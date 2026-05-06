const UsersSignup = require("../models/usersSignup");
const Expense = require("../models/expense");
const { generateInsights } = require("../services/aiService");
const { uploadToS3 } = require("../services/s3Service");

// ================= ADD EXPENSE =================

const addExpense = async (req, res) => {
  try {
    const { category, description, amount, note } = req.body;

    if (!category || !description || !amount) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const expense = new Expense({
      category,
      description,
      amount,
      note,
      userId: req.session.userId, // ✅ Mongoose field
    });

    await expense.save();

    res.status(201).json(expense);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Failed to create expense" });
  }
};

// ================= GET ALL EXPENSES =================

const getAllExpenses = async (req, res) => {
  try {
    const expenses = await Expense.find({
      userId: req.session.userId,
    }).sort({ createdAt: -1 });

    res.status(200).json(expenses);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Failed to fetch expenses" });
  }
};

// ================= DELETE EXPENSE =================

const deleteExpense = async (req, res) => {
  try {
    const deleted = await Expense.findOneAndDelete({
      _id: req.params.id,
      userId: req.session.userId,
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

// ================= UPDATE EXPENSE =================

const updateExpense = async (req, res) => {
  try {
    const { category, description, amount, note } = req.body;

    const updated = await Expense.findOneAndUpdate(
      {
        _id: req.params.id,
        userId: req.session.userId,
      },
      {
        category,
        description,
        amount,
        note,
      },
      { new: true },
    );

    if (!updated) {
      return res.status(404).json({ message: "Expense not found" });
    }

    res.status(200).json(updated);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Failed to update expense" });
  }
};

// ================= LEADERBOARD =================

const getLeaderboard = async (req, res) => {
  try {
    const leaderboard = await Expense.aggregate([
      {
        $group: {
          _id: "$userId",
          totalExpense: { $sum: "$amount" },
        },
      },
      {
        $lookup: {
          from: "users", // collection name (IMPORTANT)
          localField: "_id",
          foreignField: "_id",
          as: "user",
        },
      },
      { $unwind: "$user" },
      {
        $project: {
          _id: 0,
          userId: "$user._id",
          name: "$user.name",
          totalExpense: 1,
        },
      },
      { $sort: { totalExpense: -1 } },
    ]);

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

    const expenses = await Expense.aggregate([
      {
        $match: { userId: new require("mongoose").Types.ObjectId(userId) },
      },
      {
        $group: {
          _id: "$category",
          total: { $sum: "$amount" },
        },
      },
    ]);

    const formattedData = expenses.map((e) => ({
      category: e._id,
      total: e.total,
    }));

    const insights = await generateInsights(formattedData);

    res.json({ insights });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Failed to generate insights" });
  }
};

// ================= DOWNLOAD EXPENSES =================

const downloadExpenses = async (req, res) => {
  try {
    const userId = req.session.userId;

    const user = await UsersSignup.findById(userId);

    // ❌ Not premium → block
    if (!user || !user.isPremium) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // 1️⃣ Fetch expenses
    const expenses = await Expense.find({ userId });

    // 2️⃣ Convert to CSV
    let data = "Date,Description,Category,Amount\n";

    expenses.forEach((exp) => {
      const date = new Date(exp.createdAt).toLocaleDateString();
      data += `${date},${exp.description},${exp.category},${exp.amount}\n`;
    });

    // 3️⃣ Upload to S3
    const fileName = `expenses_${userId}_${Date.now()}.csv`;

    const result = await uploadToS3(data, fileName);

    // 4️⃣ Send signed URL
    res.status(200).json({
      signedUrl: result.signedUrl,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Failed to download" });
  }
};

module.exports = {
  addExpense,
  getAllExpenses,
  deleteExpense,
  updateExpense,
  getLeaderboard,
  getSpendingInsights,
  downloadExpenses,
};
