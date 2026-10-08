import { Router } from "express";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { adminAuth } from "../middleware/adminAuth.js";
import { adminLimiter } from "../middleware/rateLimit.js";
import * as c from "../controller/admin.controller.js";

const here = path.dirname(fileURLToPath(import.meta.url));
const router = Router();

// Express 5 forwards rejected promises from async handlers to the error handler.
router.use(adminAuth, adminLimiter);
router.get("/", (_req, res) =>
  res.sendFile(path.join(here, "../admin/index.html")),
);

router.get("/api/overview", c.overview);
router.get("/api/leads", c.leads);
router.patch("/api/leads/:id", c.updateLead);
router.get("/api/conversations", c.conversations);
router.get("/api/conversations/:phone", c.conversation);
router.post("/api/conversations/:phone/pause", c.pause);
router.post("/api/conversations/:phone/resume", c.resume);
router.post("/api/conversations/:phone/reply", c.reply);
router.post("/api/summary/run", c.runSummary);

export default router;
