import express from "express";
import {
  getWatchlist,
  addToWatchlist,
  removeFromWatchlist,
} from "../controllers/watchlistController.js";
import authMiddleware from "../middlewares/authMiddleware.js";

const router = express.Router();
router.use(authMiddleware);

router.get("/", getWatchlist);
router.post("/", addToWatchlist);
router.delete("/:symbol", removeFromWatchlist);

export default router;
