// Tiny Postgres-backed job queue: durable, retries with backoff, per-phone ordering.
import pool from "../config/db.js";
import { logger } from "../config/logger.js";

const handlers = new Map();
let running = false;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

export function registerHandler(type, fn) {
  handlers.set(type, fn);
}

export async function enqueue(type, payload, { delaySeconds = 0, maxAttempts = 4 } = {}) {
  await pool.query(
    `INSERT INTO jobs (type, payload, max_attempts, run_at)
     VALUES ($1, $2, $3, now() + make_interval(secs => $4))`,
    [type, JSON.stringify(payload), maxAttempts, delaySeconds],
  );
}

// Skips jobs whose phone already has a job running, so one user's messages stay in order.
async function claim() {
  const { rows } = await pool.query(`
    UPDATE jobs SET status = 'running', locked_at = now(), attempts = attempts + 1
    WHERE id = (
      SELECT j.id FROM jobs j
      WHERE j.status = 'pending' AND j.run_at <= now()
        AND NOT EXISTS (
          SELECT 1 FROM jobs r
          WHERE r.status = 'running'
            AND r.payload->>'phone' IS NOT NULL
            AND r.payload->>'phone' = j.payload->>'phone'
        )
      ORDER BY j.run_at, j.id
      FOR UPDATE SKIP LOCKED
      LIMIT 1
    )
    RETURNING id, type, payload, attempts, max_attempts`);
  return rows[0] || null;
}

async function complete(id) {
  await pool.query(
    `UPDATE jobs SET status = 'done', locked_at = NULL WHERE id = $1`,
    [id],
  );
}

async function fail(job, err) {
  const backoff = Math.min(300, 5 * 2 ** job.attempts);
  await pool.query(
    `UPDATE jobs
     SET status = CASE WHEN attempts >= max_attempts THEN 'failed' ELSE 'pending' END,
         run_at = now() + make_interval(secs => $2),
         last_error = $3, locked_at = NULL
     WHERE id = $1`,
    [job.id, backoff, String(err?.message || err).slice(0, 500)],
  );
}

async function run(job) {
  const handler = handlers.get(job.type);
  if (!handler) {
    logger.error({ type: job.type }, "No handler for job type");
    return fail({ ...job, attempts: job.max_attempts }, new Error("no handler"));
  }
  try {
    await handler(job.payload, job);
    await complete(job.id);
  } catch (err) {
    logger.error({ err, jobId: job.id, type: job.type, attempt: job.attempts }, "Job failed");
    await fail(job, err);
  }
}

async function recoverStale() {
  await pool.query(
    `UPDATE jobs SET status = 'pending', locked_at = NULL
     WHERE status = 'running' AND locked_at < now() - interval '5 minutes'`,
  );
}

async function loop() {
  while (running) {
    try {
      const job = await claim();
      if (!job) {
        await sleep(1000);
        continue;
      }
      await run(job);
    } catch (err) {
      logger.error({ err }, "Worker loop error");
      await sleep(3000);
    }
  }
}

export function startWorker(concurrency = 2) {
  running = true;
  recoverStale().catch((err) => logger.error({ err }, "recoverStale failed"));
  setInterval(() => recoverStale().catch(() => {}), 60_000).unref();
  for (let i = 0; i < concurrency; i++) loop();
  logger.info({ concurrency }, "Job worker started");
}

export function stopWorker() {
  running = false;
}
