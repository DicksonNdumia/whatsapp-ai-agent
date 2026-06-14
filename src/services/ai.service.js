import { ai } from "../config/gemini.js";

export async function generateReply(message) {
  const response = await ai.models.generateContent({
    model: "gemini-3.1-flash-lite",
    contents: `
You are Dickson's WhatsApp AI assistant.
Concise and friendly.

User: ${message}
`,
  });

  return response.text;
}
