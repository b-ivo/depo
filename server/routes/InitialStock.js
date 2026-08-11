import express from "express";
import Beer from "../models/Beer.js";
import DailyRecord from "../models/DailyRecord.js";

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const { date, stock } = req.body;

    if (!date || !Array.isArray(stock)) {
      return res.status(400).json({
        success: false,
        message: "Date and stock are required.",
      });
    }

    const existingRecords = await DailyRecord.countDocuments();

    if (existingRecords > 0) {
      return res.status(400).json({
        success: false,
        message:
          "Initial stock can only be created before the first business day.",
      });
    }

    const activeBeers = await Beer.find({ active: true }).sort({
      name: 1,
    });

    if (activeBeers.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No active beers exist.",
      });
    }

    const stockMap = new Map(stock.map((item) => [item.beer, item.quantity]));

    const dailyStock = [];

    for (const beer of activeBeers) {
      const quantity = stockMap.get(beer._id.toString());

      if (quantity === undefined) {
        return res.status(400).json({
          success: false,
          message: `Initial stock is missing for ${beer.name}.`,
        });
      }

      if (
        typeof quantity !== "number" ||
        !Number.isInteger(quantity) ||
        quantity < 0
      ) {
        return res.status(400).json({
          success: false,
          message: `Invalid stock quantity for ${beer.name}.`,
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
