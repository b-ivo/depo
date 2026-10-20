import mongoose from "mongoose";

const dailyStockSchema = new mongoose.Schema(
  {
    beer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Beer",
      required: true,
    },

    // Snapshot of the beer information for this specific day.
    name: {
      type: String,
      required: true,
      trim: true,
    },

    price: {
      type: Number,
      required: true,
      min: 0,
    },

    // Stock at the beginning of the day.
    morning: {
      type: Number,
      required: true,
      min: 0,
    },

    // Total quantity fulfilled during the day.
    fulfilled: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },

    // Stock remaining at the end of the day.
    evening: {
      type: Number,
      min: 0,
      default: null,
    },

    // Calculated by the backend:
    // morning + fulfilled - evening
    sold: {
      type: Number,
      min: 0,
      default: null,
    },

    // Calculated by the backend:
    // sold × price
    expected: {
      type: Number,
      min: 0,
      default: null,
    },
  },
  {
    _id: false,
  },
);

// One empty crate line inside a day.
// Empty crates are the ones customers keep instead of returning them,
// so the depot count must carry over from one day to the next.
const dailyEmptyCrateSchema = new mongoose.Schema(
  {
    beer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Beer",
      required: true,
    },

    // Snapshot of the beer information for this specific day.
    name: {
      type: String,
      required: true,
      trim: true,
    },

    // Empty crates in the depot at the beginning of the day.
    // Taken from the previous day's closing count.
    opening: {
      type: Number,
      min: 0,
      default: 0,
    },

    // Empty crates in the depot at the end of the day.
    // Filled in when the day is closed.
    closing: {
      type: Number,
      min: 0,
      default: null,
    },

    // Crates lent to borrowers on this day (sum of the day's loans).
    lent: {
      type: Number,
      min: 0,
      default: 0,
    },

    // Crates handed back by borrowers on this day.
    returned: {
      type: Number,
      min: 0,
      default: 0,
    },
  },
  {
    _id: false,
  },
);

// Per borrower crate movement for one day, frozen into history.
const dailyBorrowerSchema = new mongoose.Schema(
  {
    loan: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CrateLoan",
      required: true,
    },

    borrowerName: {
      type: String,
      required: true,
      trim: true,
    },

    phone: {
      type: String,
      trim: true,
      default: null,
    },

    // True when the loan itself was handed out on this day.
    madeOnThisDay: {
      type: Boolean,
      default: false,
    },

    lines: {
      type: [
        {
          beer: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Beer",
          },

          name: {
            type: String,
            required: true,
            trim: true,
          },

          // Crates this borrower kept on the day the loan was made.
          lent: {
            type: Number,
            min: 0,
            default: 0,
          },

          // Crates handed back on this same day.
          returnedSameDay: {
            type: Number,
            min: 0,
            default: 0,
          },

          // Crates handed back in total, across all days.
          returnedSoFar: {
            type: Number,
            min: 0,
            default: 0,
          },

          // Crates this borrower still holds.
          stillOut: {
            type: Number,
            min: 0,
            default: 0,
          },
        },
      ],
      default: [],
    },

    totalCrates: {
      type: Number,
      min: 0,
      default: 0,
    },

    returnedCrates: {
      type: Number,
      min: 0,
      default: 0,
    },

    // Everything handed back on this day, even for older loans.
    returnedOnThisDay: {
      type: Number,
      min: 0,
      default: 0,
    },

    // Still held by this borrower right now.
    stillOut: {
      type: Number,
      min: 0,
      default: 0,
    },

    // outstanding / partial / returned
    status: {
      type: String,
      default: "outstanding",
    },

    // Set on days where the loan was fully settled before closing.
    settledOnThisDay: {
      type: Boolean,
      default: false,
    },
  },
  {
    _id: false,
  },
);

const dailyRecordSchema = new mongoose.Schema(
  {
    // The DEPO/business this daily record belongs to.
    businessId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Business",
      required: true,
      index: true,
    },

    // Represents the business day, not the exact time.
    date: {
      type: Date,
      required: true,
    },

    stock: {
      type: [dailyStockSchema],
      required: true,
    },

    // Empty crate position of the depot for this specific day.
    emptyCrates: {
      type: [dailyEmptyCrateSchema],
      default: [],
    },

    // Every borrower who took or returned empty crates on this day.
    borrowers: {
      type: [dailyBorrowerSchema],
      default: [],
    },

    // Crate totals for this day, so history always prints a total.
    crateTotals: {
      // Empty crates in the depot at the start of the day.
      opening: {
        type: Number,
        min: 0,
        default: 0,
      },

      // Empty crates in the depot at the end of the day.
      closing: {
        type: Number,
        min: 0,
        default: null,
      },

      // Crates lent to borrowers during the day.
      lent: {
        type: Number,
        min: 0,
        default: 0,
      },

      // Crates handed back to the depot during the day.
      returned: {
        type: Number,
        min: 0,
        default: 0,
      },

      // Crates still held by borrowers right now, across all open loans.
      stillOut: {
        type: Number,
        min: 0,
        default: 0,
      },

      // "Amavide": total empty crates counted in the depot for this day.
      // Entered as one total, not per beer.
      amavide: {
        type: Number,
        min: 0,
        default: null,
      },
    },

    totals: {
      sold: {
        type: Number,
        min: 0,
        default: null,
      },

      expectedSales: {
        type: Number,
        min: 0,
        default: null,
      },

      expectedCash: {
        type: Number,
        min: 0,
        default: null,
      },
    },

    payments: {
      mobileMoney: {
        type: Number,
        min: 0,
        default: null,
      },

      actualCash: {
        type: Number,
        min: 0,
        default: null,
      },
    },

    // actualCash - expectedCash
    difference: {
      type: Number,
      default: null,
    },

    status: {
      type: String,
      enum: ["balanced", "shortage", "surplus"],
      default: null,
    },

    // false = day is still being worked on
    // true = day has been closed
    closed: {
      type: Boolean,
      default: false,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      index: true,
    },

    closedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    lastModifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  },
);

// One business can only have one DailyRecord for a specific date.
// Different businesses can have DailyRecords on the same date.
dailyRecordSchema.index(
  { businessId: 1, date: 1 },
  { unique: true },
);

const DailyRecord = mongoose.model("DailyRecord", dailyRecordSchema);

export default DailyRecord;