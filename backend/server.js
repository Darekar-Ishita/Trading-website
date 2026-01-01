import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import bcrypt from "bcryptjs";

import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import User from "./models/user.js";
import newsRoutes from "./routes/newsRoutes.js";
import walletRoutes from "./routes/walletRoutes.js";
import watchlistRoutes from "./routes/watchlistRoutes.js";
import stockRoutes from "./routes/stockRoutes.js";
import tradeRoutes from "./routes/tradeRoutes.js";


dotenv.config();


// connect to database
connectDB();

const app = express();

// middlewares
app.use(cors());
app.use(express.json());

// routes
app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/news", newsRoutes);
app.use("/api/wallet", walletRoutes);
app.use("/api/stocks", stockRoutes);
app.use("/api/watchlist", watchlistRoutes);
app.use("/api/trade",tradeRoutes);

// test route
app.get("/", (req, res) => {
  res.send("Server is running");
});

// test user route (optional)
app.get("/create-test-user", async (req, res) => {
  const hashedPassword = await bcrypt.hash("123456", 10);

  const user = await User.create({
    name: "Test User",
    email: "test@example.com",
    password: hashedPassword,
  });

  res.json(user);
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log("Server started on port", PORT);
});





