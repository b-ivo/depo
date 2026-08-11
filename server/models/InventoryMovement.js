import mongoose from "mongoose";

const inventoryMovementSchema = new mongoose.Schema(
  {
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
