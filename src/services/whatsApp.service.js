import axios from "axios";

export async function sendWhatsappMessage(to, text) {
  const cleanPhone = String(to).replace(/\D/g, "");

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
