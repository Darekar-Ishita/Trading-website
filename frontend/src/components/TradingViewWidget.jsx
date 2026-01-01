import { useEffect, useRef } from "react";

const TradingViewWidget = ({ type }) => {
  const ref = useRef(null);

  useEffect(() => {
    if (!ref.current) return;
    ref.current.innerHTML = "";

    const initWidget = () => {
      if (!ref.current) return;

      const script = document.createElement("script");
      script.src =
        "https://s3.tradingview.com/external-embedding/embed-widget-screener.js";
      script.async = true;
      script.innerHTML = JSON.stringify({
        width: "100%",
        height: 420,
        defaultColumn: "performance",
        defaultScreen: type === "gainers" ? "most_gainers" : "most_losers",
        market: "india",
        showToolbar: true,
        colorTheme: "dark",
        locale: "en",
      });

      ref.current.appendChild(script);
    };

    // 🔑 CRITICAL FIX
    requestAnimationFrame(initWidget);

    return () => {
      if (ref.current) ref.current.innerHTML = "";
    };
  }, [type]);

  return <div ref={ref} style={{ width: "100%" }} />;
};

export default TradingViewWidget;
