import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { FaUserCircle } from "react-icons/fa"; // Profile icon

// --- Navigation Data ---
const mainNavLinks = [
  { href: "/", label: "Home" },
  { href: "/recharge", label: "Recharge & Bills" },
  { href: "/hotel-book", label: "Booking" },
  { href: "/transfer-money", label: "Transfer Money" },
];

const Header: React.FC = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const { auth, logout } = useAuth();
  const navigate = useNavigate();
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="header-section">
      <div className="container">
        <div className="header-wrapper">
          {/* === Logo Section === */}
          <div className="logo-menu">
            <Link to="/" className="logo">
              <img src="assets/img/logo/logo.png" alt="logo" />
            </Link>
            <Link to="/" className="small__logo d-xl-none">
              <img src="assets/img/logo/favicon.png" alt="logo" />
            </Link>
          </div>

          {/* === Right Side Buttons & Hamburger === */}
          <div className="menu__right__components d-flex align-items-center">
            <div className="sigup__grp d-lg-none gap-2">
              {auth.user ? (
                <>
                  <Link to="/recharge" className="cmn__btn outline__btn">
                    <span>Recharge</span>
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="cmn__btn"
                    style={{ border: "none", cursor: "pointer" }}
                  >
                    <span>Logout</span>
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login" className="cmn__btn outline__btn">
                    <span>Login</span>
                  </Link>
                  <Link to="/signup" className="cmn__btn">
                    <span>Signup</span>
                  </Link>
                </>
              )}
            </div>
            <div
              className="header-bar d-lg-none"
              onClick={() => setMenuOpen(!menuOpen)}
            >
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>

          {/* === Main Menu === */}
          <ul className={`main-menu ${menuOpen ? "open" : ""}`}>
            {mainNavLinks.map((link) => (
              <li key={link.href}>
                <Link to={link.href} onClick={() => setMenuOpen(false)}>
                  <span>{link.label}</span>
                </Link>
              </li>
            ))}
          </ul>

          {/* === Desktop User Menu === */}
          <div
            className="sigin__grp d-none d-lg-flex align-items-center gap-3"
            ref={dropdownRef}
          >
            {auth.user ? (
              <>
                {/* --- Logged-in User Menu --- */}
                <div className="position-relative d-flex align-items-center gap-2" style={{ cursor: "pointer" }} onClick={() => setDropdownOpen(!dropdownOpen)} >
                  <span className="fw-semibold">{auth.user.name}</span>
                  <FaUserCircle size={36} color="#555" />
                </div>
                {dropdownOpen && (
                  <div
                    className="position-absolute end-0 mt-2 bg-white shadow-lg rounded-3"
                    style={{
                      minWidth: "180px",
                      zIndex: 1050, // Ensure it's above other content
                      border: "1px solid #e9ecef",
                      overflow: "hidden",
                      top: "100%", // Position it right below the navbar
                    }}
                  >
                    {/* Dashboard Link */}
                    <Link
                      to={
                        auth.user.role === "ADMIN" ? "/admin"
                        : auth.user.role === "EMPLOYEE" ? "/employee"
                        : "/dashboard"
                      }
                      className="dropdown-item text-dark d-block px-3 py-2 text-decoration-none" onClick={() => setDropdownOpen(false)} >
                      Dashboard
                    </Link>

                    {/* Profile Link */}
                    <Link to="/profile" className="dropdown-item text-dark d-block px-3 py-2 text-decoration-none" onClick={() => setDropdownOpen(false)} >
                      Profile
                    </Link>

                    {/* Logout Button */}
                    <button
                      onClick={handleLogout}
                      className="dropdown-item text-danger border-0 bg-transparent px-3 py-2 w-100 text-start"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </>
            ) : (
              <>
                {/* --- Logged-out User Buttons --- */}
                <Link to="/login" className="cmn__btn outline__btn">
                  <span>Login</span>
                </Link>
                <Link to="/signup" className="cmn__btn">
                  <span>Signup</span>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
