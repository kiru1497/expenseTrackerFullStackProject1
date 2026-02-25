const express = require("express");
const expenseController = require("../controllers/expenseController");
const isAuthenticated = require("../middleware/auth");

const router = express.Router();

router.post("/add-expense", isAuthenticated, expenseController.addExpense);
router.get("/expenses", isAuthenticated, expenseController.getAllExpenses);
router.delete("/delete-expense/:id", isAuthenticated, expenseController.deleteExpense);
router.put("/edit-expense/:id", isAuthenticated, expenseController.updateExpense);

module.exports = router;