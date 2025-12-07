import { useEffect, useState, useContext, useRef } from "react";
import api from "../utils/api";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import "./Dashboard.css";

export default function Dashboard() {
  // eslint-disable-next-line
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [capsules, setCapsules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("active");
  const [timeLeftMap, setTimeLeftMap] = useState({});
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [capsuleToDelete, setCapsuleToDelete] = useState(null);
  const [showToast, setShowToast] = useState(false);
  const capsulesRef = useRef([]);

  useEffect(() => {
    async function load() {
      try {
        const token = localStorage.getItem("token");
        const res = await api.get("/capsule/my", {
          headers: { Authorization: `Bearer ${token}` },
        });

        // Normalize unlock_date if it comes in ISO format
        const fixedCapsules = (res.data || []).map((capsule) => {
          if (capsule.unlock_date && capsule.unlock_date.includes("T")) {
            capsule.unlock_date = capsule.unlock_date.split("T")[0];
          }
          return capsule;
        });

        setCapsules(fixedCapsules);
        capsulesRef.current = fixedCapsules;

        // Initialize timeLeftMap for all capsules
        const initialTimeLeftMap = {};
        fixedCapsules.forEach((capsule) => {
          if (capsule.is_unlocked === 1) {
            initialTimeLeftMap[capsule.id] = {
              days: 0,
              hours: 0,
              minutes: 0,
              seconds: 0,
              isPast: true,
            };
            return;
          }

          const unlockAt = buildUnlockDateTime(
            capsule.unlock_date,
            capsule.unlock_time
          );
          const timeLeft = computeTimeLeft(unlockAt);
          initialTimeLeftMap[capsule.id] = timeLeft;
        });

        setTimeLeftMap(initialTimeLeftMap);
      } catch (err) {
        console.error("Error loading capsules:", err);
      }
      setLoading(false);
    }
    load();
  }, []);

  /* 🕒 TIME PARSER */
  function buildUnlockDateTime(unlockDate, unlockTime) {
    try {
      if (!unlockDate) return null;

      // Handle ISO format
      if (unlockDate.includes("T")) {
        return new Date(unlockDate);
      }

      // Combine separate date and time
      let timeString = String(unlockTime || "00:00:00").trim();

      if (/^\d{1,2}:\d{2}:\d{2}$/.test(timeString)) {
        const [hours, minutes, seconds] = timeString.split(":").map(Number);
        const [year, month, day] = unlockDate.split("-").map(Number);
        return new Date(year, month - 1, day, hours, minutes, seconds);
      }

      const isoString = `${unlockDate}T${timeString}`;
      const date = new Date(isoString);
      return isNaN(date.getTime()) ? null : date;
    } catch (err) {
      console.error("buildUnlockDateTime ERROR:", err);
      return null;
    }
  }

  /* ⏳ COUNTDOWN CALCULATION */
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
      isPast: false,
    };
  }

  /* ✅ SINGLE SOURCE OF TRUTH FOR CAPSULE STATUS
     - UNLOCKED  → is_unlocked === 1
     - READY     → time is over, not unlocked
     - ACTIVE    → time is remaining
  */
  function computeCapsuleStatus(capsule) {
    // If backend says unlocked → trust it
    if (capsule.is_unlocked === 1) return "UNLOCKED";

    const unlockAt = buildUnlockDateTime(
      capsule.unlock_date,
      capsule.unlock_time
    );
    if (!unlockAt || isNaN(unlockAt.getTime())) {
      return "ACTIVE";
    }

    const now = new Date();
    if (now >= unlockAt) return "READY";

    return "ACTIVE";
  }

  /* 🔄 Interval — runs every second for countdown updates */
  useEffect(() => {
    function updateTimeLeft() {
      const newMap = {};
      const list = capsulesRef.current;

      list.forEach((capsule) => {
        if (capsule.is_unlocked === 1) {
          newMap[capsule.id] = {
            days: 0,
            hours: 0,
            minutes: 0,
            seconds: 0,
            isPast: true,
          };
          return;
        }

        const unlockAt = buildUnlockDateTime(
          capsule.unlock_date,
          capsule.unlock_time
        );
        newMap[capsule.id] = computeTimeLeft(unlockAt);
      });

      setTimeLeftMap(newMap);
    }

    updateTimeLeft();
    const intervalId = setInterval(updateTimeLeft, 1000);
    return () => clearInterval(intervalId);
  }, []);

  // ================== CATEGORIZATION LOGIC (FIXED) ==================

  const unlockedCapsules = capsules.filter(
    (capsule) => computeCapsuleStatus(capsule) === "UNLOCKED"
  );

  const readyCapsules = capsules.filter(
    (capsule) => computeCapsuleStatus(capsule) === "READY"
  );

  const activeCapsules = capsules.filter(
    (capsule) => computeCapsuleStatus(capsule) === "ACTIVE"
  );

  // ================== END CATEGORIZATION ==================

  // DELETE CAPSULE WITH POPUP CONFIRMATION
  function confirmDeleteCapsule(capsule) {
    setCapsuleToDelete(capsule);
    setShowDeleteModal(true);
  }

  async function deleteCapsule() {
    if (!capsuleToDelete) return;

    try {
      const token = localStorage.getItem("token");
      await api.delete(`/capsule/delete/${capsuleToDelete.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Remove from state
      setCapsules((prev) => prev.filter((c) => c.id !== capsuleToDelete.id));
      capsulesRef.current = capsulesRef.current.filter(
        (c) => c.id !== capsuleToDelete.id
      );

      // Update timeLeftMap
      setTimeLeftMap((prev) => {
        const newMap = { ...prev };
        delete newMap[capsuleToDelete.id];
        return newMap;
      });

      // Close modal and reset
      setShowDeleteModal(false);
      setCapsuleToDelete(null);

      // Show success message
      alert("Capsule deleted successfully!");
    } catch (err) {
      alert("Failed to delete capsule");
      setShowDeleteModal(false);
      setCapsuleToDelete(null);
    }
  }

  // SHARE FUNCTION with auto-copy and toast
  async function shareCapsule(token, event) {
    const url = `${window.location.origin}/capsule/${token}`;

    try {
      await navigator.clipboard.writeText(url);

      // Show toast notification
      setShowToast(true);
      setTimeout(() => setShowToast(false), 2000);

      // Change button text temporarily
      const button = event.currentTarget;
      const originalHTML = button.innerHTML;
      button.innerHTML = '<span class="btn-icon">✅</span> Copied!';
      button.classList.add("copied");

      setTimeout(() => {
        button.innerHTML = originalHTML;
        button.classList.remove("copied");
      }, 2000);
    } catch (err) {
      // Fallback for browsers that don't support clipboard API
      const textArea = document.createElement("textarea");
      textArea.value = url;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);

      // Show toast for fallback too
      setShowToast(true);
      setTimeout(() => setShowToast(false), 2000);

      alert("Capsule link copied to clipboard!");
    }
  }

  function formatDisplayTime(rawDate, rawTime) {
    if (!rawDate) return "No date set";

    // Check if rawDate is ISO format
    let dateStr = rawDate;
    if (rawDate.includes("T")) {
      dateStr = rawDate.split("T")[0];
    }

    if (!rawTime) return dateStr;

    // Convert 24-hour time to 12-hour format for display
    let timeStr = String(rawTime).trim();
    if (/^\d{1,2}:\d{2}:\d{2}$/.test(timeStr)) {
      const [hours, minutes] = timeStr.split(":");
      let h = parseInt(hours);
      const ampm = h >= 12 ? "PM" : "AM";
      h = h % 12 || 12;
      return `${dateStr} • ${h}:${minutes} ${ampm}`;
    }

    return `${dateStr} • ${timeStr}`;
  }

  function formatTimeRemaining(timeLeft) {
    if (!timeLeft || timeLeft.isPast) {
      return "Ready to unlock!";
    }
    if (timeLeft.days > 0) {
      return `${timeLeft.days}d ${timeLeft.hours}h ${timeLeft.minutes}m remaining`;
    } else if (timeLeft.hours > 0) {
      return `${timeLeft.hours}h ${timeLeft.minutes}m ${timeLeft.seconds}s remaining`;
    } else {
      return `${timeLeft.minutes}m ${timeLeft.seconds}s remaining`;
    }
  }

  // FIXED CAPSULE OPENING LOGIC
  function handleOpenCapsule(capsule) {
    const status = computeCapsuleStatus(capsule);

    if (status === "UNLOCKED") {
      // Capsule is unlocked - open directly (no key needed again)
      navigate(`/capsule/opened`, {
        state: {
          capsuleData: capsule,
          capsuleId: capsule.id,
          from: "dashboard",
        },
      });
      return;
    }

    if (status === "READY") {
      // Time is up but not unlocked - go to unlock page (ask for key ONCE)
      navigate(`/unlock-capsule/${capsule.share_token}`);
      return;
    }

    // ACTIVE - still counting down
    const timeLeft =
      timeLeftMap[capsule.id] ||
      computeTimeLeft(
        buildUnlockDateTime(capsule.unlock_date, capsule.unlock_time)
      );

    navigate(`/capsule-details/${capsule.id}`, {
      state: {
        capsuleData: capsule,
        timeLeft,
        showCountdown: true,
      },
    });
  }

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="loading-spinner"></div>
        <h2>Loading Your Capsules...</h2>
      </div>
    );
  }

  // Determine which list to render based on active tab
  let displayCapsules = [];
  switch (activeTab) {
    case "active":
      displayCapsules = activeCapsules;
      break;
    case "ready":
      displayCapsules = readyCapsules;
      break;
    case "unlocked":
      displayCapsules = unlockedCapsules;
      break;
    default:
      displayCapsules = activeCapsules;
  }

  return (
    <div className="dashboard-container">
      {/* Toast Notification for Share */}
      {showToast && (
        <div className="share-toast">
          <span className="btn-icon">✅</span>
          <span>Link copied to clipboard!</span>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {showDeleteModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Delete Capsule</h3>
              <button
                className="modal-close"
                onClick={() => {
                  setShowDeleteModal(false);
                  setCapsuleToDelete(null);
                }}
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <p>
                Are you sure you want to delete "
                <strong>{capsuleToDelete?.title}</strong>"?
              </p>
              <p className="modal-warning">
                ⚠️ This action cannot be undone. All contents will be
                permanently deleted.
              </p>
            </div>
            <div className="modal-actions">
              <button
                className="modal-cancel"
                onClick={() => {
                  setShowDeleteModal(false);
                  setCapsuleToDelete(null);
                }}
              >
                Cancel
              </button>
              <button className="modal-delete" onClick={deleteCapsule}>
                Delete Permanently
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="dashboard-content">
        {/* HEADER */}
        <div className="dashboard-header">
          <div className="header-content">
            <h1 className="dashboard-title">Your SoulBox</h1>
            <p className="dashboard-subtitle">Manage your time-locked memories</p>
          </div>

          <button className="create-btn" onClick={() => navigate("/create")}>
            <span className="btn-icon">+</span>
            Create Capsule
          </button>
        </div>

        {/* COUNTERS */}
        <div className="counters-grid">
          <div className="counter-card">
            <div className="counter-icon">🔒</div>
            <div className="counter-number">{activeCapsules.length}</div>
            <div className="counter-label">Active</div>
            <div className="counter-description">Counting down</div>
          </div>
          <div className="counter-card">
            <div className="counter-icon">⏰</div>
            <div className="counter-number">{readyCapsules.length}</div>
            <div className="counter-label">Ready</div>
            <div className="counter-description">Awaiting unlock</div>
          </div>
          <div className="counter-card">
            <div className="counter-icon">🎉</div>
            <div className="counter-number">{unlockedCapsules.length}</div>
            <div className="counter-label">Unlocked</div>
            <div className="counter-description">Ready to view</div>
          </div>
        </div>

        {/* TABS */}
        <div className="tabs-container">
          <button
            className={`tab ${activeTab === "active" ? "tab-active" : ""}`}
            onClick={() => setActiveTab("active")}
          >
            <span className="tab-icon">🔒</span>
            Active
            <span className="tab-count">({activeCapsules.length})</span>
          </button>

          <button
            className={`tab ${activeTab === "ready" ? "tab-active" : ""}`}
            onClick={() => setActiveTab("ready")}
          >
            <span className="tab-icon">⏰</span>
            Ready
            <span className="tab-count">({readyCapsules.length})</span>
          </button>

          <button
            className={`tab ${activeTab === "unlocked" ? "tab-active" : ""}`}
            onClick={() => setActiveTab("unlocked")}
          >
            <span className="tab-icon">🎉</span>
            Unlocked
            <span className="tab-count">({unlockedCapsules.length})</span>
          </button>
        </div>

        {/* CAPSULES GRID */}
        <div className="capsules-grid">
          {displayCapsules.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">
                {activeTab === "active"
                  ? "🔒"
                  : activeTab === "ready"
                  ? "⏰"
                  : "🎉"}
              </div>
              <h3>
                {activeTab === "active"
                  ? "No Active Capsules"
                  : activeTab === "ready"
                  ? "No Ready Capsules"
                  : "No Unlocked Capsules"}
              </h3>
              <p>
                {activeTab === "active"
                  ? "Capsules that are still counting down will appear here"
                  : activeTab === "ready"
                  ? "Capsules ready for unlocking will appear here"
                  : "Unlocked capsules will appear here"}
              </p>
              {activeTab === "active" && (
                <button
                  className="create-first-btn"
                  onClick={() => navigate("/create")}
                >
                  Create Your First Capsule
                </button>
              )}
            </div>
          ) : (
            <div className="grid-container">
              {displayCapsules.map((capsule) => {
                const timeLeft =
                  timeLeftMap[capsule.id] || {
                    days: 0,
                    hours: 0,
                    minutes: 0,
                    seconds: 0,
                    isPast: true,
                  };

                const status = computeCapsuleStatus(capsule);
                const isUnlocked = status === "UNLOCKED";
                const isReady = status === "READY";
                const isActive = status === "ACTIVE";

                return (
                  <div
                    key={capsule.id}
                    className={`capsule-card ${
                      isUnlocked ? "unlocked" : ""
                    } ${isReady ? "ready" : ""} ${
                      isActive ? "active" : ""
                    }`}
                  >
                    <div className="capsule-header">
                      <h3 className="capsule-title">{capsule.title}</h3>
                      <div className="capsule-status">
                        {isUnlocked && (
                          <span className="status-badge unlocked">
                            🎉 Unlocked
                          </span>
                        )}
                        {isReady && !isUnlocked && (
                          <span className="status-badge ready">
                            ⏰ Ready to Unlock
                          </span>
                        )}
                        {isActive && !isUnlocked && (
                          <span className="status-badge locked">
                            🔒 Locked
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="capsule-date">
                      {formatDisplayTime(
                        capsule.unlock_date,
                        capsule.unlock_time
                      )}
                    </div>

                    {/* COUNTDOWN - Show for active capsules */}
                    {isActive && !timeLeft.isPast && (
                      <div className="countdown-section">
                        <div className="countdown-grid">
                          <div className="countdown-item">
                            <div className="countdown-number">
                              {String(timeLeft.days).padStart(2, "0")}
                            </div>
                            <div className="countdown-label">Days</div>
                          </div>
                          <div className="countdown-separator">:</div>
                          <div className="countdown-item">
                            <div className="countdown-number">
                              {String(timeLeft.hours).padStart(2, "0")}
                            </div>
                            <div className="countdown-label">Hours</div>
                          </div>
                          <div className="countdown-separator">:</div>
                          <div className="countdown-item">
                            <div className="countdown-number">
                              {String(timeLeft.minutes).padStart(2, "0")}
                            </div>
                            <div className="countdown-label">Minutes</div>
                          </div>
                          <div className="countdown-separator">:</div>
                          <div className="countdown-item">
                            <div className="countdown-number">
                              {String(timeLeft.seconds).padStart(2, "0")}
                            </div>
                            <div className="countdown-label">Seconds</div>
                          </div>
                        </div>
                        <div className="time-remaining">
                          {formatTimeRemaining(timeLeft)}
                        </div>
                      </div>
                    )}

                    {/* READY MESSAGE */}
                    {isReady && !isUnlocked && (
                      <div className="ready-message">
                        <div className="ready-icon">⏰</div>
                        <p>
                          Time&apos;s up! Enter your code to unlock this
                          capsule.
                        </p>
                      </div>
                    )}

                    {/* UNLOCKED MESSAGE */}
                    {isUnlocked && (
                      <div className="unlocked-message">
                        <div className="unlocked-icon">🎉</div>
                        <p>This capsule has been unlocked and is ready to view!</p>
                      </div>
                    )}

                    {/* ACTIONS */}
                    <div className="capsule-actions">
                      <button
                        className={`btn-view ${
                          isUnlocked
                            ? "btn-unlocked"
                            : isReady
                            ? "btn-ready"
                            : "btn-active"
                        }`}
                        onClick={() => handleOpenCapsule(capsule)}
                      >
                        <span className="btn-icon">
                          {isUnlocked ? "🔓" : isReady ? "🔑" : "👁️"}
                        </span>
                        {isUnlocked
                          ? "Open"
                          : isReady
                          ? "Unlock"
                          : "View Details"}
                      </button>

                      <button
                        className="btn-share"
                        onClick={(e) => shareCapsule(capsule.share_token, e)}
                      >
                        <span className="btn-icon">📤</span>
                        Share
                      </button>

                      {isUnlocked && (
                        <button
                          className="btn-certificate"
                          onClick={() =>
                            navigate(`/certificate/${capsule.id}`)
                          }
                        >
                          <span className="btn-icon">📜</span>
                          Certificate
                        </button>
                      )}

                      <button
                        className="btn-delete"
                        onClick={() => confirmDeleteCapsule(capsule)}
                      >
                        <span className="btn-icon">🗑️</span>
                        Delete
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
