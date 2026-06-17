import express from "express";
import webhookRoutes from "./routes/webHook.routes.js";
import summaryRoutes from "./routes/summary.routes.js";
import { errorHandler } from "./middleware/error/errorHandler.js";
import { limiter } from "./middleware/error/helper/limit.js";
const app = express();

app.use(express.json());
app.set("trust proxy", 1);
app.use(limiter);

app.use("/webhook", webhookRoutes);
app.use("/test-summary", summaryRoutes);
app.use(errorHandler);

export default app;
