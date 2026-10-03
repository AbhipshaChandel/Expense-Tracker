import { useEffect, useState } from "react";
import "./Statistics.css";

function Statistics() {

    const [transactions, settransactions] = useState([]);

    useEffect(() => {

        const getTransaction = async () => {

            try {

                const token = localStorage.getItem("token");

                const response = await fetch(
                    "http://localhost:5000/api/transaction",
                    {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    }
                );

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


            {/* CATEGORY STATISTICS */}

            <div className="category-statistics">

                <h2>Expense by Category</h2>

                {Object.keys(categoryamount).length === 0 ? (

                    <p>No expense data available.</p>

                ) : (

                    Object.entries(categoryamount).map(
                        ([category, amount]) => (

                            <div
                                className="category-row"
                                key={category}
                            >

                                <span>{category}</span>

                                <strong>₹{amount}</strong>

                            </div>

                        )
                    )

                )}

            </div>

        </div>

    );
}

export default Statistics;