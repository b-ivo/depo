import express from "express";
import mongoose from "mongoose";
import DailyRecord from "../models/DailyRecord.js";
import InventoryMovement from "../models/InventoryMovement.js";
import Beer from "../models/Beer.js";

const router = express.Router();

// Start a new business day
router.post("/start", async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Prevent starting the same business day twice.
    const existingDay = await DailyRecord.findOne({
      date: today,
    });

    if (existingDay) {
      return res.status(400).json({
        success: false,
        message: "Today's business day has already been started.",
      });
    }

    // Find the most recent business day.
    const previousDay = await DailyRecord.findOne().sort({
      date: -1,
    });

    if (!previousDay) {
      return res.status(400).json({
        success: false,
        message:
          "There is no previous business day. Initial stock must be established first.",
      });
    }

    // The previous day must be closed.
    if (!previousDay.closed) {
      return res.status(400).json({
        success: false,
        message:
          "The previous business day must be closed before starting a new day.",
      });
    }

    // Yesterday's evening stock becomes today's morning stock.
    const stock = previousDay.stock.map((item) => ({
      beer: item.beer,
      name: item.name,
      price: item.price,
      morning: item.evening,
      fulfilled: 0,
      evening: null,
      sold: null,
      expected: null,
    }));

    const dailyRecord = await DailyRecord.create({
      date: today,
      stock,

      totals: {
        sold: null,
        expectedSales: null,
        expectedCash: null,
      },

      payments: {
        mobileMoney: null,
        actualCash: null,
      },

      difference: null,
      status: null,
      closed: false,
    });

    res.status(201).json({
      success: true,
      message: "Business day started successfully.",
      data: dailyRecord,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Failed to start business day.",
    });
  }
});

