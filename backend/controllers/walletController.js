import Wallet from "../models/wallet.js";

// ADD FUNDS
export const addFunds = async (req, res) => {
  try {
    const { amount } = req.body;

    if (!amount || Number(amount) <= 0) {
      return res.status(400).json({ error: "Invalid amount" });
    }

    let wallet = await Wallet.findOne({ user: req.user._id });

    if (!wallet) {
      wallet = await Wallet.create({
        user: req.user._id,
        balance: 0,
      });
    }

    wallet.balance += Number(amount);
    await wallet.save();

    res.json({ balance: wallet.balance });
  } catch (err) {
    console.error("Add funds error:", err.message);
    res.status(500).json({ error: "Server error" });
  }
};

// GET WALLET
export const getWallet = async (req, res) => {
  try {
    let wallet = await Wallet.findOne({ user: req.user._id });

    if (!wallet) {
      wallet = await Wallet.create({
        user: req.user._id,
        balance: 0,
      });
    }

    res.json({ balance: wallet.balance });
  } catch (err) {
    console.error("Get wallet error:", err.message);
    res.status(500).json({ error: "Server error" });
  }
};
