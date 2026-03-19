const express = require("express");
const expenseController = require("../controllers/expenseController");
const isAuthenticated = require("../middleware/auth");

const router = express.Router();

router.post("/add-expense", isAuthenticated, expenseController.addExpense);
router.get("/expenses", isAuthenticated, expenseController.getAllExpenses);
router.delete(
  "/delete-expense/:id",
  isAuthenticated,
  expenseController.deleteExpense,
);
router.put(
  "/edit-expense/:id",
  isAuthenticated,
  expenseController.updateExpense,
);
router.get("/leaderboard", isAuthenticated, expenseController.getLeaderboard);
router.get(
  "/ai-insights",
  isAuthenticated,
  expenseController.getSpendingInsights,
);
router.get("/download", isAuthenticated, expenseController.downloadExpenses);

module.exports = router;
