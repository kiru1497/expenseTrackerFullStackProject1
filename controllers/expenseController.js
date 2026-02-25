const Expense = require("../models/expense");

const addExpense = async (req, res) => {
  try {
    const { category, description, amount } = req.body;

    if (!category || !description || !amount) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const expense = await Expense.create({
      category,
      description,
      amount
    });

    res.status(201).json(expense);

  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Failed to create expense" });
  }
};


const getAllExpenses = async (req, res) => {
  try {
    const expenses = await Expense.findAll();
    res.status(200).json(expenses);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Failed to fetch expenses" });
  }
};


const deleteExpense = async (req, res) => {
  try {
    const id = req.params.id;

    const deleted = await Expense.destroy({
      where: { id }
    });

    if (!deleted) {
      return res.status(404).json({ message: "Expense not found" });
    }

    res.status(200).json({ message: "Expense deleted" });

  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Failed to delete expense" });
  }
};


const updateExpense = async (req, res) => {
  try {
    const id = req.params.id;
    const { category, description, amount } = req.body;

    const expense = await Expense.findByPk(id);

    if (!expense) {
      return res.status(404).json({ message: "Expense not found" });
    }

    expense.category = category;
    expense.description = description;
    expense.amount = amount;

    await expense.save();

    res.status(200).json(expense);

  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Failed to update expense" });
  }
};


module.exports = {
  addExpense,
  getAllExpenses,
  deleteExpense,
  updateExpense
};