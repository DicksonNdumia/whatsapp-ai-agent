import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import pool from "../config/db.js";
import { logger } from "../config/logger.js";

const dir = path.dirname(fileURLToPath(import.meta.url));

export async function runMigrations() {
  const sql = await fs.readFile(path.join(dir, "schema.sql"), "utf8");
  await pool.query(sql);
  logger.info("Database schema is up to date");
}
