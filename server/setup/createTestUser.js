import "dotenv/config";
import bcrypt from "bcryptjs";

import connectDB from "../config/db.js";
import User from "../models/User.js";

const BUSINESS_B_ID = "6aaba71cbd8459d6b46177cb";

const createTestUser = async () => {
  try {
    await connectDB();

    const existingUser = await User.findOne({
      email: "testuserb@depo.com",
    });

    if (existingUser) {
      console.log("Test User B already exists.");
      console.log("User ID:", existingUser._id.toString());
      console.log("Business ID:", existingUser.businessId?.toString());

      process.exit(0);
    }

    const passwordHash = await bcrypt.hash("TestPassword123!", 12);

    const user = await User.create({
      email: "testuserb@depo.com",
      username: "testuserb",
      passwordHash,
      role: "admin",
      businessId: BUSINESS_B_ID,
    });

    console.log("Test User B created successfully.");
    console.log("User ID:", user._id.toString());
    console.log("Business ID:", user.businessId.toString());
    console.log("Email:", user.email);
    console.log("Password: TestPassword123!");

    process.exit(0);
  } catch (error) {
    console.error("Failed to create Test User B:", error);
    process.exit(1);
  }
};

createTestUser();