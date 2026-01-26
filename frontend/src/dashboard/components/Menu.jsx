import React, { useEffect, useRef, useState } from "react";
import { FaUser, FaSignOutAlt } from "react-icons/fa";
import { Link, useLocation } from "react-router-dom";
import { useUser } from "../context/userContext"; // ✅ Correct path

const Menu = () => {
  const location = useLocation();
  const menuItems = [
    { path: "/dashboard", label: "Dashboard" },
    { path: "/dashboard/orders", label: "Orders" },
    { path: "/dashboard/holdings", label: "Holdings" },
    { path: "/dashboard/positions", label: "Positions" },
    { path: "/dashboard/funds", label: "Funds" },
    { path: "/dashboard/apps", label: "Apps" },
  ];

  return (
    <div className="menu-container">
      <img src="/images/logo.png" alt="Logo" style={{ width: "50px" }} />

      <div className="menus">
        <ul>
          {menuItems.map((item, index) => (
            <li key={index}>
              <Link
                to={item.path}
                style={{ textDecoration: "none" }}
                className={
                  location.pathname === item.path ? "menu selected" : "menu"
                }
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>

        <hr />

        <div className="d-flex justify-content-end p-3 bg-light">
          <ProfileMenu />
        </div>
      </div>
    </div>
  );
};

export default Menu;

// ===================== PROFILE MENU ===================== //
const ProfileMenu = () => {
  const [open, setOpen] = useState(false);
  const { user, logout } = useUser();
  const menuRef = useRef();

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={menuRef} className="profile-menu-container">
      <div
        className="profile-trigger"
        onClick={() => setOpen((prev) => !prev)}
        role="button"
      >
        <div className="avatar">
          {user?.name
            ? user.name
                .split(" ")
                .map((n) => n[0])
                .join("")
                .toUpperCase()
            : "?"}
        </div>
        <span className="username">{user?.name || "Guest"}</span>
      </div>

      {open && (
        <div className="dropdown-menu-custom shadow-sm">
          <button className="dropdown-item-custom">
            <FaUser className="me-2" /> Profile
          </button>
          <button className="dropdown-item-custom logout" onClick={logout}>
            <FaSignOutAlt className="me-2" /> Logout
          </button>
        </div>
      )}
    </div>
  );
};
