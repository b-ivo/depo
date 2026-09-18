import express from "express";
import mongoose from "mongoose";

import InventoryMovement from "../models/InventoryMovement.js";
import Beer from "../models/Beer.js";

const router = express.Router();

// ===============================
// GET ALL INVENTORY MOVEMENTS
// Supports ?userId= for per-staff history (admin only, staff sees own)
// ===============================
router.get("/", async (req, res) => {
  try {
    const businessId = req.user.businessId;
    const { userId } = req.query;

    const filter = { businessId };

    // Staff can only see own movements; admin can filter by any user
    if (req.user.role === "staff") {
      filter.performedBy = req.user.userId;
    } else if (userId) {
      if (!mongoose.Types.ObjectId.isValid(userId)) {
        return res.status(400).json({ success: false, message: "Invalid user ID." });
      }
      filter.performedBy = userId;
    }

    const movements = await InventoryMovement.find(filter)
      .populate("beer", "name price")
      .populate("performedBy", "username email role")
      .sort({ date: -1 });

    res.json({
      success: true,
      count: movements.length,
      data: movements,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch inventory movements.",
    });
  }
});

// ===============================
// GET MOVEMENTS FOR ONE BEER
// ===============================
router.get("/beer/:beerId", async (req, res) => {
  try {
    const { beerId } = req.params;
    const businessId = req.user.businessId;

    if (!mongoose.Types.ObjectId.isValid(beerId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid beer ID.",
      });
    }

    // Make sure the beer belongs to this business
    const beer = await Beer.findOne({
      _id: beerId,
      businessId,
    });

    if (!beer) {
      return res.status(404).json({
        success: false,
        message: "Beer not found.",
      });
    }

    const filter = { businessId, beer: beerId };
    if (req.user.role === "staff") filter.performedBy = req.user.userId;
    else if (req.query.userId) {
      if (!mongoose.Types.ObjectId.isValid(req.query.userId)) {
        return res.status(400).json({ success: false, message: "Invalid user ID." });
      }
      filter.performedBy = req.query.userId;
    }
    const movements = await InventoryMovement.find(filter)
      .populate("beer", "name price")
      .populate("performedBy", "username email role")
      .sort({ date: -1 });

    res.json({
      success: true,
      count: movements.length,
      data: movements,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch beer movements.",
    });
  }
});

// ===============================
// GET MOVEMENTS FOR ONE DAY
// ===============================
router.get("/day/:date", async (req, res) => {
  try {
    const { date } = req.params;
    const businessId = req.user.businessId;

    const start = new Date(date);

    if (Number.isNaN(start.getTime())) {
      return res.status(400).json({
        success: false,
        message: "Invalid date.",
      });
    }

    const end = new Date(start);
    end.setDate(end.getDate() + 1);

    const filter = {
      businessId,
      date: { $gte: start, $lt: end },
    };
    if (req.user.role === "staff") filter.performedBy = req.user.userId;
    else if (req.query.userId) {
      if (!mongoose.Types.ObjectId.isValid(req.query.userId)) {
        return res.status(400).json({ success: false, message: "Invalid user ID." });
      }
      filter.performedBy = req.query.userId;
    }
    const movements = await InventoryMovement.find(filter)
      .populate("beer", "name price")
      .populate("performedBy", "username email role")
      .sort({ date: -1 });

    res.json({
      success: true,
      count: movements.length,
      data: movements,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch daily inventory movements.",
    });
  }
});

export default router;