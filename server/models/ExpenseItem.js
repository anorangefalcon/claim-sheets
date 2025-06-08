import mongoose from "mongoose";

const expenseItemSchema = new mongoose.Schema(
  {
    claimSheetId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ClaimSheet",
      required: true,
    },
    serialNo: {
      type: Number,
      required: true,
    },
    billNo: {
      type: String,
      required: [true, "Bill number is required"],
      trim: true,
    },
    date: {
      type: Date,
      required: [true, "Date is required"],
    },
    issuedBy: {
      type: String,
      required: [true, "Issued by is required"],
      trim: true,
    },
    details: {
      type: String,
      required: [true, "Expense details are required"],
      trim: true,
    },
    amount: {
      type: Number,
      required: [true, "Amount is required"],
      min: [0, "Amount must be positive"],
    },
  },
  {
    timestamps: true,
  }
);

// Ensure serial numbers are unique within a claim sheet
expenseItemSchema.index({ claimSheetId: 1, serialNo: 1 }, { unique: true });

// Update claim sheet total when expense is saved or removed
expenseItemSchema.post("save", async function () {
  const ClaimSheet = require("./ClaimSheet");
  const claimSheet = await ClaimSheet.findById(this.claimSheetId);
  if (claimSheet) {
    await claimSheet.updateTotalAmount();
  }
});

expenseItemSchema.post("remove", async function () {
  const ClaimSheet = require("./ClaimSheet");
  const claimSheet = await ClaimSheet.findById(this.claimSheetId);
  if (claimSheet) {
    await claimSheet.updateTotalAmount();
  }
});

export default mongoose.model("ExpenseItem", expenseItemSchema);
