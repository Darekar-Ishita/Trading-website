import express from "express";
import axios from "axios";
import authMiddleware from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get("/", authMiddleware, async (req, res) => {
  try {
    const apiKey = process.env.GNEWS_API_KEY;

    const response = await axios.get(
      "https://gnews.io/api/v4/search",
      {
        params: {
          q: "stock market OR trading OR finance",
          lang: "en",
          max: 10,
          token: apiKey,   // IMPORTANT: token, not apiKey
        },
      }
    );

    res.json(response.data.articles || []);
  } catch (err) {
    console.error("GNEWS FULL ERROR:", err.message);

    res.status(500).json({
      error: "News service unreachable",
    });
  }
});

export default router;
