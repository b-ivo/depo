    import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import User from "../models/User.js";

dotenv.config();

const SUPERADMIN_EMAIL =
  process.env.SUPERADMIN_EMAIL || "superadmin@minidepo.com";
const SUPERADMIN_USERNAME =
  process.env.SUPERADMIN_USERNAME || "superadmin";
const SUPERADMIN_PASSWORD = process.env.SUPERADMIN_PASSWORD;

const createSuperadmin = async () => {
  try {
    if (!SUPERADMIN_PASSWORD) {
      console.error(
        "SUPERADMIN_PASSWORD is not set. Set it in the environment before running this script.",
      );
      process.exit(1);
    }

    await mongoose.connect(process.env.MONGO_URI);

    const existingUser = await User.findOne({
      email: SUPERADMIN_EMAIL,
    });

    if (existingUser) {
      console.log("Superadmin already exists.");
      process.exit(0);
    }

    const passwordHash = await bcrypt.hash(SUPERADMIN_PASSWORD, 12);

    const user = await User.create({
      email: SUPERADMIN_EMAIL,
      username: SUPERADMIN_USERNAME,
      passwordHash,
      role: "superadmin",
      active: true,
      // No businessId for superadmin
    });

    console.log("Superadmin created:");
    console.log({
      id: user._id,
      email: user.email,
      username: user.username,
      role: user.role,
    });

    process.exit(0);
  } catch (error) {
    console.error("Failed to create superadmin:", error);
    process.exit(1);
  }
};

createSuperadmin();