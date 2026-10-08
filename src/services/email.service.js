import axios from "axios";
import { env } from "../config/env.js";
import { logger } from "../config/logger.js";
import { escapeHtml } from "../utils/text.js";

export async function sendEmail({ subject, html }) {
  try {
    await axios.post(
      "https://api.resend.com/emails",
      { from: env.EMAIL_FROM, to: env.MY_EMAIL_ADDRESS, subject, html },
      {
        headers: {
          Authorization: `Bearer ${env.RESEND_API_KEY}`,
          "Content-Type": "application/json",
        },
        timeout: 10_000,
      },
    );
  } catch (err) {
    logger.error(
      {
        status: err.response?.status,
        data: err.response?.data,
        message: err.message,
      },
      "Failed to send email",
    );
  }
}

const wrap = (title, body) => `
  <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px; max-width: 560px;">
    <h2 style="margin-top:0">${escapeHtml(title)}</h2>
    ${body}
    <hr style="border:0;border-top:1px solid #eee" />
    <p style="font-size:12px;color:#777">Sent by your WhatsApp AI agent</p>
  </div>`;

const row = (label, value) =>
  value
    ? `<p style="margin:6px 0"><strong>${escapeHtml(label)}:</strong> ${escapeHtml(value)}</p>`
    : "";

export function sendLeadEmail(lead, isNew) {
  return sendEmail({
    subject: `${isNew ? "New lead" : "Lead updated"}: ${lead.name || lead.phone}`,
    html: wrap(
      isNew ? "New lead" : "Lead updated",
      row("Name", lead.name) +
        row("WhatsApp", `+${lead.phone}`) +
        row("Project", lead.project_type) +
        row("Budget", lead.budget) +
        row("Timeline", lead.timeline) +
        row("Details", lead.details),
    ),
  });
}

export function sendMeetingEmail({ name, phone, preferredTime, topic }) {
  return sendEmail({
    subject: `Meeting request: ${name || phone}`,
    html: wrap(
      "Meeting request",
      row("Name", name) +
        row("WhatsApp", `+${phone}`) +
        row("Preferred time", preferredTime) +
        row("Topic", topic),
    ),
  });
}

export function sendHandoffEmail({ name, phone, reason }) {
  return sendEmail({
    subject: `Needs you: ${name || phone}`,
    html: wrap(
      "A chat needs a human",
      row("Name", name) +
        row("WhatsApp", `+${phone}`) +
        row("Reason", reason) +
        "<p>The bot is paused for this chat until you resume it.</p>",
    ),
  });
}

export function sendSummaryEmail(summary) {
  return sendEmail({
    subject: `Daily WhatsApp summary - ${new Date().toLocaleDateString("en-KE", { timeZone: env.TIMEZONE })}`,
    html: wrap(
      "Daily WhatsApp summary",
      `<div style="background:#f7f7f7;padding:15px;border-radius:8px;white-space:pre-wrap">${escapeHtml(summary)}</div>`,
    ),
  });
}
