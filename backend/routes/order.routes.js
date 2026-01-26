import express from "express";
import { verifyToken } from "../middlewares/verifyAuth.middleware.js";
import { getOrders, createOrder } from "../controllers/order.controllers.js";

const router = express.Router();

router.get("/get", verifyToken, getOrders);
router.post("/create", verifyToken, createOrder);

export default router;
