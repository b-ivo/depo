import express from "express";
import mongoose from "mongoose";
import CrateLoan from "../models/CrateLoan.js";
import EmptyCrate from "../models/EmptyCrate.js";
import Beer from "../models/Beer.js";

const router = express.Router();

// A loan is flagged as overdue once it is older than this.
export const OVERDUE_DAYS = 3;

const MS_PER_DAY = 24 * 60 * 60 * 1000;

// Start of the current business day, so the loan age is counted in days.
function startOfToday() {
  return startOfDay(new Date());
}

// Business days are stored at local midnight, like the daily records.
function startOfDay(value) {
  const date = new Date(value);

  date.setHours(0, 0, 0, 0);

  return date;
}

// Loan age in days, counted from the start of the loan's business day.
function daysSince(date) {
  const from = startOfDay(date);

  return Math.max(
    0,
    Math.floor((Date.now() - from.getTime()) / MS_PER_DAY),
  );
}

// Loans older than the threshold are considered overdue.
function overdueCutoff() {
  const cutoff = startOfToday();

  cutoff.setDate(cutoff.getDate() - OVERDUE_DAYS);

  return cutoff;
}

// Recalculates the totals and overdue state from the lines.
function withComputedFields(loan) {
  const doc =
    loan instanceof mongoose.Document ? loan.toObject() : loan;

  const totalCrates = doc.lines.reduce(
    (sum, line) => sum + line.crates,
    0,
  );

  const returnedCrates = doc.lines.reduce(
    (sum, line) => sum + (line.returned ?? 0),
    0,
  );

  const outstandingCrates = Math.max(
    0,
    totalCrates - returnedCrates,
  );

  const daysOutstanding = daysSince(doc.date);

  const overdue =
    outstandingCrates > 0 && daysOutstanding > OVERDUE_DAYS;

  return {
    ...doc,
    totalCrates,
    returnedCrates,
    outstandingCrates,
    daysOutstanding,
    overdue,
    daysOverdue: overdue ? daysOutstanding - OVERDUE_DAYS : 0,
  };
}

// Keeps the stored totals in sync with the lines.
function syncTotals(loan) {
  const totalCrates = loan.lines.reduce(
    (sum, line) => sum + line.crates,
    0,
  );

  const returnedCrates = loan.lines.reduce(
    (sum, line) => sum + (line.returned ?? 0),
    0,
  );

  const outstandingCrates = totalCrates - returnedCrates;

  loan.totalCrates = totalCrates;
  loan.returnedCrates = returnedCrates;

  if (outstandingCrates === 0) {
    loan.status = "returned";
    loan.settledAt = loan.settledAt ?? new Date();
  } else if (returnedCrates > 0) {
    loan.status = "partial";
    loan.settledAt = null;
  } else {
    loan.status = "outstanding";
    loan.settledAt = null;
  }

  return loan;
}

// ===============================
// GET LOAN SUMMARY
// ===============================
router.get("/summary", async (req, res) => {
  try {
    const businessId = req.user.businessId;

    const loans = await CrateLoan.find({
      businessId,
    }).lean();

    let outstandingLoans = 0;
    let outstandingCrates = 0;
    let overdueLoans = 0;
    let overdueCrates = 0;
    let totalLoans = 0;
    let totalCrates = 0;

    for (const loan of loans) {
      const computed = withComputedFields(loan);

      totalLoans += 1;
      totalCrates += computed.totalCrates;

      if (computed.outstandingCrates > 0) {
        outstandingLoans += 1;
        outstandingCrates += computed.outstandingCrates;

        if (computed.overdue) {
          overdueLoans += 1;
          overdueCrates += computed.outstandingCrates;
        }
      }
    }

    const emptyCrates = await EmptyCrate.find({ businessId }).lean();

    // Per beer: what the depot holds, and what borrowers still hold.
    const perBeer = new Map();

    for (const stock of emptyCrates) {
      perBeer.set(String(stock.beer), {
        beer: stock.beer,
        name: stock.name,
        inDepot: stock.quantity ?? 0,
        outWithBorrowers: 0,
      });
    }

    for (const loan of loans) {
      const computed = withComputedFields(loan);

      for (const line of loan.lines ?? []) {
        const key = String(line.beer);

        if (!perBeer.has(key)) {
          perBeer.set(key, {
            beer: line.beer,
            name: line.name,
            inDepot: 0,
            outWithBorrowers: 0,
          });
        }

        const stillOwed = (line.crates ?? 0) - (line.returned ?? 0);

        if (stillOwed > 0) {
          perBeer.get(key).outWithBorrowers += stillOwed;
        }
      }
    }

    const crateBreakdown = [...perBeer.values()].sort((a, b) =>
      a.name.localeCompare(b.name),
    );

    res.json({
      success: true,
      data: {
        totalLoans,
        totalCrates,
        outstandingLoans,
        outstandingCrates,
        overdueLoans,
        overdueCrates,
        emptyCratesInDepot: crateBreakdown.reduce(
          (total, item) => total + item.inDepot,
          0,
        ),
        perBeer: crateBreakdown,
        overdueDays: OVERDUE_DAYS,
      },
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Failed to retrieve crate loan summary.",
    });
  }
});

