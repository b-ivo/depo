import express from "express";
import mongoose from "mongoose";
import InventoryMovement from "../models/InventoryMovement.js";
import Beer from "../models/Beer.js";

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const { beer, quantity, date } = req.body;

    if (!beer || quantity === undefined || !date) {
      return res.status(400).json({
        success: false,
        message: "Beer, quantity, and date are required.",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(beer)) {
      return res.status(400).json({
        success: false,
        message: "Invalid beer ID.",
      });
    }

    if (
      typeof quantity !== "number" ||
      !Number.isInteger(quantity) ||
      quantity < 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Quantity must be a non-negative whole number.",
      });
    }

    const selectedBeer = await Beer.findOne({
      _id: beer,
      active: true,
    });

    if (!selectedBeer) {
      return res.status(404).json({
        success: false,
        message: "Beer not found or inactive.",
      });
    }

    const movement = await InventoryMovement.create({
      beer,
      type: "fulfillment",
      quantity,
      date: new Date(date),
    });

    res.status(201).json({
      success: true,
      data: movement,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Failed to record fulfillment.",
    });
  }
});

export default router;
