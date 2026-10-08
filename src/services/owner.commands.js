import { env } from "../config/env.js";
import { digitsOnly } from "../utils/text.js";
import { sendText } from "./whatsApp.service.js";
import { listLeads } from "./lead.service.js";
import { buildSummary } from "./summary.service.js";
import {
  setPaused,
  listPaused,
  saveMessage,
  touchConversation,
} from "./conversation.service.js";

const HELP = `*Owner commands*
/leads - latest leads
/summary - today's summary
/paused - chats where the bot is paused
/pause <number> - stop the bot for a chat
/resume <number> - let the bot reply again
/reply <number> <message> - reply as yourself (pauses the bot)`;

export async function handleOwnerCommand(text) {
  const [cmd, arg, ...rest] = text.trim().split(/\s+/);
  const command = cmd.toLowerCase();

  switch (command) {
    case "/help":
      return HELP;

    case "/leads": {
      const leads = await listLeads(8);
      if (!leads.length) return "No leads yet.";
      return leads
        .map(
          (l) =>
            `*${l.name || "Unknown"}* (+${l.phone}) [${l.status}]\n${l.project_type || "-"} | ${l.budget || "-"} | ${l.timeline || "-"}`,
        )
        .join("\n\n");
    }

    case "/summary":
      return (await buildSummary()) || "No messages today.";

    case "/paused": {
      const rows = await listPaused();
      if (!rows.length) return "No paused chats.";
      return rows
        .map(
          (r) =>
            `+${r.phone} ${r.sender_name || ""} - ${r.paused_reason || ""}`,
        )
        .join("\n");
    }

    case "/pause":
    case "/resume": {
      const phone = digitsOnly(arg);
      if (!phone) return `Usage: ${command} <number>`;
      await setPaused(
        phone,
        command === "/pause",
        command === "/pause" ? "Paused by owner" : null,
      );
      return command === "/pause"
        ? `Bot paused for +${phone}.`
        : `Bot resumed for +${phone}.`;
    }

    case "/reply": {
      const phone = digitsOnly(arg);
      const message = rest.join(" ").trim();
      if (!phone || !message) return "Usage: /reply <number> <message>";
      await sendText(phone, message);
      await touchConversation(phone, null);
      await saveMessage({
        phone,
        content: message,
        direction: "out",
        msgType: "human",
      });
      await setPaused(phone, true, "Owner replied manually");
      return `Sent to +${phone}. Bot paused for this chat; /resume ${phone} to re-enable.`;
    }

    default:
      return `Unknown command.\n\n${HELP}`;
  }
}

export async function replyToOwner(text) {
  if (env.OWNER_PHONE) await sendText(env.OWNER_PHONE, text);
}
