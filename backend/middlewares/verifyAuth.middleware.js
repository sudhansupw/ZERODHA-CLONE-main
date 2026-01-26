import jwt from "jsonwebtoken";
import { User } from "../models/User.model.js";

export const verifyToken = async (req, res, next) => {
  try {
    // ✅ 1. Extract from headers
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "No token provided" });
    }

    const token = authHeader.split(" ")[1];

    // ✅ 2. Verify token
    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);

    // ✅ 3. Find user
    const user = await User.findById(decoded.id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // ✅ 4. Attach and continue
    req.user = user;
    next();
  } catch (err) {
    console.error("Auth middleware error:", err.message);
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};
