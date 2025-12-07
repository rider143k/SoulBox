import { useState, useEffect, useRef } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import api from "../utils/api";
import './CapsuleDetails.css';

export default function CapsuleDetails() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  
  const [capsule, setCapsule] = useState(location.state?.capsuleData || null);
  const [loading, setLoading] = useState(!capsule);
  const [timeLeft, setTimeLeft] = useState(location.state?.timeLeft || null);
  const [error, setError] = useState(null);
  
  const intervalRef = useRef(null);

  useEffect(() => {
    if (!capsule) {
      loadCapsuleDetails();
    }
    
    // Start countdown if capsule is active
    if (capsule && capsule.is_unlocked !== 1) {
      startCountdown();
    }
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [capsule]);

  async function loadCapsuleDetails() {
    try {
      const token = localStorage.getItem("token");
      const res = await api.get(`/capsule/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCapsule(res.data);
      setLoading(false);
    } catch (err) {
      setError("Failed to load capsule details");
      setLoading(false);
    }
  }

  function buildUnlockDateTime(unlockDate, unlockTime) {
    try {
      if (!unlockDate || !unlockTime) return null;
      
      let timeString = String(unlockTime).trim();
      
      if (/^\d{1,2}:\d{2}:\d{2}$/.test(timeString)) {
        const [hours, minutes, seconds] = timeString.split(':').map(Number);
        const [year, month, day] = unlockDate.split('-').map(Number);
        return new Date(year, month - 1, day, hours, minutes, seconds);
      }

      const isoString = `${unlockDate}T${timeString}`;
      const date = new Date(isoString);
      return isNaN(date.getTime()) ? null : date;
    } catch (err) {
      return null;
    }
  }

  function computeTimeLeft(unlockAt) {
    if (!unlockAt || isNaN(unlockAt.getTime())) {
      return { days: 0, hours: 0, minutes: 0, seconds: 0, isPast: true };
    }

    const now = new Date();
    const diff = unlockAt - now;

    if (diff <= 0) {
      return { days: 0, hours: 0, minutes: 0, seconds: 0, isPast: true };
    }

    const totalSeconds = Math.floor(diff / 1000);
    const days = Math.floor(totalSeconds / (3600 * 24));
    const hours = Math.floor((totalSeconds % (3600 * 24)) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = Math.floor(totalSeconds % 60);

    return {
      days,
      hours,
      minutes,
      seconds,
      isPast: false
    };
  }

  function startCountdown() {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    intervalRef.current = setInterval(() => {
      const unlockAt = buildUnlockDateTime(capsule.unlock_date, capsule.unlock_time);
      const newTimeLeft = computeTimeLeft(unlockAt);
      setTimeLeft(newTimeLeft);

      // If time is up, navigate to unlock page
      if (newTimeLeft.isPast && capsule.is_unlocked !== 1) {
        clearInterval(intervalRef.current);
        navigate(`/unlock-capsule/${capsule.share_token}`);
      }
    }, 1000);
  }

  function formatTimeRemaining() {
    if (!timeLeft || timeLeft.isPast) {
      return "Ready to unlock!";
    }
    if (timeLeft.days > 0) {
      return `${timeLeft.days} days, ${timeLeft.hours} hours, ${timeLeft.minutes} minutes remaining`;
    } else if (timeLeft.hours > 0) {
      return `${timeLeft.hours} hours, ${timeLeft.minutes} minutes, ${timeLeft.seconds} seconds remaining`;
    } else {
      return `${timeLeft.minutes} minutes, ${timeLeft.seconds} seconds remaining`;
    }
  }

  function formatDisplayTime(rawDate, rawTime) {
    if (!rawDate || !rawTime) return "No date set";
    
    if (/^\d{1,2}:\d{2}:\d{2}$/.test(rawTime)) {
      const [hours, minutes] = rawTime.split(':');
      let h = parseInt(hours);
      const ampm = h >= 12 ? 'PM' : 'AM';
      h = h % 12 || 12;
      return `${rawDate} at ${h}:${minutes} ${ampm}`;
    }

    return `${rawDate} at ${rawTime}`;
  }

  if (loading) {
    return (
      <div className="capsule-details-loading">
        <div className="loading-spinner"></div>
        <h2>Loading Capsule Details...</h2>
      </div>
    );
  }

  if (error || !capsule) {
    return (
      <div className="capsule-details-error">
        <div className="error-icon">⚠️</div>
        <h3>{error || "Capsule not found"}</h3>
        <button className="back-btn" onClick={() => navigate("/dashboard")}>
          Back to Dashboard
        </button>
      </div>
    );
  }

  const isUnlocked = capsule.is_unlocked === 1;
  const isActive = !isUnlocked && timeLeft && !timeLeft.isPast;
  const isReady = !isUnlocked && timeLeft && timeLeft.isPast;

  return (
    <div className="capsule-details-container">
      <button className="back-button" onClick={() => navigate("/dashboard")}>
        ← Back to Dashboard
      </button>

      <div className="capsule-details-card">
        <div className="capsule-details-header">
          <h1 className="capsule-details-title">{capsule.title}</h1>
          <div className="capsule-status-badge">
            {isUnlocked ? (
              <span className="badge unlocked">🎉 Unlocked</span>
            ) : isReady ? (
              <span className="badge ready">⏰ Ready to Unlock</span>
            ) : (
              <span className="badge locked">🔒 Locked</span>
            )}
          </div>
        </div>

        <div className="capsule-details-content">
          <div className="capsule-info-section">
            <div className="info-row">
              <span className="info-label">Unlock Date:</span>
              <span className="info-value">
                {formatDisplayTime(capsule.unlock_date, capsule.unlock_time)}
              </span>
            </div>
            
            {capsule.description && (
              <div className="info-row">
                <span className="info-label">Description:</span>
                <span className="info-value">{capsule.description}</span>
              </div>
            )}
            
            <div className="info-row">
              <span className="info-label">Created:</span>
              <span className="info-value">
                {new Date(capsule.created_at).toLocaleDateString()}
              </span>
            </div>
          </div>

          {/* COUNTDOWN SECTION - Only show for active capsules */}
          {isActive && timeLeft && (
            <div className="countdown-section">
              <h2 className="countdown-title">⏳ Time Until Unlock</h2>
              
              <div className="countdown-display">
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
              
              <p className="countdown-message">{formatTimeRemaining()}</p>
              
              <div className="countdown-progress">
                <div 
                  className="progress-bar"
                  style={{
                    width: `${100 - ((timeLeft.days * 24 * 60 + timeLeft.hours * 60 + timeLeft.minutes) / 
                          (capsule.duration_days * 24 * 60) * 100)}%`
                  }}
                ></div>
              </div>
            </div>
          )}

          {isReady && (
            <div className="ready-section">
              <div className="ready-icon">🎉</div>
              <h2>Time's Up!</h2>
              <p>This capsule is ready to be unlocked. Click the button below to enter your unlock code.</p>
              <button 
                className="unlock-now-btn"
                onClick={() => navigate(`/unlock-capsule/${capsule.share_token}`)}
              >
                🔑 Unlock Now
              </button>
            </div>
          )}

          {isUnlocked && (
            <div className="unlocked-section">
              <div className="unlocked-icon">🔓</div>
              <h2>Already Unlocked!</h2>
              <p>This capsule has been unlocked and is ready to view.</p>
              <button 
                className="view-content-btn"
                onClick={() => navigate(`/capsule-opened`, { 
                  state: { capsuleData: capsule, capsuleId: capsule.id }
                })}
              >
                📖 View Contents
              </button>
            </div>
          )}

          <div className="actions-section">
            <button 
              className="action-btn share-btn"
              onClick={() => {
                const url = `${window.location.origin}/capsule/${capsule.share_token}`;
                navigator.clipboard.writeText(url);
                alert("Capsule link copied to clipboard!");
              }}
            >
              📤 Share Capsule
            </button>
            
            {isUnlocked && (
              <button 
                className="action-btn certificate-btn"
                onClick={() => navigate(`/certificate/${capsule.id}`)}
              >
                📜 View Certificate
              </button>
            )}
            
            <button 
              className="action-btn delete-btn"
              onClick={() => navigate("/dashboard")}
            >
              🗑️ Delete Capsule
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}