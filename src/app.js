import express from "express";
import webhookRoutes from "./routes/webHook.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import { errorHandler } from "./middleware/error/errorHandler.js";

const app = express();

// Render and most hosts sit behind one proxy hop.
app.set("trust proxy", 1);
app.disable("x-powered-by");

// Keep the raw body: Meta's signature is computed over the exact bytes.
app.use(
  express.json({
    limit: "1mb",
    verify: (req, _res, buf) => {
      req.rawBody = buf;
    },
  }),
);

app.get("/health", (_req, res) => res.json({ ok: true }));
app.use("/webhook", webhookRoutes);
app.use("/admin", adminRoutes);

app.use(errorHandler);

export default app;
