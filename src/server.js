import express from "express";
import dotenv from "dotenv";
import aiRoutes from "./routes/ai.routes.js";

dotenv.config();

const app = express();
app.use(express.json());

app.use("/webhook", aiRoutes);

app.listen(3000, () => {
  console.log("Server running on port 3000");
});
