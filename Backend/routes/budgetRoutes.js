const express = require("express");
const mongoose = require("mongoose");
const cors=require("cors")


const Budget = require("../models/budget");
const Transaction = require("../models/transaction");

// Replace this import with the authentication middleware
// already used by your existing protected routes.
const protect = require("../middleware/authMiddleware");

const router = express.Router();
router.use(cors());


// GET monthly budgets and actual spending.
router.get("/", protect, async (req, res) => {
  try {
    const month = Number(req.query.month);
    const year = Number(req.query.year);

    if (
      !Number.isInteger(month) ||
      month < 1 ||
      month > 12 ||
      !Number.isInteger(year) ||
      year < 2020 ||
      year > 2100
    ) {
      return res.status(400).json({
        message: "Please provide a valid month and year.",
      });
    }


    if (!mongoose.isValidObjectId(req.userID)) {
      return res.status(401).json({
        message: "Invalid authenticated user.",
      });
    }

    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 1);
    const userId=req.userID;

    const [budgets, spending] = await Promise.all([
      Budget.find({ userId, month, year }).lean(),

      Transaction.aggregate([
        {
          $match: {
            userId: new mongoose.Types.ObjectId(userId),
            type: "expense",
            date: {
              $gte: startDate,
              $lt: endDate,
            },
          },
        },
        {
          $group: {
            _id: "$category",
            totalSpent: { $sum: "$amount" },
          },
        },
      ]),
    ]);

    const spendingByCategory = new Map(
      spending.map((item) => [
        item._id,
        item.totalSpent,
      ])
    );

    const result = budgets.map((budget) => {
      const spent = spendingByCategory.get(budget.category) || 0;
      const remaining = budget.monthlyLimit - spent;

      const percentageUsed =
        (spent / budget.monthlyLimit) * 100;

      return {
        ...budget,
        spent,
        remaining,
        percentageUsed: Number(percentageUsed.toFixed(2)),
        status:
          percentageUsed >= 100
            ? "exceeded"
            : percentageUsed >= 80
              ? "warning"
              : "within-budget",
      };
    });

    return res.json(result);
  } catch (error) {
    console.error("Get budgets error:", error);

    return res.status(500).json({
      message: "Unable to retrieve budgets.",
    });
  }
});

// CREATE a budget, or update the existing budget
// for the same user, category, month, and year.
router.post("/", protect, async (req, res) => {
  try {
    const { category, monthlyLimit, month, year } = req.body;
    const userId = req.userID;

    if (!mongoose.isValidObjectId(req.userID)) {
      return res.status(401).json({
        message: "Invalid authenticated user.",
      });
    }

    if (
      typeof category !== "string" ||
      !category.trim() ||
      category.trim().length > 50
    ) {
      return res.status(400).json({
        message: "Please provide a valid category.",
      });
    }

    if (
      typeof monthlyLimit !== "number" ||
      !Number.isFinite(monthlyLimit) ||
      monthlyLimit <= 0
    ) {
      return res.status(400).json({
        message: "Monthly budget must be a positive number.",
      });
    }

    if (
      !Number.isInteger(month) ||
      month < 1 ||
      month > 12 ||
      !Number.isInteger(year) ||
      year < 2020 ||
      year > 2100
    ) {
      return res.status(400).json({
        message: "Please provide a valid month and year.",
      });
    }

    const budget = await Budget.findOneAndUpdate(
      {
        userId,
        category: category.trim(),
        month,
        year,
      },
      {
        $set: {
          monthlyLimit,
        },
        $setOnInsert: {
          userId,
          category: category.trim(),
          month,
          year,
        },
      },
      {
       returnDocument:'after',
        upsert: true,
        runValidators: true,
      }
    );

    return res.status(200).json({
      message: "Budget saved successfully.",
      budget,
    });
  } catch (error) {
    console.error("Save budget error:", error);

    return res.status(500).json({
      message: "Unable to save budget.",
    });
  }
});

module.exports = router;