const UsersSignup = require("../models/usersSignup");
const Expense = require("../models/expense");
const { Sequelize } = require("sequelize");
const { sequelize } = require("../utils/db");
const { generateInsights } = require("../services/aiService");


// ================= ADD EXPENSE =================

const addExpense = async (req, res) => {

  const t = await sequelize.transaction();

  try {

    const { category, description, amount, note } = req.body;

    if (!category || !description || !amount) {
      await t.rollback();
      return res.status(400).json({ message: "All fields are required" });
    }

    const expense = await Expense.create(
      {
        category,
        description,
        amount,
        note,
        usersSignupId: req.session.userId
      },
      { transaction: t }
    );

    await t.commit();

    res.status(201).json(expense);

  } catch (error) {

    await t.rollback();
    console.log(error);

    res.status(500).json({ message: "Failed to create expense" });

  }
};


// ================= GET ALL EXPENSES =================

const getAllExpenses = async (req, res) => {

  try {

    const expenses = await Expense.findAll({
      where: {
        usersSignupId: req.session.userId
      }
    });

    res.status(200).json(expenses);

  } catch (error) {

    console.log(error);
    res.status(500).json({ message: "Failed to fetch expenses" });

  }
};


// ================= DELETE EXPENSE =================

const deleteExpense = async (req, res) => {

  const t = await sequelize.transaction();

  try {

    const deleted = await Expense.destroy({
      where: {
        id: req.params.id,
        usersSignupId: req.session.userId
      },
      transaction: t
    });

    if (!deleted) {
      await t.rollback();
      return res.status(404).json({ message: "Expense not found" });
    }

    await t.commit();

    res.status(200).json({ message: "Expense deleted" });

  } catch (error) {

    await t.rollback();
    console.log(error);

    res.status(500).json({ message: "Failed to delete expense" });

  }
};


// ================= UPDATE EXPENSE =================

const updateExpense = async (req, res) => {

  const t = await sequelize.transaction();

  try {

    const { category, description, amount } = req.body;

    const expense = await Expense.findOne({
      where: {
        id: req.params.id,
        usersSignupId: req.session.userId
      },
      transaction: t
    });

    if (!expense) {
      await t.rollback();
      return res.status(404).json({ message: "Expense not found" });
    }

    expense.category = category;
    expense.description = description;
    expense.amount = amount;

    await expense.save({ transaction: t });

    await t.commit();

    res.status(200).json(expense);

  } catch (error) {

    await t.rollback();
    console.log(error);

    res.status(500).json({ message: "Failed to update expense" });

  }
};


// ================= LEADERBOARD =================

const getLeaderboard = async (req, res) => {

  try {

    const leaderboard = await UsersSignup.findAll({
      attributes: [
        "id",
        "name",
        [Sequelize.fn("SUM", Sequelize.col("Expenses.amount")), "totalExpense"]
      ],
      include: [
        {
          model: Expense,
          attributes: []
        }
      ],
      group: ["usersSignup.id"],
      order: [[Sequelize.literal("totalExpense"), "DESC"]]
    });

    res.status(200).json(leaderboard);

  } catch (error) {

    console.log(error);
    res.status(500).json({ message: "Failed to load leaderboard" });

  }
};


// ================= AI SPENDING INSIGHTS =================

const getSpendingInsights = async (req, res) => {

  try {

    const userId = req.session.userId;

    const expenses = await Expense.findAll({
      attributes: [
        "category",
        [Sequelize.fn("SUM", Sequelize.col("amount")), "total"]
      ],
      where: { usersSignupId: userId },
      group: ["category"]
    });

    const formattedData = expenses.map(e => ({
      category: e.category,
      total: parseFloat(e.get("total"))
    }));

    const insights = await generateInsights(formattedData);

    res.json({ insights });

  } catch (error) {

    console.log(error);
    res.status(500).json({ message: "Failed to generate insights" });

  }
};


module.exports = {
  addExpense,
  getAllExpenses,
  deleteExpense,
  updateExpense,
  getLeaderboard,
  getSpendingInsights
};