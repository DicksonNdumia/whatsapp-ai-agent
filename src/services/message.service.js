import pool from "../config/db.js";

export async function saveMessage(phone, senderName, content) {
  await pool.query(
    `
    INSERT INTO messages(phone, sender_name, content)
    VALUES ($1,$2,$3)
    `,
    [phone, senderName, content],
  );
}

export async function getTodaysMessages() {
  const result = await pool.query(`
      SELECT sender_name, phone, content
      FROM messages
      WHERE created_at >= CURRENT_DATE
      AND created_at < CURRENT_DATE + INTERVAL '1 day'
  `);

  return result.rows;
}
