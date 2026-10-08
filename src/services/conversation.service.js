import pool from "../config/db.js";

/** Returns the inserted row, or null if this WhatsApp message id was already stored (duplicate delivery). */
export async function saveMessage({
  phone,
  senderName = null,
  content = "",
  direction = "in",
  waMessageId = null,
  msgType = "text",
}) {
  const { rows } = await pool.query(
    `INSERT INTO messages (phone, sender_name, content, direction, wa_message_id, msg_type)
     VALUES ($1, $2, $3, $4, $5, $6)
     ON CONFLICT (wa_message_id) WHERE wa_message_id IS NOT NULL DO NOTHING
     RETURNING id`,
    [phone, senderName, content, direction, waMessageId, msgType],
  );
  return rows[0] || null;
}

export async function updateMessageContent(id, content) {
  await pool.query(`UPDATE messages SET content = $2 WHERE id = $1`, [id, content]);
}

export async function touchConversation(phone, senderName) {
  await pool.query(
    `INSERT INTO conversations (phone, sender_name) VALUES ($1, $2)
     ON CONFLICT (phone) DO UPDATE
       SET sender_name = COALESCE(EXCLUDED.sender_name, conversations.sender_name),
           updated_at = now()`,
    [phone, senderName],
  );
}

export async function getConversation(phone) {
  const { rows } = await pool.query(`SELECT * FROM conversations WHERE phone = $1`, [phone]);
  return rows[0] || null;
}

export async function setPaused(phone, paused, reason = null) {
  await pool.query(
    `INSERT INTO conversations (phone, paused, paused_reason, paused_at)
     VALUES ($1, $2, $3, CASE WHEN $2 THEN now() END)
     ON CONFLICT (phone) DO UPDATE
       SET paused = $2,
           paused_reason = CASE WHEN $2 THEN $3 ELSE NULL END,
           paused_at = CASE WHEN $2 THEN now() ELSE NULL END,
           updated_at = now()`,
    [phone, paused, reason],
  );
}

export async function listPaused() {
  const { rows } = await pool.query(
    `SELECT phone, sender_name, paused_reason, paused_at
     FROM conversations WHERE paused ORDER BY paused_at DESC`,
  );
  return rows;
}

/** Last N messages before `beforeId`, oldest first. */
export async function getHistory(phone, beforeId, limit) {
  const { rows } = await pool.query(
    `SELECT direction, content FROM messages
     WHERE phone = $1 AND id < $2 AND content <> ''
     ORDER BY id DESC LIMIT $3`,
    [phone, beforeId, limit],
  );
  return rows.reverse();
}

export async function countRecentInbound(phone, seconds = 60) {
  const { rows } = await pool.query(
    `SELECT count(*)::int AS n FROM messages
     WHERE phone = $1 AND direction = 'in'
       AND created_at > now() - make_interval(secs => $2)`,
    [phone, seconds],
  );
  return rows[0].n;
}

export async function listConversations(limit = 50) {
  const { rows } = await pool.query(
    `SELECT c.phone, c.sender_name, c.paused, c.paused_reason, c.updated_at,
            m.content AS last_message, m.direction AS last_direction
     FROM conversations c
     LEFT JOIN LATERAL (
       SELECT content, direction FROM messages
       WHERE phone = c.phone ORDER BY id DESC LIMIT 1
     ) m ON true
     ORDER BY c.updated_at DESC LIMIT $1`,
    [limit],
  );
  return rows;
}

export async function getMessages(phone, limit = 100) {
  const { rows } = await pool.query(
    `SELECT id, direction, content, msg_type, created_at FROM messages
     WHERE phone = $1 ORDER BY id DESC LIMIT $2`,
    [phone, limit],
  );
  return rows.reverse();
}
