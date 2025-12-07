// src/pages/Login.jsx
import { useState, useContext } from "react";
import api from "../utils/api";
import { AuthContext } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import "./Login.css";

export default function Login() {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  async function handleLogin(e) {
    e.preventDefault();
    setLoading(true);
    
    try {
      const res = await api.post("/auth/login", { email, password });
      if (res.data.token) {
        login(res.data.user, res.data.token);
        navigate("/");
      }
    } catch (err) {
      alert("Invalid Credentials");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-container">
      {/* Animated Background Elements */}
      <div className="background-elements">
        <div className="floating-orb orb-1"></div>
        <div className="floating-orb orb-2"></div>
        <div className="floating-orb orb-3"></div>
      </div>

      {/* Login Card */}
      <div className="login-card">
        {/* Header Section */}
        <div className="login-header">
          <div className="logo-container">
            <span className="logo">⏳</span>
            <div className="logo-glow"></div>
          </div>
          <h1 className="login-title">Welcome Back</h1>
          <p className="login-subtitle">Continue your journey through time</p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleLogin} className="login-form">
          {/* Email Input */}
          <div className="input-group">
            <label className="input-label">
              <span className="label-icon">📧</span>
              Email Address
            </label>
            <input 
              type="email"
              placeholder="Enter your email address..."
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="login-input"
              required
            />
          </div>

          {/* Password Input */}
          <div className="input-group">
            <label className="input-label">
              <span className="label-icon">🔒</span>
              Password
            </label>
            <div className="password-container">
              <input 
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password..."
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="login-input password-input"
                required
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? "🙈" : "👁️"}
              </button>
            </div>
          </div>

          {/* Forgot Password */}
          <div className="forgot-password">
            <Link to="/forgot-password" className="forgot-link">
              Forgot your password?
            </Link>
          </div>

          {/* Submit Button */}
          <button 
            type="submit" 
            className={`login-button ${loading ? 'loading' : ''}`}
            disabled={loading}
          >
            {loading ? (
              <>
                <div className="button-spinner"></div>
                Signing In...
              </>
            ) : (
              <>
                <span className="button-icon">🚀</span>
                Sign In to SoulBox
              </>
            )}
          </button>
        </form>

        {/* Divider */}
        <div className="divider">
          <span className="divider-text">New to SoulBox?</span>
        </div>

        {/* Sign Up Link */}
        <Link to="/signup" className="signup-link">
          <span className="signup-icon">✨</span>
          Create your time capsule account
        </Link>

        {/* Trust Indicators */}
        <div className="trust-section">
          <div className="trust-text">Your memories are safe with us</div>
          <div className="security-badges">
            <span className="security-badge">🔒 Bank-level security</span>
            <span className="security-badge">⏰ End-to-end encryption</span>
            <span className="security-badge">🌐 Private by design</span>
          </div>
        </div>
      </div>
    </div>
  );
}