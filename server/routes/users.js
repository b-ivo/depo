import express from "express";
import bcrypt from "bcryptjs";
import User from "../models/User.js";
import Business from "../models/Business.js";
import requireRole from "../middleware/roles.js";

const router = express.Router();

// ======================================
// GET USERS
// GET /api/users
// ======================================
router.get(
  "/",
  requireRole("superadmin", "admin"),
  async (req, res) => {
    try {
      const { role, businessId } = req.user;

      let filter = {};

      // Admin can only see users from their own business.
      if (role === "admin") {
        filter.businessId = businessId;
      }

      // Superadmin can see users from all businesses.
      const users = await User.find(filter)
        .select("-passwordHash")
        .populate("businessId", "name location")
        .sort({ createdAt: -1 });

      return res.json({
        success: true,
        data: users,
      });
    } catch (error) {
      console.error(error);

      return res.status(500).json({
        success: false,
        message: "Failed to retrieve users.",
      });
    }
  },
);

// ======================================
// CREATE USER
// POST /api/users
// ======================================
router.post(
  "/",
  requireRole("superadmin", "admin"),
  async (req, res) => {
    try {
      const { role: creatorRole, businessId: creatorBusinessId } = req.user;

      const {
        email,
        username,
        password,
        role,
        businessId: requestedBusinessId,
      } = req.body;

      // ----------------------------------
      // Validate required fields
      // ----------------------------------
      if (!email || !username || !password || !role) {
        return res.status(400).json({
          success: false,
          message: "Email, username, password, and role are required.",
        });
      }

      // ----------------------------------
      // Validate role
      // ----------------------------------
      if (!["admin", "staff"].includes(role)) {
        return res.status(400).json({
          success: false,
          message: "Invalid user role.",
        });
      }

      // ----------------------------------
      // Admin can only create staff
      // ----------------------------------
      if (creatorRole === "admin" && role !== "staff") {
        return res.status(403).json({
          success: false,
          message: "Admins can only create staff users.",
        });
      }

      // ----------------------------------
      // Validate password
      // ----------------------------------
      if (password.length < 8) {
        return res.status(400).json({
          success: false,
          message: "Password must be at least 8 characters.",
        });
      }

      const normalizedEmail = email.trim().toLowerCase();
      const trimmedUsername = username.trim();

      // ----------------------------------
      // Check duplicate email
      // ----------------------------------
      const existingEmail = await User.findOne({
        email: normalizedEmail,
      });

      if (existingEmail) {
        return res.status(409).json({
          success: false,
          message: "A user with this email already exists.",
        });
      }

      // ----------------------------------
      // Check duplicate username
      // ----------------------------------
      const existingUsername = await User.findOne({
        username: trimmedUsername,
      });

      if (existingUsername) {
        return res.status(409).json({
          success: false,
          message: "A user with this username already exists.",
        });
      }

      // ----------------------------------
      // Determine business
      // ----------------------------------
      let finalBusinessId;

      if (creatorRole === "admin") {
        // Admin MUST create users in their own business.
        finalBusinessId = creatorBusinessId;
      } else {
        // Superadmin can choose a business.
        finalBusinessId = requestedBusinessId;
      }

      // ----------------------------------
      // Business is required
      // ----------------------------------
      if (!finalBusinessId) {
        return res.status(400).json({
          success: false,
          message: "Business ID is required.",
        });
      }

      // ----------------------------------
      // Verify business exists
      // ----------------------------------
      const business = await Business.findById(finalBusinessId);

      if (!business) {
        return res.status(404).json({
          success: false,
          message: "Business not found.",
        });
      }

      if (!business.active) {
        return res.status(400).json({
          success: false,
          message: "This business is inactive.",
        });
      }

      // ----------------------------------
      // Hash password
      // ----------------------------------
      const passwordHash = await bcrypt.hash(password, 12);

      // ----------------------------------
      // Create user
      // ----------------------------------
      const user = await User.create({
        email: normalizedEmail,
        username: trimmedUsername,
        passwordHash,
        role,
        businessId: finalBusinessId,
        active: true,
      });

      // ----------------------------------
      // Remove password from response
      // ----------------------------------
      const userResponse = await User.findById(user._id)
        .select("-passwordHash")
        .populate("businessId", "name location");

      return res.status(201).json({
        success: true,
        message: "User created successfully.",
        data: userResponse,
      });
    } catch (error) {
      console.error(error);

      return res.status(500).json({
        success: false,
        message: "Failed to create user.",
      });
    }
  },
);

