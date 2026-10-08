import axios from "axios";
import { env } from "../config/env.js";
import { logger } from "../config/logger.js";
import { chunkText } from "../utils/text.js";

const api = axios.create({
  baseURL: "https://graph.facebook.com/v23.0",
  headers: { Authorization: `Bearer ${env.WHATSAPP_TOKEN}` },
  timeout: 15_000,
});

function logApiError(action, err) {
  logger.error(
    {
      action,
      status: err.response?.status,
      data: err.response?.data,
      message: err.message,
    },
    "WhatsApp API error",
  );
}

async function post(payload) {
  try {
    const { data } = await api.post(`/${env.PHONE_NUMBER_ID}/messages`, {
      messaging_product: "whatsapp",
      ...payload,
    });
    return data;
  } catch (err) {
    logApiError(payload.type || payload.status, err);
    throw err;
  }
}

export async function sendText(to, text) {
  for (const chunk of chunkText(text, 3800)) {
    await post({ to, type: "text", text: { body: chunk, preview_url: true } });
  }
}

/** Reply buttons: max 3, titles up to 20 chars. */
export async function sendButtons(to, body, options) {
  const buttons = options.slice(0, 3).map((title, i) => ({
    type: "reply",
    reply: { id: `qr_${i}`, title: String(title).slice(0, 20) },
  }));
  await post({
    to,
    type: "interactive",
    interactive: {
      type: "button",
      body: { text: body.slice(0, 1024) },
      action: { buttons },
    },
  });
}

export const MENU_ROWS = [
  {
    id: "menu_projects",
    title: "My projects",
    description: "Things I've built",
  },
  {
    id: "menu_services",
    title: "Services",
    description: "What I can build for you",
  },
  { id: "menu_skills", title: "Skills & tech stack" },
  {
    id: "menu_start",
    title: "Start a project",
    description: "Tell me what you need",
  },
  { id: "menu_meeting", title: "Book a call" },
  { id: "menu_contact", title: "Contact & links" },
];

export async function sendMenu(to, body) {
  await post({
    to,
    type: "interactive",
    interactive: {
      type: "list",
      body: { text: body.slice(0, 1024) },
      action: {
        button: "Open menu",
        sections: [
          {
            title: "How can I help?",
            rows: MENU_ROWS.map((r) => ({
              id: r.id,
              title: r.title.slice(0, 24),
              ...(r.description && { description: r.description.slice(0, 72) }),
            })),
          },
        ],
      },
    },
  });
}

/** Marks the message as read and shows the "typing…" indicator. Never throws. */
export async function markReadAndType(messageId) {
  if (!messageId) return;
  try {
    await api.post(`/${env.PHONE_NUMBER_ID}/messages`, {
      messaging_product: "whatsapp",
      status: "read",
      message_id: messageId,
      typing_indicator: { type: "text" },
    });
  } catch (err) {
    logger.debug({ message: err.message }, "markReadAndType failed");
  }
}

export async function downloadMedia(mediaId) {
  try {
    const { data: meta } = await api.get(`/${mediaId}`);
    const { data } = await axios.get(meta.url, {
      responseType: "arraybuffer",
      headers: { Authorization: `Bearer ${env.WHATSAPP_TOKEN}` },
      timeout: 30_000,
      maxContentLength: 16 * 1024 * 1024,
    });
    return {
      buffer: Buffer.from(data),
      mimeType: meta.mime_type || "audio/ogg",
    };
  } catch (err) {
    logApiError("downloadMedia", err);
    throw err;
  }
}
