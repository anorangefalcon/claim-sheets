const express = require("express");
const { body, validationResult } = require("express-validator");
const ClaimSheet = require("../models/ClaimSheet");
const ExpenseItem = require("../models/ExpenseItem");
const auth = require("../middleware/auth");

const router = express.Router();

// Apply auth middleware to all routes
router.use(auth);

// @route   GET /api/claim-sheets
// @desc    Get all claim sheets for the authenticated user
// @access  Private
router.get("/", async (req, res, next) => {
  try {
    const claimSheets = await ClaimSheet.find({ userId: req.user._id }).sort({
      createdAt: -1,
    });

    res.json(claimSheets);
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/claim-sheets/:id
// @desc    Get a specific claim sheet
// @access  Private
router.get("/:id", async (req, res, next) => {
  try {
    const claimSheet = await ClaimSheet.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!claimSheet) {
      return res.status(404).json({ message: "Claim sheet not found" });
    }

    res.json(claimSheet);
  } catch (error) {
    next(error);
  }
});

// @route   POST /api/claim-sheets
// @desc    Create a new claim sheet
// @access  Private
router.post(
  "/",
  [
    body("name").notEmpty().withMessage("Claim sheet name is required"),
    body("claimNumber").notEmpty().withMessage("Claim number is required"),
    body("claimType").notEmpty().withMessage("Claim type is required"),
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { name, claimNumber, claimType } = req.body;

      const claimSheet = new ClaimSheet({
        name,
        claimNumber,
        claimType,
        userId: req.user._id,
      });

      await claimSheet.save();
      res.status(201).json(claimSheet);
    } catch (error) {
      next(error);
    }
  }
);

// @route   PUT /api/claim-sheets/:id
// @desc    Update a claim sheet
// @access  Private
router.put(
  "/:id",
  [
    body("name")
      .optional()
      .notEmpty()
      .withMessage("Claim sheet name cannot be empty"),
    body("claimNumber")
      .optional()
      .notEmpty()
      .withMessage("Claim number cannot be empty"),
    body("claimType")
      .optional()
      .notEmpty()
      .withMessage("Claim type cannot be empty"),
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const claimSheet = await ClaimSheet.findOneAndUpdate(
        { _id: req.params.id, userId: req.user._id },
        req.body,
        { new: true, runValidators: true }
      );

      if (!claimSheet) {
        return res.status(404).json({ message: "Claim sheet not found" });
      }

      res.json(claimSheet);
    } catch (error) {
      next(error);
    }
  }
);

// @route   DELETE /api/claim-sheets/:id
// @desc    Delete a claim sheet and its expenses
// @access  Private
router.delete("/:id", async (req, res, next) => {
  try {
    const claimSheet = await ClaimSheet.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!claimSheet) {
      return res.status(404).json({ message: "Claim sheet not found" });
    }

    // Delete all associated expenses
    await ExpenseItem.deleteMany({ claimSheetId: claimSheet._id });

    // Delete the claim sheet
    await claimSheet.deleteOne();

    res.json({ message: "Claim sheet deleted successfully" });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
