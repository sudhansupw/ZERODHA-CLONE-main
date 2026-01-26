import mongoose, { Schema } from "mongoose";

const HoldingsSchema = new Schema({
  name: String,
  qty: Number,
  avg: Number,
  price: Number,
  net: String,
  day: String,
  isLoss: Boolean,
});

export const Holding = mongoose.model("Holding", HoldingsSchema);
