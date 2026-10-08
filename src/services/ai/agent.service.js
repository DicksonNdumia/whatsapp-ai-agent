import { generate } from "./gemini.service.js";
import { buildSystemPrompt } from "./prompt.js";
import { toolDeclarations, executeTool } from "./tools.js";
import { logger } from "../../config/logger.js";

const MAX_STEPS = 5;

/** Convert stored history into Gemini contents, merging consecutive same-role turns. */
function historyToContents(history) {
  const contents = [];
  for (const m of history) {
    const role = m.direction === "in" ? "user" : "model";
    const last = contents[contents.length - 1];
    if (last && last.role === role) last.parts[0].text += `\n${m.content}`;
    else contents.push({ role, parts: [{ text: m.content }] });
  }
  // Gemini expects the conversation to begin with a user turn.
  while (contents.length && contents[0].role !== "user") contents.shift();
  return contents;
}

/** Runs the tool-calling loop. Returns { reply, interactive, handoff }. */
export async function runAgent({ phone, senderName, text, history }) {
  const contents = historyToContents(history);
  const last = contents[contents.length - 1];
  if (last && last.role === "user") last.parts[0].text += `\n${text}`;
  else contents.push({ role: "user", parts: [{ text }] });

  const ctx = { phone, senderName, interactive: null, handoff: false };
  let reply = "";

  for (let step = 0; step < MAX_STEPS; step++) {
    const response = await generate({
      phone,
      kind: "chat",
      contents,
      config: {
        systemInstruction: buildSystemPrompt(),
        tools: [{ functionDeclarations: toolDeclarations }],
        temperature: 0.6,
      },
    });

    const calls = response.functionCalls;
    if (!calls?.length) {
      reply = (response.text || "").trim();
      break;
    }

    // Keep the model's full turn (includes thought signatures needed by newer Gemini models).
    contents.push(response.candidates[0].content);

    const parts = [];
    for (const call of calls) {
      let result;
      try {
        result = await executeTool(call.name, call.args ?? {}, ctx);
      } catch (err) {
        logger.error({ err, tool: call.name }, "Tool execution failed");
        result = { error: "Tool failed, apologise briefly and continue without it." };
      }
      parts.push({ functionResponse: { name: call.name, response: result } });
    }
    contents.push({ role: "user", parts });
  }

  if (!reply) {
    reply = "Sorry, I got a bit tangled there. Could you say that again?";
  }
  return { reply, interactive: ctx.interactive, handoff: ctx.handoff };
}
