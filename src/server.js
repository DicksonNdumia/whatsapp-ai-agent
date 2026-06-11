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
  // Meta sends these query parameters to verify your server
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  // Your personal secret verification token (Make sure this matches what you type into Meta!)
  const MY_VERIFY_TOKEN = "your_secret_token_here"; 

  console.log("=== WEBHOOK VERIFICATION ATTEMPT ===");
  console.log("Received Token:", token);

  if (mode === "subscribe" && token === MY_VERIFY_TOKEN) {
    console.log("--- VERIFICATION SUCCESSFUL! ---");
    // CRITICAL: You must return the raw challenge string as plain text
    return res.status(200).send(challenge);
  } else {
    console.log("--- VERIFICATION FAILED: Token Mismatch ---");
    return res.sendStatus(403);
  }
});

// --- 2. OPTIMIZED: MESSAGE RECEIVER (POST HANDLER) ---
app.post("/webhook", async (req, res) => {
  try {
    // Log the entire incoming body to your Render terminal so you can see exactly what Meta is sending
    console.log("INCOMING WEBHOOK BODY:", JSON.stringify(req.body, null, 2));

    const entry = req.body?.entry?.[0];
    const change = entry?.changes?.[0];
    const value = change?.value;
    
    // 1. Immediately ignore status updates (delivered, read receipts) so they don't break the logic
    if (value?.statuses && !value?.messages) {
      console.log("Ignored status receipt payload.");
      return res.sendStatus(200);
    }

    // 2. Extract the message object safely
    const message = value?.messages?.[0];

    if (!message) {
      console.log("Webhook received, but no message object found.");
      return res.sendStatus(200);
    }

    const phone = message.from;
    
    // 3. Handle different text message structures (sometimes it's directly message.text, sometimes nested)
    const userMessage = message.text?.body || message.body;

    if (!userMessage) {
      console.log("Message object found, but text body was empty.");
      return res.sendStatus(200);
    }

    console.log(`★★★ PARSED SUCCESS ★★★ Phone: ${phone} | Msg: ${userMessage}`);

    // Acknowledge Meta immediately to prevent timeout retries
    res.sendStatus(200);

    // Pass the cleaned arguments to your background worker
    processAIResponse(phone, userMessage);

  } catch (error) {
    console.error("Critical error inside Webhook Router:", error.message);
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
