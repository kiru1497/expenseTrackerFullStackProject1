const mongoose = require("mongoose");

const expenseSchema = new mongoose.Schema(
  {
    category: String,
    description: String,
    amount: Number,
    note: String,

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Expense", expenseSchema);