// Record fulfillment for the current open business day
router.post("/fulfillment", async (req, res) => {
  try {
    const { beer, quantity } = req.body;

    if (!beer || quantity === undefined) {
      return res.status(400).json({
        success: false,
        message: "Beer and quantity are required.",
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

    const currentDay = await DailyRecord.findOne({
      closed: false,
    }).sort({ date: -1 });

    if (!currentDay) {
      return res.status(400).json({
        success: false,
        message: "There is no open business day.",
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

    const stockItem = currentDay.stock.find(
      (item) => item.beer.toString() === beer,
    );

    if (!stockItem) {
      return res.status(400).json({
        success: false,
        message: "This beer is not part of the current day's stock.",
      });
    }

    // Zero fulfillment is valid, but there is nothing to record.
    if (quantity === 0) {
      return res.json({
        success: true,
        message: "No fulfillment added.",
        data: currentDay,
      });
    }

    stockItem.fulfilled += quantity;

    await currentDay.save();

    const movement = await InventoryMovement.create({
      beer,
      type: "fulfillment",
      quantity,
      date: currentDay.date,
    });

    res.status(201).json({
      success: true,
      message: "Fulfillment recorded successfully.",
      data: {
        day: currentDay,
        movement,
      },
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Failed to record fulfillment.",
    });
  }
});

router.patch("/evening-stock", async (req, res) => {
  try {
    const { stock } = req.body;

    if (!Array.isArray(stock)) {
      return res.status(400).json({
        success: false,
        message: "Stock must be an array.",
      });
    }

    const currentDay = await DailyRecord.findOne({
      closed: false,
    }).sort({ date: -1 });

    if (!currentDay) {
      return res.status(400).json({
        success: false,
        message: "There is no open business day.",
      });
    }

    let totalSold = 0;
    let totalExpectedSales = 0;

    for (const item of stock) {
      if (!item.beer || item.evening === undefined) {
        return res.status(400).json({
          success: false,
          message: "Each stock item must contain beer and evening quantity.",
        });
      }

      if (!mongoose.Types.ObjectId.isValid(item.beer)) {
        return res.status(400).json({
          success: false,
          message: `Invalid beer ID: ${item.beer}`,
        });
      }

      if (
        typeof item.evening !== "number" ||
        !Number.isInteger(item.evening) ||
        item.evening < 0
      ) {
        return res.status(400).json({
          success: false,
          message: "Evening quantity must be a non-negative whole number.",
        });
      }

      const stockItem = currentDay.stock.find(
        (dayStock) => dayStock.beer.toString() === item.beer,
      );

      if (!stockItem) {
        return res.status(400).json({
          success: false,
          message: "Beer is not part of the current day's stock.",
        });
      }

      const available = stockItem.morning + stockItem.fulfilled;

      if (item.evening > available) {
        return res.status(400).json({
          success: false,
          message: `Evening stock for ${stockItem.name} cannot be greater than available stock.`,
        });
      }

      const sold = available - item.evening;
      const expected = sold * stockItem.price;

      stockItem.evening = item.evening;
      stockItem.sold = sold;
      stockItem.expected = expected;

      totalSold += sold;
      totalExpectedSales += expected;
    }

    currentDay.totals.sold = totalSold;
    currentDay.totals.expectedSales = totalExpectedSales;

    await currentDay.save();

    res.json({
      success: true,
      message: "Evening stock recorded and sales calculated successfully.",
      data: currentDay,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Failed to record evening stock.",
    });
  }
});

router.patch("/mobile-money", async (req, res) => {
  try {
    const { mobileMoney } = req.body;

    if (mobileMoney === undefined) {
      return res.status(400).json({
        success: false,
        message: "Mobile Money amount is required.",
      });
    }

    if (
      typeof mobileMoney !== "number" ||
      !Number.isFinite(mobileMoney) ||
      mobileMoney < 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Mobile Money must be a valid non-negative amount.",
      });
    }

    const currentDay = await DailyRecord.findOne({
      closed: false,
    }).sort({ date: -1 });

    if (!currentDay) {
      return res.status(400).json({
        success: false,
        message: "There is no open business day.",
      });
    }

    if (currentDay.totals.expectedSales === null) {
      return res.status(400).json({
        success: false,
        message: "Evening stock must be recorded before Mobile Money.",
      });
    }

    if (mobileMoney > currentDay.totals.expectedSales) {
      return res.status(400).json({
        success: false,
        message: "Mobile Money cannot be greater than total expected sales.",
      });
    }

    const expectedCash = currentDay.totals.expectedSales - mobileMoney;

    currentDay.payments.mobileMoney = mobileMoney;
    currentDay.totals.expectedCash = expectedCash;

    await currentDay.save();

    res.json({
      success: true,
      message: "Mobile Money recorded successfully.",
      data: currentDay,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Failed to record Mobile Money.",
    });
  }
});

router.patch("/actual-cash", async (req, res) => {
  try {
    const { actualCash } = req.body;

    if (actualCash === undefined) {
      return res.status(400).json({
        success: false,
        message: "Actual cash amount is required.",
      });
    }

    if (
      typeof actualCash !== "number" ||
      !Number.isFinite(actualCash) ||
      actualCash < 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Actual cash must be a valid non-negative amount.",
      });
    }

    const currentDay = await DailyRecord.findOne({
      closed: false,
    }).sort({ date: -1 });

    if (!currentDay) {
      return res.status(400).json({
        success: false,
        message: "There is no open business day.",
      });
    }

    if (currentDay.totals.expectedCash === null) {
      return res.status(400).json({
        success: false,
        message: "Mobile Money must be recorded before actual cash.",
      });
    }

    const difference = actualCash - currentDay.totals.expectedCash;

    let status;

    if (difference === 0) {
      status = "balanced";
    } else if (difference < 0) {
      status = "shortage";
    } else {
      status = "surplus";
    }

    currentDay.payments.actualCash = actualCash;
    currentDay.difference = difference;
    currentDay.status = status;

    await currentDay.save();

    res.json({
      success: true,
      message: "Actual cash recorded successfully.",
      data: currentDay,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Failed to record actual cash.",
    });
  }
});

router.post("/close", async (req, res) => {
  try {
    const currentDay = await DailyRecord.findOne({
      closed: false,
    }).sort({ date: -1 });

    if (!currentDay) {
      return res.status(400).json({
        success: false,
        message: "There is no open business day.",
      });
    }

    // Evening stock must be completed.
    if (currentDay.totals.expectedSales === null) {
      return res.status(400).json({
        success: false,
        message: "Evening stock must be recorded before closing the day.",
      });
    }

    // Mobile Money is optional.
    // If none was recorded, treat it as 0.
    if (currentDay.payments.mobileMoney === null) {
      currentDay.payments.mobileMoney = 0;
      currentDay.totals.expectedCash = currentDay.totals.expectedSales;
    }

    // Actual cash is required.
    if (currentDay.payments.actualCash === null) {
      return res.status(400).json({
        success: false,
        message: "Actual cash must be recorded before closing the day.",
      });
    }

    const expectedCash = currentDay.totals.expectedCash;
    const actualCash = currentDay.payments.actualCash;

    const difference = actualCash - expectedCash;

    let status;

    if (difference === 0) {
      status = "balanced";
    } else if (difference < 0) {
      status = "shortage";
    } else {
      status = "surplus";
    }

    currentDay.difference = difference;
    currentDay.status = status;
    currentDay.closed = true;

    await currentDay.save();

    res.json({
      success: true,
      message: "Business day closed successfully.",
      data: currentDay,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Failed to close business day.",
    });
  }
});

router.get("/", async (req, res) => {
  try {
    const days = await DailyRecord.find({
      closed: true,
    }).sort({
      date: -1,
    });

    res.json({
      success: true,
      count: days.length,
      data: days,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Failed to retrieve daily history.",
    });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid daily record ID.",
      });
    }

    const day = await DailyRecord.findById(id);

    if (!day) {
      return res.status(404).json({
        success: false,
        message: "Daily record not found.",
      });
    }

    res.json({
      success: true,
      data: day,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Failed to retrieve daily record.",
    });
  }
});

export default router;
