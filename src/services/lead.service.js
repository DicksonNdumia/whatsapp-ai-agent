import pool from "../config/db.js";
import { sendLeadEmail } from "./email.service.js";

/** One active lead per phone: later calls fill in or update fields. */
export async function upsertLead(phone, fields) {
  const { name, project_type, budget, timeline, details } = fields;
  const existing = await pool.query(
    `SELECT id FROM leads WHERE phone = $1 AND status <> 'closed' ORDER BY id DESC LIMIT 1`,
    [phone],
  );

  let lead;
  let isNew = false;
  if (existing.rows[0]) {
    const { rows } = await pool.query(
      `UPDATE leads SET
         name = COALESCE($2, name), project_type = COALESCE($3, project_type),
         budget = COALESCE($4, budget), timeline = COALESCE($5, timeline),
         details = COALESCE($6, details), updated_at = now()
       WHERE id = $1 RETURNING *`,
      [
        existing.rows[0].id,
        name ?? null,
        project_type ?? null,
        budget ?? null,
        timeline ?? null,
        details ?? null,
      ],
    );
    lead = rows[0];
  } else {
    isNew = true;
    const { rows } = await pool.query(
      `INSERT INTO leads (phone, name, project_type, budget, timeline, details)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [
        phone,
        name ?? null,
        project_type ?? null,
        budget ?? null,
        timeline ?? null,
        details ?? null,
      ],
    );
    lead = rows[0];
  }

  sendLeadEmail(lead, isNew).catch(() => {});
  return { lead, isNew };
}

export async function listLeads(limit = 50) {
  const { rows } = await pool.query(
    `SELECT * FROM leads ORDER BY updated_at DESC LIMIT $1`,
    [limit],
  );
  return rows;
}

export async function setLeadStatus(id, status) {
  const { rows } = await pool.query(
    `UPDATE leads SET status = $2, updated_at = now() WHERE id = $1 RETURNING *`,
    [id, status],
  );
  return rows[0] || null;
}

export async function saveMeetingRequest({
  phone,
  name,
  preferredTime,
  topic,
}) {
  await pool.query(
    `INSERT INTO meeting_requests (phone, name, preferred_time, topic) VALUES ($1, $2, $3, $4)`,
    [phone, name ?? null, preferredTime ?? null, topic ?? null],
  );
}
