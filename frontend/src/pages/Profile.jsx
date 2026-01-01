import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import axios from "axios";

export default function Profile() {
  const { user, setUser, token: contextToken } = useAuth();
  const { theme } = useTheme();

  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const BASE_URL = import.meta.env.VITE_BASE_URL;
  const isDark = theme === "dark";

  // Background same as Dashboard
  const dashboardBg = isDark
    ? "linear-gradient(135deg, #0f2027, #203a43, #2c5364)"
    : "linear-gradient(135deg, #e0eafc, #cfdef3, #f5f7fa)";

  const textColor = isDark ? "#ffffff" : "#000000";
  const inputBg = isDark ? "rgba(255,255,255,0.08)" : "rgba(255,255,255,0.7)";
  const borderColor = isDark ? "#00ffff80" : "#ff00ff80";
  const buttonBg = isDark ? "#00ffff30" : "#ff00ff30";

  // Use token from context first, fallback to localStorage
  const token = contextToken || localStorage.getItem("token");

  // Fetch wallet balance
  const fetchWallet = async () => {
    if (!token) return; // no token, cannot fetch
    try {
      const res = await axios.get(`${BASE_URL}/api/wallet`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUser({ ...user, wallet: res.data.balance });
    } catch (err) {
      console.error("Failed to fetch wallet:", err.response?.data || err.message);
      setError(err.response?.data?.error || "Failed to fetch wallet");
    }
  };

  useEffect(() => {
    if (user) fetchWallet();
  }, [user]);

  // Add funds
  const handleAddFunds = async () => {
    const amt = parseFloat(amount);
    if (isNaN(amt) || amt <= 0) {
      alert("Enter a valid amount");
      return;
    }

    if (!token) {
      alert("User not logged in!");
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post(
        `${BASE_URL}/api/wallet/add-funds`,
        { amount: amt },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Update wallet immediately
      setUser({ ...user, wallet: res.data.balance });
      setAmount("");
    } catch (err) {
      console.error("Add fund error:", err.response?.data || err.message);
      alert(err.response?.data?.error || "Failed to add funds");
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="dashboard" style={{ background: dashboardBg }}>
        <Navbar />
        <div className="main" style={{ color: textColor }}>Loading profile...</div>
      </div>
    );
  }

  return (
    <div className="dashboard" style={{ background: dashboardBg }}>
      <Navbar />
      <div className="main profile-page">
        <h2 style={{ color: textColor, fontWeight: "800" }}>Profile</h2>

        {error && <p style={{ color: "red" }}>{error}</p>}

        <div className="profile-container">
          <div className="profile-box">
            <span className="label">Name</span>
            <span className="value">{user.name}</span>
          </div>

          <div className="profile-box">
            <span className="label">Email</span>
            <span className="value">{user.email}</span>
          </div>

          <div className="profile-box">
            <span className="label">Wallet</span>
            <span className="value">₹{user.wallet}</span>
          </div>

          <div className="profile-box">
            <span className="label">Verified</span>
            <span className="value">{user.isVerified ? "Yes" : "No"}</span>
          </div>

          <div className="profile-box add-fund-box">
            <input
              type="number"
              placeholder="Enter amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              style={{
                background: inputBg,
                color: textColor,
                border: `1px solid ${borderColor}`,
              }}
            />

            <button
              onClick={handleAddFunds}
              disabled={loading}
              style={{
                background: buttonBg,
                color: textColor,
                border: `1px solid ${borderColor}`,
              }}
            >
              {loading ? "Adding..." : "Add Funds"}
            </button>
          </div>
        </div>

        <style>{`
          .profile-container {
            max-width: 420px;
            margin: 24px auto;
            display: flex;
            flex-direction: column;
            gap: 16px;
            padding: 20px;
            border-radius: 18px;
            background: rgba(255,255,255,0.06);
            backdrop-filter: blur(14px);
          }

          .profile-box {
            display: flex;
            justify-content: space-between;
            font-size: 0.95rem;
          }

          .label { opacity: 0.75; }
          .value { font-weight: 600; }

          .add-fund-box {
            display: flex;
            gap: 10px;
            margin-top: 10px;
          }

          .add-fund-box input {
            flex: 1;
            padding: 8px 10px;
            border-radius: 8px;
            outline: none;
          }

          .add-fund-box button {
            padding: 8px 14px;
            border-radius: 8px;
            cursor: pointer;
          }

          .add-fund-box button:hover { opacity: 0.85; }
        `}</style>
      </div>
    </div>
  );
}
