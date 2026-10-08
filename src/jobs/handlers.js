import { registerHandler } from "../services/queue.service.js";
import { processIncoming } from "../services/message.processor.js";

export function registerJobHandlers() {
  registerHandler("process_message", processIncoming);
}
