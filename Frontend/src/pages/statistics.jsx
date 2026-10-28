import { useEffect, useMemo, useState } from "react";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

import "./statistics.css";
import { API_BASE_URL } from "../utils/api";
import { exportTransactionsToCSV } from "../csv/exportCSV";

const COLORS = [
  "#6366f1",
  "#16a34a",
  "#f59e0b",
  "#dc2626",
  "#0ea5e9",
  "#a855f7",
  "#ec4899",
  "#14b8a6",
];

function Statistics() {
  const [transactions, setTransactions] = useState([]);
  const [budgets, setBudgets] = useState([]);

  const [loading, setLoading] = useState(true);
  const [budgetLoading, setBudgetLoading] = useState(true);
  const [error, setError] = useState("");
  const [budgetError, setBudgetError] = useState("");

  const [selectedPeriod, setSelectedPeriod] = useState("all");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const [refresh, setRefresh] = useState(0);

  // Current month and year
  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();

  // Format currency in Indian Rupees
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 2,
    }).format(Number(amount) || 0);
  };

  // Fetch transactions
  useEffect(() => {
    const getTransactions = async () => {
      try {
        setLoading(true);
        setError("");

        const token = localStorage.getItem("token");

        if (!token) {
          setError("Please log in to view your statistics.");
          return;
        }

        const response = await fetch(
          `${API_BASE_URL}/api/transaction`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message || "Failed to fetch transactions."
          );
        }

        if (!Array.isArray(data)) {
          throw new Error("Unexpected transaction data received.");
        }

        setTransactions(data);
      } catch (err) {
        setError(
          err.message || "Unable to load statistics."
        );
      } finally {
        setLoading(false);
      }
    };

    getTransactions();
  }, [refresh]);

  // Fetch current month's budgets
  useEffect(() => {
    const getBudgets = async () => {
      try {
        setBudgetLoading(true);
        setBudgetError("");

        const token = localStorage.getItem("token");

        if (!token) {
          setBudgetError("Please log in to view budgets.");
          return;
        }

        const response = await fetch(
          `${API_BASE_URL}/api/budgets?month=${currentMonth}&year=${currentYear}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message || "Failed to fetch budgets."
          );
        }

        if (!Array.isArray(data)) {
          throw new Error("Unexpected budget data received.");
        }

        setBudgets(data);
      } catch (err) {
        setBudgetError(
          err.message || "Unable to load budgets."
        );
      } finally {
        setBudgetLoading(false);
      }
    };

    getBudgets();
  }, [currentMonth, currentYear, refresh]);

  // Ignore invalid dates and amounts when preparing statistics
  const validTransactions = useMemo(() => {
    return transactions.filter((transaction) => {
      const date = new Date(transaction.createdAt);
      const amount = Number(transaction.amount);

      return (
        !Number.isNaN(date.getTime()) &&
        Number.isFinite(amount) &&
        amount >= 0 &&
        ["income", "expense"].includes(transaction.type)
      );
    });
  }, [transactions]);

  // Get available categories
  const categories = useMemo(() => {
    return [
      ...new Set(
        validTransactions
          .filter((transaction) => transaction.type === "expense")
          .map((transaction) => transaction.category)
          .filter(Boolean)
      ),
    ].sort();
  }, [validTransactions]);

  // Apply date and category filters to summary data
  const filteredTransactions = useMemo(() => {
    return validTransactions.filter((transaction) => {
      const date = new Date(transaction.createdAt);

      const matchesCategory =
        selectedCategory === "all" ||
        transaction.category === selectedCategory;

      let matchesPeriod = true;

      if (selectedPeriod === "thisMonth") {
        matchesPeriod =
          date.getMonth() === now.getMonth() &&
          date.getFullYear() === now.getFullYear();
      } else if (selectedPeriod === "lastMonth") {
        const lastMonthDate = new Date(
          currentYear,
          currentMonth - 2,
          1
        );

        matchesPeriod =
          date.getMonth() === lastMonthDate.getMonth() &&
          date.getFullYear() === lastMonthDate.getFullYear();
      } else if (selectedPeriod === "thisYear") {
        matchesPeriod =
          date.getFullYear() === currentYear;
      }

      return matchesCategory && matchesPeriod;
    });
  }, [
    validTransactions,
    selectedCategory,
    selectedPeriod,
    currentMonth,
    currentYear,
  ]);

  // Total income
  const income = useMemo(() => {
    return filteredTransactions
      .filter((transaction) => transaction.type === "income")
      .reduce(
        (total, transaction) =>
          total + Number(transaction.amount),
        0
      );
  }, [filteredTransactions]);

  // Total expense
  const expense = useMemo(() => {
    return filteredTransactions
      .filter((transaction) => transaction.type === "expense")
      .reduce(
        (total, transaction) =>
          total + Number(transaction.amount),
        0
      );
  }, [filteredTransactions]);

  // Balance
  const balance = income - expense;

  // Transaction count
  const totalTransactions = filteredTransactions.length;

  // Income versus expense data
  const incomeExpenseData = [
    {
      name: "Income",
      amount: income,
    },
    {
      name: "Expense",
      amount: expense,
    },
  ];

  // Category-wise expenses
  const categoryData = useMemo(() => {
    const categoryAmounts = {};

    filteredTransactions
      .filter((transaction) => transaction.type === "expense")
      .forEach((transaction) => {
        const category = transaction.category || "Other";

        categoryAmounts[category] =
          (categoryAmounts[category] || 0) +
          Number(transaction.amount);
      });

    const totalExpense = Object.values(categoryAmounts).reduce(
      (total, amount) => total + amount,
      0
    );

    return Object.entries(categoryAmounts)
      .map(([name, amount]) => ({
        name,
        amount,
        value: amount,
        percentage:
          totalExpense > 0
            ? (amount / totalExpense) * 100
            : 0,
      }))
      .sort((a, b) => b.amount - a.amount);
  }, [filteredTransactions]);

  // Monthly income and expense data
  // This chart uses all months of data, regardless of the period filter.
  const monthlyData = useMemo(() => {
    const monthlyTotals = {};

    validTransactions
      .filter(
        (transaction) =>
          selectedCategory === "all" ||
          transaction.category === selectedCategory
      )
      .forEach((transaction) => {
        const date = new Date(transaction.createdAt);

        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(
          2,
          "0"
        );

        const key = `${year}-${month}`;

        if (!monthlyTotals[key]) {
          monthlyTotals[key] = {
            income: 0,
            expense: 0,
          };
        }

        if (transaction.type === "income") {
          monthlyTotals[key].income += Number(
            transaction.amount
          );
        } else {
          monthlyTotals[key].expense += Number(
            transaction.amount
          );
        }
      });

    return Object.entries(monthlyTotals)
      .sort(([keyA], [keyB]) => keyA.localeCompare(keyB))
      .map(([key, totals]) => {
        const [year, month] = key.split("-");

        const label = new Date(
          Number(year),
          Number(month) - 1,
          1
        ).toLocaleDateString("en-IN", {
          month: "short",
          year: "numeric",
        });

        return {
          month: label,
          Income: totals.income,
          Expense: totals.expense,
        };
      });
  }, [validTransactions, selectedCategory]);

  // Current month's expense by category for budget comparison
  const currentMonthExpenses = useMemo(() => {
    const amounts = {};

    validTransactions
      .filter((transaction) => {
        const date = new Date(transaction.createdAt);

        return (
          transaction.type === "expense" &&
          date.getMonth() === currentMonth - 1 &&
          date.getFullYear() === currentYear
        );
      })
      .forEach((transaction) => {
        const category = transaction.category || "Other";

        amounts[category] =
          (amounts[category] || 0) +
          Number(transaction.amount);
      });

    return amounts;
  }, [validTransactions, currentMonth, currentYear]);

  const getBudgetStatus = (percentage) => {
    if (percentage >= 100) {
      return "exceeded";
    }

    if (percentage >= 80) {
      return "warning";
    }

    return "normal";
  };

  // Loading state
  if (loading) {
    return (
      <div className="statistics-page">
        <h1>Statistics</h1>
        <p>Loading statistics...</p>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="statistics-page">
        <h1>Statistics</h1>
        <p className="statistics-error">{error}</p>

        <button
          type="button"
          onClick={() => setRefresh((previous) => previous + 1)}
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="statistics-page">
      <div className="statistics-header">
        <h1>Statistics</h1>
        <div>
         <button
    className="export-csv-btn"
    onClick={() => exportTransactionsToCSV(filteredTransactions)}
    disabled={!transactions || transactions.length === 0}
  >
    Export CSV
  </button>

        <button
          type="button"
          onClick={() => setRefresh((previous) => previous + 1)}
        >
          Refresh
        </button>

        </div>
      </div>

      {/* FILTERS */}

      <div className="statistics-filters">
        <div>
          <label htmlFor="period-filter">Period</label>

          <select
            id="period-filter"
            value={selectedPeriod}
            onChange={(event) =>
              setSelectedPeriod(event.target.value)
            }
          >
            <option value="all">All time</option>
            <option value="thisMonth">This month</option>
            <option value="lastMonth">Last month</option>
            <option value="thisYear">This year</option>
          </select>
        </div>

        <div>
          <label htmlFor="category-filter">Expense category</label>

          <select
            id="category-filter"
            value={selectedCategory}
            onChange={(event) =>
              setSelectedCategory(event.target.value)
            }
          >
            <option value="all">All categories</option>

            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* SUMMARY CARDS */}

      <div className="statistics-cards">
        <div className="statistics-card">
          <h3>Total Transactions</h3>
          <p>{totalTransactions}</p>
        </div>

        <div className="statistics-card">
          <h3>Total Income</h3>
          <p>{formatCurrency(income)}</p>
        </div>

        <div className="statistics-card">
          <h3>Total Expenses</h3>
          <p>{formatCurrency(expense)}</p>
        </div>

        <div className="statistics-card">
          <h3>Balance</h3>
          <p>{formatCurrency(balance)}</p>
        </div>
      </div>

      {filteredTransactions.length === 0 && (
        <p className="statistics-empty">
          No transactions found for the selected filters.
        </p>
      )}

      {/* INCOME VERSUS EXPENSE */}

      <div className="chart-box">
        <h2>Income vs. Expense</h2>

        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={incomeExpenseData}>
            <CartesianGrid strokeDasharray="3 3" />

            <XAxis dataKey="name" />

            <YAxis
              tickFormatter={(value) =>
                `₹${Number(value).toLocaleString("en-IN")}`
              }
            />

            <Tooltip
              formatter={(value) =>
                formatCurrency(Number(value))
              }
            />

            <Bar
              dataKey="amount"
              name="Amount"
              radius={[6, 6, 0, 0]}
            >
              {incomeExpenseData.map((entry) => (
                <Cell
                  key={entry.name}
                  fill={
                    entry.name === "Income"
                      ? "#16a34a"
                      : "#dc2626"
                  }
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* CATEGORY EXPENSE TABLE */}

      <div className="category-statistics">
        <h2>Expense by Category</h2>

        {categoryData.length === 0 ? (
          <p>No expense data available.</p>
        ) : (
          <div className="statistics-table-wrapper">
            <table className="statistics-table">
              <thead>
                <tr>
                  <th>Category</th>
                  <th>Amount</th>
                  <th>Share</th>
                </tr>
              </thead>

              <tbody>
                {categoryData.map((category) => (
                  <tr key={category.name}>
                    <td>{category.name}</td>

                    <td>
                      {formatCurrency(category.amount)}
                    </td>

                    <td>
                      {category.percentage.toFixed(1)}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* CATEGORY PIE CHART */}

      <div className="chart-box">
        <h2>Spending Distribution</h2>

        {categoryData.length === 0 ? (
          <p>No expense data available.</p>
        ) : (
          <ResponsiveContainer width="100%" height={350}>
            <PieChart>
              <Pie
                data={categoryData}
                dataKey="value"
                nameKey="name"
                innerRadius={65}
                outerRadius={115}
                paddingAngle={3}
                label={({ name, percentage }) =>
                  `${name} (${percentage.toFixed(1)}%)`
                }
              >
                {categoryData.map((entry, index) => (
                  <Cell
                    key={entry.name}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>

              <Tooltip
                formatter={(value) =>
                  formatCurrency(Number(value))
                }
              />

              <Legend />
            </PieChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* MONTHLY INCOME AND EXPENSE */}

      <div className="chart-box">
        <h2>Monthly Income vs. Expense</h2>

        <p className="chart-description">
          This chart shows monthly trends for the selected category,
          independently of the period filter above.
        </p>

        {monthlyData.length === 0 ? (
          <p>No monthly data available.</p>
        ) : (
          <ResponsiveContainer width="100%" height={350}>
            <LineChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" />

              <XAxis dataKey="month" />

              <YAxis
                tickFormatter={(value) =>
                  `₹${Number(value).toLocaleString("en-IN")}`
                }
              />

              <Tooltip
                formatter={(value) =>
                  formatCurrency(Number(value))
                }
              />

              <Legend />

              <Line
                type="monotone"
                dataKey="Income"
                stroke="#16a34a"
                strokeWidth={3}
                dot={{ r: 4 }}
              />

              <Line
                type="monotone"
                dataKey="Expense"
                stroke="#dc2626"
                strokeWidth={3}
                dot={{ r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* BUDGET COMPARISON */}

      <div className="budget-statistics">
        <h2>
          Budget vs. Actual Spending (
          {now.toLocaleDateString("en-IN", {
            month: "long",
            year: "numeric",
          })}
          )
        </h2>

        <p className="chart-description">
          This section always shows the current month's budgets,
          regardless of the period filter above.
        </p>

        {budgetLoading ? (
          <p>Loading budgets...</p>
        ) : budgetError ? (
          <p className="statistics-error">{budgetError}</p>
        ) : budgets.length === 0 ? (
          <p>
            No budgets set for this month. Add a budget to compare
            your spending against your limits.
          </p>
        ) : (
          budgets.map((budget) => {
            const spent =
              currentMonthExpenses[budget.category] || 0;

            const limit = Number(budget.monthlyLimit) || 0;

            const percentage =
              limit > 0 ? (spent / limit) * 100 : 0;

            const remaining = limit - spent;

            const status = getBudgetStatus(percentage);

            return (
              <div
                className="budget-statistics-row"
                key={budget._id || budget.category}
              >
                <div className="budget-statistics-heading">
                  <strong>{budget.category}</strong>

                  <span>
                    {formatCurrency(spent)} /{" "}
                    {formatCurrency(limit)}
                  </span>
                </div>

                <div className="budget-progress-track">
                  <div
                    className={`budget-progress-fill ${status}`}
                    style={{
                      width: `${Math.min(percentage, 100)}%`,
                    }}
                  />
                </div>

                <div className="budget-statistics-footer">
                  <span>
                    {percentage.toFixed(1)}% used
                  </span>

                  <span
                    className={`budget-status ${status}`}
                  >
                    {status === "exceeded"
                      ? "Budget exceeded"
                      : status === "warning"
                      ? "Approaching limit"
                      : "Within budget"}
                  </span>

                  <span>
                    {remaining >= 0
                      ? `${formatCurrency(remaining)} remaining`
                      : `${formatCurrency(Math.abs(remaining))} over budget`}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

export default Statistics;