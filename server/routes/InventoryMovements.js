import express from "express";
import mongoose from "mongoose";

import InventoryMovement from "../models/InventoryMovement.js";
import Beer from "../models/Beer.js";

const router = express.Router();

// ===============================
// GET ALL INVENTORY MOVEMENTS
// ===============================
router.get("/", async (req, res) => {
  try {
    const businessId = req.user.businessId;

    const movements = await InventoryMovement.find({
      businessId,
    })
      .populate("beer", "name price")
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

    const movements = await InventoryMovement.find({
      businessId,
      beer: beerId,
    })
      .populate("beer", "name price")
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

    const movements = await InventoryMovement.find({
      businessId,
      date: {
        $gte: start,
        $lt: end,
      },
    })
      .populate("beer", "name price")
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