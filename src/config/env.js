const required = [
  "neonUrl",
  "GEMINI_API_KEY",
  "WHATSAPP_TOKEN",
  "PHONE_NUMBER_ID",
  "RESEND_API_KEY",
  "MY_EMAIL_ADDRESS",
  "VERIFY_TOKEN",
];

for (const key of required) {
  if (!process.env[key]) {
    throw new Error(`Missing env variable: ${key}`);
  }
}
