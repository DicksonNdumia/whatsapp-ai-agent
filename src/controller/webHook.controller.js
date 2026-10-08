import { env } from "../config/env.js";
import { logger } from "../config/logger.js";
import {
  saveMessage,
  touchConversation,
} from "../services/conversation.service.js";
import { enqueue } from "../services/queue.service.js";

// Ids from list/button taps are mapped to natural-language prompts for the AI.
const MENU_PROMPTS = {
  menu_projects: "Show me your projects",
  menu_services: "What services do you offer?",
  menu_skills: "What are your skills and tech stack?",
  menu_start: "I want to start a project",
  menu_meeting: "I'd like to book a call",
  menu_contact: "How can I contact you?",
};

function parseMessage(m) {
  switch (m.type) {
    case "text":
      return { type: "text", text: m.text?.body || "" };
    case "interactive": {
      const r = m.interactive?.button_reply ?? m.interactive?.list_reply;
      return { type: "text", text: MENU_PROMPTS[r?.id] ?? r?.title ?? "" };
    }
    case "button":
      return { type: "text", text: m.button?.text || "" };
    case "audio":
      return { type: "audio", mediaId: m.audio?.id, preview: "[voice note]" };
    default:
      return { type: "unsupported", preview: `[${m.type} message]` };
  }
}

async function ingest(m, value) {
  const phone = m.from;
  const senderName =
    value.contacts?.find((c) => c.wa_id === phone)?.profile?.name ?? null;
  const parsed = parseMessage(m);
  const content = parsed.text ?? parsed.preview ?? "";

  // The unique wa_message_id index makes duplicate deliveries a no-op.
  const row = await saveMessage({
    phone,
    senderName,
    content,
    direction: "in",
    waMessageId: m.id,
    msgType: parsed.type,
  });
  if (!row) {
    logger.debug({ id: m.id }, "Duplicate webhook delivery ignored");
    return;
  }

  await touchConversation(phone, senderName);
  await enqueue("process_message", {
    phone,
    senderName,
    waMessageId: m.id,
    dbId: row.id,
    type: parsed.type,
    text: parsed.text ?? "",
    mediaId: parsed.mediaId ?? null,
  });
}

export function verifyWebhook(req, res) {
  const {
    "hub.mode": mode,
    "hub.verify_token": token,
    "hub.challenge": challenge,
  } = req.query;
  if (mode === "subscribe" && token === env.VERIFY_TOKEN) {
    return res.status(200).send(challenge);
  }
  res.sendStatus(403);
}

export async function handleWebhook(req, res) {
  try {
    for (const entry of req.body?.entry ?? []) {
      for (const change of entry.changes ?? []) {
        const value = change.value ?? {};
        for (const m of value.messages ?? []) {
          await ingest(m, value);
        }
        // value.statuses (delivery receipts) are intentionally ignored.
      }
    }
    // Messages are durably queued; heavy work happens in the worker.
    res.sendStatus(200);
  } catch (err) {
    // A 500 makes Meta retry; duplicates are filtered by wa_message_id.
    logger.error({ err }, "Webhook ingest failed");
    res.sendStatus(500);
  }
}
