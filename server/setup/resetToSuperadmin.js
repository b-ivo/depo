import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import User from "../models/User.js";
import Business from "../models/Business.js";
import Beer from "../models/Beer.js";
import DailyRecord from "../models/DailyRecord.js";
import InventoryMovement from "../models/InventoryMovement.js";

dotenv.config();

const TARGET_EMAIL = "ivobryan12@gmail.com";
const TARGET_PASSWORD = "1234567890";
const TARGET_USERNAME = "superadmin";

const resetDatabase = async () => {
  try {
    if (!process.env.MONGO_URI) {
      console.error("MONGO_URI is not set in .env");
      process.exit(1);
    }

    console.log("Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGO_URI);
    console.log(`Connected to: ${mongoose.connection.name}`);

    // Safety check: require explicit --force flag to actually delete
    const hasForce = process.argv.includes("--force");
    if (!hasForce) {
      console.log("\n--- DRY RUN (no data deleted) ---");
      console.log("Counts before deletion:");
      console.log(" Businesses:", await Business.countDocuments());
      console.log(" Beers:", await Beer.countDocuments());
      console.log(" DailyRecords:", await DailyRecord.countDocuments());
      console.log(" InventoryMovements:", await InventoryMovement.countDocuments());
      console.log(" Users:", await User.countDocuments());
      console.log(" Users (superadmin):", await User.countDocuments({ role: "superadmin" }));
      console.log("\nTo actually wipe data, run:");
      console.log("  node setup/resetToSuperadmin.js --force");
      console.log("\nThis will:");
      console.log(" - Delete ALL Businesses, Beers, DailyRecords, InventoryMovements");
      console.log(" - Delete ALL Users except superadmin will be recreated");
      console.log(` - Create/update superadmin -> ${TARGET_EMAIL} / ${TARGET_PASSWORD}`);
      await mongoose.disconnect();
      process.exit(0);
    }

    console.log("\n--- WIPE STARTED (--force) ---");

    const delBusiness = await Business.deleteMany({});
    console.log(`Deleted ${delBusiness.deletedCount} businesses`);

    const delBeer = await Beer.deleteMany({});
    console.log(`Deleted ${delBeer.deletedCount} beers`);

    const delDaily = await DailyRecord.deleteMany({});
    console.log(`Deleted ${delDaily.deletedCount} daily records`);

    const delInv = await InventoryMovement.deleteMany({});
    console.log(`Deleted ${delInv.deletedCount} inventory movements`);

    const delUsers = await User.deleteMany({});
    console.log(`Deleted ${delUsers.deletedCount} users (all)`);

    // Create superadmin with target credentials
    const passwordHash = await bcrypt.hash(TARGET_PASSWORD, 12);

    const superadmin = await User.create({
      email: TARGET_EMAIL.toLowerCase(),
      username: TARGET_USERNAME,
      passwordHash,
      role: "superadmin",
      active: true,
    });

    console.log("\nSuperadmin created:");
    console.log({
      id: superadmin._id,
      email: superadmin.email,
      username: superadmin.username,
      role: superadmin.role,
      active: superadmin.active,
    });

    console.log("\n--- WIPE COMPLETE ---");
    console.log("Database now contains only superadmin");
    console.log(`Login with: ${TARGET_EMAIL} / ${TARGET_PASSWORD}`);

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error("Reset failed:", error);
    try { await mongoose.disconnect(); } catch {}
    process.exit(1);
  }
};

resetDatabase();
