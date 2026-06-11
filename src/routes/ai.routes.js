import express from "express";
import { messageHandler, metaVerification } from "../controller/ai.js";

const router = express.Router();

router.get("/", metaVerification);
router.post("/", messageHandler);

export default router;
