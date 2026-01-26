import { Order } from "../models/Orders.model.js";
import { Holding } from "../models/Holdings.model.js"; // (optional if you have holdings)

// Get all orders for logged-in user
export const getOrders = async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .lean();

    res.json({ success: true, orders });
  } catch (err) {
    console.error("Error fetching orders:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Add a new order
export const createOrder = async (req, res) => {
  try {
    const { name, qty, price, mode } = req.body;

    const order = new Order({
      name,
      qty,
      price,
      mode,
      userId: req.user._id,
    });

    await order.save();

    res.json({ success: true, order });
  } catch (err) {
    console.error("Error creating order:", err);
    res.status(500).json({ success: false, message: "Failed to place order" });
  }
};

// Automatically move to holdings after X minutes
export const autoTransferToHoldings = async () => {
  const EXPIRY_MINUTES = 2; // e.g. 2 mins
  const cutoff = new Date(Date.now() - EXPIRY_MINUTES * 60 * 1000);

  const expiredOrders = await Order.find({ createdAt: { $lt: cutoff } });

  for (const order of expiredOrders) {
    // Example: Move order to holdings
    await Holding.create({
      name: order.name,
      qty: order.qty,
      price: order.price,
      userId: order.userId,
    });

    await Order.findByIdAndDelete(order._id);
  }

  console.log("Expired orders moved to holdings");
};
