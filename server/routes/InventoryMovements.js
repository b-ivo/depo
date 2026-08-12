import express from "express";
import mongoose from "mongoose";
import InventoryMovement from "../models/InventoryMovement.js";
import Beer from "../models/Beer.js";

const router = express.Router();

/*
  GET ALL INVENTORY MOVEMENTS
*/
router.get("/", async (req, res) => {
  try {
    const movements = await InventoryMovement.find()
      .populate("beer", "name price")
      .sort({
        date: -1,
        createdAt: -1,
      });

    res.json({
      success: true,
      count: movements.length,
      data: movements,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Failed to retrieve inventory movements.",
    });
  }
});

// GET MOVEMENTS FOR ONE BEER
router.get("/beer/:beerId", async (req, res) => {
  try {
    const { beerId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(beerId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid beer ID.",
      });
    }

    const beer = await Beer.findById(beerId);

    if (!beer) {
      return res.status(404).json({
        success: false,
        message: "Beer not found.",
      });
    }

    const movements = await InventoryMovement.find({
      beer: beerId,
    })
      .populate("beer", "name price")
      .sort({
        date: -1,
        createdAt: -1,
      });

    res.json({
      success: true,
      count: movements.length,
      data: movements,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Failed to retrieve beer movements.",
    });
  }
});

/*
  GET MOVEMENTS FOR ONE DAY
*/
router.get("/day/:date", async (req, res) => {
  try {
    const { date } = req.params;

    const startDate = new Date(`${date}T00:00:00.000Z`);

    if (Number.isNaN(startDate.getTime())) {
      return res.status(400).json({
        success: false,
        message: "Invalid date.",
      });
    }

    const endDate = new Date(startDate);
    endDate.setUTCDate(endDate.getUTCDate() + 1);

    const movements = await InventoryMovement.find({
      date: {
        $gte: startDate,
        $lt: endDate,
      },
    })
      .populate("beer", "name price")
      .sort({
        createdAt: 1,
      });

    res.json({
      success: true,
      count: movements.length,
      data: movements,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Failed to retrieve daily inventory movements.",
    });
  }
});

export default router;
