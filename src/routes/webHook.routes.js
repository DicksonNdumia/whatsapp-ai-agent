import { Router } from "express";
import {
  handleWebhook,
  verifyWebhook,
} from "../controller/webHook.controller.js";

const router = Router();

router.post("/", handleWebhook);
router.get("/", verifyWebhook);

export default router;
