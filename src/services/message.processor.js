import { env } from "../config/env.js";
import { logger } from "../config/logger.js";
import {
  sendText,
  sendMenu,
  sendButtons,
  markReadAndType,
  downloadMedia,
} from "./whatsApp.service.js";
import { transcribeAudio } from "./ai/gemini.service.js";
import { runAgent } from "./ai/agent.service.js";
import {
  saveMessage,
  updateMessageContent,
  getConversation,
  getHistory,
  countRecentInbound,
} from "./conversation.service.js";
import { isOwner, notifyOwner } from "./owner.service.js";
import { handleOwnerCommand, replyToOwner } from "./owner.commands.js";

const UNSUPPORTED_REPLY =
  "Thanks for sending that! I can only read text and voice notes for now. Could you type it out?";
const APOLOGY =
  "Sorry, I'm having a technical hiccup. Dickson will get back to you shortly.";

/** Handles one inbound message (runs inside the job worker). */
export async function processIncoming(p, job) {
  const { phone, senderName } = p;
  let text = p.text || "";

  // Owner slash-commands bypass the AI entirely.
  if (isOwner(phone) && text.startsWith("/")) {
    const result = await handleOwnerCommand(text);
    await replyToOwner(result);
    return;
  }

  try {
    await markReadAndType(p.waMessageId);

    if (p.type === "unsupported") {
      await sendText(phone, UNSUPPORTED_REPLY);
      await saveMessage({ phone, content: UNSUPPORTED_REPLY, direction: "out" });
      return;
    }

    if (p.type === "audio") {
      const media = await downloadMedia(p.mediaId);
      text = await transcribeAudio(media, phone);
      if (!text) {
        const msg = "I couldn't make out that voice note. Could you try again or type it?";
        await sendText(phone, msg);
        await saveMessage({ phone, content: msg, direction: "out" });
        return;
      }
      await updateMessageContent(p.dbId, `🎤 ${text}`);
    }

    if ((await countRecentInbound(phone, 60)) > env.MAX_MESSAGES_PER_MINUTE) {
      logger.warn({ phone }, "Rate limit hit, ignoring message");
      return;
    }

    const conversation = await getConversation(phone);
    if (conversation?.paused) {
      // Human takeover: stay quiet, but forward the message so the owner sees it.
      await notifyOwner({ whatsapp: `💬 ${senderName || ""} (+${phone}): ${text}` });
      return;
    }

    const history = await getHistory(phone, p.dbId, env.HISTORY_LIMIT);
    const { reply, interactive } = await runAgent({ phone, senderName, text, history });

    await deliverReply(phone, reply, interactive);
    saveMessage({ phone, content: reply, direction: "out" }).catch((err) =>
      logger.warn({ err }, "Failed to store outbound message"),
    );
  } catch (err) {
    // On the final attempt, make sure the user isn't left in silence.
    if (job && job.attempts >= job.max_attempts) {
      await sendText(phone, APOLOGY).catch(() => {});
    }
    throw err;
  }
}

async function deliverReply(phone, reply, interactive) {
  const fits = reply.length <= 1000;

  if (interactive?.type === "menu") {
    if (fits) return sendMenu(phone, reply);
    await sendText(phone, reply);
    return sendMenu(phone, "What would you like to see?");
  }
  if (interactive?.type === "buttons") {
    if (fits) return sendButtons(phone, reply, interactive.options);
    await sendText(phone, reply);
    return sendButtons(phone, "Pick one:", interactive.options);
  }
  return sendText(phone, reply);
}
