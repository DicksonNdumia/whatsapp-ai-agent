import express from "express";
import dotenv from "dotenv";
import axios from "axios";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

async function sendWhatsappMessage(to, text) {
  try {
    // Ensure the phone number is just digits, no plus signs or spaces
    const cleanPhone = String(to).replace(/\D/g, "");

    // Force Gemini's text into a completely clean, flat string
    const cleanText = String(text)
      .replace(/[\r\n]+/g, " ") // Flatten line breaks into single spaces
      .replace(/"/g, '\\"') // Escape double quotes
      .trim();

    console.log(`Sending sanitized text to ${cleanPhone}: "${cleanText}"`);

    await axios.post(
      `https://graph.facebook.com/v23.0/${process.env.PHONE_NUMBER_ID}/messages`,
      {
        messaging_product: "whatsapp",
        to: cleanPhone,
        type: "text",
        text: {
          body: cleanText,
        },
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.WHATSAPP_TOKEN}`,
          "Content-Type": "application/json",
        },
      },
    );
    console.log("✓ Message successfully delivered to WhatsApp API");
  } catch (error) {
    console.error("Error sending WhatsApp message:");
    if (error.response) {
      console.error(JSON.stringify(error.response.data, null, 2));
    } else {
      console.error(error.message);
    }
  }
}
const app = express();
app.use(express.json());

// --- 1. ADDED: WEBHOOK VERIFICATION (GET HANDLER) ---
// Meta uses this to verify your server when you set up the Webhook in the App Dashboard
app.get("/webhook", (req, res) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  // Replace "YOUR_VERIFY_TOKEN" with a secure string you set in the Meta Developer Portal
  const VERIFY_TOKEN = process.env.VERIFY_TOKEN || "YOUR_VERIFY_TOKEN";

  if (mode && token) {
    if (mode === "subscribe" && token === VERIFY_TOKEN) {
      console.log("WEBHOOK_VERIFIED");
      return res.status(200).send(challenge);
    }
    return res.sendStatus(403);
  }
  res.sendStatus(400);
});

// --- 2. OPTIMIZED: MESSAGE RECEIVER (POST HANDLER) ---
app.post("/webhook", async (req, res) => {
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
});

// Helper function to handle the long-running AI generation and messaging
async function processAIResponse(phone, userMessage) {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.1-flash-lite",
      contents: `
You are Dickson's WhatsApp AI assistant.
Be concise and friendly.

User: ${userMessage}
`,
    });

    const aiReply = response.text ?? "Sorry, I couldn't generate a response.";
    console.log("AI Reply:", aiReply);

    await sendWhatsappMessage(phone, aiReply);
  } catch (error) {
    console.error("AI Processing Error:", error.message);
  }
}

app.listen(3000, () => {
  console.log("Server running on port 3000");
});
