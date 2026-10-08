import { Type } from "@google/genai";
import { env } from "../../config/env.js";
import ABOUT_ME from "../../data/aboutMe.js";
import PROJECTS from "../../data/projects.js";
import { upsertLead, saveMeetingRequest } from "../lead.service.js";
import { setPaused } from "../conversation.service.js";
import { sendMeetingEmail } from "../email.service.js";
import { notifyOwner } from "../owner.service.js";

export const toolDeclarations = [
  {
    name: "get_projects",
    description: "List the portfolio projects with descriptions, technologies and links.",
  },
  {
    name: "get_services_and_skills",
    description: "Get the services offered and the technical skills / tech stack.",
  },
  {
    name: "get_contact_info",
    description: "Get contact details and profile links (email, GitHub, LinkedIn, portfolio, CV).",
  },
  {
    name: "save_lead",
    description:
      "Save a potential client's project details. Call once you know the project type plus budget or timeline; call again to add details.",
    parameters: {
      type: Type.OBJECT,
      properties: {
        project_type: { type: Type.STRING, description: "What they want built, e.g. 'e-commerce website'." },
        budget: { type: Type.STRING, description: "Budget as the user stated it." },
        timeline: { type: Type.STRING, description: "When they need it." },
        details: { type: Type.STRING, description: "Other useful details in one or two sentences." },
        name: { type: Type.STRING, description: "The client's name if they gave it." },
      },
      required: ["project_type"],
    },
  },
  {
    name: "request_meeting",
    description: "Record a request for a call/meeting and get the booking link if one exists.",
    parameters: {
      type: Type.OBJECT,
      properties: {
        preferred_time: { type: Type.STRING, description: "Preferred day/time as the user said it." },
        topic: { type: Type.STRING, description: "What the meeting is about." },
      },
      required: ["preferred_time"],
    },
  },
  {
    name: "show_quick_replies",
    description: "Show 2-3 tappable reply buttons under your message.",
    parameters: {
      type: Type.OBJECT,
      properties: {
        options: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
          description: "2-3 short options, each under 20 characters.",
        },
      },
      required: ["options"],
    },
  },
  {
    name: "show_menu",
    description: "Show the main menu list (projects, services, skills, start a project, book a call, contact).",
  },
  {
    name: "handoff_to_human",
    description: "Pause the bot and alert the owner so he replies personally.",
    parameters: {
      type: Type.OBJECT,
      properties: { reason: { type: Type.STRING, description: "Why a human is needed." } },
      required: ["reason"],
    },
  },
];

/** ctx: { phone, senderName, interactive: null | {type, options?}, handoff: boolean } */
export async function executeTool(name, args, ctx) {
  switch (name) {
    case "get_projects":
      return {
        projects: PROJECTS.map((p) => ({
          name: p.name,
          description: p.description,
          technologies: p.technologies,
          live: p.liveLink,
          github: p.githubLink,
        })),
      };

    case "get_services_and_skills":
      return { services: ABOUT_ME.services, skills: [...new Set(ABOUT_ME.skills)] };

    case "get_contact_info":
      return {
        email: ABOUT_ME.email,
        github: ABOUT_ME.github,
        linkedin: ABOUT_ME.linkedin,
        portfolio: ABOUT_ME.portfolio,
        location: ABOUT_ME.location,
        ...(env.CV_URL && { cv: env.CV_URL }),
        ...(env.BOOKING_URL && { booking_link: env.BOOKING_URL }),
      };

    case "save_lead": {
      const { lead, isNew } = await upsertLead(ctx.phone, {
        ...args,
        name: args.name || ctx.senderName,
      });
      return { saved: true, new: isNew, lead_id: lead.id };
    }

    case "request_meeting": {
      const info = {
        phone: ctx.phone,
        name: ctx.senderName,
        preferredTime: args.preferred_time,
        topic: args.topic,
      };
      await saveMeetingRequest(info);
      sendMeetingEmail(info).catch(() => {});
      notifyOwner({
        whatsapp: `📅 Meeting request from ${ctx.senderName || ""} (+${ctx.phone}): ${args.preferred_time}${args.topic ? ` - ${args.topic}` : ""}`,
      }).catch(() => {});
      return {
        recorded: true,
        booking_link: env.BOOKING_URL || null,
        note: env.BOOKING_URL
          ? "Share the booking link and say the owner will also confirm personally."
          : "No booking link; say the owner will confirm the time personally.",
      };
    }

    case "show_quick_replies": {
      const options = (args.options || []).map(String).filter(Boolean).slice(0, 3);
      if (options.length >= 2) ctx.interactive = { type: "buttons", options };
      return { shown: options.length >= 2 };
    }

    case "show_menu":
      ctx.interactive = { type: "menu" };
      return { shown: true };

    case "handoff_to_human": {
      await setPaused(ctx.phone, true, args.reason);
      ctx.handoff = true;
      await notifyOwner({
        handoff: { name: ctx.senderName, phone: ctx.phone, reason: args.reason },
        whatsapp: `🙋 ${ctx.senderName || "Someone"} (+${ctx.phone}) needs you: ${args.reason}\nBot paused. Reply with /reply ${ctx.phone} <message>, or /resume ${ctx.phone}.`,
      });
      return { paused: true };
    }

    default:
      return { error: `Unknown tool: ${name}` };
  }
}
