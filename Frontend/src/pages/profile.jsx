import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Profile.css";
import {apiFetch} from "../utils/api"

function Profile() {
  const navigate = useNavigate();

  const [user, setuser] = useState(null);
  const [statistics, setstatistics] = useState(null);
  const [topCategory, settopCategory] = useState(null);
  const [recentTransactions, setrecentTransactions] = useState([]);
  const [editmode, seteditmode] = useState(false);
  const [showPasswordForm, setshowPasswordForm] = useState(false);
  const [currentPassword, setcurrentPassword] = useState("");
  const [newPassword, setnewPassword] = useState("");
  const [confirmPassword, setconfirmPassword] = useState("");

  const [name, setname] = useState("");
  const [email, setemail] = useState("");

  useEffect(() => {
    const getProfile = async () => {
      try {
        // const token = localStorage.getItem("token");

        // const response = await fetch("http://localhost:5000/api/auth/profile", {
        //   method: "GET",
        //   headers: {
        //     Authorization: `Bearer ${token}`,
        //   },
        // });


        const response = await apiFetch(
    "http://localhost:5000/api/auth/profile",
    {},
    navigate
);

if (!response) {
    return;
}

        const data = await response.json();

        if (!response.ok) {
          alert(data.message);
          return;
        }

        setuser(data.user);
        setstatistics(data.statistics);
        settopCategory(data.topCategory);
        setrecentTransactions(data.recentTransactions);
        setname(data.user.name);
        setemail(data.user.email);
      } catch (error) {
        console.log("Error fetching profile", error);
      }
    };

    getProfile();
  }, []);

  if (!user || !statistics || !topCategory) {
    return <h2>Loading...</h2>;
  }

  const updateProfile = async () => {
    try {
      // const token = localStorage.getItem("token");

      // const response = await fetch("http://localhost:5000/api/auth/profile", {
      //   method: "PUT",
      //   headers: {
      //     "Content-Type": "application/json",
      //     Authorization: `Bearer ${token}`,
      //   },
      //   body: JSON.stringify({
      //     name,
      //     email,
      //   }),
      // });



        const response = await apiFetch(
            "http://localhost:5000/api/auth/profile",
            {
                method: "PUT",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    name: name,
                    email: email
                })
            },
            navigate
        );

        // JWT expired/invalid
        if (!response) {
            return;
        }

      const data = await response.json();

      if (!response.ok) {
        alert(data.message);
        return;
      }

      setuser(data.user);
      seteditmode(false);

      alert("Profile updated successfully");
    } catch (error) {
      console.log("Error updating profile", error);
    }
  };

  const changePassword = async () => {
    if (newPassword !== confirmPassword) {
      alert("New passwords do not match");

      return;
    }

    try {
      // const token = localStorage.getItem("token");

      // const response = await fetch(
      //   "http://localhost:5000/api/auth/change-password",
      //   {
      //     method: "PUT",

      //     headers: {
      //       "Content-Type": "application/json",
      //       Authorization: `Bearer ${token}`,
      //     },

      //     body: JSON.stringify({
      //       currentPassword,
      //       newPassword,
      //     }),
      //   },
      // );



        const response = await apiFetch(
            "http://localhost:5000/api/auth/change-password",
            {
                method: "PUT",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    currentPassword: currentPassword,
                    newPassword: newPassword
                })
            },
            navigate
        );

        // JWT expired/invalid
        if (!response) {
            return;
        }

      const data = await response.json();

      if (!response.ok) {
        alert(data.message);

        return;
      }

      alert("Password changed successfully");

      setcurrentPassword("");
      setnewPassword("");
      setconfirmPassword("");
    } catch (error) {
      console.log("Error changing password", error);
    }
  };

  const logout = () => {
    localStorage.removeItem("token");

    navigate("/login");
  };

  return (
    <div className="profile-page">
      <h1>My Profile</h1>

      {/* USER INFORMATION */}

      <div className="profile-card">
        <div className="profile-avatar">
          {user.name.charAt(0).toUpperCase()}
        </div>

        {editmode ? (
          <>
            <input
              type="text"
              value={name}
              onChange={(e) => setname(e.target.value)}
            />

            <input
              type="email"
              value={email}
              onChange={(e) => setemail(e.target.value)}
            />

            <button onClick={updateProfile}>Save Changes</button>

            <button onClick={() => seteditmode(false)}>Cancel</button>
          </>
        ) : (
          <>
            <h2>{user.name}</h2>

            <p>{user.email}</p>

            <button onClick={() => seteditmode(true)}>Edit Profile</button>
          </>
        )}

        <h2>Change Password</h2>

        {!showPasswordForm ? (
          // Only button is shown initially
          <button
            className="change-password-button"
            onClick={() => setshowPasswordForm(true)}
          >
            Change Password
          </button>
        ) : (
          // Form appears after clicking the button
          <div className="password-form">
            <input
              type="password"
              placeholder="Current Password"
              value={currentPassword}
              onChange={(e) => setcurrentPassword(e.target.value)}
            />

            <input
              type="password"
              placeholder="New Password"
              value={newPassword}
              onChange={(e) => setnewPassword(e.target.value)}
            />

            <input
              type="password"
              placeholder="Confirm New Password"
              value={confirmPassword}
              onChange={(e) => setconfirmPassword(e.target.value)}
            />

            <div className="password-buttons">
              <button onClick={changePassword}>Update Password</button>

              <button
                type="button"
                onClick={() => {
                  setshowPasswordForm(false);
                  setcurrentPassword("");
                  setnewPassword("");
                  setconfirmPassword("");
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ACCOUNT INFORMATION */}

      <div className="profile-section">
        <h2>Account Information</h2>

        <p>
          <strong>Account ID:</strong> {user.id}
        </p>

        <p>
          <strong>Member Since:</strong>{" "}
          {new Date(user.createdAt).toLocaleDateString("en-IN", {
            day: "numeric",
            month: "short",
            year: "numeric",
          })}
        </p>
      </div>

      {/* ACTIVITY */}

      <div className="profile-section">
        <h2>Your Activity</h2>

        <div className="stats-container">
          <div className="stat-box">
            <h3>Total Transactions</h3>
            <p>{statistics.totalTransactions}</p>
          </div>

          <div className="stat-box">
            <h3>Total Income</h3>
            <p>₹{statistics.totalIncome}</p>
          </div>

          <div className="stat-box">
            <h3>Total Expenses</h3>
            <p>₹{statistics.totalExpense}</p>
          </div>

          <div className="stat-box">
            <h3>Balance</h3>
            <p>₹{statistics.balance}</p>
          </div>
        </div>
      </div>

      {/* TOP CATEGORY */}

      <div className="profile-section">
        <h2>Top Spending Category</h2>

        <div className="category-box">
          <h3>{topCategory.name}</h3>

          <p>₹{topCategory.categoryAmount}</p>
        </div>
      </div>

      {/* RECENT TRANSACTIONS */}

      <div className="profile-section">
        <h2>Recent Transactions</h2>

        {recentTransactions.length === 0 ? (
          <p>No transactions yet.</p>
        ) : (
          recentTransactions.map((transaction) => (
            <div className="recent-transaction" key={transaction._id}>
              <div>
                <strong>{transaction.text}</strong>

                <p>{transaction.category}</p>
              </div>

              <div>
                <span>
                  {transaction.type === "income" ? "+" : "-"}₹
                  {transaction.amount}
                </span>

                <p>
                  {new Date(transaction.createdAt).toLocaleDateString("en-IN")}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default Profile;
