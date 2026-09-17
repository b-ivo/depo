import express from "express";
import mongoose from "mongoose";

import Beer from "../models/Beer.js";
import DailyRecord from "../models/DailyRecord.js";

const router = express.Router();

/*
  CREATE INITIAL STOCK

  This can only happen if this business
  has no DailyRecords yet.
*/
router.post("/", async (req, res) => {
  try {
    const businessId = req.user.businessId;
    const { date, stock } = req.body;

    if (!date || !Array.isArray(stock)) {
      return res.status(400).json({
        success: false,
        message: "Date and stock are required.",
      });
    }

    // Check only this business.
    const existingRecords = await DailyRecord.countDocuments({
      businessId,
    });

    if (existingRecords > 0) {
      return res.status(400).json({
        success: false,
        message:
          "Initial stock can only be created before the first business day.",
      });
    }

    // Only active beers belonging to this business.
    const activeBeers = await Beer.find({
      businessId,
      active: true,
    }).sort({
      name: 1,
    });

    if (activeBeers.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No active beers exist.",
      });
    }

    const stockMap = new Map();

    for (const item of stock) {
      if (!item.beer || !mongoose.Types.ObjectId.isValid(item.beer)) {
        return res.status(400).json({
          success: false,
          message: "Invalid beer ID in initial stock.",
        });
      }

      if (
        typeof item.quantity !== "number" ||
        !Number.isInteger(item.quantity) ||
        item.quantity < 0
      ) {
        return res.status(400).json({
          success: false,
          message: "Initial stock quantities must be non-negative integers.",
        });
      }

      stockMap.set(item.beer, item.quantity);
    }

    const dailyStock = [];

    for (const beer of activeBeers) {
      const quantity = stockMap.get(beer._id.toString());

      if (quantity === undefined) {
        return res.status(400).json({
          success: false,
          message: `Initial stock is missing for ${beer.name}.`,
        });
      }

      dailyStock.push({
        beer: beer._id,
        name: beer.name,
        price: beer.price,
        morning: quantity,
        fulfilled: 0,
      });
    }

    const dailyRecord = await DailyRecord.create({
      businessId,
      date: new Date(date),
      stock: dailyStock,
      closed: false,
    });

    res.status(201).json({
      success: true,
      message: "Initial business day created successfully.",
      data: dailyRecord,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Failed to create initial stock.",
    });
  }
});

export default router;