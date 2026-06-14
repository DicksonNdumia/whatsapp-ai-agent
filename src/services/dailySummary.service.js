import pool from "../config/db.js";
import { ai } from "../config/gemini.js";
import { sendEmailSummary } from "./sendEmailSummary.service.js";

export async function generateDailySummary() {
  try {
    const messages = await pool.query(`
      SELECT sender_name, phone, content
      FROM messages
      WHERE created_at >= CURRENT_DATE
      AND created_at < CURRENT_DATE + INTERVAL '1 day'
    `);

    if (messages.rows.length === 0) {
      return;
    }

    const conversationText = messages.rows
      .map((m) => `${m.sender_name} (${m.phone}): ${m.content}`)
      .join("\n");

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `
Create a concise business summary.

For each person:
- Name
- Main topics discussed
- Any meeting requests
- Any follow-up needed

At the end provide:
- Total conversations
- People requiring follow-up
- Important opportunities

Messages:

${conversationText}
`,
    });

    const summary = response.text ?? "No summary generated.";

    await sendEmailSummary(summary);
  } catch (error) {
    console.error("❌ Daily summary job failed:");

    if (error.response) {
      console.error(JSON.stringify(error.response.data, null, 2));
    } else {
      console.error(error.message);
    }
  }
}
