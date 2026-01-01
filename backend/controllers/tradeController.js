import Order from "../models/order.js";
import Wallet from "../models/wallet.js";

// ==================== BUY STOCK ====================
export const buyStock = async (req, res) => {
  try {
    const { stockSymbol, price, quantity } = req.body;

    if (!stockSymbol || !price || !quantity || quantity <= 0) {
      return res.status(400).json({ error: "Invalid data" });
    }

    // Get or create wallet
    let wallet = await Wallet.findOne({ user: req.user._id });
    if (!wallet) wallet = await Wallet.create({ user: req.user._id, balance: 0 });

    const totalCost = price * quantity;

    if (wallet.balance < totalCost) {
      return res.status(400).json({ error: "Insufficient funds" });
    }

    wallet.balance -= totalCost;
    await wallet.save();

    // Create order
    const order = await Order.create({
      user: req.user._id,
      stockSymbol,
      price,
      quantity,
      type: "BUY",
    });

    res.json({ order, walletBalance: wallet.balance });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

// ==================== SELL STOCK ====================
export const sellStock = async (req, res) => {
  try {
    const { orderId, price, quantity } = req.body;

    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ error: "Order not found" });

    if (quantity > order.quantity) {
      return res.status(400).json({ error: "Quantity exceeds owned" });
    }

    // Update order quantity
    order.quantity -= quantity;

    if (order.quantity <= 0) {
      // Delete the order if quantity is zero
      await order.deleteOne();
    } else {
      await order.save();
    }

    // Update wallet
    let wallet = await Wallet.findOne({ user: req.user._id });
    if (!wallet) wallet = await Wallet.create({ user: req.user._id, balance: 0 });

    wallet.balance += price * quantity;
    await wallet.save();

    res.json({ order, walletBalance: wallet.balance });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

// ==================== GET ORDERS ====================
export const getOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};
