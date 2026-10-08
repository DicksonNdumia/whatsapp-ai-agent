// Must be the first import in the app: loads .env before anything reads process.env.
import "dotenv/config";

const required = [
  "GEMINI_API_KEY",
  "WHATSAPP_TOKEN",
  "PHONE_NUMBER_ID",
  "VERIFY_TOKEN",
  "META_APP_SECRET",
  "RESEND_API_KEY",
  "MY_EMAIL_ADDRESS",
];

// `neonUrl` is accepted for backwards compatibility with the old config.
const databaseUrl = process.env.DATABASE_URL || process.env.neonUrl;

const missing = required.filter((key) => !process.env[key]);
if (!databaseUrl) missing.push("DATABASE_URL");
if (missing.length) {
  throw new Error(`Missing env variables: ${missing.join(", ")}`);
}

const digits = (value = "") => String(value).replace(/\D/g, "");
const num = (value, fallback) =>
  value !== undefined && value !== "" && Number.isFinite(Number(value))
    ? Number(value)
    : fallback;

export const env = {
  NODE_ENV: process.env.NODE_ENV || "development",
  PORT: num(process.env.PORT, 3000),
  LOG_LEVEL: process.env.LOG_LEVEL || "info",
  TIMEZONE: process.env.TIMEZONE || "Africa/Nairobi",

  DATABASE_URL: databaseUrl,
  DATABASE_SSL: process.env.DATABASE_SSL !== "false",

  GEMINI_API_KEY: process.env.GEMINI_API_KEY,
  GEMINI_MODEL: process.env.GEMINI_MODEL || "gemini-3.1-flash-lite",
  GEMINI_SUMMARY_MODEL: process.env.GEMINI_SUMMARY_MODEL || "gemini-2.5-flash",

  WHATSAPP_TOKEN: process.env.WHATSAPP_TOKEN,
  PHONE_NUMBER_ID: process.env.PHONE_NUMBER_ID,
  VERIFY_TOKEN: process.env.VERIFY_TOKEN,
  META_APP_SECRET: process.env.META_APP_SECRET,

  RESEND_API_KEY: process.env.RESEND_API_KEY,
  EMAIL_FROM: process.env.EMAIL_FROM || "WhatsApp Bot <onboarding@resend.dev>",
  MY_EMAIL_ADDRESS: process.env.MY_EMAIL_ADDRESS,

  // Digits only, with country code, e.g. 254700000000. Enables owner commands + WhatsApp alerts.
  OWNER_PHONE: digits(process.env.OWNER_PHONE),

  BOOKING_URL: process.env.BOOKING_URL || "",
  CV_URL: process.env.CV_URL || "",

  // Admin dashboard is disabled unless ADMIN_PASSWORD is set.
  ADMIN_USER: process.env.ADMIN_USER || "admin",
  ADMIN_PASSWORD: process.env.ADMIN_PASSWORD || "",

  HISTORY_LIMIT: num(process.env.HISTORY_LIMIT, 10),
  MAX_MESSAGES_PER_MINUTE: num(process.env.MAX_MESSAGES_PER_MINUTE, 12),
  WORKER_CONCURRENCY: num(process.env.WORKER_CONCURRENCY, 2),
};
