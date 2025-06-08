const express = require("express");
const { body, validationResult } = require("express-validator");
const ExpenseItem = require("../models/ExpenseItem");
const ClaimSheet = require("../models/ClaimSheet");
const auth = require("../middleware/auth");

const router = express.Router();

// Apply auth middleware to all routes
router.use(auth);

// @route   GET /api/expenses/claim-sheet/:claimSheetId
// @desc    Get all expenses for a specific claim sheet
// @access  Private
router.get("/claim-sheet/:claimSheetId", async (req, res, next) => {
  try {
    // Verify claim sheet belongs to user
    const claimSheet = await ClaimSheet.findOne({
      _id: req.params.claimSheetId,
      userId: req.user._id,
    });

    if (!claimSheet) {
      return res.status(404).json({ message: "Claim sheet not found" });
    }

    const expenses = await ExpenseItem.find({
      claimSheetId: req.params.claimSheetId,
    }).sort({ serialNo: 1 });

    res.json(expenses);
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/expenses/:id
// @desc    Get a specific expense item
// @access  Private
router.get("/:id", async (req, res, next) => {
  try {
    const expense = await ExpenseItem.findById(req.params.id).populate(
      "claimSheetId"
    );

    if (!expense) {
      return res.status(404).json({ message: "Expense not found" });
    }

    // Check if the claim sheet belongs to the user
    if (expense.claimSheetId.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Access denied" });
    }

    res.json(expense);
  } catch (error) {
    next(error);
  }
});

// @route   POST /api/expenses
// @desc    Create a new expense item
// @access  Private
router.post(
  "/",
  [
    body("claimSheetId").notEmpty().withMessage("Claim sheet ID is required"),
    body("billNo").notEmpty().withMessage("Bill number is required"),
    body("date").isISO8601().withMessage("Valid date is required"),
    body("issuedBy").notEmpty().withMessage("Issued by is required"),
    body("details").notEmpty().withMessage("Expense details are required"),
    body("amount")
      .isNumeric()
      .withMessage("Amount must be a number")
      .custom((value) => value > 0)
      .withMessage("Amount must be positive"),
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { claimSheetId, billNo, date, issuedBy, details, amount } =
        req.body;

      // Verify claim sheet belongs to user
      const claimSheet = await ClaimSheet.findOne({
        _id: claimSheetId,
        userId: req.user._id,
      });

      if (!claimSheet) {
        return res.status(404).json({ message: "Claim sheet not found" });
      }

      // Get the next serial number
      const lastExpense = await ExpenseItem.findOne({ claimSheetId }).sort({
        serialNo: -1,
      });
      const serialNo = lastExpense ? lastExpense.serialNo + 1 : 1;

      const expense = new ExpenseItem({
        claimSheetId,
        serialNo,
        billNo,
        date,
        issuedBy,
        details,
        amount: parseFloat(amount),
      });

      await expense.save();
      res.status(201).json(expense);
    } catch (error) {
      next(error);
    }
  }
);

// @route   PUT /api/expenses/:id
// @desc    Update an expense item
// @access  Private
router.put(
  "/:id",
  [
    body("billNo")
      .optional()
      .notEmpty()
      .withMessage("Bill number cannot be empty"),
    body("date").optional().isISO8601().withMessage("Valid date is required"),
    body("issuedBy")
      .optional()
      .notEmpty()
      .withMessage("Issued by cannot be empty"),
    body("details")
      .optional()
      .notEmpty()
      .withMessage("Expense details cannot be empty"),
    body("amount")
      .optional()
      .isNumeric()
      .withMessage("Amount must be a number")
      .custom((value) => !value || value > 0)
      .withMessage("Amount must be positive"),
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const expense = await ExpenseItem.findById(req.params.id).populate(
        "claimSheetId"
      );

      if (!expense) {
        return res.status(404).json({ message: "Expense not found" });
      }

      // Check if the claim sheet belongs to the user
      if (expense.claimSheetId.userId.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: "Access denied" });
      }

      // Update fields
      Object.keys(req.body).forEach((key) => {
        if (key === "amount") {
          expense[key] = parseFloat(req.body[key]);
        } else {
          expense[key] = req.body[key];
        }
      });

      await expense.save();
      res.json(expense);
    } catch (error) {
      next(error);
    }
  }
);

// @route   DELETE /api/expenses/:id
// @desc    Delete an expense item
// @access  Private
router.delete("/:id", async (req, res, next) => {
  try {
    const expense = await ExpenseItem.findById(req.params.id).populate(
      "claimSheetId"
    );

    if (!expense) {
      return res.status(404).json({ message: "Expense not found" });
    }

    // Check if the claim sheet belongs to the user
    if (expense.claimSheetId.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Access denied" });
    }

    await expense.deleteOne();
    res.json({ message: "Expense deleted successfully" });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
