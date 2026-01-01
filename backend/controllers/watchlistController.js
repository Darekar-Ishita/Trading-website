// backend/controllers/watchlistController.js
import {
  getWatchlistByUser,
  addStockToWatchlist,
  removeStockFromWatchlist,
} from "../services/watchlistServices.js";

// Get user watchlist
export const getWatchlist = async (req, res) => {
  try {
    const watchlist = await getWatchlistByUser(req.user._id);
    res.json(watchlist);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch watchlist" });
  }
};

// Add stock to watchlist
export const addToWatchlist = async (req, res) => {
  try {
    const { symbol, name, exchange } = req.body;
    if (!symbol) return res.status(400).json({ error: "Symbol is required" });

    const stock = await addStockToWatchlist(req.user._id, { symbol, name, exchange });
    const watchlist = await getWatchlistByUser(req.user._id);
    res.json(watchlist);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to add stock" });
  }
};

// Remove stock from watchlist
export const removeFromWatchlist = async (req, res) => {
  try {
    const { symbol } = req.params;
    if (!symbol) return res.status(400).json({ error: "Symbol is required" });

    await removeStockFromWatchlist(req.user._id, symbol);
    const watchlist = await getWatchlistByUser(req.user._id);
    res.json(watchlist);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to remove stock" });
  }
};
