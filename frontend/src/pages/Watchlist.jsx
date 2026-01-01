import { useEffect, useState, useRef } from "react";
import Sidebar from "../components/Navbar";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import axios from "axios";
import StockChart from "../components/StockChart";

export default function Watchlist() {
  const { token } = useAuth();
  const { theme } = useTheme();
  const BASE_URL = import.meta.env.VITE_BASE_URL;

  const [sidebarWidth, setSidebarWidth] = useState(80);
  const [watchlist, setWatchlist] = useState([]);
  const [livePrices, setLivePrices] = useState({}); // store live prices
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState("");
  const [chartSymbol, setChartSymbol] = useState(null); // open chart modal

  // Theme colors
  const isDark = theme === "dark";
  const dashboardBg = isDark
    ? "linear-gradient(135deg, #0f2027, #203a43, #2c5364)"
    : "linear-gradient(135deg, #e0eafc, #cfdef3, #f5f7fa)";
  const textColor = isDark ? "#fff" : "#000";
  const cardBg = isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.05)";

  // Fetch watchlist
  const fetchWatchlist = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/api/watchlist`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setWatchlist(res.data);
    } catch (err) {
      console.error("Fetch watchlist error:", err);
    }
  };

  useEffect(() => {
    fetchWatchlist();
  }, [token]);

  // Fetch live prices for watchlist stocks
  const fetchLivePrices = async () => {
    if (!watchlist.length) return;
    try {
      const promises = watchlist.map((stock) =>
        axios.get(`${BASE_URL}/api/stocks/live/${stock.symbol}`)
      );
      const responses = await Promise.all(promises);
      const prices = {};
      responses.forEach((res, idx) => {
        prices[watchlist[idx].symbol] = res.data;
      });
      setLivePrices(prices);
    } catch (err) {
      console.error("Failed to fetch live prices:", err);
    }
  };

  // Fetch live prices every 5 seconds
  useEffect(() => {
    fetchLivePrices();
    const interval = setInterval(fetchLivePrices, 5000);
    return () => clearInterval(interval);
  }, [watchlist]);

  // Stock search
  const handleStockSearch = async () => {
    if (!searchQuery.trim()) return;
    setSearchLoading(true);
    setSearchError("");
    try {
      const res = await axios.get(`${BASE_URL}/api/stocks/search?q=${searchQuery}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSearchResults(res.data || []);
    } catch (err) {
      console.error("Search failed:", err);
      setSearchError("Search failed");
    } finally {
      setSearchLoading(false);
    }
  };

  // Add / Remove from watchlist
  const addToWatchlist = async (stock) => {
    try {
      await axios.post(
        `${BASE_URL}/api/watchlist`,
        { symbol: stock.symbol, name: stock.name, exchange: stock.exchange },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchWatchlist();
    } catch (err) {
      console.error("Add to watchlist failed:", err);
    }
  };
  const removeFromWatchlist = async (symbol) => {
    try {
      await axios.delete(`${BASE_URL}/api/watchlist/${symbol}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchWatchlist();
    } catch (err) {
      console.error("Remove from watchlist failed:", err);
    }
  };

  // Lazy-load Sparkline chart with trend color
  const Sparkline = ({ symbol, trendUp }) => {
    const canvasRef = useRef(null);
    const [prices, setPrices] = useState([]);
    const [loaded, setLoaded] = useState(false);

    const fetchPrices = async () => {
      if (loaded) return;
      try {
        const res = await axios.get(`${BASE_URL}/api/stocks/historical/${symbol}`);
        setPrices(res.data.map((d) => d.close));
        setLoaded(true);
      } catch (err) {
        console.error(`Failed to fetch sparkline for ${symbol}:`, err);
        setPrices([10, 12, 9, 14, 11]);
        setLoaded(true);
      }
    };

    useEffect(() => {
      if (!canvasRef.current || prices.length === 0) return;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      const width = canvas.width;
      const height = canvas.height;

      ctx.clearRect(0, 0, width, height);
      const min = Math.min(...prices);
      const max = Math.max(...prices);
      const scale = (val) => height - ((val - min) / (max - min || 1)) * height;

      ctx.beginPath();
      ctx.strokeStyle = trendUp ? "#4CAF50" : "#f44336"; // green/red based on trend
      ctx.lineWidth = 2;
      prices.forEach((point, idx) => {
        const x = (idx / (prices.length - 1)) * width;
        const y = scale(point);
        idx === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      });
      ctx.stroke();
    }, [prices, trendUp]);

    return <canvas ref={canvasRef} width={100} height={30} onMouseEnter={fetchPrices} />;
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: dashboardBg, color: textColor }}>
      <Sidebar onToggle={(isOpen) => setSidebarWidth(isOpen ? 250 : 80)} />
      <div style={{ flex: 1, marginLeft: `${sidebarWidth}px`, padding: "20px", transition: "margin-left 0.3s ease" }}>
        <h2>Watchlist</h2>

        {/* Search */}
        <div style={{ marginBottom: "20px", padding: "16px", borderRadius: "12px", background: cardBg, backdropFilter: "blur(8px)" }}>
          <h3>Search Stocks</h3>
          <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
            <input
              type="text"
              placeholder="Enter stock name or symbol"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ flex: 1, padding: "10px", borderRadius: "8px", border: "1px solid #999" }}
            />
            <button onClick={handleStockSearch} style={{ padding: "10px 16px", borderRadius: "8px", cursor: "pointer" }}>Search</button>
          </div>
          {searchLoading && <p>Searching...</p>}
          {searchError && <p style={{ color: "red" }}>{searchError}</p>}
          {searchResults.length > 0 &&
            searchResults.map((stock, idx) => (
              <div key={idx} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px", borderBottom: "1px solid rgba(0,0,0,0.2)" }}>
                <span><strong>{stock.symbol}</strong> {stock.name ? `- ${stock.name}` : ""}</span>
                <button onClick={() => addToWatchlist(stock)} style={{ padding: "4px 8px", background: "#4CAF50", color: "#fff", border: "none", borderRadius: "6px", cursor: "pointer" }}>+ Add</button>
              </div>
            ))}
        </div>

        {/* Watchlist */}
        <div className="profile-container">
          {watchlist.length === 0 ? (
            <div className="profile-box">No stocks in your watchlist.</div>
          ) : (
            watchlist.map((stock) => {
              const live = livePrices[stock.symbol] || {};
              const up = live.change >= 0;
              const priceColor = up ? "#4CAF50" : "#f44336"; // green/red text
              return (
                <div key={stock._id} className="profile-box" style={{ padding: "12px", marginBottom: "10px", borderRadius: "10px", background: cardBg, cursor: "pointer" }} onClick={() => setChartSymbol(stock.symbol)}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <strong>{stock.symbol}</strong> {stock.name ? `- ${stock.name}` : ""} ({stock.exchange})<br />
                      <span style={{ color: priceColor, fontWeight: "bold" }}>
                        ₹{live.price?.toFixed(2) || "..."} ({up ? "▲" : "▼"} {live.change?.toFixed(2) || "..."})
                      </span>
                    </div>
                    <button
                      onClick={(e) => { e.stopPropagation(); removeFromWatchlist(stock.symbol); }}
                      style={{ background: "#f44336", color: "#fff", border: "none", borderRadius: "6px", padding: "4px 8px", cursor: "pointer" }}
                    >
                      Remove
                    </button>
                  </div>
                  <div style={{ marginTop: "8px" }}>
                    <Sparkline symbol={stock.symbol} trendUp={up} />
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Chart modal */}
        {chartSymbol && (
          <div style={{ position: "fixed", top: "10%", left: "50%", transform: "translateX(-50%)", width: "80%", height: "60%", background: "#fff", borderRadius: "12px", boxShadow: "0 4px 20px rgba(0,0,0,0.2)", zIndex: 9999, padding: "10px" }}>
            <button onClick={() => setChartSymbol(null)} style={{ position: "absolute", top: "10px", right: "10px", zIndex: 10000, padding: "10px 15px", background: "#f44336", color: "#fff", border: "none", borderRadius: "6px", cursor: "pointer" }}>Close</button>
            <StockChart symbol={chartSymbol} onClose={() => setChartSymbol(null)} />
          </div>
        )}
      </div>
    </div>
  );
}