// ======================================
// UPDATE USER STATUS
// PATCH /api/users/:id/status
// ======================================
router.patch(
  "/:id/status",
  requireRole("superadmin", "admin"),
  async (req, res) => {
    try {
      const { id } = req.params;
      const { active } = req.body;

      const { role: creatorRole, businessId: creatorBusinessId } = req.user;

      // Validate active value
      if (typeof active !== "boolean") {
        return res.status(400).json({
          success: false,
          message: "Active must be a boolean.",
        });
      }

      // ----------------------------------
      // Find target user
      // ----------------------------------
      const user = await User.findById(id);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found.",
        });
      }

      // ----------------------------------
      // Admin can only manage own business
      // ----------------------------------
      if (
        creatorRole === "admin" &&
        user.businessId?.toString() !== creatorBusinessId?.toString()
      ) {
        return res.status(403).json({
          success: false,
          message: "You cannot manage users from another business.",
        });
      }

      // ----------------------------------
      // Admin cannot deactivate another admin
      // ----------------------------------
      if (creatorRole === "admin" && user.role === "admin") {
        return res.status(403).json({
          success: false,
          message: "Admins cannot change another admin's status.",
        });
      }

      // ----------------------------------
      // Superadmin cannot deactivate itself
      // ----------------------------------
      if (
        creatorRole === "superadmin" &&
        user._id.toString() === req.user.userId.toString()
      ) {
        return res.status(400).json({
          success: false,
          message: "You cannot change your own status.",
        });
      }

      user.active = active;

      await user.save();

      const userResponse = await User.findById(user._id)
        .select("-passwordHash")
        .populate("businessId", "name location");

      return res.json({
        success: true,
        message: active
          ? "User activated successfully."
          : "User deactivated successfully.",
        data: userResponse,
      });
    } catch (error) {
      console.error(error);

      return res.status(500).json({
        success: false,
        message: "Failed to update user status.",
      });
    }
  },
);

// ======================================
// UPDATE USER
// PATCH /api/users/:id
// ======================================
router.patch(
  "/:id",
  requireRole("superadmin", "admin"),
  async (req, res) => {
    try {
      const { id } = req.params;
      const { username, email, role } = req.body;

      const {
        role: creatorRole,
        businessId: creatorBusinessId,
      } = req.user;

      // ----------------------------------
      // Find target user
      // ----------------------------------
      const user = await User.findById(id);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found.",
        });
      }

      // ----------------------------------
      // Admin can only manage own business
      // ----------------------------------
      if (
        creatorRole === "admin" &&
        user.businessId?.toString() !== creatorBusinessId?.toString()
      ) {
        return res.status(403).json({
          success: false,
          message: "You cannot manage users from another business.",
        });
      }

      // ----------------------------------
      // Admin cannot edit another admin
      // ----------------------------------
      if (creatorRole === "admin" && user.role === "admin") {
        return res.status(403).json({
          success: false,
          message: "Admins cannot edit another admin.",
        });
      }

      // ----------------------------------
      // Validate role if provided
      // ----------------------------------
      if (role !== undefined) {
        if (!["admin", "staff"].includes(role)) {
          return res.status(400).json({
            success: false,
            message: "Invalid user role.",
          });
        }

        // Admin can only assign staff
        if (creatorRole === "admin" && role !== "staff") {
          return res.status(403).json({
            success: false,
            message: "Admins can only assign the staff role.",
          });
        }
      }

      // ----------------------------------
      // Validate username
      // ----------------------------------
      if (username !== undefined) {
        if (!username.trim()) {
          return res.status(400).json({
            success: false,
            message: "Username cannot be empty.",
          });
        }

        const existingUsername = await User.findOne({
          username: username.trim(),
          _id: { $ne: id },
        });

        if (existingUsername) {
          return res.status(409).json({
            success: false,
            message: "A user with this username already exists.",
          });
        }

        user.username = username.trim();
      }

      // ----------------------------------
      // Validate email
      // ----------------------------------
      if (email !== undefined) {
        const normalizedEmail = email.trim().toLowerCase();

        if (!normalizedEmail) {
          return res.status(400).json({
            success: false,
            message: "Email cannot be empty.",
          });
        }

        const existingEmail = await User.findOne({
          email: normalizedEmail,
          _id: { $ne: id },
        });

        if (existingEmail) {
          return res.status(409).json({
            success: false,
            message: "A user with this email already exists.",
          });
        }

        user.email = normalizedEmail;
      }

      // ----------------------------------
      // Update role
      // ----------------------------------
      if (role !== undefined) {
        user.role = role;
      }

      // ----------------------------------
      // Prevent businessId modification
      // ----------------------------------
      // We intentionally do NOT read businessId
      // from req.body.
      //
      // The user's existing businessId stays unchanged.

      await user.save();

      const userResponse = await User.findById(user._id)
        .select("-passwordHash")
        .populate("businessId", "name location");

      return res.json({
        success: true,
        message: "User updated successfully.",
        data: userResponse,
      });
    } catch (error) {
      console.error(error);

      return res.status(500).json({
        success: false,
        message: "Failed to update user.",
      });
    }
  },
);

export default router;