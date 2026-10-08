import crypto from "node:crypto";

/** Validates Meta's X-Hub-Signature-256 header against the raw request body. */
export function isValidSignature(rawBody, header, secret) {
  if (!rawBody || !header || !secret) return false;
  const expected =
    "sha256=" +
    crypto.createHmac("sha256", secret).update(rawBody).digest("hex");
  const a = Buffer.from(header);
  const b = Buffer.from(expected);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}
