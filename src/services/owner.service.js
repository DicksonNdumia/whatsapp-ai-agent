import { env } from "../config/env.js";
import { logger } from "../config/logger.js";
import { sendText } from "./whatsApp.service.js";
import { sendHandoffEmail } from "./email.service.js";

export const isOwner = (phone) =>
  Boolean(env.OWNER_PHONE) && phone === env.OWNER_PHONE;

/**
 * Best-effort alerts. WhatsApp free-form messages only deliver if the owner messaged
 * the bot in the last 24h, so email is the reliable channel for handoffs.
 */
export async function notifyOwner({ whatsapp, handoff }) {
  if (handoff) sendHandoffEmail(handoff).catch(() => {});
  if (whatsapp && env.OWNER_PHONE) {
    try {
      await sendText(env.OWNER_PHONE, whatsapp);
    } catch (err) {
      logger.warn(
        { message: err.message },
        "Owner WhatsApp alert failed (24h window?)",
      );
    }
  }
}
