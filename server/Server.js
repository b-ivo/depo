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
import crateLoansRouter from "./routes/CrateLoans.js";
import emptyCratesRouter from "./routes/EmptyCrates.js";
import usersRoutes from "./routes/users.js";
import businessesRoutes from "./routes/businesses.js";

import authMiddleware from "./middleware/auth.js";
import requireBusinessUser from "./middleware/requireBusinessUser.js";

setServers(["8.8.8.8", "1.1.1.1"]);

validateEnv();

const app = express();

const PORT = process.env.PORT || 5000;

// Remove whitespace and trailing slashes so a sloppy env value
// (e.g. "https://depo-gold.vercel.app/") still matches the browser's Origin.
const normalize = (url) => url?.trim().replace(/\/+$/, "");

const allowedOrigins = [
  normalize(process.env.CLIENT_URL) || "http://localhost:5173",
  normalize(process.env.ADMIN_URL) || "http://localhost:5174",
];

console.log("Allowed origins:", allowedOrigins);

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

      console.warn("Blocked origin:", origin);
      return callback(new Error("Not allowed by CORS."));
    },
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
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

// Everything below this line requires a valid JWT.
app.use(authMiddleware);

app.use("/api/beers", requireBusinessUser, beersRouter);

// Daily operations
app.use("/api/days", requireBusinessUser, daysRouter);

// Inventory movements
app.use(
  "/api/inventory-movements",
  requireBusinessUser,
  inventoryMovementsRouter,
);

// Initial stock
app.use("/api/initial-stock", requireBusinessUser, initialStockRouter);

// Empty crates lent out and not returned
app.use("/api/crate-loans", requireBusinessUser, crateLoansRouter);

// Empty crates physically present in the depot
app.use("/api/empty-crates", requireBusinessUser, emptyCratesRouter);

app.use("/api/businesses", businessesRoutes);
app.use("/api/users", usersRoutes);

// =====================================
// 404 + ERROR HANDLING
// =====================================

// Unknown route
app.use((req, res) => {
  res.status(404).json({ success: false, message: "Route not found" });
});

// Central error handler (must be last)
app.use((err, req, res, next) => {
  if (err.message === "Not allowed by CORS.") {
    return res
      .status(403)
      .json({ success: false, message: "Origin not allowed" });
  }

  console.error(err);
  res.status(500).json({ success: false, message: "Server error" });
});

// =====================================
// START SERVER
// =====================================

app.listen(PORT, () => {
  console.log(`Mini DEPO API running on port ${PORT}`);
});