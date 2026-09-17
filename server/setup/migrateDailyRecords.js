import "dotenv/config";
import mongoose from "mongoose";

import connectDB from "../config/db.js";
import DailyRecord from "../models/DailyRecord.js";

const BUSINESS_ID = "6aab743f5c6b2a24c480de48";

const migrateDailyRecords = async () => {
  try {
    await connectDB();

    console.log("Connected to MongoDB.");

    // 1. Show current indexes
    const indexes = await DailyRecord.collection.indexes();

    console.log("\nCurrent DailyRecord indexes:");
    console.log(indexes);

    // 2. Add businessId to old records
    const result = await DailyRecord.updateMany(
      {
        businessId: { $exists: false },
      },
      {
        $set: {
          businessId: new mongoose.Types.ObjectId(BUSINESS_ID),
        },
      },
    );

    console.log(
      `\nUpdated ${result.modifiedCount} DailyRecord documents.`,
    );

    // 3. Remove old unique date index if it exists
    const dateIndex = indexes.find(
      (index) =>
        index.key &&
        index.key.date === 1 &&
        Object.keys(index.key).length === 1,
    );

    if (dateIndex) {
      console.log(`Dropping old index: ${dateIndex.name}`);

      await DailyRecord.collection.dropIndex(dateIndex.name);

      console.log("Old date index removed.");
    } else {
      console.log("Old date-only index not found.");
    }

    // 4. Make sure indexes match the new schema
    await DailyRecord.syncIndexes();

    console.log("DailyRecord indexes synchronized.");

    // 5. Verify
    const records = await DailyRecord.find({})
      .select("_id businessId date closed")
      .sort({ date: 1 });

    console.log("\nMigrated DailyRecords:");

    for (const record of records) {
      console.log({
        id: record._id.toString(),
        businessId: record.businessId?.toString(),
        date: record.date,
        closed: record.closed,
      });
    }

    console.log("\nMigration completed successfully.");

    process.exit(0);
  } catch (error) {
    console.error("\nMigration failed:");
    console.error(error);

    process.exit(1);
  }
};

migrateDailyRecords();