import "dotenv/config";

import connectDB from "../config/db.js";
import Business from "../models/Business.js";

const createBusiness = async () => {
  try {
    await connectDB();

    const existingBusiness = await Business.findOne({
      name: "Ivo Beer Distribution",
      location: "Rwamiko",
    });

    if (existingBusiness) {
      console.log("Business already exists.");
      console.log(existingBusiness);
      process.exit(0);
    }

    const business = await Business.create({
      name: "Ivo Beer Distribution",
      location: "Rwamiko",
      active: true,
    });

    console.log("Business created successfully:");
    console.log(business);

    process.exit(0);
  } catch (error) {
    console.error("Failed to create business:", error);
    process.exit(1);
  }
};

createBusiness();