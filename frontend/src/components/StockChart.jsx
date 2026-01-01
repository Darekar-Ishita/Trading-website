import { useEffect, useRef } from "react";

const getTradingViewSymbol = (symbol) => {
  if (!symbol) return "";
  if (symbol === "^NSEI") return "NSE:NIFTY";
  if (symbol === "^BSESN") return "BSE:SENSEX";
  if (symbol.endsWith(".NS")) return `NSE:${symbol.replace(".NS", "")}`;
  if (symbol.endsWith(".BO")) return `BSE:${symbol.replace(".BO", "")}`;
  return symbol.includes(":") ? symbol : `NSE:${symbol}`;
};

export default function StockChart({ symbol, onClose }) {
  const containerRef = useRef(null);
  const tvSymbol = getTradingViewSymbol(symbol);

  useEffect(() => {
    if (!symbol) return;
    containerRef.current.innerHTML = "";

    const script = document.createElement("script");
    script.src = "https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js";
    script.async = true;
    script.innerHTML = JSON.stringify({
      autosize: true,
      symbol: tvSymbol,
      interval: "15",
      timezone: "Asia/Kolkata",
      theme: "light",
      style: "1",
      locale: "en",
      hide_top_toolbar: false,
      hide_legend: false,
      allow_symbol_change: true,
      withdateranges: true,
      save_image: true,
      container_id: "tradingview-widget",
    });

    containerRef.current.appendChild(script);
  }, [symbol]);

  return (
    <div style={{ position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh", background: "#fff", zIndex: 9999, padding: "10px" }}>
      <button onClick={onClose} style={{ position: "absolute", top: "10px", right: "10px", zIndex: 10000, padding: "10px 15px", background: "#f44336", color: "#fff", border: "none", borderRadius: "6px", cursor: "pointer" }}>Close</button>
      <div id="tradingview-widget" ref={containerRef} style={{ width: "100%", height: "100%" }} />
    </div>
  );
}