// ===============================
// GET ALL CRATE LOANS
// ===============================
router.get("/", async (req, res) => {
  try {
    const businessId = req.user.businessId;
    const { status, q, overdue } = req.query;

    const filter = { businessId };

    if (status && status !== "all") {
      filter.status = status;
    }

    if (overdue === "true") {
      filter.status = { $ne: "returned" };
      filter.date = { $lt: overdueCutoff() };
    }

    if (q && typeof q === "string" && q.trim() !== "") {
      const escaped = q.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

      filter.borrowerName = {
        $regex: escaped,
        $options: "i",
      };
    }

    const loans = await CrateLoan.find(filter)
      .sort({ date: -1, createdAt: -1 })
      .lean();

    const data = loans.map(withComputedFields);

    res.json({
      success: true,
      count: data.length,
      data,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Failed to retrieve crate loans.",
    });
  }
});

// ===============================
// ADD CRATE LOAN
// ===============================
router.post("/", async (req, res) => {
  try {
    const businessId = req.user.businessId;
    const { borrowerName, phone, date, notes, lines } = req.body;

    if (!borrowerName || !date || !Array.isArray(lines)) {
      return res.status(400).json({
        success: false,
        message:
          "Borrower name, date and at least one crate line are required.",
      });
    }

    if (
      typeof borrowerName !== "string" ||
      borrowerName.trim() === ""
    ) {
      return res.status(400).json({
        success: false,
        message: "Borrower name must be a valid text value.",
      });
    }

    if (lines.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Add at least one beer crate line.",
      });
    }

    if (Number.isNaN(new Date(date).getTime())) {
      return res.status(400).json({
        success: false,
        message: "Date must be a valid date.",
      });
    }

    // Validate every line and load the beers inside this business.
    const preparedLines = [];

    for (const line of lines) {
      const { beer, crates } = line ?? {};

      if (!beer || crates === undefined) {
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
        typeof crates !== "number" ||
        !Number.isInteger(crates) ||
        crates < 1
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Crate count must be a whole number greater than zero.",
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

      preparedLines.push({
        beer: beerDoc._id,
        name: beerDoc.name,
        crates,
        returned: 0,
      });
    }

    const trimmedName = borrowerName.trim();
    const loanDate = startOfDay(date);

    // The total is required by the schema, so it has to be known
    // before the document is validated.
    const totalCrates = preparedLines.reduce(
      (sum, line) => sum + line.crates,
      0,
    );

    const loan = new CrateLoan({
      businessId,
      borrowerName: trimmedName,
      phone: phone ? String(phone).trim() : null,
      date: loanDate,
      lines: preparedLines,
      totalCrates,
      notes: notes ? String(notes).trim() : null,
      createdBy: req.user.userId,
      lastModifiedBy: req.user.userId,
    });

    syncTotals(loan);

    await loan.save();

    res.status(201).json({
      success: true,
      message: "Crate loan recorded successfully.",
      data: withComputedFields(loan),
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Failed to record crate loan.",
    });
  }
});

