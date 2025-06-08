const mongoose = require("mongoose");

const claimSheetSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Claim sheet name is required"],
      trim: true,
    },
    claimNumber: {
      type: String,
      required: [true, "Claim number is required"],
      unique: true,
      trim: true,
    },
    claimType: {
      type: String,
      required: [true, "Claim type is required"],
      trim: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: ["Draft", "Submitted", "Approved", "Rejected"],
      default: "Draft",
    },
    totalAmount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Update total amount when expenses are modified
claimSheetSchema.methods.updateTotalAmount = async function () {
  const ExpenseItem = require("./ExpenseItem");
  const expenses = await ExpenseItem.find({ claimSheetId: this._id });
  this.totalAmount = expenses.reduce(
    (total, expense) => total + expense.amount,
    0
  );
  return this.save();
};

module.exports = mongoose.model("ClaimSheet", claimSheetSchema);
