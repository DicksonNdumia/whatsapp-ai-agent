import express from "express";
import webhookRoutes from "./routes/webHook.routes.js";
import summaryRoutes from "./routes/summary.routes.js";
import { errorHandler } from "./middleware/error/errorHandler.js";
const app = express();

app.use(express.json());
app.use(errorHandler);

app.use("/webhook", webhookRoutes);
app.use("/test-summary", summaryRoutes);

export default app;
