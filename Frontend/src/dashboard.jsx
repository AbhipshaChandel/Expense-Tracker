import { useState, useEffect } from "react";
import "./App.css";
function Dashboard() {
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
        console.log("Error fetching Transaction", error);
      }
    };
    getTransaction();
  }, []);

  const [text, settext] = useState("");
  const [amount, setamount] = useState("");
  const [type, settype] = useState("expense");
  const [showform, setshowform] = useState(false);
  const [search, setsearch] = useState("");
  const [editId, seteditId] = useState(null);
  const [category, setcategory] = useState("");

  const income = transactions
    .filter((t) => t.type === "income")
    .reduce((acc, t) => acc + Number(t.amount), 0);

  const expense = transactions
    .filter((t) => t.type === "expense")
    .reduce((acc, t) => acc + Number(t.amount), 0);

  const balance = income - expense;

  // New way of adding transaction//

  const addtransaction = async (e) => {
    e.preventDefault();

    if (!text || !amount || !category) {
      alert("Please add transaction");
      return;
    }

    const amountnumber = Number(amount);
    if (!Number.isInteger(amountnumber) || amountnumber <= 0) {
      return alert("Amount should be positive");
    }

    try {
      const token = localStorage.getItem("token");
      if (editId !== null) {
        const response = await fetch(
          `http://localhost:5000/api/transaction/${editId}`,
          {
            method: "PUT",
            headers: {
              "Content-type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              text: text,
              amount: amountnumber,
              type: type,
              category:category
            }),
          },
        );

        const updateTransaction = await response.json();

        settransactions(
          transactions.map((t) => (t._id == editId ? updateTransaction : t)),
        );
      } else {
        const response = await fetch("http://localhost:5000/api/transaction", {
          method: "POST",
          headers: {
            "Content-type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            text: text,
            amount: amountnumber,
            type: type,
            category:category
          }),
        });

        const newTransaction = await response.json();

        settransactions([...transactions, newTransaction]);
      }
      settext("");
      setamount("");
      settype("expense");
      seteditId(null);
      setshowform(false);
      setcategory("")
    } catch (error) {
      console.log("Error adding/Editing transaction", error);
    }
  };

  // New method of deleting transaction//

  const deleteTransaction = async (id) => {
    try {
      const token = localStorage.getItem("token");
      await fetch(`http://localhost:5000/api/transaction/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      settransactions(transactions.filter((t) => t._id !== id));
    } catch (error) {
      console.log("Error deleting transaction", error);
    }
  };

  const editTransaction = async (e) => {
    settext(e.text);
    setamount(e.amount);
    settype(e.type);

    seteditId(e._id);
    setcategory(e.category)
    setshowform(true);
  };

  const filteredtransactions = transactions.filter((t) =>
    t.text.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <>
      <div className="container">
        {/* Heading */}
        <h1>Expense Tracker</h1>

        {/* Balance Section */}
        <div className="balance-section">
          <h2>
            Balance: <span>${balance}</span>
          </h2>

          <button
            className="add-btn"
            onClick={() => {
              setshowform(!showform);
              seteditId(null);
              settext("");
              setamount("");
              settype("expense");
            }}
          >
            {showform ? "Cancel" : "Add"}
          </button>
        </div>

        {/* Add transaction form */}
        {showform && (
          <form className="add-transaction-form" onSubmit={addtransaction}>
            <input
              type="text"
              placeholder="Enter Transaction type"
              value={text}
              onChange={(e) => settext(e.target.value)}
            />

            <input
              type="number"
              placeholder="Enter amount"
              value={amount}
              onChange={(e) => setamount(e.target.value)}
              min="1"
              step="1"
            />

            <div className="radio-btn">
              <label>
                <input
                  type="radio"
                  value="expense"
                  checked={type === "expense"}
                  onChange={(e) => settype(e.target.value)}
                />
                Expense
              </label>

              <label>
                <input
                  type="radio"
                  value="income"
                  checked={type === "income"}
                  onChange={(e) => settype(e.target.value)}
                />
                Income
              </label>
              <select
                value={category}
                onChange={(e) => setcategory(e.target.value)}
              >
                <option value="">Select Category</option>
                <option value="Food">Food</option>
                <option value="Travel">Travel</option>
                <option value="Shopping">Shopping</option>
                <option value="Bills">Bills</option>
                <option value="Education">Education</option>
                <option value="Entertainment">Entertainment</option>
                <option value="Other">Other</option>
              </select>

              {/* Submit button */}

              <button className="submit" type="submit">
                {editId !== null ? "Update-transaction" : "Add-transaction"}
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

          <div className="summary-box">
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
          {filteredtransactions.map((transaction) => (
            <div
              className={`transaction ${transaction.type === "income" ? "transaction-income" : "transaction-expense"}`}
              key={transaction._id}
            >
              <span>{transaction.text}</span>
              <span>{transaction.category}</span>
              <span>{transaction.amount}</span>
              <span>
                {new Date(transaction.createdAt).toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              </span>
              <button onClick={() => editTransaction(transaction)}>Edit</button>
              <span onClick={() => deleteTransaction(transaction._id)}>X</span>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

export default Dashboard;

// old way of getting data

// const [transactions, settransactions] = useState(() => {
//   let savedData = localStorage.getItem("Transactions");

//   return savedData ? JSON.parse(savedData) : [];
// });

// old way of storing

// useEffect(() => {
//   localStorage.setItem("Transactions", JSON.stringify(transactions));
// }, [transactions]);

// Old method of adding transaction//

// const addtransaction = (e) => {
//   e.preventDefault();

//   if (!text || !amount) {
//     alert("Please add a transaction");
//     return;
//   }

//   if (editId !== null) {
//     settransactions(
//       transactions.map((t) =>
//         t.id === editId
//           ? {
//               ...transactions,
//               text: text,
//               amount: Number(amount),
//               type: type,
//             }
//           : t,
//       ),
//     );
//   } else {
//     const newTransaction = {
//       id: Date.now(),
//       text: text,
//       amount: Number(amount),
//       type: type,
//     };

//     settransactions([...transactions, newTransaction]);
//   }

//   settext("");
//   setamount("");
//   settype("expense");
//   setshowform(false);
// };

// OLd method of deleting transaction//

// const deleteTransaction = (e) => {
//   settransactions(transactions.filter((t) => t.id !== e.id));
// };
