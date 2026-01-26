import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

import { Holding } from "./models/Holdings.model.js";
import { Position } from "./models/Positions.model.js";
import { Order } from "./models/Orders.model.js";
import authRoutes from "./routes/auth.routes.js";
import orderRoutes from "./routes/order.routes.js";

const app = express();

// ✅ Middleware setup
app.use(express.json({ limit: "16kb" }));
app.use(cookieParser());

app.use(
  cors({
    origin: "http://localhost:5173", // Your frontend
    credentials: true, // Important: allows cookies to be sent
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// ✅ Route to insert Holdings
// app.get("/addHoldings", async (req, res) => {
//   try {
//     const temp = [
//       {
//         name: "BHARTIARTL",
//         qty: 2,
//         avg: 538.05,
//         price: 541.15,
//         net: "+0.58%",
//         day: "+2.99%",
//       },
//       {
//         name: "HDFCBANK",
//         qty: 2,
//         avg: 1383.4,
//         price: 1522.35,
//         net: "+10.04%",
//         day: "+0.11%",
//       },
//       {
//         name: "HINDUNILVR",
//         qty: 1,
//         avg: 2335.85,
//         price: 2417.4,
//         net: "+3.49%",
//         day: "+0.21%",
//       },
//       {
//         name: "INFY",
//         qty: 1,
//         avg: 1350.5,
//         price: 1555.45,
//         net: "+15.18%",
//         day: "-1.60%",
//         isLoss: true,
//       },
//       {
//         name: "ITC",
//         qty: 5,
//         avg: 202.0,
//         price: 207.9,
//         net: "+2.92%",
//         day: "+0.80%",
//       },
//       {
//         name: "KPITTECH",
//         qty: 5,
//         avg: 250.3,
//         price: 266.45,
//         net: "+6.45%",
//         day: "+3.54%",
//       },
//       {
//         name: "M&M",
//         qty: 2,
//         avg: 809.9,
//         price: 779.8,
//         net: "-3.72%",
//         day: "-0.01%",
//         isLoss: true,
//       },
//       {
//         name: "RELIANCE",
//         qty: 1,
//         avg: 2193.7,
//         price: 2112.4,
//         net: "-3.71%",
//         day: "+1.44%",
//       },
//       {
//         name: "SBIN",
//         qty: 4,
//         avg: 324.35,
//         price: 430.2,
//         net: "+32.63%",
//         day: "-0.34%",
//         isLoss: true,
//       },
//       {
//         name: "SGBMAY29",
//         qty: 2,
//         avg: 4727.0,
//         price: 4719.0,
//         net: "-0.17%",
//         day: "+0.15%",
//       },
//       {
//         name: "TATAPOWER",
//         qty: 5,
//         avg: 104.2,
//         price: 124.15,
//         net: "+19.15%",
//         day: "-0.24%",
//         isLoss: true,
//       },
//       {
//         name: "TCS",
//         qty: 1,
//         avg: 3041.7,
//         price: 3194.8,
//         net: "+5.03%",
//         day: "-0.25%",
//         isLoss: true,
//       },
//       {
//         name: "WIPRO",
//         qty: 4,
//         avg: 489.3,
//         price: 577.75,
//         net: "+18.08%",
//         day: "+0.32%",
//       },
//     ];

//     // ✅ Save all holdings in parallel
//     await Promise.all(temp.map((item) => new Holding(item).save()));

//     res.send("✅ Holdings data saved to DB");
//   } catch (err) {
//     console.error(err);
//     res.status(500).send("❌ Error saving holdings data");
//   }
// });

// ✅ Route to insert Positions
// app.get("/addPositions", async (req, res) => {
//   try {
//     const temp = [
//       {
//         product: "CNC",
//         name: "EVEREADY",
//         qty: 2,
//         avg: 316.27,
//         price: 312.35,
//         net: "+0.58%",
//         day: "-1.24%",
//         isLoss: true,
//       },
//       {
//         product: "CNC",
//         name: "JUBLFOOD",
//         qty: 1,
//         avg: 3124.75,
//         price: 3082.65,
//         net: "+10.04%",
//         day: "-1.35%",
//         isLoss: true,
//       },
//     ];

//     // ✅ Save all positions in parallel
//     await Promise.all(temp.map((item) => new Position(item).save()));

//     res.send("✅ Positions data saved to DB");
//   } catch (err) {
//     console.error(err);
//     res.status(500).send("❌ Error saving positions data");
//   }
// });

//get all holdings

// routes

app.use("/auth", authRoutes);
app.use("/orders", orderRoutes);

app.get("/allHoldings", async (req, res) => {
  const allHoldings = await Holding.find({});
  res.json(allHoldings);
});

//get all positions
app.get("/allPositions", async (req, res) => {
  const allPositions = await Position.find({});
  res.json(allPositions);
});

// app.post("/newOrder", (req, res) => {
//   const order = new Order({
//     name: req.body.name,
//     qty: req.body.qty,
//     price: req.body.price,
//     mode: req.body.mode,
//   });

//   order.save();

//   res.send("Data saved to DB !!!");
// });

export default app;
