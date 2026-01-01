import express from "express";
import { addFunds, getWallet } from "../controllers/walletController.js";
import authMiddleware from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get("/", authMiddleware, getWallet);
router.post("/add-funds", authMiddleware, addFunds);

export default router;
