import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import Business from "../models/Business.js";
import authMiddleware from "../middleware/auth.js";

const router = express.Router();

// ================================
// LOGIN
// POST /api/auth/login
// ================================
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required.",
      });
    }

    // Find user by email
    const user = await User.findOne({
      email: email.trim().toLowerCase(),
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    // ======================================
    // CHECK BUSINESS STATUS
    // Superadmins do not belong to a business
    // ======================================
    let business = null;

    if (user.role !== "superadmin") {
      if (!user.businessId) {
        return res.status(403).json({
          success: false,
          message: "This account is not assigned to a business.",
        });
      }

      business = await Business.findById(user.businessId);

      if (!business) {
        return res.status(403).json({
          success: false,
          message: "This business no longer exists.",
        });
      }

      if (!business.active) {
        return res.status(403).json({
          success: false,
          message: "This business is inactive.",
        });
      }
    }

    // ======================================
    // CHECK ACCOUNT STATUS
    // ======================================
    if (!user.active) {
      return res.status(403).json({
        success: false,
        message: "This account is inactive.",
      });
    }

    // ======================================
    // COMPARE PASSWORD
    // ======================================
    const passwordMatch = await bcrypt.compare(
      password,
      user.passwordHash,
    );

    if (!passwordMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    // ======================================
    // CREATE JWT
    // ======================================
    const token = jwt.sign(
      {
        userId: user._id,
        role: user.role,
        businessId: user.businessId,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "1d",
      },
    );

    // ======================================
    // BUSINESS DATA FOR CLIENT
    // ======================================
    let businessData = null;

    if (business) {
      businessData = {
        id: business._id,
        name: business.name,
        location: business.location,
      };
    }

    return res.json({
      success: true,
      message: "Login successful.",
      data: {
        id: user._id,
        email: user.email,
        role: user.role,
        username: user.username,
        businessId: user.businessId,
        business: businessData,
        token,
      },
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Login failed.",
    });
  }
});

// ================================
// CURRENT USER
// GET /api/auth/me
// ================================
router.get("/me", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId)
      .select("-passwordHash")
      .populate("businessId", "name location active");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    // ======================================
    // CHECK BUSINESS STATUS
    // ======================================
    let businessData = null;

    if (user.role !== "superadmin") {
      if (!user.businessId) {
        return res.status(403).json({
          success: false,
          message: "This account is not assigned to a business.",
        });
      }

      if (!user.businessId.active) {
        return res.status(403).json({
          success: false,
          message: "This business is inactive.",
        });
      }

      businessData = {
        id: user.businessId._id,
        name: user.businessId.name,
        location: user.businessId.location,
      };
    }

    // ======================================
    // CHECK ACCOUNT STATUS
    // ======================================
    if (!user.active) {
      return res.status(403).json({
        success: false,
        message: "This account is inactive.",
      });
    }

    return res.json({
      success: true,
      message: "Current user retrieved successfully.",
      data: {
        id: user._id,
        email: user.email,
        role: user.role,
        username: user.username,
        businessId: businessData
          ? businessData.id
          : user.businessId,
        business: businessData,
        active: user.active,
      },
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Failed to retrieve current user.",
    });
  }
});

// ================================
// CHANGE PASSWORD
// PATCH /api/auth/change-password
// ================================
router.patch("/change-password", authMiddleware, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    // Validate input
    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Current password and new password are required.",
      });
    }

    // Validate new password length
    if (newPassword.length < 8) {
      return res.status(400).json({
        success: false,
        message: "New password must be at least 8 characters.",
      });
    }

    // Find current user
    const user = await User.findById(req.user.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    // Check current password
    const passwordMatch = await bcrypt.compare(
      currentPassword,
      user.passwordHash,
    );

    if (!passwordMatch) {
      return res.status(401).json({
        success: false,
        message: "Current password is incorrect.",
      });
    }

    // Hash new password
    const newPasswordHash = await bcrypt.hash(newPassword, 12);

    user.passwordHash = newPasswordHash;

    await user.save();

    return res.json({
      success: true,
      message: "Password changed successfully.",
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Failed to change password.",
    });
  }
});

export default router;