import { generateReply } from "../services/ai.service.js";
import { sendMeetingNotification } from "../services/email.service.js";
import { wantsMeeting } from "../services/meeting.detector.js";
import { saveMessage } from "../services/message.service.js";
import { sendWhatsappMessage } from "../services/whatsApp.service.js";

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

    if (wantsMeeting(text)) {
      await sendMeetingNotification(senderName, phone, text);
    }
    const reply = await generateReply(text);
    await sendWhatsappMessage(phone, reply);
    res.sendStatus(200);
  } catch (error) {
    console.error(error);
    res.sendStatus(200);
  }
}

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
