import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  provider: {
    type: String,
    enum: ["google", "phone", "email"],
    required: true,
    default: "email",
  },
  providerId: { type: String }, // Google profile id or phone number
  name: { type: String },
  email: { type: String },
  password: { type: String },
  phone: { type: String },
  createdAt: { type: Date, default: Date.now },
  // Optional: store hashed refresh token(s) for revocation
  refreshTokens: [
    {
      token: String,
      createdAt: { type: Date, default: Date.now },
      expiresAt: Date,
    },
  ],
});

export const User = mongoose.model("User", UserSchema);
