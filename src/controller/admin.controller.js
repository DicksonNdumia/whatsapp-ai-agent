import pool from "../config/db.js";
import { env } from "../config/env.js";
import { digitsOnly } from "../utils/text.js";
import { listLeads, setLeadStatus } from "../services/lead.service.js";
import {
  listConversations,
  getMessages,
  setPaused,
  saveMessage,
  touchConversation,
} from "../services/conversation.service.js";
import { sendText } from "../services/whatsApp.service.js";
import { runDailySummary } from "../services/summary.service.js";

const LEAD_STATUSES = ["new", "contacted", "won", "closed"];
const DAY_START = `(date_trunc('day', now() AT TIME ZONE $1) AT TIME ZONE $1)`;

export async function overview(_req, res) {
  const tz = [env.TIMEZONE];
  const [msgs, leads, paused, usage, queue] = await Promise.all([
    pool.query(
      `SELECT count(*)::int AS n FROM messages WHERE direction = 'in' AND created_at >= ${DAY_START}`,
      tz,
    ),
    pool.query(`SELECT status, count(*)::int AS n FROM leads GROUP BY status`),
    pool.query(`SELECT count(*)::int AS n FROM conversations WHERE paused`),
    pool.query(
      `SELECT
         coalesce(sum(total_tokens) FILTER (WHERE created_at >= ${DAY_START}), 0)::int AS today,
         coalesce(sum(total_tokens) FILTER (WHERE created_at >= now() - interval '7 days'), 0)::int AS week,
         coalesce(sum(total_tokens) FILTER (WHERE created_at >= now() - interval '30 days'), 0)::int AS month
       FROM usage_log`,
      tz,
    ),
    pool.query(
      `SELECT status, count(*)::int AS n FROM jobs WHERE status IN ('pending','running','failed') GROUP BY status`,
    ),
  ]);
  res.json({
    messagesToday: msgs.rows[0].n,
    leadsByStatus: Object.fromEntries(leads.rows.map((r) => [r.status, r.n])),
    pausedChats: paused.rows[0].n,
    tokens: usage.rows[0],
    queue: Object.fromEntries(queue.rows.map((r) => [r.status, r.n])),
    timezone: env.TIMEZONE,
  });
}

export async function leads(_req, res) {
  res.json(await listLeads(100));
}

export async function updateLead(req, res) {
  const { status } = req.body || {};
  if (!LEAD_STATUSES.includes(status))
    return res.status(400).json({ error: "Invalid status" });
  const lead = await setLeadStatus(Number(req.params.id), status);
  if (!lead) return res.sendStatus(404);
  res.json(lead);
}

export async function conversations(_req, res) {
  res.json(await listConversations(100));
}

export async function conversation(req, res) {
  res.json(await getMessages(digitsOnly(req.params.phone), 150));
}

export async function pause(req, res) {
  await setPaused(digitsOnly(req.params.phone), true, "Paused from dashboard");
  res.json({ paused: true });
}

export async function resume(req, res) {
  await setPaused(digitsOnly(req.params.phone), false);
  res.json({ paused: false });
}

export async function reply(req, res) {
  const phone = digitsOnly(req.params.phone);
  const text = String(req.body?.text || "").trim();
  if (!phone || !text) return res.status(400).json({ error: "text required" });
  await sendText(phone, text);
  await touchConversation(phone, null);
  await saveMessage({
    phone,
    content: text,
    direction: "out",
    msgType: "human",
  });
  await setPaused(phone, true, "Owner replied from dashboard");
  res.json({ sent: true });
}

export async function runSummary(_req, res) {
  await runDailySummary();
  res.json({ ok: true });
}
