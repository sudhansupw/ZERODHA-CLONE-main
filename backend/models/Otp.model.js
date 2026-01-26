import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const OtpSchema = new mongoose.Schema({
  phone: { type: String, required: true, index: true },
  otpHash: { type: String, required: true },
  expiresAt: { type: Date, required: true },
});

// helper: verify an OTP
OtpSchema.methods.verify = async function (otp) {
  return bcrypt.compare(otp, this.otpHash);
};

export const Otp = mongoose.model("Otp", OtpSchema);
