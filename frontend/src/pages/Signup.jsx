// src/pages/Signup.jsx
import { useState } from "react";
import api from "../utils/api";
import { useNavigate, Link } from "react-router-dom";
import "./Signup.css";

export default function Signup() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  async function handleSignup(e) {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      alert("Passwords don't match!");
      return;
    }

    if (password.length < 6) {
      alert("Password must be at least 6 characters long!");
      return;
    }

    setLoading(true);
    
    try {
      await api.post("/auth/signup", { name, email, password });
      alert("Signup Successful! Please login to continue.");
      navigate("/login");
    } catch (err) {
      alert("Error during signup. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="signup-container">
      {/* Animated Background Elements */}
      <div className="background-elements">
        <div className="floating-orb orb-1"></div>
        <div className="floating-orb orb-2"></div>
        <div className="floating-orb orb-3"></div>
      </div>

      {/* Signup Card */}
      <div className="signup-card">
        {/* Header Section */}
        <div className="signup-header">
          <div className="logo-container">
            <span className="logo">⏳</span>
            <div className="logo-glow"></div>
          </div>
          <h1 className="signup-title">Join SoulBox</h1>
          <p className="signup-subtitle">Create your account to start preserving memories for the future</p>
        </div>

        {/* Signup Form */}
        <form onSubmit={handleSignup} className="signup-form">
          {/* Name Input */}
          <div className="input-group">
            <label className="input-label">
              <span className="label-icon">👤</span>
              Full Name
            </label>
            <input 
              type="text"
              placeholder="Enter your full name..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="signup-input"
              required
            />
          </div>

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
              className="signup-input"
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
                placeholder="Create a strong password..."
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="signup-input password-input"
                required
                minLength="6"
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? "🙈" : "👁️"}
              </button>
            </div>
            <div className="password-hint">
              Must be at least 6 characters long
            </div>
          </div>

          {/* Confirm Password Input */}
          <div className="input-group">
            <label className="input-label">
              <span className="label-icon">✅</span>
              Confirm Password
            </label>
            <div className="password-container">
              <input 
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirm your password..."
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="signup-input password-input"
                required
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? "🙈" : "👁️"}
              </button>
            </div>
          </div>

          {/* Terms Agreement */}
          <div className="terms-agreement">
            <p className="terms-text">
              By creating an account, you agree to our{" "}
              <Link to="/terms" className="terms-link">Terms of Service</Link>{" "}
              and{" "}
              <Link to="/privacy" className="terms-link">Privacy Policy</Link>
            </p>
          </div>

          {/* Submit Button */}
          <button 
            type="submit" 
            className={`signup-button ${loading ? 'loading' : ''}`}
            disabled={loading}
          >
            {loading ? (
              <>
                <div className="button-spinner"></div>
                Creating Account...
              </>
            ) : (
              <>
                <span className="button-icon">✨</span>
                Create Account
              </>
            )}
          </button>
        </form>

        {/* Login Link */}
        <div className="login-section">
          <p className="login-text">
            Already have an account?{" "}
            <Link to="/login" className="login-link">
              Sign in here
            </Link>
          </p>
        </div>

        
      </div>
    </div>
  );
}