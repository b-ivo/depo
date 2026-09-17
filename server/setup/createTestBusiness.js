import "dotenv/config";
import mongoose from "mongoose";

import connectDB from "../config/db.js";
import Business from "../models/Business.js";

const createTestBusiness = async () => {
  try {
    await connectDB();

    const existingBusiness = await Business.findOne({
      name: "Test DEPO B",
    });

    if (existingBusiness) {
      console.log("Test DEPO B already exists:");
      console.log(existingBusiness._id.toString());
      process.exit(0);
    }

    const business = await Business.create({
      name: "Test DEPO B",
      location: "Kigali",
    });

    console.log("Business B created successfully.");
    console.log("Business ID:", business._id.toString());

    process.exit(0);
  } catch (error) {
    console.error("Failed to create Business B:", error);
    process.exit(1);
  }
};

createTestBusiness();