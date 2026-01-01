// backend/services/watchlistServices.js
import Watchlist from "../models/watchlist.js";

// Get all watchlist items for a user
export const getWatchlistByUser = async (userId) => {
  return await Watchlist.find({ user: userId }).sort({ addedAt: -1 });
};

// Add a stock to watchlist
export const addStockToWatchlist = async (userId, stock) => {
  // Check if already exists
  const exists = await Watchlist.findOne({ user: userId, symbol: stock.symbol });
  if (exists) return exists;

  const newStock = new Watchlist({
    user: userId,
    symbol: stock.symbol,
    name: stock.name,
    exchange: stock.exchange,
  });

  return await newStock.save();
};

// Remove stock from watchlist
export const removeStockFromWatchlist = async (userId, symbol) => {
  return await Watchlist.findOneAndDelete({ user: userId, symbol });
};
