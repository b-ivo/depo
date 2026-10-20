/*
  Reset the password of one account.

    node setup/resetPassword.js eric@gmail.com NEW_PASSWORD

  Passwords cannot be read back from the database, they are only
  stored as a hash, so this is the way to restore access to an
  account when the password has been lost.
*/

import "dotenv/config";
import bcrypt from "bcryptjs";
import connectDB from "../config/db.js";
import User from "../models/User.js";

const [, , email, password] = process.argv;

const resetPassword = async () => {
  try {
    if (!email || !password) {
      console.error("Usage: node setup/resetPassword.js <email> <newPassword>");
      process.exit(1);
    }

    await connectDB();

    const user = await User.findOne({ email });

    if (!user) {
      console.error(`No user found with email: ${email}`);
      process.exit(1);
    }

    if (password.length < 8) {
      console.error("The new password must be at least 8 characters long.");
      process.exit(1);
    }

    user.passwordHash = await bcrypt.hash(password, 12);

    await user.save();

    console.log(`Password reset for ${user.email} (${user.role}).`);

    process.exit(0);
  } catch (error) {
    console.error("Failed to reset password:", error.message);
    process.exit(1);
  }
};

resetPassword();
