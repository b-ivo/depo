import express from "express";
import mongoose from "mongoose";
import EmptyCrate from "../models/EmptyCrate.js";
import Beer from "../models/Beer.js";

const router = express.Router();

// ===============================
// GET EMPTY CRATES IN DEPOT
// ===============================
router.get("/", async (req, res) => {
  try {
    const businessId = req.user.businessId;

    const emptyCrates = await EmptyCrate.find({
      businessId,
    })
      .sort({ name: 1 })
      .lean();

    const total = emptyCrates.reduce(
      (sum, item) => sum + item.quantity,
      0,
    );

    res.json({
      success: true,
      count: emptyCrates.length,
      total,
      data: emptyCrates,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Failed to retrieve empty crate stock.",
    });
  }
});

// ===============================
// RECORD END OF DAY COUNT
// ===============================
router.post("/count", async (req, res) => {
  try {
    const businessId = req.user.businessId;
    const { date, lines } = req.body;

    if (!Array.isArray(lines) || lines.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Provide at least one empty crate count.",
      });
    }

    if (date && Number.isNaN(new Date(date).getTime())) {
      return res.status(400).json({
        success: false,
        message: "Count date must be a valid date.",
      });
    }

    const countedOn = date ? new Date(date) : new Date();

    const recorded = [];

    for (const entry of lines) {
      const { beer, quantity } = entry ?? {};

      if (!beer || quantity === undefined) {
        return res.status(400).json({
          success: false,
          message: "Each line needs a beer and a crate count.",
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
          message:
            "Empty crate count must be a whole number of zero or more.",
        });
      }

      const beerDoc = await Beer.findOne({
        _id: beer,
        businessId,
      });

      if (!beerDoc) {
        return res.status(404).json({
          success: false,
          message: "Beer not found.",
        });
      }

      const previous = await EmptyCrate.findOne({
        businessId,
        beer: beerDoc._id,
      });

      const emptyCrate = await EmptyCrate.findOneAndUpdate(
        { businessId, beer: beerDoc._id },
        {
          $set: {
            name: beerDoc.name,
            quantity,
            countedOn,
            countedQuantity: quantity,
            countedBy: req.user.userId,
          },
          $setOnInsert: { businessId, beer: beerDoc._id },
        },
        { returnDocument: "after", upsert: true },
      );

      if (!emptyCrate) {
        return res.status(500).json({
          success: false,
          message: "Failed to record empty crate count.",
        });
      }

      recorded.push({
        beer: emptyCrate.beer,
        name: emptyCrate.name,
        quantity: emptyCrate.quantity,
        previousQuantity: previous?.quantity ?? 0,
        difference: quantity - (previous?.quantity ?? 0),
      });
    }

    const total = recorded.reduce(
      (sum, item) => sum + item.quantity,
      0,
    );

    res.json({
      success: true,
      message: "Empty crate count recorded successfully.",
      data: {
        countedOn,
        total,
        lines: recorded,
      },
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Failed to record empty crate count.",
    });
  }
});

export default router;
