import React, { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const UserContext = createContext();
export const useUser = () => useContext(UserContext);

const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const API = import.meta.env.VITE_API_URL || "http://localhost:5000";
  const navigate = useNavigate();

  // ✅ Load user on mount using stored JWT
  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      setLoading(false);
      return;
    }

    const fetchUser = async () => {
      try {
        const res = await axios.get(`${API}/auth/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (res.data?.user) {
          setUser(res.data.user);
          localStorage.setItem("user", JSON.stringify(res.data.user));
        }
      } catch (err) {
        console.error("Auth error:", err.response?.data || err.message);
        localStorage.removeItem("accessToken");
        localStorage.removeItem("user");
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  // ✅ Manual logout (just clears localStorage)
  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("user");
    setUser(null);
    navigate("/signup");
  };

  return (
    <UserContext.Provider
      value={{
        user,
        setUser,
        loading,
        logout: handleLogout,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export default UserProvider;
