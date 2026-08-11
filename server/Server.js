import "dotenv/config";
import { setServers } from "node:dns/promises";
import express from "express";
import connectDB from "./config/db.js";

setServers(["8.8.8.8", "1.1.1.1"]);

const app = express();
const PORT = 5000;

connectDB();

app.use(express.json());

app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "Mini DEPO API is running",
  });
});

app.listen(PORT, () => {
  console.log(`Mini DEPO API running on port ${PORT}`);
});
