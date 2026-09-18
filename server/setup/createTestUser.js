import "dotenv/config";
import bcrypt from "bcryptjs";

import connectDB from "../config/db.js";
import User from "../models/User.js";

const BUSINESS_B_ID = "6aaba71cbd8459d6b46177cb";

const TEST_USER_EMAIL =
  process.env.TEST_USER_EMAIL || "testuserb@depo.com";
const TEST_USER_USERNAME =
  process.env.TEST_USER_USERNAME || "testuserb";
const TEST_USER_PASSWORD = process.env.TEST_USER_PASSWORD;

const createTestUser = async () => {
  try {
    if (!TEST_USER_PASSWORD) {
      console.error(
        "TEST_USER_PASSWORD is not set. Set it in the environment before running this script.",
      );
      process.exit(1);
    }

    await connectDB();

    const existingUser = await User.findOne({
      email: TEST_USER_EMAIL,
    });

    if (existingUser) {
      console.log("Test User B already exists.");
      console.log("User ID:", existingUser._id.toString());
      console.log("Business ID:", existingUser.businessId?.toString());

      process.exit(0);
    }

    const passwordHash = await bcrypt.hash(TEST_USER_PASSWORD, 12);

    const user = await User.create({
      email: TEST_USER_EMAIL,
      username: TEST_USER_USERNAME,
      passwordHash,
      role: "admin",
      businessId: BUSINESS_B_ID,
    });

    console.log("Test User B created successfully.");
    console.log("User ID:", user._id.toString());
    console.log("Business ID:", user.businessId.toString());
    console.log("Email:", user.email);

    process.exit(0);
  } catch (error) {
    console.error("Failed to create Test User B:", error);
    process.exit(1);
  }
};

createTestUser();