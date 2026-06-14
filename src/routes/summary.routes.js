import { Router } from "express";
import { runSummary } from "../controller/summary.controller.js";
const router = Router();

router.get("/", runSummary);

export default router;
