import { Router } from "express";
import {
  verifyWebhook,
  handleWebhook,
} from "../controller/webhook.controller.js";
import { verifySignature } from "../middleware/verifySignature.js";

const router = Router();
router.get("/", verifyWebhook);
router.post("/", verifySignature, handleWebhook);

export default router;
