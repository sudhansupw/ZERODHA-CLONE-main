import jwt from "jsonwebtoken";

export const createAccessToken = (user) =>
  jwt.sign(
    { sub: user._id, name: user.name, email: user.email },
    process.env.JWT_ACCESS_SECRET,
    { expiresIn: process.env.JWT_ACCESS_EXPIRES_IN || "15m" }
  );

export const createRefreshToken = (user) =>
  jwt.sign({ sub: user._id }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || "7d",
  });
