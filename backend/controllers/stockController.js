import {
  searchStocksService,
  getStockHistorical,
  getStockLivePrice,
} from "../services/yahooStockService.js";

// SEARCH STOCKS
export const searchStocks = async (req, res) => {
  const query = req.query.q;
  if (!query) return res.status(400).json({ error: "Query is required" });

  try {
    const results = await searchStocksService(query);
    res.json(results);
  } catch (err) {
    console.error("Stock search failed:", err.message);
    res.status(500).json({ error: "Stock search failed" });
  }
};

// HISTORICAL PRICES
export const getHistoricalPrices = async (req, res) => {
  const { symbol } = req.params;
  if (!symbol) return res.status(400).json({ error: "Symbol is required" });

  try {
    const data = await getStockHistorical(symbol);
    res.json(data);
  } catch (err) {
    console.error("Historical fetch failed:", err.message);
    res.status(500).json({ error: "Failed to fetch historical data" });
  }
};

// LIVE PRICE
export const getLivePriceController = async (req, res) => {
  const { symbol } = req.params;
  if (!symbol) return res.status(400).json({ error: "Symbol is required" });

  try {
    const price = await getStockLivePrice(symbol);
    res.json(price);
  } catch (err) {
    console.error("Live price fetch failed:", err.message);
    res.status(500).json({ error: "Failed to fetch live price" });
  }
};
