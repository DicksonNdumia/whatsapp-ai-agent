import { logger } from "../../config/logger.js";
export function errorHandler(err, req, res, _next) {
  logger.error({ err, path: req.path }, "Unhandled error");
  res.status(err.status || 500).json({ error: "Internal server error" });
}
