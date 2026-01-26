import React, { useState, useContext } from "react";
import { toast } from "react-toastify";
import { X } from "lucide-react"; // icon for close
import axios from "axios";
import GeneralContext from "../context/GeneralContext";
import "./ActionWindow.css";

const API = "http://localhost:5000";

const ActionWindow = ({ uid, mode }) => {
  const generalContext = useContext(GeneralContext);
  const [stockQuantity, setStockQuantity] = useState(1);
  const [stockPrice, setStockPrice] = useState(0.0);
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        toast.error("Please login first!");
        return;
      }

      setLoading(true);

      await axios.post(
        `${API}/orders/create`,
        {
          name: uid,
          qty: Number(stockQuantity),
          price: Number(stockPrice),
          mode,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      toast.success(`${mode} order placed successfully!`);
      generalContext.closeWindow();
    } catch (err) {
      console.error("Error placing order:", err);
      toast.error("Failed to place order");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="action-window-overlay">
      <div className="action-window-card">
        <div className="action-header">
          <h2 className={mode === "BUY" ? "buy-title" : "sell-title"}>
            {mode === "BUY" ? "Buy" : "Sell"} {uid}
          </h2>
          <X className="close-icon" onClick={generalContext.closeWindow} />
        </div>

        <div className="action-body">
          <div className="input-group">
            <label>Quantity</label>
            <input
              type="number"
              min="1"
              value={stockQuantity}
              onChange={(e) => setStockQuantity(e.target.value)}
            />
          </div>

          <div className="input-group">
            <label>Price (₹)</label>
            <input
              type="number"
              step="0.05"
              value={stockPrice}
              onChange={(e) => setStockPrice(e.target.value)}
            />
          </div>

          <div className="margin-info">
            Estimated Margin:{" "}
            <strong>₹{(stockQuantity * stockPrice).toFixed(2)}</strong>
          </div>
        </div>

        <div className="action-footer">
          <button
            className={`btn ${mode === "BUY" ? "btn-buy" : "btn-sell"}`}
            onClick={handleClick}
            disabled={loading}
          >
            {loading
              ? mode === "BUY"
                ? "Buying..."
                : "Selling..."
              : mode === "BUY"
              ? "Buy Now"
              : "Sell Now"}
          </button>
          <button
            className="btn btn-cancel"
            onClick={generalContext.closeWindow}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default ActionWindow;
