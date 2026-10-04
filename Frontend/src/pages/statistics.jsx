import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line
} from "recharts";

import { PieChart, Pie, Cell } from "recharts";
import { useEffect, useState } from "react";
import "./Statistics.css";

function Statistics() {
  const [transactions, settransactions] = useState([]);

  useEffect(() => {
    const getTransaction = async () => {
      try {
        const token = localStorage.getItem("token");

        const response = await fetch("http://localhost:5000/api/transaction", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json();

        if (!response.ok) {
          alert(data.message);
          return;
        }

        settransactions(data);
      } catch (error) {
        console.log("Error fetching transactions", error);
      }
    };

    getTransaction();
  }, []);

  // ---------------- TOTAL INCOME ----------------

  const income = transactions
    .filter((t) => t.type === "income")
    .reduce((acc, t) => acc + Number(t.amount), 0);

  // ---------------- TOTAL EXPENSE ----------------

  const expense = transactions
    .filter((t) => t.type === "expense")
    .reduce((acc, t) => acc + Number(t.amount), 0);

  // ---------------- BALANCE ----------------

  const balance = income - expense;

  // ---------------- TOTAL TRANSACTIONS ----------------

  const totaltransactions = transactions.length;

  const incomeexpense = [
    {
      name: "Money",
      Income: income,
      Expense: expense,
    },
  ];

  // ---------------- CATEGORY EXPENSE ----------------

  const categoryamount = {};

  transactions
    .filter((t) => t.type === "expense")
    .forEach((t) => {
      if (!categoryamount[t.category]) {
        categoryamount[t.category] = 0;
      }

      categoryamount[t.category] += Number(t.amount);
    });

  const categorydata = Object.entries(categoryamount).map(
    ([category, amount]) => ({
      name: category,
      value: amount,
    }),
  );


  const monthlyexpense = {};

transactions
    .filter((t) => t.type === "expense")
    .forEach((t) => {

        const date = new Date(t.createdAt);

        const month = date.toLocaleDateString("en-IN", {
            month: "short",
            year: "numeric"
        });

        if (!monthlyexpense[month]) {
            monthlyexpense[month] = 0;
        }

        monthlyexpense[month] += Number(t.amount);

    });


    const monthlydata = Object.entries(monthlyexpense).map(
    ([month, amount]) => ({
        month,
        amount
    })
);

  return (
    <div className="statistics-page">
      <h1>Statistics</h1>

      {/* SUMMARY CARDS */}

      <div className="statistics-cards">
        <div className="statistics-card">
          <h3>Total Transactions</h3>
          <p>{totaltransactions}</p>
        </div>

        <div className="statistics-card">
          <h3>Total Income</h3>
          <p>₹{income}</p>
        </div>

        <div className="statistics-card">
          <h3>Total Expenses</h3>
          <p>₹{expense}</p>
        </div>

        <div className="statistics-card">
          <h3>Balance</h3>
          <p>₹{balance}</p>
        </div>
      </div>

      <div className="chart-box">
        <h2>Income vs Expense</h2>

        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={incomeexpense}>
            <CartesianGrid strokeDasharray="3 3" />

            <XAxis dataKey="name" />

            <YAxis />

            <Tooltip />

            <Bar dataKey="Income" fill="#16a34a" />

            <Bar dataKey="Expense" fill="#dc2626" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* CATEGORY STATISTICS */}

      <div className="category-statistics">
        <h2>Expense by Category</h2>

        {Object.keys(categoryamount).length === 0 ? (
          <p>No expense data available.</p>
        ) : (
          Object.entries(categoryamount).map(([category, amount]) => (
            <div className="category-row" key={category}>
              <span>{category}</span>

              <strong>₹{amount}</strong>
            </div>
          ))
        )}
      </div>

      <div className="chart-box">
        <h2>Expense by Category</h2>

        {categorydata.length === 0 ? (
          <p>No expense data available.</p>
        ) : (
          <ResponsiveContainer width="100%" height={350}>
            <PieChart>
              <Pie
                data={categorydata}
                dataKey="value"
                nameKey="name"
                outerRadius={120}
                label
              >
                {categorydata.map((entry, index) => (
                  <Cell key={`cell-${index}`} />
                ))}
              </Pie>

              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className="chart-box">

    <h2>Monthly Expenses</h2>

    {monthlydata.length === 0 ? (

        <p>No expense data available.</p>

    ) : (

        <ResponsiveContainer width="100%" height={350}>

            <LineChart data={monthlydata}>

                <CartesianGrid strokeDasharray="3 3" />

                <XAxis dataKey="month" />

                <YAxis />

                <Tooltip />

                <Line
                    type="monotone"
                    dataKey="amount"
                    stroke="#dc2626"
                    strokeWidth={3}
                />

            </LineChart>

        </ResponsiveContainer>

    )}

</div>
    </div>
  );
}

export default Statistics;
