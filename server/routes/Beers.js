import express from "express";
import mongoose from "mongoose";
import Beer from "../models/Beer.js";

const router = express.Router();

// ===============================
// GET ALL BEERS
// ===============================
router.get("/", async (req, res) => {
  try {
    const businessId = req.user.businessId;

    const beers = await Beer.find({
      businessId,
    }).sort({
      name: 1,
    });

    res.json({
      success: true,
      count: beers.length,
      data: beers,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Failed to retrieve beers.",
    });
  }
});

// ===============================
// ADD BEER
// ===============================
router.post("/", async (req, res) => {
  try {
    const businessId = req.user.businessId;
    const { name, price } = req.body;

    if (!name || price === undefined) {
      return res.status(400).json({
        success: false,
        message: "Name and price are required.",
      });
    }

    if (typeof name !== "string" || name.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "Beer name must be a valid text value.",
      });
    }

    if (
      typeof price !== "number" ||
      !Number.isFinite(price) ||
      price < 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Price must be a valid non-negative number.",
      });
    }

    const trimmedName = name.trim();

    // Duplicate check only inside this business.
    const existingBeer = await Beer.findOne({
      name: trimmedName,
      businessId,
    });

    if (existingBeer) {
      return res.status(409).json({
        success: false,
        message: "A beer with this name already exists.",
      });
    }

    const beer = await Beer.create({
      name: trimmedName,
      price,
      active: true,
      businessId,
    });

    res.status(201).json({
      success: true,
      message: "Beer created successfully.",
      data: beer,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Failed to create beer.",
    });
  }
});

// ===============================
// UPDATE BEER
// ===============================
router.patch("/:id", async (req, res) => {
  try {
    const businessId = req.user.businessId;
    const { id } = req.params;
    const { name, price } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid beer ID.",
      });
    }

    if (name === undefined && price === undefined) {
      return res.status(400).json({
        success: false,
        message: "Provide a name or price to update.",
      });
    }

    const beer = await Beer.findOne({
      _id: id,
      businessId,
    });

    if (!beer) {
      return res.status(404).json({
        success: false,
        message: "Beer not found.",
      });
    }

    if (name !== undefined) {
      if (typeof name !== "string" || name.trim() === "") {
        return res.status(400).json({
          success: false,
          message: "Beer name must be a valid text value.",
        });
      }

      const trimmedName = name.trim();

      const duplicate = await Beer.findOne({
        name: trimmedName,
        businessId,
        _id: { $ne: id },
      });

      if (duplicate) {
        return res.status(409).json({
          success: false,
          message: "A beer with this name already exists.",
        });
      }

      beer.name = trimmedName;
    }

    if (price !== undefined) {
      if (
        typeof price !== "number" ||
        !Number.isFinite(price) ||
        price < 0
      ) {
        return res.status(400).json({
          success: false,
          message: "Price must be a valid non-negative number.",
        });
      }

      beer.price = price;
    }

    await beer.save();

    res.json({
      success: true,
      message: "Beer updated successfully.",
      data: beer,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Failed to update beer.",
    });
  }
});

// ===============================
// ACTIVATE / DEACTIVATE BEER
// ===============================
router.patch("/:id/status", async (req, res) => {
  try {
    const businessId = req.user.businessId;
    const { id } = req.params;
    const { active } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid beer ID.",
      });
    }

    if (typeof active !== "boolean") {
      return res.status(400).json({
        success: false,
        message: "Active must be true or false.",
      });
    }

    const beer = await Beer.findOne({
      _id: id,
      businessId,
    });

    if (!beer) {
      return res.status(404).json({
        success: false,
        message: "Beer not found.",
      });
    }

    beer.active = active;

    await beer.save();

    res.json({
      success: true,
      message: active
        ? "Beer activated successfully."
        : "Beer deactivated successfully.",
      data: beer,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Failed to update beer status.",
    });
  }
});

export default router;