import React, { Suspense, lazy } from "react";
import { Routes, Route, useLocation } from "react-router-dom";

// Helper to ensure the loader is visible for a minimum amount of time
const lazyWithMinTime = (
  importFn: () => Promise<{ default: React.ComponentType<any> }>,
  minTimeMs: number = 1000
) => {
  return lazy(() =>
    Promise.all([
      importFn(),
      new Promise((resolve) => setTimeout(resolve, minTimeMs)),
    ]).then(([moduleExports]) => moduleExports)
  );
};

// Lazy load pages
const Home = lazyWithMinTime(() => import("./pages/Home"));
const Login = lazyWithMinTime(() => import("./pages/Login"));
const Signup = lazyWithMinTime(() => import("./pages/Signup"));
const Recharge = lazyWithMinTime(() => import("./pages/Recharge"));
const Kyc = lazyWithMinTime(() => import("./pages/Kyc"));
const Dashboard = lazyWithMinTime(() => import("./pages/Dashboard"));
const AdminDashboard = lazyWithMinTime(() => import("./pages/AdminDashboard"));
const EmployeeDashboard = lazyWithMinTime(
  () => import("./pages/EmployeeDashboard")
);
const ForgotPassword = lazyWithMinTime(() => import("./pages/ForgotPassword"));
// The ResetPassword page is now combined into ForgotPassword.tsx
// const ResetPassword = lazyWithMinTime(() => import("./pages/ResetPassword"));

const Profile = lazyWithMinTime(() => import("./pages/Profile"));

// Placeholder for pages that are not yet created
const ComingSoonPage = () => (
  <div className="container text-center py-5 my-5">
    <h1 className="display-3">Coming Soon!</h1>
    <p className="lead text-muted">This feature is under construction and will be available shortly.</p>
  </div>
);

// Components
import Navbar from "./components/Navbar";
import Footer from "./components/Footer"; // Import the new Footer component
import ProtectedRoute from "./components/ProtectedRoute";
import AdminRoute from "./components/AdminRoute";
import EmployeeRoute from "./components/EmployeeRoute";
import BroadbandPage from "./pages/Broadband";
import CableTVPage from "./pages/CableTV";
import GasPage from "./pages/Gas";
import LandlinePage from "./pages/Landline";
import ElectricityPage from "./pages/Electricity";
import WaterPage from "./pages/Water";

// Loader Component
const LoaderStyles = () => (
  <style>
    {`
      @keyframes wave-bounce {
        0%, 60%, 100% { transform: translateY(0); }
        30% { transform: translateY(-25px); }
      }

      .wave-loader {
        display: flex;
        justify-content: center;
        align-items: center;
        width: 150px;
        height: 80px;
      }

      .wave-loader > div {
        width: 15px;
        height: 15px;
        background-color: #E15D67;
        border-radius: 50%;
        margin: 0 5px;
        animation: wave-bounce 1.2s infinite ease-in-out;
      }

      .wave-loader .dot1 { animation-delay: 0.0s; }
      .wave-loader .dot2 { animation-delay: 0.1s; }
      .wave-loader .dot3 { animation-delay: 0.2s; }
      .wave-loader .dot4 { animation-delay: 0.3s; }
      .wave-loader .dot5 { animation-delay: 0.4s; }
    `}
  </style>
);

const PageLoader: React.FC = () => (
  <>
    <LoaderStyles />
    <div
      className="w-100 vh-100 d-flex justify-content-center align-items-center"
      style={{ backgroundColor: "rgba(255, 255, 255, 0.9)" }}
    >
      <div className="wave-loader">
        <div className="dot1"></div>
        <div className="dot2"></div>
        <div className="dot3"></div>
        <div className="dot4"></div>
        <div className="dot5"></div>
      </div>
    </div>
  </>
);

const App: React.FC = () => {
  const location = useLocation();
  const dashboardPaths = ["/employee", "/admin"];
  const isDashboardPage = dashboardPaths.some((path) => location.pathname.startsWith(path));

  return (
    <>
      {/* Navigation Bar */}
      {!isDashboardPage && <Navbar />}

      {/* Full Width Wrapper for All Pages */}
      <div
        style={{
          paddingTop: isDashboardPage ? "0" : "80px",
          width: "100%",
          minHeight: "100vh",
          overflowX: "hidden",
        }}
        className="full-width-page"
      >
        <Suspense fallback={<PageLoader />}>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/recharge" element={<Recharge />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />

            {/* Routes for other services pointing to a placeholder page */}
            <Route path="/card" element={<ComingSoonPage />} />
            <Route path="/broadband" element={<BroadbandPage />} />
            <Route path="/landline" element={<LandlinePage />} />
            <Route path="/cabletv" element={<CableTVPage />} />
            <Route path="/electricity" element={<ElectricityPage />} />
            <Route path="/gas" element={<GasPage />} />
            <Route path="/water" element={<WaterPage />} />

            {/* Protected Routes */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/kyc"
              element={
                <ProtectedRoute>
                  <Kyc />
                </ProtectedRoute>
              }
            />

            {/* Role-Based Protected Routes */}
            <Route
              path="/admin/*"
              element={
                <AdminRoute>
                  <AdminDashboard />
                </AdminRoute>
              }
            />
            <Route
              path="/employee/*"
              element={
                <EmployeeRoute>
                  <EmployeeDashboard />
                </EmployeeRoute>
              }
            />
          </Routes>
        </Suspense>
      </div>

      {/* Footer */}
      {!isDashboardPage && <Footer />}
    </>
  );
};

export default App;
