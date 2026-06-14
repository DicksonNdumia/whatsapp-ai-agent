import { generateReply } from "../services/ai.service.js";
import { sendMeetingNotification } from "../services/email.service.js";
import { wantsMeeting } from "../services/meeting.detector.js";
import { saveMessage } from "../services/message.service.js";
import { sendWhatsappMessage } from "../services/whatsApp.service.js";
import { handlePortfolioQuery } from "../services/portfolioService.js";
import { isPortfolioQuery } from "../utils/portfolioKeywords.js";

/**
 * Handle incoming WhatsApp messages
 *
 * Flow:
 * 1. Extract message from webhook payload
 * 2. Save message to database
 * 3. Check for meeting intent
 * 4. Check if it's a portfolio query (NEW)
 * 5. If portfolio query: return portfolio response (no Gemini call)
 * 6. If not: call Gemini for AI response
 * 7. Send response back to WhatsApp
 */
export async function handleWebhook(req, res) {
  try {
    const value = req.body?.entry?.[0]?.changes?.[0]?.value;

    const message = value?.messages?.[0];

    if (!message) {
      return res.sendStatus(200);
    }

    const phone = message.from;
    const text = message.text?.body;
    if (!text) {
      await saveMessage(phone, senderName, "[non-text message]");
      return res.sendStatus(200);
    }

    const senderName = value?.contacts?.[0]?.profile?.name || "Unknown User";

    await saveMessage(phone, senderName, text);

    // Check for meeting intent
    if (wantsMeeting(text)) {
      await sendMeetingNotification(senderName, phone, text);
    }

    // ========== PORTFOLIO INTEGRATION ==========
    // NEW: Check if message is a portfolio query BEFORE calling Gemini
    // This saves API costs and provides instant responses
    if (isPortfolioQuery(text)) {
      const portfolioReply = handlePortfolioQuery(text);
      await sendWhatsappMessage(phone, portfolioReply);
      return res.sendStatus(200);
    }
    // ========== END PORTFOLIO INTEGRATION ==========

    // Normal AI flow for non-portfolio queries
    const reply = await generateReply(text);
    await sendWhatsappMessage(phone, reply);
    res.sendStatus(200);
  } catch (error) {
    console.error(error);
    res.sendStatus(200);
  }
}

/**
 * Verify WhatsApp webhook
 * Called by Meta when setting up or verifying the webhook
 */
export async function verifyWebhook(req, res) {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  const MY_VERIFY_TOKEN = process.env.VERIFY_TOKEN;

  if (mode === "subscribe" && token === MY_VERIFY_TOKEN) {
    return res.status(200).send(challenge);
  } else {
    return res.sendStatus(403);
  }
}
