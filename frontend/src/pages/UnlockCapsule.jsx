import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../utils/api";
import "./UnlockCapsule.css";

export default function UnlockCapsule() {
  const { token } = useParams();
  const navigate = useNavigate();

  const [capsule, setCapsule] = useState(null);
  const [key, setKey] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [unlocking, setUnlocking] = useState(false);
  const [tooEarly, setTooEarly] = useState(false); // ⭐ New state

  // ⭐ SAFE EFFECT (No redirect inside)
  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const res = await api.get(`/capsule/view/${token}`);
        if (cancelled) return;

        setCapsule(res.data);

        // Check unlock time
        const unlockAt = new Date(`${res.data.unlock_date}T${res.data.unlock_time}`);
        if (new Date() < unlockAt) {
          setTooEarly(true); // ⭐ No redirect, no history corruption
        }
      } catch (err) {
        if (!cancelled) {
          setError("Capsule not found.");
        }
      }

      if (!cancelled) setLoading(false);
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [token]);

  // ⭐ Unlock handler
  async function handleUnlock(e) {
    e.preventDefault();
    setError("");
    setUnlocking(true);

    if (!key.trim()) {
      setError("Please enter the unlock key.");
      setUnlocking(false);
      return;
    }

    try {
      const res = await api.post(`/capsule/unlock/${token}`, {
        key,
        viewer_email: capsule.recipient_email || "unknown",
      });

      navigate("/capsule/opened", {
        state: {
          capsuleData: res.data.data,
          capsuleId: res.data.capsule_id,
        },
      });
    } catch (err) {
      if (err.response?.data?.error) {
        setError(err.response.data.error);
      } else {
        setError("Invalid key. Please try again.");
      }
    }

    setUnlocking(false);
  }

  // ⭐ Loading screen
  if (loading) {
    return (
      <div className="unlock-loading">
        <div className="loading-spinner"></div>
        <h2>Loading Your Capsule...</h2>
      </div>
    );
  }

  // ⭐ Capsule not found
  if (!capsule) {
    return (
      <div className="unlock-container">
        <div className="error-state">
          <div className="error-icon">🔒</div>
          <h2>Capsule Not Found</h2>
          <button className="back-btn" onClick={() => navigate("/dashboard")}>
            Go Back
          </button>
        </div>
      </div>
    );
  }

  // ⭐ Capsule too early
  if (tooEarly) {
    return (
      <div className="unlock-container">
        <div className="error-state">
          <div className="error-icon">⏳</div>
          <h2>This Capsule Isn't Ready Yet</h2>
          <p>
            You can unlock this capsule after{" "}
            <strong>
              {new Date(capsule.unlock_date).toLocaleDateString("en-US", {
                month: "long",
                day: "numeric",
                year: "numeric",
              })}{" "}
              {formatTime(capsule.unlock_time)} IST
            </strong>
          </p>

          <div style={{ marginTop: "20px", display: "flex", gap: "12px" }}>
            <button className="back-btn" onClick={() => navigate(-1)}>
              Go Back
            </button>

            <button
              className="back-btn"
              onClick={() => navigate(`/capsule/view/${token}`)}
            >
              View Capsule Preview
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ⭐ Main unlock page UI
  return (
    <div className="unlock-container">
      <div className="unlock-content">
        <div className="unlock-header">
          <h1>Unlock Your SoulBox</h1>
        </div>

        <div className="capsule-info">
          <h2 className="capsule-name">{capsule.title}</h2>

          <div className="capsule-details">
            <div className="detail-item">
              <span className="detail-label">Created on</span>
              <span className="detail-value">
                {new Date(capsule.created_at).toLocaleDateString("en-US", {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
              </span>
            </div>

            <div className="detail-item">
              <span className="detail-label">Unlock time</span>
              <span className="detail-value">
                {new Date(capsule.unlock_date).toLocaleDateString("en-US", {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}{" "}
                {formatTime(capsule.unlock_time)} IST
              </span>
            </div>
          </div>
        </div>

        <div className="divider"></div>

        <form onSubmit={handleUnlock} className="unlock-form">
          <h3>Enter Your Unlock Key</h3>

          <div className="input-group">
            <input
              type="text"
              placeholder="XXXXXX"
              value={key}
              onChange={(e) => setKey(e.target.value)}
              className="key-input"
              autoComplete="off"
              autoFocus
              maxLength={6}
            />
            <div className="input-hint">
              Check your email for the 6-character unlock key
            </div>
          </div>

          {error && <div className="error-message">{error}</div>}

          <button
            type="submit"
            className={`unlock-btn ${unlocking ? "unlocking" : ""}`}
            disabled={unlocking}
          >
            {unlocking ? (
              <>
                <div className="btn-spinner"></div>
                Unlocking...
              </>
            ) : (
              "Open Capsule"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

function formatTime(timeString) {
  try {
    const [hours, minutes] = timeString.split(":");
    const date = new Date();
    date.setHours(parseInt(hours), parseInt(minutes));
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  } catch {
    return timeString;
  }
}
