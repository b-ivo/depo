import express from "express";
import Beer from "../models/Beer.js";

const router = express.Router();

// Get all active beers
router.get("/", async (req, res) => {
  try {
    const beers = await Beer.find({ active: true }).sort({ name: 1 });

    res.json({
      success: true,
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

// Add a new beer
router.post("/", async (req, res) => {
  try {
    const { name, price } = req.body;

    if (!name || price === undefined) {
      return res.status(400).json({
        success: false,
        message: "Name and price are required.",
      });
    }

    if (typeof price !== "number" || price < 0) {
      return res.status(400).json({
        success: false,
        message: "Price must be a valid non-negative number.",
      });
    }

    const existingBeer = await Beer.findOne({
      name: name.trim(),
      active: true,
    });

    if (existingBeer) {
      return res.status(409).json({
        success: false,
        message: "A beer with this name already exists.",
      });
    }

    const beer = await Beer.create({
      name: name.trim(),
      price,
    });

    res.status(201).json({
      success: true,
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

// Update a beer
router.patch("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { name, price } = req.body;

    const beer = await Beer.findById(id);

    if (!beer) {
      return res.status(404).json({
        success: false,
        message: "Beer not found.",
      });
    }

    if (name !== undefined) {
      if (!name.trim()) {
        return res.status(400).json({
          success: false,
          message: "Beer name cannot be empty.",
        });
      }

      beer.name = name.trim();
    }

    if (price !== undefined) {
      if (typeof price !== "number" || price < 0) {
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

export default router;
