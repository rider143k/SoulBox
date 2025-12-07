import { useEffect, useState } from "react";
import api from "../utils/api";
import { useNavigate } from "react-router-dom";
import './Timeline.css';

export default function Timeline() {
  const [capsules, setCapsules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCapsule, setSelectedCapsule] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    async function load() {
      try {
        const token = localStorage.getItem("token");
        const res = await api.get("/capsule/my", {
          headers: { Authorization: `Bearer ${token}` }
        });

        // Sort capsules by unlock date
        const sorted = res.data.sort((a, b) =>
          new Date(a.unlock_date + " " + a.unlock_time) -
          new Date(b.unlock_date + " " + b.unlock_time)
        );

        setCapsules(sorted);
      } catch (err) {
        console.error(err);
      }
      setLoading(false);
    }

    load();
  }, []);

  const getStatus = (capsule) => {
    const unlockAt = new Date(capsule.unlock_date + " " + capsule.unlock_time);
    if (capsule.is_unlocked === 1) return "unlocked";
    if (new Date() >= unlockAt) return "ready";
    return "locked";
  };

  const handleCapsuleClick = (capsule) => {
    setSelectedCapsule({
      ...capsule,
      status: getStatus(capsule)
    });
    setShowModal(true);
  };

  const handleOpenCapsule = () => {
  if (!selectedCapsule) return;

  const status = selectedCapsule.status;

  if (status === "unlocked") {
    navigate("/capsule/opened", {
      state: {
        capsuleData: selectedCapsule,
        capsuleId: selectedCapsule.id,
        from: "timeline"
      }
    });
  } 
  else if (status === "ready") {
    navigate(`/unlock-capsule/${selectedCapsule.share_token}`);
  }
};


  const closeModal = () => {
  setShowModal(false);
  setSelectedCapsule(null);
  navigate("/timeline");  // Fixes back navigation
};


  if (loading) {
    return (
      <div className="timeline-loading">
        <div className="loading-spinner"></div>
        <h2>Loading Your Timeline...</h2>
      </div>
    );
  }

  return (
    <div className="timeline-container">
      {/* Header Section */}
      <div className="timeline-header">
        <h1 className="timeline-title">Your Memory Timeline</h1>
        <p className="timeline-subtitle">
          A journey through time with your locked and unlocked memories
        </p>
      </div>

      {/* Timeline Section */}
      <div className="timeline-wrapper">
        <div className="timeline">
          {capsules.map((capsule, index) => {
            const status = getStatus(capsule);
            
            return (
              <div key={capsule.id} className="capsule-wrapper">
                {/* Date Badge */}
                <div className={`date-badge status-${status}`}>
                  {new Date(capsule.unlock_date).toLocaleDateString("en-US", {
                    month: "short", 
                    day: "2-digit"
                  })}
                </div>

                {/* Capsule Card */}
                <div 
                  className={`capsule-card status-${status}`}
                  onClick={() => handleCapsuleClick(capsule)}
                >
                  <div className="capsule-header">
                    <h3 className="capsule-title">{capsule.title}</h3>
                    <div className={`status-indicator status-${status}`}>
                      {status === "unlocked" && "🎉"}
                      {status === "ready" && "🔥"}
                      {status === "locked" && "🔒"}
                    </div>
                  </div>
                  
                  <div className="capsule-time">
                    {formatTime(capsule.unlock_time)} IST
                  </div>

                  <div className="capsule-status">
                    {status === "unlocked" && "Unlocked!"}
                    {status === "ready" && "Ready to Open!"}
                    {status === "locked" && "Locked"}
                  </div>

                  <div className="capsule-preview">
                    {capsule.message && capsule.message.substring(0, 30)}...
                  </div>
                </div>

                {/* Connection Line */}
                {index < capsules.length - 1 && (
                  <div className="timeline-connector"></div>
                )}
              </div>
            );
          })}

          {/* Empty State */}
          {capsules.length === 0 && (
            <div className="empty-timeline">
              <div className="empty-icon">⏳</div>
              <h3>No Capsules Yet</h3>
              <p>Create your first time capsule to start your memory journey</p>
              <button 
                className="create-first-btn"
                onClick={() => navigate("/create")}
              >
                Create Your First Capsule
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Capsule Details Modal */}
      {showModal && selectedCapsule && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={closeModal}>×</button>
            
            <div className="modal-header">
              <div className={`modal-status-badge status-${selectedCapsule.status}`}>
                {selectedCapsule.status === "unlocked" && "🎉 Unlocked"}
                {selectedCapsule.status === "ready" && "🔥 Ready"}
                {selectedCapsule.status === "locked" && "🔒 Locked"}
              </div>
              <h2 className="modal-title">{selectedCapsule.title}</h2>
            </div>

            <div className="modal-body">
              <div className="capsule-details-grid">
                <div className="detail-item">
                  <label>Unlock Date</label>
                  <span>{new Date(selectedCapsule.unlock_date).toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}</span>
                </div>
                
                <div className="detail-item">
                  <label>Unlock Time</label>
                  <span>{formatTime(selectedCapsule.unlock_time)} IST</span>
                </div>
                
                <div className="detail-item">
                  <label>Created On</label>
                  <span>{new Date(selectedCapsule.created_at).toLocaleDateString()}</span>
                </div>
                
                <div className="detail-item">
                  <label>Status</label>
                  <span className={`status-text status-${selectedCapsule.status}`}>
                    {selectedCapsule.status.charAt(0).toUpperCase() + selectedCapsule.status.slice(1)}
                  </span>
                </div>
              </div>

              {selectedCapsule.message && (
                <div className="capsule-message">
                  <label>Message Preview</label>
                  <div className="message-preview">
                    {selectedCapsule.message}
                  </div>
                </div>
              )}

              <div className="modal-actions">
                {selectedCapsule.status === "ready" || selectedCapsule.status === "unlocked" ? (
                  <button className="btn-primary" onClick={handleOpenCapsule}>
                    <span className="btn-icon">🎁</span>
                    Open Capsule
                  </button>
                ) : (
                  <button className="btn-secondary" disabled>
                    <span className="btn-icon">🔒</span>
                    Available {new Date(selectedCapsule.unlock_date + ' ' + selectedCapsule.unlock_time).toLocaleString()}
                  </button>
                )}
                
                <button className="btn-outline" onClick={closeModal}>
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
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
      hour12: true
    });
  } catch {
    return timeString;
  }
}