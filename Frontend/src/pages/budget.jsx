
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL,apiFetch } from "../utils/api";
import "./budget.css";

function Budget() {
      const navigate = useNavigate();
  const today = new Date();

  const [month, setMonth] = useState(today.getMonth() + 1);
  const [year, setYear] = useState(today.getFullYear());

  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const [category, setCategory] = useState("Food");
  const [monthlyLimit, setMonthlyLimit] = useState("");

  const categories = [
    "Food",
    "Travel",
    "Shopping",
    "Bills",
    "Health",
    "Education",
    "Entertainment",
    "Other",
  ];

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  // Fetch budgets for the selected month and year.
  async function fetchBudgets() {
    setLoading(true);
    setError("");

    try {

      const response = await apiFetch(
        `${API_BASE_URL}/api/budgets?month=${month}&year=${year}`,{},
        navigate,
        
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to fetch budgets.");
      }

      if (!Array.isArray(data)) {
        throw new Error("Unexpected budget API response.");
      }

      setBudgets(data);
    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchBudgets();
  }, [month, year]);

  // Create or update a budget.
  async function handleSubmit(e) {
    e.preventDefault();

    setError("");
    setMessage("");

    const limit = Number(monthlyLimit);

    if (!Number.isFinite(limit) || limit <= 0) {
      setError("Please enter a budget greater than zero.");
      return;
    }

    setSaving(true);

    try {

      const response = await apiFetch(`${API_BASE_URL}/api/budgets`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
         
        },
        body: JSON.stringify({
          category,
          monthlyLimit: limit,
          month,
          year,
        }),
      },
    navigate,
    );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to save budget.");
      }

      setMessage(`${category} budget saved successfully!`);
      setMonthlyLimit("");

      // Reload budgets to display the latest values.
      await fetchBudgets();
    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setSaving(false);
    }
  }

  function getStatusLabel(status) {
    if (status === "exceeded") {
      return "Budget exceeded";
    }

    if (status === "warning") {
      return "Near budget limit";
    }

    return "Within budget";
  }

  function getProgress(budget) {
    const percentage = Number(budget.percentageUsed) || 0;

    // Prevent the progress bar from extending beyond 100%.
    return Math.min(Math.max(percentage, 0), 100);
  }

  function formatCurrency(amount) {
    return `₹${Number(amount || 0).toLocaleString("en-IN", {
      maximumFractionDigits: 2,
    })}`;
  }

  return (
    <div className="budget-page">
      <div className="budget-header">
        <div>
          <h1>Monthly Budgets</h1>
          <p>Plan your spending and stay within your limits.</p>
        </div>

        <div className="budget-month-selector">
          <select
            value={month}
            onChange={(e) => setMonth(Number(e.target.value))}
            aria-label="Select month"
          >
            {monthNames.map((name, index) => (
              <option key={name} value={index + 1}>
                {name}
              </option>
            ))}
          </select>

          <select
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
            aria-label="Select year"
          >
            {[today.getFullYear() - 1, today.getFullYear(), today.getFullYear() + 1].map(
              (value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              )
            )}
          </select>
        </div>
      </div>

      <div className="budget-form-card">
        <h2>Set a Category Budget</h2>

        <form onSubmit={handleSubmit} className="budget-form">
          <div className="budget-form-field">
            <label htmlFor="budget-category">Category</label>

            <select
              id="budget-category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              {categories.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>

          <div className="budget-form-field">
            <label htmlFor="monthly-limit">Monthly limit (₹)</label>

            <input
              id="monthly-limit"
              type="number"
              min="0.01"
              step="0.01"
              placeholder="Enter amount"
              value={monthlyLimit}
              onChange={(e) => setMonthlyLimit(e.target.value)}
              required
            />
          </div>

          <button type="submit" disabled={saving}>
            {saving ? "Saving..." : "Save Budget"}
          </button>
        </form>

        <p className="budget-form-note">
          This budget will apply to {monthNames[month - 1]} {year}.
        </p>
      </div>

      {error && (
        <div className="budget-error" role="alert">
          {error}
        </div>
      )}

      {message && (
        <div className="budget-success" role="status">
          {message}
        </div>
      )}

      <div className="budget-list-header">
        <h2>Your Budgets</h2>
        <span>{budgets.length} categories</span>
      </div>

      {loading ? (
        <p className="budget-empty">Loading budgets...</p>
      ) : budgets.length === 0 ? (
        <div className="budget-empty">
          <h3>No budgets set yet</h3>
          <p>Create a budget above to start tracking your spending.</p>
        </div>
      ) : (
        <div className="budget-grid">
          {budgets.map((budget) => (
            <div className="budget-card" key={budget._id}>
              <div className="budget-card-top">
                <h3>{budget.category}</h3>

                <span
                  className={`budget-status ${budget.status}`}
                >
                  {getStatusLabel(budget.status)}
                </span>
              </div>

              <p className="budget-spent-label">Spent so far</p>

              <h2 className="budget-spent">
                {formatCurrency(budget.spent)}
              </h2>

              <div className="budget-progress-track">
                <div
                  className={`budget-progress-fill ${budget.status}`}
                  style={{
                    width: `${getProgress(budget)}%`,
                  }}
                />
              </div>

              <div className="budget-progress-info">
                <span>
                  {Number(budget.percentageUsed || 0).toFixed(1)}% used
                </span>

                <span>
                  Limit: {formatCurrency(budget.monthlyLimit)}
                </span>
              </div>

              <div className="budget-remaining">
                <span>Remaining</span>

                <strong
                  className={
                    Number(budget.remaining) < 0
                      ? "budget-negative"
                      : ""
                  }
                >
                  {formatCurrency(budget.remaining)}
                </strong>
              </div>

              <button
                type="button"
                className="budget-edit-button"
                onClick={() => {
                  setCategory(budget.category);
                  setMonthlyLimit(String(budget.monthlyLimit));

                  window.scrollTo({
                    top: 0,
                    behavior: "smooth",
                  });
                }}
              >
                Edit Budget
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Budget;
