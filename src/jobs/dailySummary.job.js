import cron from "node-cron";
import { generateDailySummary } from "../services/dailySummary.service.js";

export function startDailySummaryJob() {
  cron.schedule("0 18 * * *", async () => {
    await generateDailySummary();
  });
}
