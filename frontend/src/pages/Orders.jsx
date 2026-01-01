import { useState, useEffect, lazy, Suspense } from "react";
import Sidebar from "../components/Navbar";
import { useAuth } from "../context/AuthContext";
import axios from "axios";

const StockChart = lazy(() => import("../components/StockChart"));

export default function Orders() {
  const { token } = useAuth();
  const BASE_URL = import.meta.env.VITE_BASE_URL;

  const [sidebarWidth, setSidebarWidth] = useState(80);
  const [orders, setOrders] = useState([]);
  const [walletBalance, setWalletBalance] = useState(0);
  const [livePrices, setLivePrices] = useState({});
  const [profitLoss, setProfitLoss] = useState({});
  const [chartSymbol, setChartSymbol] = useState(null);

  // For search and buy
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [selectedStock, setSelectedStock] = useState(null);
  const [quantity, setQuantity] = useState(1);

  const btnBase = { padding: "8px 14px", borderRadius: "8px", border: "none", cursor: "pointer", fontWeight: 500, transition: "all 0.2s ease" };
  const btnPrimary = { ...btnBase, background: "#4CAF50", color: "#fff" };
  const btnDanger = { ...btnBase, background: "#F44336", color: "#fff" };
  const btnInfo = { ...btnBase, background: "#2196F3", color: "#fff" };
  const btnSecondary = { ...btnBase, background: "#9E9E9E", color: "#fff" };

  // Fetch orders and wallet
  const fetchOrders = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/api/trade/orders`, { headers: { Authorization: `Bearer ${token}` } });
      setOrders(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchWallet = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/api/wallet`, { headers: { Authorization: `Bearer ${token}` } });
      setWalletBalance(res.data.balance || 0);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchOrders();
    fetchWallet();
  }, []);

  // Search stocks
  const handleSearch = async () => {
    if (!searchQuery) return;
    try {
      const res = await axios.get(`${BASE_URL}/api/stocks/search?q=${searchQuery}`, { headers: { Authorization: `Bearer ${token}` } });
      setSearchResults(res.data);
    } catch {
      setSearchResults([]);
    }
  };

  // Select stock to buy
  const selectStockToBuy = async (symbol) => {
    try {
      const res = await axios.get(`${BASE_URL}/api/stocks/live/${symbol}`, { headers: { Authorization: `Bearer ${token}` } });
      setSelectedStock({ symbol, price: res.data.price });
      setQuantity(1);
    } catch {
      setSelectedStock({ symbol, price: 0 });
    }
  };

  // Buy stock
  const handleBuy = async () => {
    if (!selectedStock || quantity <= 0) return alert("Enter valid quantity");

    try {
      const res = await axios.post(
        `${BASE_URL}/api/trade/buy`,
        { stockSymbol: selectedStock.symbol, price: selectedStock.price, quantity },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("Buy successful!");
      fetchOrders();
      fetchWallet();
      setSelectedStock(null);
      setQuantity(1);
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.error || "Buy failed");
    }
  };

  // Sell order
  const handleSell = async (order) => {
    const qty = parseInt(prompt(`Enter quantity to sell (max ${order.quantity})`));
    if (!qty || qty <= 0 || qty > order.quantity) return;

    try {
      const res = await axios.post(
        `${BASE_URL}/api/trade/sell`,
        { orderId: order._id, price: livePrices[order.stockSymbol], quantity: qty },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("Sell successful");
      fetchOrders();
      fetchWallet();
    } catch (err) {
      alert(err.response?.data?.error || "Sell failed");
    }
  };

  // Update live prices & P/L
  useEffect(() => {
    const updateLive = async () => {
      const prices = {};
      const pl = {};
      for (let order of orders) {
        try {
          const res = await axios.get(`${BASE_URL}/api/stocks/live/${order.stockSymbol}`, { headers: { Authorization: `Bearer ${token}` } });
          const current = res.data.price || 0;
          prices[order.stockSymbol] = current;
          pl[order._id] = (current * order.quantity - order.price * order.quantity).toFixed(2);
        } catch {
          prices[order.stockSymbol] = 0;
          pl[order._id] = 0;
        }
      }
      setLivePrices(prices);
      setProfitLoss(pl);
    };

    updateLive();
    const interval = setInterval(updateLive, 5000);
    return () => clearInterval(interval);
  }, [orders, token]);

  // Totals
  const totalInvested = orders.reduce((sum, o) => sum + o.price * o.quantity, 0);
  const totalCurrent = orders.reduce((sum, o) => sum + (livePrices[o.stockSymbol] || 0) * o.quantity, 0);
  const totalPL = totalCurrent - totalInvested;

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <Sidebar onToggle={(o) => setSidebarWidth(o ? 250 : 80)} />
      <div style={{ flex: 1, marginLeft: sidebarWidth, padding: 20 }}>
        <h2>Orders</h2>
        <p>Wallet Balance: ₹{walletBalance.toFixed(2)}</p>

        {/* Search */}
        <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search Stock"
            style={{ flex: 1, padding: 10, borderRadius: 8 }}
          />
          <button style={btnPrimary} onClick={handleSearch}>Search</button>
        </div>

        {/* Search Results */}
        {searchResults.map((s) => (
          <div key={s.symbol} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: 10, marginBottom: 8, borderRadius: 8, border: "1px solid #ccc" }}>
            <span>{s.symbol} - {s.name}</span>
            <div style={{ display: "flex", gap: 8 }}>
              <button style={btnPrimary} onClick={() => selectStockToBuy(s.symbol)}>Buy</button>
              <button style={btnInfo} onClick={() => setChartSymbol(s.symbol)}>Graph</button>
            </div>
          </div>
        ))}

        {/* Selected Stock Buy Panel */}
        {selectedStock && (
          <div style={{ marginTop: 16, padding: 12, border: "1px solid #ccc", borderRadius: 8 }}>
            <h3>{selectedStock.symbol}</h3>
            <p>Live Price: ₹{selectedStock.price}</p>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <label>Quantity:</label>
              <input type="number" value={quantity} min={1} onChange={(e) => setQuantity(parseInt(e.target.value))} style={{ width: 60, padding: 4, borderRadius: 4 }} />
              <button style={btnPrimary} onClick={handleBuy}>Buy</button>
              <button style={btnSecondary} onClick={() => setSelectedStock(null)}>Cancel</button>
            </div>
          </div>
        )}

        {/* Totals */}
        <div style={{ display: "flex", gap: 16, marginBottom: 16 }}>
          <div style={{ padding: 12, borderRadius: 8, background: "#f0f0f0", color: "#000" }}>Total Invested: ₹{totalInvested.toFixed(2)}</div>
          <div style={{ padding: 12, borderRadius: 8, background: "#f0f0f0", color: "#000" }}>Current Value: ₹{totalCurrent.toFixed(2)}</div>
          <div style={{ padding: 12, borderRadius: 8, background: totalPL >= 0 ? "#4CAF50" : "#F44336", color: "#fff" }}>Total P/L: ₹{totalPL.toFixed(2)}</div>
        </div>

        {/* Orders Table */}
        {orders.length === 0 ? <p>No orders yet</p> : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid #ccc" }}>
                <th>Symbol</th>
                <th>Qty</th>
                <th>Buy Price</th>
                <th>Current Price</th>
                <th>Total Invested</th>
                <th>Current Value</th>
                <th>P/L</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => {
                const currentPrice = livePrices[order.stockSymbol] || 0;
                const invested = order.price * order.quantity;
                const currentValue = currentPrice * order.quantity;
                const pl = profitLoss[order._id] || 0;
                const currentValueColor = currentValue >= invested ? "green" : "red";
                const plColor = pl >= 0 ? "green" : "red";
                const priceColor = currentPrice >= order.price ? "green" : "red";

                return (
                  <tr key={order._id} style={{ textAlign: "center", borderBottom: "1px solid #eee" }}>
                    <td>{order.stockSymbol}</td>
                    <td>{order.quantity}</td>
                    <td>₹{order.price.toFixed(2)}</td>
                    <td style={{ color: priceColor }}>₹{currentPrice.toFixed(2)}</td>
                    <td>₹{invested.toFixed(2)}</td>
                    <td style={{ color: currentValueColor }}>₹{currentValue.toFixed(2)}</td>
                    <td style={{ color: plColor }}>₹{pl}</td>
                    <td>
                      <button onClick={() => handleSell(order)} style={{ ...btnDanger, marginRight: 4 }}>Sell</button>
                      <button onClick={() => setChartSymbol(order.stockSymbol)} style={btnInfo}>Graph</button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}

        {/* Chart */}
        {chartSymbol && (
          <Suspense fallback={<div>Loading chart...</div>}>
            <StockChart symbol={chartSymbol} onClose={() => setChartSymbol(null)} />
          </Suspense>
        )}
      </div>
    </div>
  );
}
