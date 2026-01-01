import { useState, useEffect, useRef, lazy, Suspense } from "react";
import Sidebar from "../components/Navbar";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import axios from "axios";
import { useDebounce } from "../hooks/useDebounce";

const StockChart = lazy(() => import("../components/StockChart"));

export default function Dashboard() {
  const { token } = useAuth();
  const { theme } = useTheme();
  const BASE_URL = import.meta.env.VITE_BASE_URL;

  const [sidebarWidth, setSidebarWidth] = useState(80);
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearchQuery = useDebounce(searchQuery, 700);

  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState("");

  const [selectedStock, setSelectedStock] = useState(null);
  const [boughtStocks, setBoughtStocks] = useState({});
  const [chartSymbol, setChartSymbol] = useState(null);

  const [liveMarket, setLiveMarket] = useState({
    NIFTY: { price: 0, change: 0, changePercent: 0 },
    SENSEX: { price: 0, change: 0, changePercent: 0 },
  });

  const isDark = theme === "dark";
  const sparklineCache = useRef({});

  /* ================= BUTTON STYLES ================= */
  const btnBase = { padding: "8px 14px", borderRadius: "8px", border: "none", cursor: "pointer", fontWeight: 500, transition: "all 0.2s ease" };
  const btnPrimary = { ...btnBase, background: "#4CAF50", color: "#fff" };
  const btnDanger = { ...btnBase, background: "#F44336", color: "#fff" };
  const btnInfo = { ...btnBase, background: "#2196F3", color: "#fff" };
  const btnSecondary = { ...btnBase, background: "#9E9E9E", color: "#fff" };

  /* ===================== SEARCH STOCKS ===================== */
  useEffect(() => {
    if (!debouncedSearchQuery.trim()) {
      setSearchResults([]);
      setSearchError("");
      return;
    }

    const controller = new AbortController();
    const fetchStocks = async () => {
      setSearchLoading(true);
      setSearchError("");
      try {
        const res = await axios.get(`${BASE_URL}/api/stocks/search?q=${debouncedSearchQuery}`, {
          headers: { Authorization: `Bearer ${token}` },
          signal: controller.signal,
        });
        setSearchResults(res.data || []);
      } catch {
        setSearchError("Search failed. Try again later.");
      } finally {
        setSearchLoading(false);
      }
    };

    fetchStocks();
    return () => controller.abort();
  }, [debouncedSearchQuery, token]);

  /* ===================== LIVE MARKET (NIFTY/SENSEX) ===================== */
  useEffect(() => {
    let mounted = true;

    const fetchMarket = async () => {
      try {
        const [niftyRes, sensexRes] = await Promise.all([
          axios.get(`${BASE_URL}/api/stocks/live/NIFTY`),
          axios.get(`${BASE_URL}/api/stocks/live/SENSEX`),
        ]);
        if (mounted) {
          setLiveMarket({
            NIFTY: niftyRes.data,
            SENSEX: sensexRes.data,
          });
        }
      } catch {}
    };

    fetchMarket();
    const interval = setInterval(fetchMarket, 5000);
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  /* ===================== SELECTED STOCK LIVE ===================== */
  useEffect(() => {
    if (!selectedStock?.symbol) return;
    let mounted = true;

    const fetchPrice = async () => {
      try {
        const res = await axios.get(`${BASE_URL}/api/stocks/live/${selectedStock.symbol}`);
        if (mounted) setSelectedStock(res.data);
      } catch {}
    };

    fetchPrice();
    const interval = setInterval(fetchPrice, 3000);
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, [selectedStock?.symbol]);

  const handleSelectStock = (symbol) => setSelectedStock({ symbol });

  /* ===================== BUY / SELL ===================== */
  const handleBuy = (symbol) => setBoughtStocks((prev) => ({ ...prev, [symbol]: (prev[symbol] || 0) + 1 }));
  const handleSell = (symbol) => {
    setBoughtStocks((prev) => {
      const copy = { ...prev };
      if (copy[symbol] > 1) copy[symbol]--;
      else delete copy[symbol];
      return copy;
    });
  };
  const handleBack = () => {
    setSelectedStock(null);
    setSearchQuery("");
    setSearchResults([]);
  };

  /* ===================== SPARKLINE ===================== */
  const Sparkline = ({ symbol }) => {
    const canvasRef = useRef(null);
    const [prices, setPrices] = useState([]);

    const fetchPrices = async () => {
      if (sparklineCache.current[symbol]) {
        setPrices(sparklineCache.current[symbol]);
        return;
      }
      try {
        const res = await axios.get(`${BASE_URL}/api/stocks/historical/${symbol}`);
        const closes = res.data.map((d) => d.close);
        sparklineCache.current[symbol] = closes;
        setPrices(closes);
      } catch {
        const dummy = [10, 12, 9, 14, 11];
        sparklineCache.current[symbol] = dummy;
        setPrices(dummy);
      }
    };

    useEffect(() => {
      if (!canvasRef.current || prices.length === 0) return;
      const ctx = canvasRef.current.getContext("2d");
      ctx.clearRect(0, 0, 100, 30);

      const min = Math.min(...prices);
      const max = Math.max(...prices);
      const trendUp = prices[prices.length - 1] >= prices[0];

      ctx.beginPath();
      ctx.strokeStyle = trendUp ? "#4CAF50" : "#F44336"; // green/red based on trend
      ctx.lineWidth = 2;

      prices.forEach((p, i) => {
        const x = (i / (prices.length - 1)) * 100;
        const y = 30 - ((p - min) / (max - min || 1)) * 30;
        i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      });

      ctx.stroke();
    }, [prices]);

    return <canvas ref={canvasRef} width={100} height={30} onMouseEnter={fetchPrices} />;
  };

  /* ===================== RENDER ===================== */
  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <Sidebar onToggle={(o) => setSidebarWidth(o ? 250 : 80)} />

      <div style={{ flex: 1, marginLeft: sidebarWidth, padding: 20 }}>
        {/* LIVE MARKET CARDS */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: "14px",
            marginBottom: "16px",
          }}
        >
          {["NIFTY", "SENSEX"].map((index) => {
            const data = liveMarket[index];
            const up = data.change >= 0;
            return (
              <div
                key={index}
                style={{
                  padding: "14px",
                  borderRadius: "12px",
                  background: isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.04)",
                  boxShadow: "0 8px 20px rgba(0,0,0,0.15)",
                  transition: "background 0.3s",
                }}
              >
                <div style={{ fontSize: "14px", opacity: 0.8 }}>{index}</div>
                <div style={{ fontSize: "22px", fontWeight: "bold", color: up ? "#4CAF50" : "#F44336" }}>
                  {data.price?.toLocaleString() || "..."}
                </div>
                <div style={{ marginTop: "4px", color: up ? "#4CAF50" : "#F44336", fontWeight: 600, fontSize: "13px" }}>
                  {up ? "▲" : "▼"} {data.change?.toFixed(2) || "..."} ({data.changePercent?.toFixed(2) || "..."}%)
                </div>
              </div>
            );
          })}
        </div>

        {/* SEARCH & SELECT STOCK */}
        <div style={{ padding: 16, borderRadius: 12, background: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.05)" }}>
          {!selectedStock ? (
            <>
              <h3>Search Stocks</h3>
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Enter stock symbol"
                style={{ width: "100%", padding: 10, borderRadius: 8 }}
              />
              {searchLoading && <p>Searching...</p>}
              {searchError && <p style={{ color: "red" }}>{searchError}</p>}
              {searchResults.map((stock, i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: 8, alignItems: "center" }}>
                  <strong>{stock.symbol}</strong>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button style={btnPrimary} onClick={() => handleSelectStock(stock.symbol)}>Select</button>
                    <Sparkline symbol={stock.symbol} />
                  </div>
                </div>
              ))}
            </>
          ) : (
            <>
              <h3>{selectedStock.symbol}</h3>
              <p>Price: ₹{selectedStock.price?.toFixed(2) || "..."}</p>
              <div style={{ display: "flex", gap: 10 }}>
                <button style={btnPrimary} onClick={() => handleBuy(selectedStock.symbol)}>Buy</button>
                {boughtStocks[selectedStock.symbol] && <button style={btnDanger} onClick={() => handleSell(selectedStock.symbol)}>Sell</button>}
                <button style={btnSecondary} onClick={handleBack}>Back</button>
                <button style={btnInfo} onClick={() => setChartSymbol(selectedStock.symbol)}>View Chart</button>
              </div>
            </>
          )}
        </div>

        {/* STOCK CHART */}
        {chartSymbol && (
          <Suspense fallback={<div>Loading chart...</div>}>
            <StockChart symbol={chartSymbol} onClose={() => setChartSymbol(null)} />
          </Suspense>
        )}
      </div>
    </div>
  );
}

