import express from "express";
import dotenv from "dotenv";
import axios from "axios";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

async function sendNotificationEmail(senderName, phone, userMessage) {
  try {
    console.log(`📡 Dispatching secure HTTP email request via Resend API...`);

    await axios.post(
      "https://api.resend.com/emails",
      {
        from: "WhatsApp Bot <onboarding@resend.dev>",
        to: process.env.MY_EMAIL_ADDRESS,
        subject: `📅 New WhatsApp Meeting Request: ${senderName}`,
        html: `
          <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
            <h2 style="color: #25D366;">New Meeting Intent Detected!</h2>
            <p><strong>Sender Name:</strong> ${senderName}</p>
            <p><strong>WhatsApp Number:</strong> +${phone}</p>
            <p><strong>Raw Message:</strong> "${userMessage}"</p>
            <hr style="border: 0; border-top: 1px solid #eeeeee;" />
            <p style="font-size: 12px; color: #777777;"><em>This notification was securely routed via HTTP API.</em></p>
          </div>
        `,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
          "Content-Type": "application/json",
        },
      },
    );
    //console.log("📨 Email notification successfully delivered to your inbox!");
  } catch (error) {
    console.error("❌ Failed to transmit notification email via HTTP:");
    if (error.response) {
      console.error(JSON.stringify(error.response.data, null, 2));
    } else {
      console.error(error.message);
    }
  }
}

async function sendWhatsappMessage(to, text) {
  try {
    const cleanPhone = String(to).replace(/\D/g, "");
    const cleanText = String(text)
      .replace(/[\r\n]+/g, " ")
      .replace(/"/g, '\\"')
      .trim();

    await axios.post(
      `https://graph.facebook.com/v23.0/${process.env.PHONE_NUMBER_ID}/messages`,
      {
        messaging_product: "whatsapp",
        to: cleanPhone,
        type: "text",
        text: { body: cleanText },
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.WHATSAPP_TOKEN}`,
          "Content-Type": "application/json",
        },
      },
    );
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

app.get("/webhook", (req, res) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  const MY_VERIFY_TOKEN = "your_secret_token_here";

  if (mode === "subscribe" && token === MY_VERIFY_TOKEN) {
    return res.status(200).send(challenge);
  } else {
    return res.sendStatus(403);
  }
});

app.post("/webhook", async (req, res) => {
  try {
    const entry = req.body?.entry?.[0];
    const change = entry?.changes?.[0];
    const value = change?.value;

    if (value?.statuses && !value?.messages) {
      return res.sendStatus(200);
    }

    const message = value?.messages?.[0];
    if (!message) {
      return res.sendStatus(200);
    }

    const phone = message.from;
    const userMessage = message.text?.body || message.body;

    if (!userMessage) {
      return res.sendStatus(200);
    }

    const senderName = value?.contacts?.[0]?.profile?.name || "Unknown User";
    console.log(
      `★★★ PARSED SUCCESS ★★★ From: ${senderName} (${phone}) | Msg: ${userMessage}`,
    );

    const lowerMessage = userMessage.toLowerCase();
    const keywords = [
      "meet",
      "meeting",
      "schedule",
      "appointment",
      "call",
      "discuss",
    ];
    const wantsToMeet = keywords.some((keyword) =>
      lowerMessage.includes(keyword),
    );

    if (wantsToMeet) {
      sendNotificationEmail(senderName, phone, userMessage);
    }

    res.sendStatus(200);
    processAIResponse(phone, userMessage);
  } catch (error) {
    console.error("Critical error inside Webhook Router:", error.message);
    if (!res.headersSent) {
      res.sendStatus(200);
    }
  }
});

async function processAIResponse(phone, userMessage) {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.1-flash-lite",
      contents: `You are Dickson's WhatsApp AI assistant. Concise and friendly.\nUser: ${userMessage}`,
    });

    const aiReply = response.text ?? "Sorry, I couldn't generate a response.";
    await sendWhatsappMessage(phone, aiReply);
  } catch (error) {
    console.error("AI Processing Error:", error.message);
  }
}

app.listen(3000, () => {
  console.log("Server running on port 3000");
});
