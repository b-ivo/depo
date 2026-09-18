import "dotenv/config";
import cors from "cors";
import helmet from "helmet";
import { setServers } from "node:dns/promises";
import express from "express";

import connectDB from "./config/db.js";
import validateEnv from "./config/env.js";

import authRouter from "./routes/auth.js";
import beersRouter from "./routes/Beers.js";
import inventoryMovementsRouter from "./routes/InventoryMovements.js";
import initialStockRouter from "./routes/InitialStock.js";
import daysRouter from "./routes/days.js";
import usersRoutes from "./routes/users.js";
import businessesRoutes from "./routes/businesses.js";

import authMiddleware from "./middleware/auth.js";
import requireRole from "./middleware/roles.js";
import requireBusinessUser from "./middleware/requireBusinessUser.js";

setServers(["8.8.8.8", "1.1.1.1"]);

validateEnv();

const app = express();

const PORT = process.env.PORT || 5000;

const allowedOrigins = [
  process.env.CLIENT_URL || "http://localhost:5173",
  process.env.ADMIN_URL || "http://localhost:5174",
];


// =====================================
// MIDDLEWARE
// =====================================

app.use(helmet());

app.use(
  cors({
    origin: (origin, callback) => {
      // Requests without an Origin header (curl, Postman, server-to-server)
      // are allowed. Browser requests must come from a known origin.
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error("Not allowed by CORS."));
    },
  }),
);

app.use(express.json({ limit: "1mb" }));



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
app.use("/api/beers", requireBusinessUser, beersRouter);

// Daily operations
app.use("/api/days", requireBusinessUser, daysRouter);

// Inventory movements
app.use(
  "/api/inventory-movements",
  requireBusinessUser,
  inventoryMovementsRouter
);

// Initial stock
app.use("/api/initial-stock", requireBusinessUser, initialStockRouter);
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