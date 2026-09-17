    import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import User from "../models/User.js";

dotenv.config();

const createSuperadmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    const existingUser = await User.findOne({
      email: "superadmin@minidepo.com",
    });

    if (existingUser) {
      console.log("Superadmin already exists.");
      process.exit(0);
    }

    const passwordHash = await bcrypt.hash("SuperAdmin123!", 12);

    const user = await User.create({
      email: "superadmin@minidepo.com",
      username: "superadmin",
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