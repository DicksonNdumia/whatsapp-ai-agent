import cron from "node-cron";
import pool from "../config/db.js";
import { env } from "../config/env.js";
import { logger } from "../config/logger.js";
import { runDailySummary } from "../services/summary.service.js";

export function startSchedules() {
  // Daily summary at 18:00 local time.
  cron.schedule(
    "0 18 * * *",
    async () => {
      try {
        await runDailySummary();
      } catch (err) {
        logger.error({ err }, "Daily summary failed");
      }
    },
    { timezone: env.TIMEZONE },
  );

  // Housekeeping at 03:00 local time.
  cron.schedule(
    "0 3 * * *",
    async () => {
      try {
        await pool.query(`DELETE FROM jobs WHERE status = 'done' AND created_at < now() - interval '7 days'`);
        await pool.query(`DELETE FROM usage_log WHERE created_at < now() - interval '180 days'`);
      } catch (err) {
        logger.error({ err }, "Cleanup failed");
      }
    },
    { timezone: env.TIMEZONE },
  );

  logger.info({ timezone: env.TIMEZONE }, "Schedules started");
}
