import { generateDailySummary } from "../services/dailySummary.service.js";

export async function runSummary(req, res) {
  try {
    await generateDailySummary();
    res.send("Summary executed successfully");
  } catch (error) {
    res.status(500).send("Summary failed");
  }
}
