import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../utils/api";
import './ViewCapsule.css';

export default function ViewCapsule() {
  const { token } = useParams();
  const navigate = useNavigate();

  const [capsule, setCapsule] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let timer = null;

    async function load() {
      try {
        const res = await api.get(`/capsule/view/${token}`);
        const data = res.data;

        setCapsule(data);

        const unlockAt = parseUnlockDateTime(data.unlock_date, data.unlock_time);

        if (!unlockAt || isNaN(unlockAt.getTime())) {
          setError("Invalid unlock time configuration");
          setLoading(false);
          return;
        }

        // Check if already unlocked or time has passed
        if (data.is_unlocked === 1 || new Date() >= unlockAt) {
          navigate(`/unlock-capsule/${token}`);
          return;
        }

        const tick = () => {
          const now = new Date();
          const diff = unlockAt - now;
          
          if (diff <= 0) {
            clearInterval(timer);
            navigate(`/unlock-capsule/${token}`);
            return;
          }

          setTimeLeft({
            days: Math.floor(diff / (1000 * 60 * 60 * 24)),
            hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
            minutes: Math.floor((diff / (1000 * 60)) % 60),
            seconds: Math.floor((diff / 1000) % 60),
          });
        };

        tick();
        timer = setInterval(tick, 1000);
      } catch (err) {
        console.error(err);
        setError("Capsule not found or access denied");
      } finally {
        setLoading(false);
      }
    }

    load();
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [token, navigate]);

  /* --------------------------------------
      FIXED TIME PARSING FUNCTION
  --------------------------------------- */
  function parseUnlockDateTime(rawDate, rawTime) {
    try {
      // If rawDate is already a full ISO string with time
      if (rawDate.includes("T")) {
        return new Date(rawDate);
      }

      // Clean the time string - remove any AM/PM and extra spaces
      let cleanTime = rawTime.trim().toUpperCase();
      
      // Handle AM/PM format
      let isPM = false;
      if (cleanTime.includes("PM")) {
        isPM = true;
        cleanTime = cleanTime.replace("PM", "").trim();
      } else if (cleanTime.includes("AM")) {
        cleanTime = cleanTime.replace("AM", "").trim();
      }

      // Split time into hours and minutes
      const timeParts = cleanTime.split(":");
      let hours = parseInt(timeParts[0]);
      const minutes = parseInt(timeParts[1] || "0");

      // Convert 12-hour format to 24-hour format
      if (isPM && hours < 12) {
        hours += 12;
      } else if (!isPM && hours === 12) {
        hours = 0;
      }

      // Ensure hours are in 24-hour format (0-23)
      hours = hours % 24;

      // Create date string in ISO format (local time)
      const dateString = `${rawDate}T${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:00`;
      
      // Parse as local time (not UTC)
      const date = new Date(dateString);
      
      // Validate the date
      if (isNaN(date.getTime())) {
        console.error("Invalid date:", dateString);
        return null;
      }

      return date;
    } catch (e) {
      console.error("Time parsing error:", e);
      return null;
    }
  }

  if (loading) {
    return (
      <div className="view-capsule-loading">
        <div className="loading-spinner"></div>
        <h2>Loading Your Capsule...</h2>
      </div>
    );
  }

  if (error) {
    return (
      <div className="view-capsule-error">
        <div className="error-icon">⏰</div>
        <h2>Unable to Load Capsule</h2>
        <p>{error}</p>
        <button 
          className="back-btn"
          onClick={() => navigate("/dashboard")}
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  if (!capsule || !timeLeft) {
    return (
      <div className="view-capsule-error">
        <div className="error-icon">🔒</div>
        <h2>Capsule Not Found</h2>
        <p>The capsule you're looking for doesn't exist.</p>
        <button 
          className="back-btn"
          onClick={() => navigate("/dashboard")}
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="view-capsule-container">
      {/* Background Animation */}
      <div className="background-animation">
        <div className="floating-orb orb-1"></div>
        <div className="floating-orb orb-2"></div>
        <div className="floating-orb orb-3"></div>
      </div>

      <div className="view-capsule-content">
        {/* Capsule Header */}
        <div className="capsule-header">
          <div className="capsule-icon">⏳</div>
          <h1 className="capsule-title">{capsule.title}</h1>
          <p className="capsule-subtitle">Your memory capsule will unlock in</p>
        </div>

        {/* Unlock Time Info */}
        <div className="unlock-info">
          <div className="unlock-date">
            {formatDisplayDate(capsule.unlock_date)} at {formatDisplayTime(capsule.unlock_time)} IST
          </div>
          {capsule.creator_name && (
            <div className="creator-info">
              Created by <span className="creator-name">{capsule.creator_name}</span>
            </div>
          )}
        </div>

        {/* Countdown Timer */}
        <div className="countdown-container">
          <div className="countdown-grid">
            <div className="countdown-item">
              <div className="countdown-number">{String(timeLeft.days).padStart(2, '0')}</div>
              <div className="countdown-label">Days</div>
            </div>
            <div className="countdown-separator">:</div>
            <div className="countdown-item">
              <div className="countdown-number">{String(timeLeft.hours).padStart(2, '0')}</div>
              <div className="countdown-label">Hours</div>
            </div>
            <div className="countdown-separator">:</div>
            <div className="countdown-item">
              <div className="countdown-number">{String(timeLeft.minutes).padStart(2, '0')}</div>
              <div className="countdown-label">Minutes</div>
            </div>
            <div className="countdown-separator">:</div>
            <div className="countdown-item">
              <div className="countdown-number">{String(timeLeft.seconds).padStart(2, '0')}</div>
              <div className="countdown-label">Seconds</div>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="progress-container">
          <div className="progress-bar">
            <div 
              className="progress-fill"
              style={{
                width: `${calculateProgress(capsule.unlock_date, capsule.unlock_time)}%`
              }}
            ></div>
          </div>
          <div className="progress-text">
            Time until unlock: {formatTimeRemaining(timeLeft)}
          </div>
        </div>

        {/* Info Section */}
        <div className="info-section">
          <div className="info-card">
            <h3>📦 About This Capsule</h3>
            <p>This time capsule contains memories and messages that will be revealed once the countdown completes.</p>
            <div className="capsule-stats">
              <div className="stat">
                <span className="stat-number">1</span>
                <span className="stat-label">Memory</span>
              </div>
              <div className="stat">
                <span className="stat-number">🔒</span>
                <span className="stat-label">Encrypted</span>
              </div>
              <div className="stat">
                <span className="stat-number">⏰</span>
                <span className="stat-label">Timed</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ----------------------------
   HELPER FUNCTIONS
----------------------------- */
function formatDisplayDate(dateString) {
  try {
    const date = new Date(dateString + "T00:00:00");
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return dateString;
  }
}

function formatDisplayTime(timeString) {
  try {
    // Parse the time and format it consistently
    const [hours, minutes] = timeString.split(":").map(part => parseInt(part));
    const date = new Date();
    date.setHours(hours, minutes, 0);
    
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true
    });
  } catch {
    return timeString;
  }
}

function calculateProgress(unlockDate, unlockTime) {
  try {
    const unlockAt = new Date(`${unlockDate}T${unlockTime}`);
    const created = new Date(unlockAt);
    created.setDate(created.getDate() - 1); // Assume created 1 day before unlock
    
    const total = unlockAt - created;
    const elapsed = Date.now() - created;
    
    return Math.min(100, Math.max(0, (elapsed / total) * 100));
  } catch {
    return 0;
  }
}

function formatTimeRemaining(timeLeft) {
  if (timeLeft.days > 0) {
    return `${timeLeft.days} days, ${timeLeft.hours} hours`;
  } else if (timeLeft.hours > 0) {
    return `${timeLeft.hours} hours, ${timeLeft.minutes} minutes`;
  } else {
    return `${timeLeft.minutes} minutes, ${timeLeft.seconds} seconds`;
  }
}