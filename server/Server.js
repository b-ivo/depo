import "dotenv/config";
import cors from "cors";
import { setServers } from "node:dns/promises";
import express from "express";
import connectDB from "./config/db.js";
import beersRouter from "./routes/Beers.js";
import inventoryMovementsRouter from "./routes/InventoryMovements.js";
import initialStockRouter from "./routes/InitialStock.js";
import daysRouter from "./routes/days.js";

setServers(["8.8.8.8", "1.1.1.1"]);

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());

connectDB();

app.use(express.json());
app.use("/api/beers", beersRouter);
app.use("/api/days", daysRouter);
app.use("/api/inventory-movements", inventoryMovementsRouter);
app.use("/api/initial-stock", initialStockRouter);

app.listen(PORT, () => {
  console.log(`Mini DEPO API running on port ${PORT}`);
});
