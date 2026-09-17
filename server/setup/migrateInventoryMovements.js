import "dotenv/config";
import { setServers } from "node:dns/promises";
import mongoose from "mongoose";

import connectDB from "../config/db.js";
import InventoryMovement from "../models/InventoryMovement.js";
import Beer from "../models/Beer.js";

setServers(["8.8.8.8", "1.1.1.1"]);

const migrateInventoryMovements = async () => {
  try {
    await connectDB();

    const movements = await InventoryMovement.find({
      businessId: { $exists: false },
    });

    console.log(`Found ${movements.length} movements to migrate.`);

    let migrated = 0;
    let skipped = 0;

    for (const movement of movements) {
      const beer = await Beer.findById(movement.beer).select("businessId");

      if (!beer || !beer.businessId) {
        console.log(
          `Skipping movement ${movement._id}: beer/business not found.`,
        );
        skipped++;
        continue;
      }

      movement.businessId = beer.businessId;
      await movement.save();
      migrated++;
    }

    console.log(`Migrated: ${migrated}`);
    console.log(`Skipped: ${skipped}`);

    await mongoose.disconnect();
    console.log("Migration complete.");
    process.exit(0);
  } catch (error) {
    console.error("Migration failed:", error);
    await mongoose.disconnect();
    process.exit(1);
  }
};

migrateInventoryMovements();
