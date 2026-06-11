import dotenv from "dotenv";
import processAIResponse from "../utils/helper/processAiResponse";

dotenv.config();
export const metaVerification = (req, res) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  const VERIFY_TOKEN = process.env.VERIFY_TOKEN || "MY_VERIFY_TOKEN";

  if (mode && token) {
    if (mode === "subscribe" && token === VERIFY_TOKEN) {
      console.log("WEBHOOK_VERIFIED");
      return res.status(200).send(challenge);
    }
    return res.sendStatus(403);
  }
  res.sendStatus(400);
};

export const messageHandler = async (req, res) => {
  try {
    const value = req.body.entry?.[0]?.changes?.[0]?.value;
    const message = value?.messages?.[0];

    // Ignore status updates (sent, delivered, read receipts) to avoid double processing
    if (value?.statuses) {
      return res.sendStatus(200);
    }

    if (!message || !message.text?.body) {
      return res.sendStatus(200);
    }

    const phone = message.from;
    const userMessage = message.text.body;

    console.log(`Received message from ${phone}: ${userMessage}`);

    // CRITICAL: Acknowledge Meta immediately to prevent timeout retries
    res.sendStatus(200);

    // --- 3. ASYNCHRONOUS PROCESSING ---
    // This executes in the background AFTER we already sent res.sendStatus(200)
    processAIResponse(phone, userMessage);
  } catch (error) {
    console.error("Webhook Error:", error.message);
    // Always ensure a 200 is sent to Meta so they don't block your webhook
    if (!res.headersSent) {
      res.sendStatus(200);
    }
  }
};
