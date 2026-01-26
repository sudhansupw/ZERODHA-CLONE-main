import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { useUser } from "../../dashboard/context/userContext";

const API = "http://localhost:5000";

export default function Signup() {
  const [authMode, setAuthMode] = useState("signup"); // signup | login
  const [mode, setMode] = useState("email"); // email | phone
  const [step, setStep] = useState("enter"); // enter | verify
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const navigate = useNavigate();
  const { setUser } = useUser();

  const handleGoogleAuth = () => {
    window.location.href = `${API}/auth/google`;
  };

  // ----------------- EMAIL AUTH -----------------
  const handleEmailAuth = async (e) => {
    e.preventDefault();
    if (mode !== "email") return;

    if (authMode === "signup" && (!name || !email || !password)) {
      return setMessage("Please fill all fields");
    }
    if (authMode === "login" && (!email || !password)) {
      return setMessage("Please enter email and password");
    }

    setLoading(true);
    setMessage("");

    try {
      const endpoint =
        authMode === "signup"
          ? `${API}/auth/email/signup`
          : `${API}/auth/email/login`;

      const payload =
        authMode === "signup" ? { name, email, password } : { email, password };

      const res = await axios.post(endpoint, payload);

      // ✅ Save token & user info
      if (res.data.token) {
        localStorage.setItem("accessToken", res.data.token);
      }
      if (res.data.user) {
        localStorage.setItem("user", JSON.stringify(res.data.user));
        setUser(res.data.user);
      }

      toast.success("Redirecting to Dashboard");
      setTimeout(() => navigate("/dashboard"), 500);
    } catch (err) {
      console.error("Login error:", err.response?.data || err.message);
      toast.error(err.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  // ----------------- PHONE AUTH -----------------
  const handleRequestOtp = async (e) => {
    e.preventDefault();
    if (!phone) return setMessage("Enter your phone number");
    setLoading(true);
    setMessage("");

    try {
      const res = await axios.post(`${API}/auth/phone/request-otp`, { phone });
      if (res.data.ok) {
        setStep("verify");
        setMessage("OTP sent!");
      }
    } catch (err) {
      setMessage(err.response?.data?.error || "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!otp) return setMessage("Enter the OTP sent to your phone");
    setLoading(true);
    setMessage("");

    try {
      const res = await axios.post(`${API}/auth/phone/verify-otp`, {
        phone,
        otp,
      });

      if (res.data.ok && res.data.token) {
        localStorage.setItem("accessToken", res.data.token);
        if (res.data.user) {
          localStorage.setItem("user", JSON.stringify(res.data.user));
          setUser(res.data.user);
        }
        toast.success("Verification successful!");
        navigate("/dashboard");
      }
    } catch (err) {
      setMessage(err.response?.data?.error || "Verification failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="d-flex flex-column align-items-center justify-content-center vh-100 bg-light"
      style={{ fontFamily: "Poppins, sans-serif" }}
    >
      <div className="card p-4 shadow-sm" style={{ width: "23rem" }}>
        <h3 className="text-center mb-3">
          {authMode === "signup" ? "Sign Up" : "Login"}
        </h3>

        {/* Mode Toggle */}
        <div className="btn-group w-100 mb-3">
          <button
            className={`btn ${
              mode === "email" ? "btn-primary" : "btn-outline-primary"
            }`}
            onClick={() => {
              setMode("email");
              setStep("enter");
              setMessage("");
            }}
          >
            Email
          </button>
          <button
            className={`btn ${
              mode === "phone" ? "btn-primary" : "btn-outline-primary"
            }`}
            onClick={() => {
              setMode("phone");
              setStep("enter");
              setMessage("");
            }}
          >
            Phone
          </button>
        </div>

        {/* Email Form */}
        {mode === "email" && (
          <form onSubmit={handleEmailAuth}>
            {authMode === "signup" && (
              <div className="mb-3">
                <label className="form-label">Name</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
            )}
            <div className="mb-3">
              <label className="form-label">Email</label>
              <input
                type="email"
                className="form-control"
                placeholder="example@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="mb-3">
              <label className="form-label">Password</label>
              <input
                type="password"
                className="form-control"
                placeholder="********"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary w-100"
              disabled={loading}
            >
              {loading
                ? authMode === "signup"
                  ? "Signing up..."
                  : "Logging in..."
                : authMode === "signup"
                ? "Sign Up"
                : "Login"}
            </button>
          </form>
        )}

        {/* Phone Form */}
        {mode === "phone" && step === "enter" && (
          <form onSubmit={handleRequestOtp}>
            <div className="mb-3">
              <label className="form-label">Phone Number</label>
              <input
                type="tel"
                className="form-control"
                placeholder="+91 9876543210"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
            <button
              type="submit"
              className="btn btn-primary w-100"
              disabled={loading}
            >
              {loading ? "Sending OTP..." : "Send OTP"}
            </button>
          </form>
        )}

        {mode === "phone" && step === "verify" && (
          <form onSubmit={handleVerifyOtp}>
            <div className="mb-3">
              <label className="form-label">Enter OTP</label>
              <input
                type="text"
                className="form-control"
                placeholder="6-digit code"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
              />
            </div>
            <button
              type="submit"
              className="btn btn-success w-100"
              disabled={loading}
            >
              {loading ? "Verifying..." : "Verify OTP"}
            </button>
          </form>
        )}

        <hr />
        <button
          className="btn btn-danger w-100"
          onClick={handleGoogleAuth}
          disabled={loading}
        >
          <i className="bi bi-google me-2"></i> Continue with Google
        </button>

        <div className="text-center mt-3">
          {authMode === "signup" ? (
            <p>
              Already have an account?{" "}
              <span
                className="text-primary"
                style={{ cursor: "pointer" }}
                onClick={() => {
                  setAuthMode("login");
                  setMessage("");
                }}
              >
                Log in
              </span>
            </p>
          ) : (
            <p>
              New here?{" "}
              <span
                className="text-primary"
                style={{ cursor: "pointer" }}
                onClick={() => {
                  setAuthMode("signup");
                  setMessage("");
                }}
              >
                Sign up
              </span>
            </p>
          )}
        </div>

        {message && (
          <div className="alert alert-info mt-3 text-center p-2">{message}</div>
        )}
      </div>
    </div>
  );
}
