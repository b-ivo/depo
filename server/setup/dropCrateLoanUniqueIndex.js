import "dotenv/config";
import connectDB from "../config/db.js";
import CrateLoan from "../models/CrateLoan.js";

const dropCrateLoanUniqueIndex = async () => {
  try {
    await connectDB();

    const collection = CrateLoan.collection;

    const existing = await collection.indexes();
    const uniqueIndex = existing.find(
      (index) =>
        index.name === "businessId_1_borrowerName_1_date_1" &&
        index.unique === true,
    );

    if (!uniqueIndex) {
      console.log("No unique borrower/date index found. Nothing to do.");
      process.exit(0);
    }

    // The same borrower may hold several loans, including on the
    // same day, so the old unique index has to be removed.
    await collection.dropIndex("businessId_1_borrowerName_1_date_1");

    console.log("Dropped unique index businessId_1_borrowerName_1_date_1.");

    await collection.createIndex({
      businessId: 1,
      borrowerName: 1,
      date: -1,
    });

    console.log("Created index businessId_1_borrowerName_1_date_-1 (not unique).");

    const after = await collection.indexes();

    console.log("\nCurrent indexes on crateloans:");

    for (const index of after) {
      console.log(
        `  ${index.name}  unique=${index.unique === true}`,
      );
    }

    process.exit(0);
  } catch (error) {
    console.error("Failed to update CrateLoan indexes:", error);
    process.exit(1);
  }
};

dropCrateLoanUniqueIndex();
