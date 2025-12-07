// src/components/Navbar.jsx
import { useState, useContext, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import './Navbar.css';

export default function Navbar() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const dropdownRef = useRef(null);
  const mobileMenuRef = useRef(null);

  const [openProfile, setOpenProfile] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Hide navbar when user is not logged in
 useEffect(() => {
  // User not logged in = do nothing here
  if (!user) return;

  function handleClickOutside(event) {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
      setOpenProfile(false);
    }

    if (
      mobileMenuRef.current &&
      !mobileMenuRef.current.contains(event.target) &&
      !event.target.closest(".mobile-menu-toggle")
    ) {
      setIsMobileMenuOpen(false);
    }
  }

  document.addEventListener("mousedown", handleClickOutside);
  return () => {
    document.removeEventListener("mousedown", handleClickOutside);
  };
}, [user]);


  // Navbar scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    navigate("/login");
    setOpenProfile(false);
    setIsMobileMenuOpen(false);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <>
      <nav 
        className={`nav ${isScrolled ? 'scrolled' : ''}`}
      >
        {/* LEFT SIDE - BRAND & NAVIGATION */}
        <div className="nav-left">
          {/* Logo */}
          <Link to="/" className="logo">
            <div className="logo-container">
              <span className="logo-icon">⏳</span>
              <div className="logo-glow"></div>
            </div>
            <span className="logo-text">SoulBox</span>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="nav-links">
            <NavLink to="/" label="Home" activePath={location.pathname} />
            <NavLink to="/create" label="Create Capsule" activePath={location.pathname} />
            <NavLink to="/dashboard" label="Dashboard" activePath={location.pathname} />
            <NavLink to="/timeline" label="Timeline" activePath={location.pathname} />
          </div>
        </div>

        {/* RIGHT SIDE - USER PROFILE & MOBILE MENU */}
        <div className="nav-right">
          {/* Desktop User Profile */}
          <div className="profile-section" ref={dropdownRef}>
            {/* Welcome Text - Visible on desktop */}
            <div className="welcome-text">
              Welcome, <span className="user-name">{user?.name?.split(' ')[0]}</span>
            </div>

            {/* Profile Dropdown Trigger */}
            <div
              className="profile-trigger"
              onMouseEnter={() => setOpenProfile(true)}
              onMouseLeave={() => setTimeout(() => setOpenProfile(false), 300)}
              onClick={() => setOpenProfile(!openProfile)}
            >
              <div className="profile-avatar">
                {user?.name?.charAt(0).toUpperCase()}
                <div className="avatar-status"></div>
              </div>
              <span className="dropdown-arrow">
                {openProfile ? '▲' : '▼'}
              </span>
            </div>

            {/* Profile Dropdown Menu */}
            {openProfile && (
              <div 
                className="dropdown-menu"
                onMouseEnter={() => setOpenProfile(true)}
                onMouseLeave={() => setOpenProfile(false)}
              >
                {/* User Info Header */}
                <div className="dropdown-header">
                  <div className="dropdown-avatar">
                    {user?.name?.charAt(0).toUpperCase()}
                  </div>
                  <div className="user-info">
                    <div className="user-name">{user?.name}</div>
                    <div className="user-email">{user?.email}</div>
                  </div>
                </div>

                <div className="dropdown-divider"></div>

                {/* Quick Stats */}
                <div className="user-stats">
                  <div className="stat">
                    <div className="stat-number">12</div>
                    <div className="stat-label">Capsules</div>
                  </div>
                  <div className="stat">
                    <div className="stat-number">3</div>
                    <div className="stat-label">Unlocked</div>
                  </div>
                </div>

                <div className="dropdown-divider"></div>

                {/* Dropdown Menu Items */}
                <div className="menu-items">
                  <Link to="/profile" className="menu-item" onClick={() => setOpenProfile(false)}>
                    <span className="menu-icon">👤</span>
                    My Profile
                  </Link>
                  <Link to="/settings" className="menu-item" onClick={() => setOpenProfile(false)}>
                    <span className="menu-icon">⚙️</span>
                    Settings
                  </Link>
                  <Link to="/help" className="menu-item" onClick={() => setOpenProfile(false)}>
                    <span className="menu-icon">❓</span>
                    Help & Support
                  </Link>
                </div>

                <div className="dropdown-divider"></div>

                {/* Logout Button */}
                <button
                  className="logout-btn"
                  onClick={handleLogout}
                >
                  <span className="logout-icon">🚪</span>
                  Sign Out
                </button>
              </div>
            )}
          </div>

          {/* Mobile Menu Toggle Button */}
          <button 
            className={`mobile-menu-toggle ${isMobileMenuOpen ? 'active' : ''}`}
            onClick={toggleMobileMenu}
            aria-label="Toggle menu"
          >
            <span></span>
            <span></span>
            <span></span>
          </button>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      <div className={`mobile-menu-overlay ${isMobileMenuOpen ? 'active' : ''}`}>
        <div className="mobile-menu" ref={mobileMenuRef}>
          {/* Mobile User Info */}
          <div className="mobile-user-info">
            <div className="mobile-user-avatar">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div className="mobile-user-details">
              <div className="mobile-user-name">{user?.name}</div>
              <div className="mobile-user-email">{user?.email}</div>
            </div>
          </div>

          <div className="mobile-divider"></div>

          {/* Mobile Navigation Links */}
          <div className="mobile-nav-links">
            <NavLink to="/" label="Home" activePath={location.pathname} mobile />
            <NavLink to="/create" label="Create Capsule" activePath={location.pathname} mobile />
            <NavLink to="/dashboard" label="Dashboard" activePath={location.pathname} mobile />
            <NavLink to="/timeline" label="Timeline" activePath={location.pathname} mobile />
            <NavLink to="/profile" label="My Profile" activePath={location.pathname} mobile />
            <NavLink to="/settings" label="Settings" activePath={location.pathname} mobile />
            <NavLink to="/help" label="Help & Support" activePath={location.pathname} mobile />
          </div>

          <div className="mobile-divider"></div>

          {/* Mobile Quick Stats */}
          <div className="mobile-user-stats">
            <div className="mobile-stat">
              <div className="mobile-stat-number">12</div>
              <div className="mobile-stat-label">Capsules</div>
            </div>
            <div className="mobile-stat">
              <div className="mobile-stat-number">3</div>
              <div className="mobile-stat-label">Unlocked</div>
            </div>
          </div>

          {/* Mobile Logout Button */}
          <button className="mobile-logout-btn" onClick={handleLogout}>
            <span className="mobile-logout-icon">🚪</span>
            Sign Out
          </button>
        </div>
      </div>
    </>
  );
}

/* ----------------------------------------
   ACTIVE LINK COMPONENT
---------------------------------------- */
function NavLink({ to, label, activePath, mobile = false }) {
  const isActive = activePath === to;
  const [isHovered, setIsHovered] = useState(false);

  const linkClass = mobile ? 'mobile-nav-link' : 'nav-link';
  const activeClass = isActive ? 'active' : '';
  const hoverClass = isHovered && !isActive ? 'hover' : '';

  return (
    <Link
      to={to}
      className={`${linkClass} ${activeClass} ${hoverClass}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {label}
      {isActive && !mobile && <div className="active-indicator"></div>}
    </Link>
  );
}