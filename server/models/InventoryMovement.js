import mongoose from "mongoose";

const inventoryMovementSchema = new mongoose.Schema(
  {
    // The business that owns this movement
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

    type: {
      type: String,
      enum: ["fulfillment"],
      required: true,
    },

    quantity: {
      type: Number,
      required: true,
      min: 0,
    },

    date: {
      type: Date,
      required: true,
    },

    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
  },
  {
    timestamps: true,
  },
);

const InventoryMovement = mongoose.model(
  "InventoryMovement",
  inventoryMovementSchema,
);

export default InventoryMovement;
