import express from "express";
import dotenv from "dotenv";
import axios from "axios";
import { GoogleGenAI } from "@google/genai";
import pool from "./config/db.js";
import cron from "node-cron";
import app from "./app.js";
import { startDailySummaryJob } from "./jobs/dailySummary.job.js";

dotenv.config();
await import("./config/env.js");

startDailySummaryJob();

app.listen(3000, () => {
  console.log("Server running on port 3000");
});
