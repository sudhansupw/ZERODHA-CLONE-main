import React from "react";
import "./Loader.css";

export default function Loader({ text = "Loading Dashboard..." }) {
  return (
    <div className="loader-wrapper">
      <div className="spinner"></div>
      <p>{text}</p>
    </div>
  );
}
