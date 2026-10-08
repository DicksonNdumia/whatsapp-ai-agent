import { env } from "../config/env.js";
import { logger } from "../config/logger.js";
import { isValidSignature } from "../utils/signature.js";

export function verifySignature(req, res, next) {
  if (
    !isValidSignature(
      req.rawBody,
      req.get("x-hub-signature-256"),
      env.META_APP_SECRET,
    )
  ) {
    logger.warn({ ip: req.ip }, "Rejected webhook with invalid signature");
    return res.sendStatus(401);
  }
  next();
}