// ===============================
// GET SINGLE CRATE LOAN
// ===============================
router.get("/:id", async (req, res) => {
  try {
    const businessId = req.user.businessId;
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid crate loan ID.",
      });
    }

    // The loan must belong to the authenticated business.
    const loan = await CrateLoan.findOne({
      _id: id,
      businessId,
    }).lean();

    if (!loan) {
      return res.status(404).json({
        success: false,
        message: "Crate loan not found.",
      });
    }

    res.json({
      success: true,
      data: withComputedFields(loan),
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Failed to retrieve crate loan.",
    });
  }
});

// ===============================
// RECORD EMPTY CRATES RETURNED
// ===============================
router.post("/:id/returns", async (req, res) => {
  try {
    const businessId = req.user.businessId;
    const { id } = req.params;
    const { lines, date, note } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid crate loan ID.",
      });
    }

    if (!Array.isArray(lines) || lines.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Provide at least one returned crate count.",
      });
    }

    if (date && Number.isNaN(new Date(date).getTime())) {
      return res.status(400).json({
        success: false,
        message: "Return date must be a valid date.",
      });
    }

    const loan = await CrateLoan.findOne({
      _id: id,
      businessId,
    });

    if (!loan) {
      return res.status(404).json({
        success: false,
        message: "Crate loan not found.",
      });
    }

    // Validate every line first, so a later failure cannot leave the
    // empty crate stock partially updated.
    const validated = [];

    for (const entry of lines) {
      const { beer, crates } = entry ?? {};

      if (!beer || crates === undefined) {
        return res.status(400).json({
          success: false,
          message: "Each return line needs a beer and a crate count.",
        });
      }

      if (
        typeof crates !== "number" ||
        !Number.isInteger(crates) ||
        crates < 1
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Returned crates must be a whole number greater than zero.",
        });
      }

      const line = loan.lines.find(
        (item) => item.beer.toString() === String(beer),
      );

      if (!line) {
        return res.status(400).json({
          success: false,
          message: "This beer is not part of the loan.",
        });
      }

      const stillOwed = line.crates - (line.returned ?? 0);

      if (crates > stillOwed) {
        return res.status(400).json({
          success: false,
          message: `Only ${stillOwed} empty crate(s) are still owed for ${line.name}.`,
        });
      }

      validated.push({ line, crates });
    }

    let totalReturnedNow = 0;

    for (const { line, crates } of validated) {
      line.returned = (line.returned ?? 0) + crates;

      totalReturnedNow += crates;

      // Returned empties become available in the depot.
      const emptyCrate = await EmptyCrate.findOneAndUpdate(
        { businessId, beer: line.beer },
        {
          $inc: { quantity: crates },
          $set: { name: line.name },
          $setOnInsert: { businessId, beer: line.beer },
        },
        { returnDocument: "after", upsert: true },
      );

      if (!emptyCrate) {
        return res.status(500).json({
          success: false,
          message: "Failed to update empty crate stock.",
        });
      }
    }

    loan.returns.push({
      date: date ? new Date(date) : new Date(),
      crates: totalReturnedNow,
      lines: validated.map(({ line, crates }) => ({
        beer: line.beer,
        name: line.name,
        crates,
      })),
      note: note ? String(note).trim() : null,
      recordedBy: req.user.userId,
    });

    loan.lastModifiedBy = req.user.userId;

    syncTotals(loan);

    await loan.save();

    res.json({
      success: true,
      message: "Empty crates returned successfully.",
      data: withComputedFields(loan),
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Failed to record returned empty crates.",
    });
  }
});

// ===============================
// DELETE CRATE LOAN
// ===============================
router.delete("/:id", async (req, res) => {
  try {
    const businessId = req.user.businessId;
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid crate loan ID.",
      });
    }

    const loan = await CrateLoan.findOne({
      _id: id,
      businessId,
    });

    if (!loan) {
      return res.status(404).json({
        success: false,
        message: "Crate loan not found.",
      });
    }

    if (loan.returnedCrates > 0) {
      return res.status(400).json({
        success: false,
        message:
          "This loan already has returned crates and cannot be deleted.",
      });
    }

    await loan.deleteOne();

    res.json({
      success: true,
      message: "Crate loan deleted successfully.",
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Failed to delete crate loan.",
    });
  }
});

export default router;
