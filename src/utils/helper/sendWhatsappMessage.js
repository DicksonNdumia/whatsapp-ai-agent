import axios from "axios";

import dotenv from "dotenv";

dotenv.config();

export const sendWhatsappMessage = async (to, text) => {
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
};
