import mongoose from "mongoose";

// Empty crates physically present in the depot, per beer type.
// Returns top this up, and the end of day count reconciles it.
const emptyCrateSchema = new mongoose.Schema(
  {
    // The DEPO/business that owns the empty crates.
    businessId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Business",
      required: true,
      index: true,
    },

    beer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Beer",
      required: true,
    },

    // Snapshot of the beer name at the time of counting.
    name: {
      type: String,
      required: true,
      trim: true,
    },

    // Empty crates available in the depot.
    quantity: {
      type: Number,
      min: 0,
      default: 0,
    },

    // Last physical count performed at the end of a business day.
    countedOn: {
      type: Date,
      default: null,
    },

    countedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    countedQuantity: {
      type: Number,
      min: 0,
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

// One empty crate stock row per beer inside a business.
emptyCrateSchema.index(
  { businessId: 1, beer: 1 },
  { unique: true },
);

const EmptyCrate = mongoose.model("EmptyCrate", emptyCrateSchema);

export default EmptyCrate;
