import axios from "axios";
import NodeCache from "node-cache";

/* ================= CACHE ================= */
const searchCache = new NodeCache({ stdTTL: 300 }); // 5 min
const liveCache = new NodeCache({ stdTTL: 30 }); // 30 sec
const historicalCache = new NodeCache({ stdTTL: 300 }); // 5 min

/* ================= YAHOO ENDPOINTS ================= */
const YAHOO_BASE = "https://query2.finance.yahoo.com/v8/finance/chart";
const yahooHeaders = { headers: { "User-Agent": "Mozilla/5.0" } };

/* ================= INDEX MAPPING ================= */
const indexMap = {
  NIFTY: "^NSEI",
  SENSEX: "^BSESN",
};

/* ================= GET LIVE STOCK ================= */
export const getLiveStock = async (symbol) => {
  if (!symbol) return null;

  const yahooSymbol = indexMap[symbol] || symbol;
  const cached = liveCache.get(symbol);
  if (cached) return cached;

  try {
    const res = await axios.get(`${YAHOO_BASE}/${yahooSymbol}`, {
      params: { range: "1d", interval: "1m" }, // last day's data with 1-minute interval
      ...yahooHeaders,
      timeout: 6000,
    });

    const result = res.data.chart.result?.[0];
    const quoteData = result?.indicators?.quote?.[0];
    const timestamps = result?.timestamp || [];
    const closes = quoteData?.close || [];
    const opens = quoteData?.open || [];

    if (!closes.length) throw new Error("Price unavailable");

    const lastPrice = closes[closes.length - 1];
    const todayOpen = opens.find((o) => o !== null) ?? closes[0];
    const change = lastPrice - todayOpen;
    const changePercent = (change / todayOpen) * 100;

    const data = { symbol, price: lastPrice, change, changePercent };
    liveCache.set(symbol, data);
    return data;
  } catch (err) {
    console.error(`Yahoo LIVE error for ${symbol}:`, err.message);
    return cached || { symbol, price: 0, change: 0, changePercent: 0 };
  }
};

/* ================= SEARCH STOCKS ================= */
export const searchStocks = async (query) => {
  if (!query) return [];

  const cached = searchCache.get(query);
  if (cached) return cached;

  try {
    const res = await axios.get(
      `https://query1.finance.yahoo.com/v1/finance/search?q=${query}`,
      { ...yahooHeaders, timeout: 6000 }
    );

    const results = res.data?.quotes?.map((q) => ({
      symbol: q.symbol,
      name: q.shortname || q.longname || "",
    }));

    searchCache.set(query, results);
    return results || [];
  } catch (err) {
    console.error("Yahoo SEARCH error:", err.message);
    return [];
  }
};

/* ================= HISTORICAL DATA ================= */
export const getHistorical = async (symbol) => {
  if (!symbol) return [];

  const cached = historicalCache.get(symbol);
  if (cached) return cached;

  try {
    const res = await axios.get(`${YAHOO_BASE}/${symbol}`, {
      params: { range: "1mo", interval: "1d" },
      ...yahooHeaders,
      timeout: 6000,
    });

    const result = res.data.chart.result?.[0];
    const timestamps = result?.timestamp || [];
    const closes = result?.indicators?.quote?.[0]?.close || [];

    const data = timestamps.map((t, i) => ({
      date: new Date(t * 1000),
      close: closes[i],
    }));

    historicalCache.set(symbol, data);
    return data;
  } catch (err) {
    console.error("Yahoo HISTORICAL error:", err.message);
    return [];
  }
};
