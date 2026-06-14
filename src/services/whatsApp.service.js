import axios from "axios";

export async function sendWhatsappMessage(to, text) {
  if (!to) {
    throw new Error("Recipient phone number is required");
  }
  const cleanPhone = String(to).replace(/\D/g, "");
  if (!cleanPhone) {
    throw new Error("Invalid phone number format");
  }

  await axios.post(
    `https://graph.facebook.com/v23.0/${process.env.PHONE_NUMBER_ID}/messages`,
    {
      messaging_product: "whatsapp",
      to: cleanPhone,
      type: "text",
      text: { body: text },
    },
    {
      headers: {
        Authorization: `Bearer ${process.env.WHATSAPP_TOKEN}`,
      },
    },
  );
}
