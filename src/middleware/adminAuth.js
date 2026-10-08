import crypto from "node:crypto";
import { env } from "../config/env.js";

const safeEqual = (a, b) => {
  const x = crypto.createHash("sha256").update(String(a)).digest();
  const y = crypto.createHash("sha256").update(String(b)).digest();
  return crypto.timingSafeEqual(x, y);
};

export function adminAuth(req, res, next) {
  if (!env.ADMIN_PASSWORD) return res.sendStatus(404);

  const header = req.get("authorization") || "";
  const [scheme, encoded] = header.split(" ");
  if (scheme === "Basic" && encoded) {
    const decoded = Buffer.from(encoded, "base64").toString();
    const i = decoded.indexOf(":");
    const user = decoded.slice(0, i);
    const pass = decoded.slice(i + 1);
    if (
      i >= 0 &&
      safeEqual(user, env.ADMIN_USER) &&
      safeEqual(pass, env.ADMIN_PASSWORD)
    ) {
      return next();
    }
  }
  res.set("WWW-Authenticate", 'Basic realm="WhatsApp agent admin"');
  res.sendStatus(401);
}
