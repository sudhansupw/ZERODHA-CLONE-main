import React, { StrictMode, Suspense } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route, Outlet } from "react-router-dom";
import "./index.css";
import Loader from "./dashboard/components/Loader";

// Landing pages
import HomePage from "./LandingPage/Home/HomePage";
import PricingPage from "./LandingPage/Pricing/PricingPage";
import ProductPage from "./LandingPage/Products/ProductPage";
import SupportPage from "./LandingPage/Support/SupportPage";
import AboutPage from "./LandingPage/About/AboutPage";
import SignUp from "./LandingPage/Signup/SignUp";
import NotFound from "./LandingPage/NotFound";
const DashboardApp = React.lazy(() => import("./dashboard/components/Home"));

// Common layout components
import Navbar from "./LandingPage/Navbar";
import Footer from "./LandingPage/Footer";

// Toast
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import UserProvider from "./dashboard/context/userContext";

// Optional future: import DashboardApp when ready
// import DashboardApp from "./dashboard/DashboardApp";

// 🔹 Layout Component (Navbar + Footer + Outlet)
function Layout() {
  return (
    <>
      <Navbar />
      <Outlet /> {/* This renders nested routes (home, pricing, etc.) */}
      <Footer />
    </>
  );
}

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <UserProvider>
        <Routes>
          {/* 🔹 Landing Routes under Layout */}
          <Route element={<Layout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/pricing" element={<PricingPage />} />
            <Route path="/product" element={<ProductPage />} />
            <Route path="/support" element={<SupportPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/signup" element={<SignUp />} />
          </Route>

          {/* 🔹 Example future dashboard route */}
          {/* <Route path="/dashboard/*" element={<Home />} /> */}
          <Route
            path="/dashboard/*"
            element={
              <Suspense
                fallback={<Loader text="Preparing your dashboard..." />}
              >
                <DashboardApp />
              </Suspense>
            }
          />

          {/* 🔹 Fallback for 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </UserProvider>

      {/* 🔹 Global Toast */}
      <ToastContainer
        position="top-right"
        autoClose={2500}
        hideProgressBar={false}
        newestOnTop={true}
        closeOnClick
        theme="light"
      />
    </BrowserRouter>
  </StrictMode>
);
