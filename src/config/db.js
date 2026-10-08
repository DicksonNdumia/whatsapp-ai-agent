import pg from "pg";
import { env } from "./env.js";

const pool = new pg.Pool({
  connectionString: env.DATABASE_URL,
  ssl: env.DATABASE_SSL ? true : false,
  max: 10,
});

export default pool;
