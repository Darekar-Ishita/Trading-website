import express from "express";
import {
  getLiveStock,
  searchStocks,
  getHistorical,
} from "../services/yahooStockService.js";

const router = express.Router();

/* ================= SEARCH STOCKS ================= */
router.get("/search", async (req, res) => {
  const { q } = req.query;
  if (!q) return res.status(400).json({ error: "Query is required" });

  try {
    const results = await searchStocks(q);
    res.json(results);
  } catch (err) {
    console.error("Stock search failed:", err.message);
    res.status(500).json({ error: "Stock search failed" });
  }
});

/* ================= LIVE STOCK ================= */
router.get("/live/:symbol", async (req, res) => {
  const { symbol } = req.params;
  if (!symbol) return res.status(400).json({ error: "Symbol is required" });

  try {
    const data = await getLiveStock(symbol);
    if (!data) return res.status(404).json({ message: "No data found" });
    res.json(data);
  } catch (err) {
    console.error("Live stock fetch failed:", err.message);
    res.status(500).json({ error: "Failed to fetch live stock" });
  }
});

/* ================= HISTORICAL STOCK ================= */
router.get("/historical/:symbol", async (req, res) => {
  const { symbol } = req.params;
  if (!symbol) return res.status(400).json({ error: "Symbol is required" });

  try {
    const data = await getHistorical(symbol);
    res.json(data);
  } catch (err) {
    console.error("Historical fetch failed:", err.message);
    res.status(500).json({ error: "Failed to fetch historical data" });
  }
});

export default router;
