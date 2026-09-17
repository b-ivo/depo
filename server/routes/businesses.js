import express from "express";
import Business from "../models/Business.js";
import User from "../models/User.js";
import requireRole from "../middleware/roles.js";

const router = express.Router();

// ======================================
// GET ALL BUSINESSES
// GET /api/businesses
// ======================================
router.get("/", requireRole("superadmin"), async (req, res) => {
  try {
    const businesses = await Business.find().sort({ createdAt: -1 });

    return res.json({
      success: true,
      data: businesses,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Failed to retrieve businesses.",
    });
  }
});

// ======================================
// CREATE BUSINESS
// POST /api/businesses
// ======================================
router.post("/", requireRole("superadmin"), async (req, res) => {
  try {
    const { name, location } = req.body;

    // ----------------------------------
    // Validate required fields
    // ----------------------------------
    if (!name || !location) {
      return res.status(400).json({
        success: false,
        message: "Business name and location are required.",
      });
    }

    const trimmedName = name.trim();
    const trimmedLocation = location.trim();

    // ----------------------------------
    // Validate empty values
    // ----------------------------------
    if (!trimmedName || !trimmedLocation) {
      return res.status(400).json({
        success: false,
        message: "Business name and location cannot be empty.",
      });
    }

    // ----------------------------------
    // Check duplicate business name
    // ----------------------------------
    const existingBusiness = await Business.findOne({
      name: trimmedName,
    });

    if (existingBusiness) {
      return res.status(409).json({
        success: false,
        message: "A business with this name already exists.",
      });
    }

    // ----------------------------------
    // Create business
    // ----------------------------------
    const business = await Business.create({
      name: trimmedName,
      location: trimmedLocation,
      active: true,
    });

    return res.status(201).json({
      success: true,
      message: "Business created successfully.",
      data: business,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Failed to create business.",
    });
  }
});

// ======================================
// UPDATE BUSINESS
// PATCH /api/businesses/:id
// ======================================
router.patch("/:id", requireRole("superadmin"), async (req, res) => {
  try {
    const { id } = req.params;
    const { name, location } = req.body;

    // ----------------------------------
    // Find business
    // ----------------------------------
    const business = await Business.findById(id);

    if (!business) {
      return res.status(404).json({
        success: false,
        message: "Business not found.",
      });
    }

    // ----------------------------------
    // Update name
    // ----------------------------------
    if (name !== undefined) {
      if (typeof name !== "string" || !name.trim()) {
        return res.status(400).json({
          success: false,
          message: "Business name cannot be empty.",
        });
      }

      const trimmedName = name.trim();

      // Check duplicate name
      const existingBusiness = await Business.findOne({
        name: trimmedName,
        _id: { $ne: id },
      });

      if (existingBusiness) {
        return res.status(409).json({
          success: false,
          message: "A business with this name already exists.",
        });
      }

      business.name = trimmedName;
    }

    // ----------------------------------
    // Update location
    // ----------------------------------
    if (location !== undefined) {
      if (typeof location !== "string" || !location.trim()) {
        return res.status(400).json({
          success: false,
          message: "Business location cannot be empty.",
        });
      }

      business.location = location.trim();
    }

    await business.save();

    return res.json({
      success: true,
      message: "Business updated successfully.",
      data: business,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Failed to update business.",
    });
  }
});

// ======================================
// UPDATE BUSINESS STATUS
// PATCH /api/businesses/:id/status
// ======================================
router.patch("/:id/status", requireRole("superadmin"), async (req, res) => {
  try {
    const { id } = req.params;
    const { active } = req.body;

    if (typeof active !== "boolean") {
      return res.status(400).json({
        success: false,
        message: "Active must be a boolean.",
      });
    }

    const business = await Business.findById(id);

    if (!business) {
      return res.status(404).json({
        success: false,
        message: "Business not found.",
      });
    }

    if (business.active === active) {
      return res.json({
        success: true,
        message: active
          ? "Business is already active."
          : "Business is already inactive.",
        data: business,
      });
    }

    // Deactivate the whole business
    if (!active) {
      await User.updateMany(
        {
          businessId: business._id,
        },
        {
          $set: {
            active: false,
          },
        },
      );
    }

    business.active = active;

    await business.save();

    return res.json({
      success: true,
      message: active
        ? "Business activated successfully."
        : "Business deactivated successfully. All users have been deactivated.",
      data: business,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Failed to update business status.",
    });
  }
});

export default router;
