import { useState } from "react";
import "./App.css";

function App() {
  const [transactions, setTransactions] = useState([
    {
      id: 1,
      text: "Salary",
      amount: 10000,
      type: "income",
    },
    {
      id: 2,
      text: "Travel",
      amount: 5000,
      type: "expense",
    },
  ]);

  const [showForm, setShowForm] = useState(false);

  const [text, setText] = useState("");
  const [amount, setAmount] = useState("");
  const [type, setType] = useState("expense");

  const [search, setSearch] = useState("");

  // Calculate total income
  const income = transactions
    .filter((transaction) => transaction.type === "income")
    .reduce((total, transaction) => total + transaction.amount, 0);

  // Calculate total expenses
  const expense = transactions
    .filter((transaction) => transaction.type === "expense")
    .reduce((total, transaction) => total + transaction.amount, 0);

  // Calculate balance
  const balance = income - expense;

  // Add transaction
  const addTransaction = (e) => {
    e.preventDefault();

    if (!text || !amount) {
      alert("Please enter transaction details");
      return;
    }

    const newTransaction = {
      id: Date.now(),
      text: text,
      amount: Number(amount),
      type: type,
    };

    setTransactions([...transactions, newTransaction]);

    // Clear form
    setText("");
    setAmount("");
    setType("expense");

    // Hide form
    setShowForm(false);
  };

  // Search transactions
  const filteredTransactions = transactions.filter((transaction) =>
    transaction.text.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="container">

      {/* Heading */}
      <h1>Expense Tracker</h1>

      {/* Balance + Add button */}
      <div className="balance-section">

        <h2>
          Balance: <span>${balance}</span>
        </h2>

        <button
          className="add-btn"
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? "CANCEL" : "ADD"}
        </button>

      </div>

      {/* Add Transaction Form */}
      {showForm && (
        <form className="transaction-form" onSubmit={addTransaction}>

          <input
            type="text"
            placeholder="Enter transaction"
            value={text}
            onChange={(e) => setText(e.target.value)}
          />

          <input
            type="number"
            placeholder="Enter amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />

          <div className="radio-section">

            <label>
              <input
                type="radio"
                value="expense"
                checked={type === "expense"}
                onChange={(e) => setType(e.target.value)}
              />
              Expense
            </label>

            <label>
              <input
                type="radio"
                value="income"
                checked={type === "income"}
                onChange={(e) => setType(e.target.value)}
              />
              Income
            </label>

          </div>

          <button className="submit-btn" type="submit">
            Add Transaction
          </button>

        </form>
      )}

      {/* Income / Expense boxes */}
      <div className="summary">

        <div className="summary-box">
          <p>Expense</p>
          <h2 className="expense">
            ${expense}
          </h2>
        </div>

        <div className="summary-box">
          <p>Income</p>
          <h2 className="income">
            ${income}
          </h2>
        </div>

      </div>

      {/* Transactions */}
      <h2 className="transactions-title">
        Transactions
      </h2>

      {/* Search */}
      <input
        className="search"
        type="text"
        placeholder="Search"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {/* Transaction List */}
      <div className="transaction-list">

        {filteredTransactions.map((transaction) => (

          <div
            className={`transaction ${
              transaction.type === "income"
                ? "transaction-income"
                : "transaction-expense"
            }`}
            key={transaction.id}
          >

            <span>{transaction.text}</span>

            <span>
              ${transaction.amount}
            </span>

          </div>

        ))}

      </div>

    </div>
  );
}

export default App;