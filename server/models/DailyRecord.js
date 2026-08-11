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

const dailyRecordSchema = new mongoose.Schema(
  {
    // Represents the business day, not the exact time.
    date: {
      type: Date,
      required: true,
      unique: true,
    },

    stock: {
      type: [dailyStockSchema],
      required: true,
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
  },

  {
    timestamps: true,
  },
);

const DailyRecord = mongoose.model("DailyRecord", dailyRecordSchema);

export default DailyRecord;
