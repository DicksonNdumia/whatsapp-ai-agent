import { env } from "./config/env.js"; // must stay first: loads .env
import pool from "./config/db.js";
import { logger } from "./config/logger.js";
import app from "./app.js";
import { runMigrations } from "./db/migrate.js";
import { registerJobHandlers } from "./jobs/handlers.js";
import { startSchedules } from "./jobs/schedule.js";
import { startWorker, stopWorker } from "./services/queue.service.js";

async function main() {
  await runMigrations();
  registerJobHandlers();
  startWorker(env.WORKER_CONCURRENCY);
  startSchedules();

  const server = app.listen(env.PORT, () => {
    logger.info({ port: env.PORT }, "Server running");
  });

  const shutdown = async (signal) => {
    logger.info({ signal }, "Shutting down");
    stopWorker();
    server.close(async () => {
      await pool.end().catch(() => {});
      process.exit(0);
    });
    setTimeout(() => process.exit(1), 10_000).unref();
  };
  process.on("SIGTERM", () => shutdown("SIGTERM"));
  process.on("SIGINT", () => shutdown("SIGINT"));
}

process.on("unhandledRejection", (err) =>
  logger.error({ err }, "Unhandled rejection"),
);

main().catch((err) => {
  logger.fatal({ err }, "Failed to start");
  process.exit(1);
});
