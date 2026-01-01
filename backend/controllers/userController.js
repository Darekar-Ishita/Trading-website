import User from "../models/user.js";

// GET /api/user/profile
export const getProfile = async (req, res) => {
  try {
    // req.user is set by authMiddleware
    const user = await User.findById(req.user.id).select("-password"); // exclude password

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

   

    res.json(user); // send all fields
  } catch (err) {
    console.error("Error fetching profile:", err.message);
    res.status(500).json({ error: "Server error" });
  }
};
