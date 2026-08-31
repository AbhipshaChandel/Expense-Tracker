import { useState } from "react";
// import './App.css'

function App() {
  const [transactions, settransactions] = useState([
    {
      id: 1,
      text: "salary",
      amount: 10000,
      type: "income",
    },
    {
      id: 2,
      text: "travel",
      amount: 5000,
      type: "expense",
    },
  ]);

  const [text, settext] = useState("");
  const [amount, setamount] = useState("");
  const [type, settype] = useState("expense");
  const [showform, setshowform] = useState(false);
  const [search, setsearch] = useState("");

  const income = transactions
    .filter((t) => {
      t.type === "income";
    })
    .reduce((acc, t) => {
      (acc + t.amount, 0);
    });

  const expense = transactions
    .filter((t) => {
      t.type == "expense";
    })
    .reduce((acc, t) => {
      (acc + t.amount, 0);
    });

  const balance = income - expense;

  const addtransaction = (e) => {
    e.preventDefault();

    if (!text || !amount) {
      alert("Please add a transaction");
      return;
    }

    const newTransaction = {
      id: Date.now(),
      text: text,
      amount: Number(amount),
      type: type,
    };

    settransactions([...transactions, newTransaction]);
    settext("");
    setamount("");
    settype("expense");
    setshowform(false);
  };

  const filteredtransactions = transactions.filter((t) => {
    t.text.toLowerCase().includes(search.toLowerCase());
  });

  return (
    <>
      <div className="container">
        {/* Heading */}
        <h1>Expense Tracker</h1>

        {/* Balance Section */}
        <div className="balance-section">
          <h2>
            Balance: <span>`${balance}`</span>
          </h2>

          <button className="add-btn" onClick={() => setshowform(!showform)}>
            {showform ? "Cancel" : "Add"}
          </button>
        </div>

        {/* Add transaction form */}
        {showform && (
          <form className="add-transaction-form" onSubmit={addtransaction}>
            <input
              type="text"
              placeholder="Enter Transaction type"
              value={type}
              onChange={(e) => settext(e.target.value)}
            />

            <input
              type="text"
              placeholder="Enter amount"
              value={amount}
              onChange={(e) => setamount(e.target.value)}
            />

            <div className="radio-btn">
              <label>
                <input
                  type="radio"
                  value="income"
                  checked={type === "income"}
                  onChange={(e) => settype(e.target.value)}
                />
                Income
              </label>

              <label>
                <input
                  type="radio"
                  value="expense"
                  checked={type === "expense"}
                  onChange={(e) => settype(e.target.value)}
                />
                Expense
              </label>

              {/* Submit button */}

              <button className="submit" type="submit">
                Add-transaction
              </button>
            </div>
          </form>
        )}
        {/* Summary Box */}
        <div className="summary">
          <div className="summary-box">
            <p>Expense</p>
            <h2 className="expense">${expense}</h2>
          </div>

          <div className="income">
            <p>Income</p>
            <h2 className="income">${income}</h2>
          </div>
        </div>

        {/* Transaction */}
        <h2 className="transaction-heading">Transaction</h2>

        <input
          className="search"
          type="text"
          placeholder="Search"
          value={search}
          onChange={(e) => setsearch(e.target.value)}
        ></input>

        {/* Transaction list */}

        <div className="transaction-list">
          {filteredtransactions.map((transaction) => {
            <div
              className={`transaction ${transaction.type === income ? "transaction-income" : "transaction-expense"}`}
              key={transaction.id}
            >
              <span>{transaction.text}</span>
              <span>{transaction.amount}</span>
            </div>;
          })}
        </div>
      </div>
    </>
  );
}

export default App;
