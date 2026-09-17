import "dotenv/config";
import cors from "cors";
import { setServers } from "node:dns/promises";
import express from "express";

import connectDB from "./config/db.js";

import authRouter from "./routes/auth.js";
import beersRouter from "./routes/Beers.js";
import inventoryMovementsRouter from "./routes/InventoryMovements.js";
import initialStockRouter from "./routes/InitialStock.js";
import daysRouter from "./routes/days.js";
import usersRoutes from "./routes/users.js";
import businessesRoutes from "./routes/businesses.js";

import authMiddleware from "./middleware/auth.js";
import requireRole from "./middleware/roles.js"

setServers(["8.8.8.8", "1.1.1.1"]);

const app = express();

const PORT = process.env.PORT || 5000;


// =====================================
// MIDDLEWARE
// =====================================

app.use(cors());

app.use(express.json());



// =====================================
// DATABASE
// =====================================

connectDB();


// =====================================
// PUBLIC ROUTES
// =====================================

// Authentication
app.use("/api/auth", authRouter);

// Health check
app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "Mini DEPO API is running",
  });
});

// =====================================
// PROTECTED ROUTES
// =====================================

// Everything below this line requires
// a valid JWT.
app.use(authMiddleware);


// Beers
app.get("/api/admin/test", requireRole("admin", "superadmin"), (req, res) => {
  res.json({
    success: true,
    message: "Admin access confirmed.",
  });
});
app.use("/api/beers", beersRouter);

// Daily operations
app.use("/api/days", daysRouter);

// Inventory movements
app.use(
  "/api/inventory-movements",
  inventoryMovementsRouter
);

// Initial stock
app.use("/api/initial-stock", initialStockRouter);
app.use("/api/businesses", businessesRoutes);
app.use("/api/users", usersRoutes);


// =====================================
// START SERVER
// =====================================

app.listen(PORT, () => {
  console.log(
    `Mini DEPO API running on port ${PORT}`
  );
});