import axios from "axios";

export async function sendMeetingNotification(senderName, phone, message) {
  await axios.post(
    "https://api.resend.com/emails",
    {
      from: "WhatsApp Bot <onboarding@resend.dev>",
      to: process.env.MY_EMAIL_ADDRESS,
      subject: `Meeting Request: ${senderName}`,
      html: `
        <p>${message}</p>
      `,
    },
    {
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      },
    },
  );
}
