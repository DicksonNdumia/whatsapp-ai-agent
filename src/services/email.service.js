import axios from "axios";

export async function sendMeetingNotification(senderName, phone, message) {
  try {
    await axios.post(
      "https://api.resend.com/emails",
      {
        from: "WhatsApp Bot <onboarding@resend.dev>",
        to: process.env.MY_EMAIL_ADDRESS,
        subject: `New WhatsApp Meeting Request: ${senderName}`,
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
  } catch (error) {
    console.error("❌ Failed to transmit notification email via HTTP:");
    if (error.response) {
      console.error(JSON.stringify(error.response.data, null, 2));
    } else {
      console.error(error.message);
    }
  }
}
