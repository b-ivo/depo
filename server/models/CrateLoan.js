import mongoose from "mongoose";

// One beer line inside a crate loan.
// A loan can contain several beer types for the same borrower.
const crateLoanLineSchema = new mongoose.Schema(
  {
    beer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Beer",
      required: true,
    },

    // Snapshot of the beer name for this specific loan.
    name: {
      type: String,
      required: true,
      trim: true,
    },

    // Empty crates the borrower kept instead of returning them.
    crates: {
      type: Number,
      required: true,
      min: 1,
    },

    // Empty crates handed back so far. Can be partial.
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

// A single return event, kept for accountability.
const crateReturnSchema = new mongoose.Schema(
  {
    date: {
      type: Date,
      required: true,
    },

    crates: {
      type: Number,
      required: true,
      min: 1,
    },

    // Which beers came back, so a business day can attribute
    // its returns to the right crate totals per beer.
    lines: {
      type: [
        {
          beer: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Beer",
            required: true,
          },

          name: {
            type: String,
            required: true,
            trim: true,
          },

          crates: {
            type: Number,
            required: true,
            min: 1,
          },
        },
      ],
      default: [],
    },

    note: {
      type: String,
      trim: true,
      default: null,
    },

    recordedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    _id: false,
  },
);

const crateLoanSchema = new mongoose.Schema(
  {
    // The DEPO/business this loan belongs to.
    businessId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Business",
      required: true,
      index: true,
    },

    // The person holding the empty crates.
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

    // Represents the business day, not the exact time.
    date: {
      type: Date,
      required: true,
    },

    lines: {
      type: [crateLoanLineSchema],
      required: true,
    },

    // Sum of lines[].crates, kept in sync by the routes.
    totalCrates: {
      type: Number,
      required: true,
      min: 1,
    },

    // Sum of lines[].returned, kept in sync by the routes.
    returnedCrates: {
      type: Number,
      min: 0,
      default: 0,
    },

    status: {
      type: String,
      enum: ["outstanding", "partial", "returned"],
      default: "outstanding",
      index: true,
    },

    settledAt: {
      type: Date,
      default: null,
    },

    returns: {
      type: [crateReturnSchema],
      default: [],
    },

    notes: {
      type: String,
      trim: true,
      default: null,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      index: true,
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

// Newest loans first when listing a business.
crateLoanSchema.index({ businessId: 1, date: -1 });

// The same borrower can hold several loans, even on the same day,
// so this lookup is intentionally not unique.
crateLoanSchema.index({ businessId: 1, borrowerName: 1, date: -1 });

const CrateLoan = mongoose.model("CrateLoan", crateLoanSchema);

export default CrateLoan;
