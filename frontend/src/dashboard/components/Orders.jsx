import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import "./Orders.css";

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        toast.error("No token found, please log in again");
        return;
      }

      const res = await axios.get(`${API}/orders/get`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.data.success) setOrders(res.data.orders);
    } catch (err) {
      console.error(
        "Error fetching orders:",
        err.response?.data || err.message
      );
      toast.error("Failed to fetch orders");
    }
  };

  useEffect(() => {
    fetchOrders();
    // optional auto-refresh every 10 seconds
    const interval = setInterval(fetchOrders, 10000);
    return () => clearInterval(interval);
  }, []);

  if (orders.length === 0) {
    return (
      <div className="orders">
        <div className="no-orders">
          <p>You haven't placed any orders today</p>
          <button
            className="btn btn-blue"
            onClick={() => toast.info("Place an order in the watchlist")}
          >
            Get started
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="orders">
      <h2>Today's Orders</h2>
      <table className="orders-table">
        <thead>
          <tr>
            <th>Stock</th>
            <th>Quantity</th>
            <th>Price (₹)</th>
            <th>Mode</th>
            <th>Placed</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <tr key={order._id}>
              <td>{order.name}</td>
              <td>{order.qty}</td>
              <td>{order.price.toFixed(2)}</td>
              <td
                className={
                  order.mode === "BUY"
                    ? "mode-buy"
                    : order.mode === "SELL"
                    ? "mode-sell"
                    : ""
                }
              >
                {order.mode}
              </td>
              <td>{new Date(order.createdAt).toLocaleTimeString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Orders;
