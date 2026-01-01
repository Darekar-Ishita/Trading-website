import express from "express";
import { buyStock, sellStock, getOrders } from "../controllers/tradeController.js";
import authMiddleware from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get("/orders", authMiddleware, getOrders);
router.post("/buy", authMiddleware, buyStock);
router.post("/sell", authMiddleware, sellStock);

export default router;
