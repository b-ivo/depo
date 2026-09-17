import "dotenv/config";

import connectDB from "../config/db.js";
import User from "../models/User.js";
import Business from "../models/Business.js";

const BUSINESS_ID = "6aab743f5c6b2a24c480de48";

const assignUsersToBusiness = async () => {
  try {
    await connectDB();

    const business = await Business.findById(BUSINESS_ID);

    if (!business) {
      console.log("Business not found.");
      process.exit(1);
    }

    const result = await User.updateMany(
      {
        role: { $in: ["admin", "staff"] },
        businessId: { $exists: false },
      },
      {
        $set: {
          businessId: business._id,
        },
      }
    );

    console.log("Users assigned successfully.");
    console.log(`Users updated: ${result.modifiedCount}`);

    const users = await User.find({
      businessId: business._id,
    }).select("username email role businessId");

    console.log("Users in this business:");
    console.log(users);

    process.exit(0);
  } catch (error) {
    console.error("Failed to assign users:", error);
    process.exit(1);
  }
};

assignUsersToBusiness();