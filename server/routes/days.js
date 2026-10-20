import express from "express";
import mongoose from "mongoose";
import DailyRecord from "../models/DailyRecord.js";
import InventoryMovement from "../models/InventoryMovement.js";
import Beer from "../models/Beer.js";
import EmptyCrate from "../models/EmptyCrate.js";
import CrateLoan from "../models/CrateLoan.js";

const router = express.Router();

function sumOf(list, field) {
  return list.reduce((total, item) => total + (item[field] ?? 0), 0);
}

/*
  Build the empty crate lines for a new day.

  Continuity rule: the previous day's closing count becomes today's
  opening count, so a day always continues from where the last one
  finished. When the previous day has no closing count (older record),
  the live depot quantity is used instead.
*/
async function buildDayEmptyCrates(businessId, previousDay) {
  const stocks = await EmptyCrate.find({ businessId }).lean();

  if (stocks.length === 0) {
    return [];
  }

  const previous = new Map(
    (previousDay?.emptyCrates ?? []).map((item) => [
      String(item.beer),
      item,
    ]),
  );

  return stocks.map((item) => {
    const before = previous.get(String(item.beer));

    return {
      beer: item.beer,
      name: item.name,
      opening: before?.closing ?? item.quantity ?? 0,
      closing: null,
      lent: 0,
      returned: 0,
    };
  });
}

function dayRange(date) {
  const start = new Date(date);

  start.setHours(0, 0, 0, 0);

  const end = new Date(start);

  end.setDate(end.getDate() + 1);

  return { start, end };
}

/*
  Work out the crate movement of one business day.

  lent      : crates handed to borrowers on that day
  returned  : crates handed back to the depot on that day
  stillOut  : crates held by borrowers right now, across every loan
  borrowers : one entry per borrower, with the beer lines and a total

  Returns are matched with a time range because a return is stamped with
  the real time it happened, while a business day only knows the date.
*/
async function buildDayCrateActivity(businessId, day, { live = false } = {}) {
  const { start, end } = dayRange(day.date);

  const allLoans = await CrateLoan.find({ businessId }).lean();

  // Every return that landed inside this business day, per loan.
  const returnsOnDay = new Map();

  for (const loan of allLoans) {
    for (const entry of loan.returns ?? []) {
      const at = new Date(entry.date);

      if (at < start || at >= end) {
        continue;
      }

      const bucket = returnsOnDay.get(String(loan._id)) ?? [];

      bucket.push(entry);
      returnsOnDay.set(String(loan._id), bucket);
    }
  }

  // Loans made on this day, and loans that had something returned on it.
  const isLoanDay = (loan) => {
    const at = new Date(loan.date);

    return at >= start && at < end;
  };

  const hasReturnOnDay = (loan) =>
    (returnsOnDay.get(String(loan._id)) ?? []).length > 0;

  const involved = allLoans.filter(
    (loan) => isLoanDay(loan) || hasReturnOnDay(loan),
  );

  const borrowers = involved.map((loan) => {
    const events = returnsOnDay.get(String(loan._id)) ?? [];

    const returnedOnThisDay = events.reduce(
      (total, event) => total + (event.crates ?? 0),
      0,
    );

    // Per beer returns for this day, when the return event recorded them.
    const perBeer = new Map();

    for (const event of events) {
      for (const line of event.lines ?? []) {
        const key = String(line.beer);

        perBeer.set(key, (perBeer.get(key) ?? 0) + line.crates);
      }
    }

    return {
      loan: loan._id,
      borrowerName: loan.borrowerName,
      phone: loan.phone ?? null,
      notes: loan.notes ?? null,
      // True when the loan itself was handed out on this day.
      madeOnThisDay: isLoanDay(loan),
      lines: loan.lines.map((line) => ({
        beer: line.beer,
        name: line.name,
        lent: line.crates,
        returnedSameDay: perBeer.get(String(line.beer)) ?? 0,
        returnedSoFar: line.returned ?? 0,
        stillOut: (line.crates ?? 0) - (line.returned ?? 0),
      })),
      totalCrates: loan.totalCrates ?? 0,
      returnedCrates: loan.returnedCrates ?? 0,
      returnedOnThisDay,
      stillOut: (loan.totalCrates ?? 0) - (loan.returnedCrates ?? 0),
      status: loan.status,
      settledOnThisDay: loan.settledAt
        ? new Date(loan.settledAt) >= start && new Date(loan.settledAt) < end
        : false,
    };
  });

  const lentOnThisDay = borrowers
    .filter((borrower) => borrower.madeOnThisDay)
    .reduce((total, borrower) => total + borrower.totalCrates, 0);

  const returnedOnThisDay = borrowers.reduce(
    (total, borrower) => total + borrower.returnedOnThisDay,
    0,
  );

  // Live figure: what every borrower still holds right now.
  const stillOut = allLoans.reduce(
    (total, loan) =>
      total + (loan.totalCrates ?? 0) - (loan.returnedCrates ?? 0),
    0,
  );

  // Per beer crate movement of the day.
  const perBeer = new Map();

  for (const borrower of borrowers) {
    for (const line of borrower.lines) {
      const key = String(line.beer);

      const entry = perBeer.get(key) ?? {
        beer: line.beer,
        name: line.name,
        lent: 0,
        returned: 0,
      };

      if (borrower.madeOnThisDay) {
        entry.lent += line.lent;
      }

      entry.returned += line.returnedSameDay;
      perBeer.set(key, entry);
    }
  }

  // Opening and closing depot position per beer.
  const stocks = await EmptyCrate.find({ businessId }).lean();

  const emptyCrates = stocks.map((stock) => {
    const existing = (day.emptyCrates ?? []).find(
      (item) => String(item.beer) === String(stock.beer),
    );

    const movement = perBeer.get(String(stock.beer));

    return {
      beer: stock.beer,
      name: stock.name,
      opening: existing?.opening ?? stock.quantity ?? 0,
      closing: live ? (stock.quantity ?? 0) : (existing?.closing ?? null),
      lent: movement?.lent ?? 0,
      returned: movement?.returned ?? 0,
    };
  });

  return {
    emptyCrates,
    borrowers,
    crateTotals: {
      opening: sumOf(emptyCrates, "opening"),
      closing: live
        ? sumOf(emptyCrates, "closing")
        : (day.crateTotals?.closing ?? null),
      lent: lentOnThisDay,
      returned: returnedOnThisDay,
      stillOut,
      // Kept as entered by the user, never recalculated.
      amavide: day.crateTotals?.amavide ?? null,
    },
  };
}

