import express from "express";
import authMiddleware from "../middlewares/authMiddleware.js";
import { getProfile } from "../controllers/userController.js";
import User from "../models/user.js";

const router = express.Router();

router.get("/profile", authMiddleware, async (req, res) => {
  const user = await User.findById(req.user.id).select("-password");
  res.json(user);
});
router.get("/profile", authMiddleware, getProfile);


export default router;
