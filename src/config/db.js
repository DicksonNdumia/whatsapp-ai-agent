import { Pool } from "pg";
import dotenv from "dotenv";

dotenv.config();

const pool = new Pool({
  //   host: process.env.DB_HOST,
  //   password: process.env.DB_PASSWORD,
  //   port: process.env.DB_PORT,
  //   database: process.env.DB_NAME,
  //   user: process.env.DB_USER,
  //This is for the live Neon Db
  connectionString: process.env.neonUrl,
  ssl: true,
});

export default pool;