/*
  START BUSINESS DAY
  Previous day's evening stock becomes today's morning stock.
  Previous day's closing empty crates become today's opening count.
  Fulfillment is optional.
*/
router.post("/start", async (req, res) => {
  try {
    const businessId = req.user.businessId;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Prevent starting the same business day twice.
    const existingDay = await DailyRecord.findOne({
      businessId,
      date: today,
    });

    if (existingDay) {
      return res.status(400).json({
        success: false,
        message: "Today's business day has already been started.",
      });
    }

    // Find the most recent business day for THIS business.
    const previousDay = await DailyRecord.findOne({
      businessId,
    }).sort({
      date: -1,
    });

    if (!previousDay) {
      return res.status(400).json({
        success: false,
        message:
          "There is no previous business day. Initial stock must be established first.",
      });
    }

    // Previous day must be closed first.
    if (!previousDay.closed) {
      return res.status(400).json({
        success: false,
        code: "PREVIOUS_DAY_NOT_CLOSED",
        message: `The business day of ${previousDay.date.toLocaleDateString()} must be closed before starting a new day. Record its evening stock and actual cash, then close it.`,
        data: {
          blockingDate: previousDay.date,
        },
      });
    }

    // Previous evening stock becomes today's morning stock.
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

    const emptyCrates = await buildDayEmptyCrates(businessId, previousDay);

    const dailyRecord = await DailyRecord.create({
      businessId,
      date: today,
      stock,
      emptyCrates,
      borrowers: [],
      crateTotals: {
        opening: sumOf(emptyCrates, "opening"),
        closing: null,
        lent: 0,
        returned: 0,
        stillOut: 0,
        amavide: null,
      },
      createdBy: req.user.userId,
      lastModifiedBy: req.user.userId,

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

/*
  GET CURRENT OPEN BUSINESS DAY
*/
router.get("/current", async (req, res) => {
  try {
    const businessId = req.user.businessId;

    const currentDay = await DailyRecord.findOne({
      businessId,
      closed: false,
    }).sort({
      date: -1,
    });

    if (currentDay) {
      const crateActivity = await buildDayCrateActivity(
        businessId,
        currentDay,
        { live: true },
      );

      return res.json({
        success: true,
        data: {
          ...currentDay.toObject(),
          emptyCrates: crateActivity.emptyCrates,
          borrowers: crateActivity.borrowers,
          crateTotals: crateActivity.crateTotals,
        },
      });
    }

    // Check whether today's business day already exists.
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayDay = await DailyRecord.findOne({
      businessId,
      date: today,
    });

    if (todayDay && todayDay.closed) {
      return res.status(409).json({
        success: false,
        code: "DAY_ALREADY_CLOSED",
        message: "Today's business day has already been closed.",
      });
    }

    return res.status(404).json({
      success: false,
      code: "NO_OPEN_DAY",
      message: "Today's business day has not been started yet.",
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Failed to retrieve current business day.",
    });
  }
});

/*
  ADD A BEER TO THE CURRENT OPEN BUSINESS DAY
*/
router.post("/add-beer", async (req, res) => {
  try {
    const businessId = req.user.businessId;
    const { beer } = req.body;

    if (!beer) {
      return res.status(400).json({
        success: false,
        message: "Beer ID is required.",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(beer)) {
      return res.status(400).json({
        success: false,
        message: "Invalid beer ID.",
      });
    }

    const currentDay = await DailyRecord.findOne({
      businessId,
      closed: false,
    }).sort({
      date: -1,
    });

    if (!currentDay) {
      return res.status(400).json({
        success: false,
        message: "There is no open business day.",
      });
    }

    // Beer must belong to the current business.
    const selectedBeer = await Beer.findOne({
      _id: beer,
      businessId,
      active: true,
    });

    if (!selectedBeer) {
      return res.status(404).json({
        success: false,
        message: "Beer not found or inactive.",
      });
    }

    const alreadyExists = currentDay.stock.some(
      (item) => item.beer.toString() === beer,
    );

    if (alreadyExists) {
      return res.status(409).json({
        success: false,
        message: "This beer is already part of today's stock.",
      });
    }

    currentDay.stock.push({
      beer: selectedBeer._id,
      name: selectedBeer.name,
      price: selectedBeer.price,
      morning: 0,
      fulfilled: 0,
      evening: null,
      sold: null,
      expected: null,
    });

    // A new beer also needs an empty crate line for the day.
    const emptyCrateStock = await EmptyCrate.findOne({
      businessId,
      beer: selectedBeer._id,
    }).lean();

    if (emptyCrateStock) {
      const crateLine = currentDay.emptyCrates.find(
        (item) => item.beer.toString() === selectedBeer._id.toString(),
      );

      if (!crateLine) {
        currentDay.emptyCrates.push({
          beer: selectedBeer._id,
          name: selectedBeer.name,
          opening: emptyCrateStock.quantity ?? 0,
          closing: null,
          lent: 0,
          returned: 0,
        });

        currentDay.crateTotals.opening = sumOf(
          currentDay.emptyCrates,
          "opening",
        );
      }
    }

    currentDay.lastModifiedBy = req.user.userId;
    await currentDay.save();

    res.status(201).json({
      success: true,
      message: "Beer added to today's stock successfully.",
      data: currentDay,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Failed to add beer to today's stock.",
    });
  }
});

/*
  RECORD FULFILLMENT
  Fulfillment is optional.
*/
router.post("/fulfillment", async (req, res) => {
  try {
    const businessId = req.user.businessId;
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
      businessId,
      closed: false,
    }).sort({
      date: -1,
    });

    if (!currentDay) {
      return res.status(400).json({
        success: false,
        message: "There is no open business day.",
      });
    }

    const selectedBeer = await Beer.findOne({
      _id: beer,
      businessId,
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

    // Zero fulfillment is valid but there is nothing to record.
    if (quantity === 0) {
      return res.json({
        success: true,
        message: "No fulfillment added.",
        data: currentDay,
      });
    }

    stockItem.fulfilled += quantity;
    currentDay.lastModifiedBy = req.user.userId;
    await currentDay.save();

    const movement = await InventoryMovement.create({
      businessId,
      beer,
      type: "fulfillment",
      quantity,
      date: currentDay.date,
      performedBy: req.user.userId,
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

/*
  UPDATE TOTAL FULFILLMENT FOR A BEER
*/
router.patch("/fulfillment/:beerId", async (req, res) => {
  try {
    const businessId = req.user.businessId;
    const { beerId } = req.params;
    const { quantity } = req.body;

    if (!mongoose.Types.ObjectId.isValid(beerId)) {
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
      businessId,
      closed: false,
    }).sort({
      date: -1,
    });

    if (!currentDay) {
      return res.status(400).json({
        success: false,
        message: "There is no open business day.",
      });
    }

    const stockItem = currentDay.stock.find(
      (item) => item.beer.toString() === beerId,
    );

    if (!stockItem) {
      return res.status(404).json({
        success: false,
        message: "This beer is not part of today's stock.",
      });
    }

    if (stockItem.evening !== null) {
      return res.status(400).json({
        success: false,
        message:
          "Fulfillment cannot be edited after evening stock has been recorded.",
      });
    }

    stockItem.fulfilled = quantity;
    currentDay.lastModifiedBy = req.user.userId;
    await currentDay.save();

    // --- Real-time inventory sync: keep InventoryMovement in sync with fulfilled total ---
    await InventoryMovement.deleteMany({
      businessId,
      beer: beerId,
      date: currentDay.date,
    });
    if (quantity > 0) {
      await InventoryMovement.create({
        businessId,
        beer: beerId,
        type: "fulfillment",
        quantity,
        date: currentDay.date,
        performedBy: req.user.userId,
      });
    }

    res.json({
      success: true,
      message: "Fulfillment updated successfully.",
      data: currentDay,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Failed to update fulfillment.",
    });
  }
});

/*
  RECORD EVENING STOCK
  Calculates sold quantity and expected sales.
*/
router.patch("/evening-stock", async (req, res) => {
  try {
    const businessId = req.user.businessId;
    const { stock } = req.body;

    if (!Array.isArray(stock)) {
      return res.status(400).json({
        success: false,
        message: "Stock must be an array.",
      });
    }

    const currentDay = await DailyRecord.findOne({
      businessId,
      closed: false,
    }).sort({
      date: -1,
    });

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

    if (currentDay.payments.mobileMoney !== null) {
      currentDay.totals.expectedCash =
        totalExpectedSales - currentDay.payments.mobileMoney;
    }
    currentDay.lastModifiedBy = req.user.userId;
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

/*
  RECORD MOBILE MONEY
*/
router.patch("/mobile-money", async (req, res) => {
  try {
    const businessId = req.user.businessId;
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
      businessId,
      closed: false,
    }).sort({
      date: -1,
    });

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

    const expectedCash =
      currentDay.totals.expectedSales - mobileMoney;

    currentDay.payments.mobileMoney = mobileMoney;
    currentDay.totals.expectedCash = expectedCash;
    currentDay.lastModifiedBy = req.user.userId;
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

/*
  RECORD AMAVIDE (TOTAL EMPTY CRATES IN THE DEPOT)
  A single total for the day, not per beer.
*/
router.patch("/amavide", async (req, res) => {
  try {
    const businessId = req.user.businessId;
    const { amavide } = req.body;

    if (amavide === undefined) {
      return res.status(400).json({
        success: false,
        message: "The total empty crate count is required.",
      });
    }

    if (
      typeof amavide !== "number" ||
      !Number.isInteger(amavide) ||
      amavide < 0
    ) {
      return res.status(400).json({
        success: false,
        message: "The empty crate count must be a whole number, zero or more.",
      });
    }

    const currentDay = await DailyRecord.findOne({
      businessId,
      closed: false,
    }).sort({
      date: -1,
    });

    if (!currentDay) {
      return res.status(400).json({
        success: false,
        message: "There is no open business day.",
      });
    }

    currentDay.crateTotals.amavide = amavide;

    // The day often has no empty crate lines yet, so keep the depot
    // figure and the day in step for reporting.
    if (currentDay.emptyCrates.length === 0) {
      currentDay.crateTotals.closing = amavide;
    }

    currentDay.lastModifiedBy = req.user.userId;
    await currentDay.save();

    res.json({
      success: true,
      message: "Empty crate count recorded successfully.",
      data: currentDay,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Failed to record the empty crate count.",
    });
  }
});

/*
  RECORD ACTUAL CASH
*/
router.patch("/actual-cash", async (req, res) => {
  try {
    const businessId = req.user.businessId;
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
      businessId,
      closed: false,
    }).sort({
      date: -1,
    });

    if (!currentDay) {
      return res.status(400).json({
        success: false,
        message: "There is no open business day.",
      });
    }

    if (currentDay.totals.expectedSales === null) {
      return res.status(400).json({
        success: false,
        message: "Evening stock must be recorded before actual cash.",
      });
    }

    if (currentDay.payments.mobileMoney === null) {
      currentDay.payments.mobileMoney = 0;

      currentDay.totals.expectedCash =
        currentDay.totals.expectedSales;
    }

    const difference =
      actualCash - currentDay.totals.expectedCash;

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
    currentDay.lastModifiedBy = req.user.userId;
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

/*
  CLOSE BUSINESS DAY
*/
router.post("/close", async (req, res) => {
  try {
    const businessId = req.user.businessId;

    const currentDay = await DailyRecord.findOne({
      businessId,
      closed: false,
    }).sort({
      date: -1,
    });

    if (!currentDay) {
      return res.status(400).json({
        success: false,
        message: "There is no open business day.",
      });
    }

    if (currentDay.totals.expectedSales === null) {
      return res.status(400).json({
        success: false,
        message: "Evening stock must be recorded before closing the day.",
      });
    }

    if (currentDay.payments.mobileMoney === null) {
      currentDay.payments.mobileMoney = 0;

      currentDay.totals.expectedCash =
        currentDay.totals.expectedSales;
    }

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
    currentDay.closedBy = req.user.userId;
    currentDay.lastModifiedBy = req.user.userId;

    // Freeze the crate position of the day into history:
    // the closing depot count, the borrowers, and the totals.
    const crateActivity = await buildDayCrateActivity(
      businessId,
      currentDay,
      { live: true },
    );

    currentDay.emptyCrates = crateActivity.emptyCrates;
    currentDay.borrowers = crateActivity.borrowers;
    currentDay.crateTotals = crateActivity.crateTotals;

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

/*
  GET DAILY HISTORY
  Only closed days appear in history.
*/
router.get("/", async (req, res) => {
  try {
    const businessId = req.user.businessId;

    const days = await DailyRecord.find({
      businessId,
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

/*
  GET HISTORY BY DATE RANGE
*/
router.get("/history/range", async (req, res) => {
  try {
    const businessId = req.user.businessId;
    const { from, to } = req.query;

    if (!from || !to) {
      return res.status(400).json({
        success: false,
        message: "Both from and to dates are required.",
      });
    }

    const startDate = new Date(`${from}T00:00:00.000Z`);
    const endDate = new Date(`${to}T23:59:59.999Z`);

    if (
      Number.isNaN(startDate.getTime()) ||
      Number.isNaN(endDate.getTime())
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid date range.",
      });
    }

    if (startDate > endDate) {
      return res.status(400).json({
        success: false,
        message: "The from date cannot be after the to date.",
      });
    }

    const days = await DailyRecord.find({
      businessId,
      closed: true,
      date: {
        $gte: startDate,
        $lte: endDate,
      },
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
      message: "Failed to retrieve history.",
    });
  }
});

/*
  GET ONE DAILY RECORD
*/
router.get("/:id", async (req, res) => {
  try {
    const businessId = req.user.businessId;
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid daily record ID.",
      });
    }

    // IMPORTANT:
    // The record must belong to the authenticated business.
    const day = await DailyRecord.findOne({
      _id: id,
      businessId,
    });

    if (!day) {
      return res.status(404).json({
        success: false,
        message: "Daily record not found.",
      });
    }

    // Crate figures are worked out live, so an open day shows the
    // current position instead of stale zeros.
    const crateActivity = await buildDayCrateActivity(
      businessId,
      day,
      { live: !day.closed },
    );

    res.json({
      success: true,
      data: {
        ...day.toObject(),
        emptyCrates: crateActivity.emptyCrates,
        borrowers: crateActivity.borrowers,
        crateTotals: crateActivity.crateTotals,
      },
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