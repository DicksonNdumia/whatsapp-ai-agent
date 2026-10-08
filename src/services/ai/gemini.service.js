import { ai } from "../../config/gemini.js";
import { env } from "../../config/env.js";
import pool from "../../config/db.js";
import { logger } from "../../config/logger.js";

/** generateContent wrapper that records token usage per call. */
export async function generate({ phone = null, kind, model = env.GEMINI_MODEL, ...params }) {
  const response = await ai.models.generateContent({ model, ...params });
  const u = response.usageMetadata || {};
  pool
    .query(
      `INSERT INTO usage_log (phone, kind, model, prompt_tokens, output_tokens, total_tokens)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [
        phone,
        kind,
        model,
        u.promptTokenCount || 0,
        u.candidatesTokenCount || 0,
        u.totalTokenCount || 0,
      ],
    )
    .catch((err) => logger.warn({ err }, "usage_log insert failed"));
  return response;
}

export async function transcribeAudio({ buffer, mimeType }, phone) {
  const response = await generate({
    phone,
    kind: "transcribe",
    contents: [
      {
        role: "user",
        parts: [
          { inlineData: { mimeType: mimeType.split(";")[0].trim(), data: buffer.toString("base64") } },
          { text: "Transcribe this voice note verbatim in its original language. Output only the transcript." },
        ],
      },
    ],
  });
  return (response.text || "").trim();
}
