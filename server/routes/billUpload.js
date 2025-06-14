import express from "express";
import multer from "multer";
import { google } from "@ai-sdk/google";
import { generateObject } from "ai";
import { z } from "zod";
import ExpenseItem from "../models/ExpenseItem.js";
import ClaimSheet from "../models/ClaimSheet.js";
import auth from "../middleware/auth.js";

const router = express.Router();

// Configure multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit per file
  },
  fileFilter: (req, file, cb) => {
    // Accept image files only
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed"), false);
    }
  },
});

// Zod schema for expense data validation
const ExpenseItemSchema = z.object({
  billNo: z.string().min(1, "Bill number is required"),
  date: z.string().refine((date) => !isNaN(Date.parse(date)), {
    message: "Invalid date format",
  }),
  issuedBy: z.string().min(1, "Issued by is required"),
  details: z.string().min(1, "Expense details are required"),
  amount: z.number().positive("Amount must be positive"),
});

const ExpensesArraySchema = z.array(ExpenseItemSchema);

// Initialize Google AI model
const model = google("gemini-2.5-flash-preview-05-20", {
  apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY,
});

// @route   POST /api/bill-upload
// @desc    Upload and process bill images using AI
// @access  Private
router.post("/", auth, upload.array("bills", 5), async (req, res, next) => {
  try {
    const { claimSheetId } = req.body;
    const files = req.files;

    if (!files || files.length === 0) {
      return res.status(400).json({ message: "No files uploaded" });
    }

    if (!claimSheetId) {
      return res.status(400).json({ message: "Claim sheet ID is required" });
    }

    // Verify claim sheet exists and belongs to the user
    const claimSheet = await ClaimSheet.findById(claimSheetId);
    if (!claimSheet) {
      return res.status(404).json({ message: "Claim sheet not found" });
    }

    if (claimSheet.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Access denied" });
    }

    const processedExpenses = [];

    for (const file of files) {
      try {
        // Convert buffer to base64 for the AI model
        const base64Image = file.buffer.toString("base64");
        const imageUrl = `data:${file.mimetype};base64,${base64Image}`;

        // Generate expense data using AI
        const result = await generateObject({
          model,
          schema: ExpensesArraySchema,
          messages: [
            {
              role: "user",
              content: [
                {
                  type: "text",
                  text: "Extract expense information from this bill/receipt image. Return an array of expense items. For each item, extract: billNo (bill/receipt number), date (in YYYY-MM-DD format), issuedBy (vendor/company name), details (description of goods/services), and amount (numeric value only, no currency symbols). If multiple items are on one bill, create separate entries for each. If information is unclear, make reasonable assumptions based on context.",
                },
                {
                  type: "image",
                  image: imageUrl,
                },
              ],
            },
          ],
        });

        // Get the next serial number
        const lastExpense = await ExpenseItem.findOne({ claimSheetId }).sort({
          serialNo: -1,
        });
        let serialNo = lastExpense ? lastExpense.serialNo + 1 : 1;

        // Process each extracted expense
        for (const expenseData of result.object) {
          const expense = new ExpenseItem({
            claimSheetId,
            serialNo: serialNo++,
            billNo: expenseData.billNo,
            date: new Date(expenseData.date),
            issuedBy: expenseData.issuedBy,
            details: expenseData.details,
            amount: expenseData.amount,
          });

          await expense.save();
          processedExpenses.push(expense);
        }
      } catch (aiError) {
        console.error(`Error processing file ${file.originalname}:`, aiError);
        // Continue processing other files even if one fails
      }
    }

    if (processedExpenses.length === 0) {
      return res.status(400).json({
        message: "Failed to extract expense data from the uploaded images",
      });
    }

    res.status(201).json({
      message: `Successfully processed ${processedExpenses.length} expense items`,
      expenses: processedExpenses,
    });
  } catch (error) {
    next(error);
  }
});

export default router;
