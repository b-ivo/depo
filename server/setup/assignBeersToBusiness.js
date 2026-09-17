import "dotenv/config";

import connectDB from "../config/db.js";
import Beer from "../models/Beer.js";
import Business from "../models/Business.js";

const BUSINESS_ID = "6aab743f5c6b2a24c480de48";

const assignBeersToBusiness = async () => {
  try {
    await connectDB();

    const business = await Business.findById(BUSINESS_ID);

    if (!business) {
      console.log("Business not found.");
      process.exit(1);
    }

    const result = await Beer.updateMany(
      {
        businessId: { $exists: false },
      },
      {
        $set: {
          businessId: business._id,
        },
      }
    );

    console.log("Beers assigned successfully.");
    console.log(`Beers updated: ${result.modifiedCount}`);

    const beers = await Beer.find({
      businessId: business._id,
    }).sort({ name: 1 });

    console.log("Beers in this business:");
    console.log(beers);

    process.exit(0);
  } catch (error) {
    console.error("Failed to assign beers:", error);
    process.exit(1);
  }
};

assignBeersToBusiness();