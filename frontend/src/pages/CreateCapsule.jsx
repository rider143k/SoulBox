import { useState } from "react";
import api from "../utils/api";
import { useNavigate } from "react-router-dom";

export default function CreateCapsule() {
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [unlockDate, setUnlockDate] = useState("");
  const [hour, setHour] = useState("");
  const [minute, setMinute] = useState("");
  const [ampm, setAmpm] = useState("AM");
  const [recipientEmail, setRecipientEmail] = useState("");
  const [repeatDays, setRepeatDays] = useState("");
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [successData, setSuccessData] = useState(null);
  const [fileName, setFileName] = useState("");

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);
    setFileName(selectedFile ? selectedFile.name : "");
  };

  async function handleSubmit(e) {
    e.preventDefault();

    if (!title || !message || !unlockDate || !hour || !minute) {
      alert("Please fill all required fields");
      return;
    }

    // Validate future date
    const selectedDateTime = new Date(`${unlockDate} ${hour}:${minute} ${ampm}`);
    if (selectedDateTime <= new Date()) {
      alert("Please select a future date and time");
      return;
    }

    const finalUnlockTime = `${hour.padStart(2, '0')}:${minute.padStart(2, '0')} ${ampm}`;
    setLoading(true);

    try {
      const token = localStorage.getItem("token");
      const formData = new FormData();
      
      formData.append("title", title);
      formData.append("message", message);
      formData.append("unlock_date", unlockDate);
      formData.append("unlock_time", finalUnlockTime);
      formData.append("recipient_email", recipientEmail);
      formData.append("repeat_days", repeatDays);
      if (file) formData.append("file", file);

      const res = await api.post("/capsule/create", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      setSuccessData({
        capsuleId: res.data.capsuleId,
        encryptKey: res.data.encrypt_key,
        shareToken: res.data.share_token,
      });

    } catch (err) {
      console.error(err);
      alert("Error creating capsule");
    }

    setLoading(false);
  }

  // SUCCESS UI
  if (successData) {
    return (
      <div style={styles.successContainer}>
        <div style={styles.successCard}>
          <div style={styles.successIcon}>🎉</div>
          <h2 style={styles.successTitle}>Time Capsule Created Successfully!</h2>
          <p style={styles.successMessage}>
            Your memories are now safely stored and will unlock at the scheduled time.
          </p>

          <div style={styles.successDetails}>
            <div style={styles.detailItem}>
              <span style={styles.detailLabel}>Capsule ID:</span>
              <span style={styles.detailValue}>{successData.capsuleId}</span>
            </div>
            <div style={styles.detailItem}>
              <span style={styles.detailLabel}>Encryption Key:</span>
              <span style={styles.detailValue}>{successData.encryptKey}</span>
            </div>
          </div>

          <div style={styles.shareSection}>
            <label style={styles.shareLabel}>Shareable Link:</label>
            <div style={styles.linkContainer}>
              <code style={styles.linkBox}>
                {window.location.origin}/capsule/{successData.shareToken}
              </code>
              <button 
                style={styles.copyBtn}
                onClick={() => navigator.clipboard.writeText(`${window.location.origin}/capsule/${successData.shareToken}`)}
              >
                📋
              </button>
            </div>
          </div>

          <div style={styles.successActions}>
            <button 
              style={styles.primaryAction}
              onClick={() => navigate("/dashboard")}
            >
              🏠 Go to Dashboard
            </button>
            <button 
              style={styles.secondaryAction}
              onClick={() => setSuccessData(null)}
            >
              ➕ Create Another
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div style={styles.headerIcon}>⏳</div>
        <h1 style={styles.title}>Create Time Capsule</h1>
        <p style={styles.subtitle}>
          Preserve your memories for the future. Set a date and time for your capsule to unlock.
        </p>
      </div>

      <form onSubmit={handleSubmit} style={styles.form}>
        {/* Capsule Title */}
        <div style={styles.inputGroup}>
          <label style={styles.label}>
            Capsule Title *
            <span style={styles.required}> *</span>
          </label>
          <input
            type="text"
            placeholder="Give your capsule a meaningful title..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            style={styles.input}
            maxLength={100}
          />
          <div style={styles.charCount}>{title.length}/100</div>
        </div>

        {/* Message */}
        <div style={styles.inputGroup}>
          <label style={styles.label}>
            Your Message *
            <span style={styles.required}> *</span>
          </label>
          <textarea
            placeholder="Write your heartfelt message for the future..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            style={styles.textarea}
            rows={6}
            maxLength={1000}
          />
          <div style={styles.charCount}>{message.length}/1000</div>
        </div>

        {/* Date & Time */}
        <div style={styles.row}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>
              Unlock Date *
              <span style={styles.required}> *</span>
            </label>
            <input
              type="date"
              value={unlockDate}
              onChange={(e) => setUnlockDate(e.target.value)}
              style={styles.input}
              min={new Date().toISOString().split('T')[0]}
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>
              Unlock Time *
              <span style={styles.required}> *</span>
            </label>
            <div style={styles.timeInputs}>
              <input
                type="number"
                min="1"
                max="12"
                placeholder="HH"
                value={hour}
                onChange={(e) => {
                  let v = e.target.value;
                  if (v > 12) v = 12;
                  if (v < 1) v = "";
                  setHour(v);
                }}
                style={styles.timeInput}
                required
              />
              <span style={styles.timeSeparator}>:</span>
              <input
                type="number"
                min="0"
                max="59"
                placeholder="MM"
                value={minute}
                onChange={(e) => {
                  let v = e.target.value;
                  if (v > 59) v = 59;
                  if (v < 0) v = "";
                  setMinute(v);
                }}
                style={styles.timeInput}
                required
              />
              <select
                value={ampm}
                onChange={(e) => setAmpm(e.target.value)}
                style={styles.ampmSelect}
              >
                <option value="AM">AM</option>
                <option value="PM">PM</option>
              </select>
            </div>
          </div>
        </div>

        {/* File Upload */}
        <div style={styles.inputGroup}>
          <label style={styles.label}>
            Add Media (Optional)
          </label>
          <div 
            style={styles.fileUploadArea}
            onClick={() => document.getElementById('file-input').click()}
          >
            <input
              id="file-input"
              type="file"
              accept="image/*,video/*"
              onChange={handleFileChange}
              style={styles.fileInput}
            />
            <div style={styles.fileUploadContent}>
              <div style={styles.uploadIcon}>📁</div>
              <div style={styles.uploadText}>
                {fileName ? fileName : "Click to upload image or video"}
              </div>
              <div style={styles.uploadSubtext}>
                Supports JPG, PNG, MP4, MOV (Max 50MB)
              </div>
            </div>
          </div>
        </div>

        {/* Recipient Email */}
        <div style={styles.inputGroup}>
          <label style={styles.label}>Send to Recipient (Optional)</label>
          <input
            type="email"
            placeholder="Enter recipient's email address..."
            value={recipientEmail}
            onChange={(e) => setRecipientEmail(e.target.value)}
            style={styles.input}
          />
          <div style={styles.helperText}>
            Leave empty if this capsule is for yourself
          </div>
        </div>

        {/* Repeat Reminder */}
        <div style={styles.inputGroup}>
          <label style={styles.label}>Repeat Reminder (Optional)</label>
          <div style={styles.reminderInput}>
            <input
              type="number"
              min="1"
              max="365"
              placeholder="e.g., 30"
              value={repeatDays}
              onChange={(e) => setRepeatDays(e.target.value)}
              style={styles.reminderField}
            />
            <span style={styles.reminderText}>days after unlock</span>
          </div>
          <div style={styles.helperText}>
            Send reminder emails after the capsule unlocks
          </div>
        </div>

        {/* Submit Button */}
        <button 
          style={loading ? styles.submitBtnLoading : styles.submitBtn}
          type="submit" 
          disabled={loading}
        >
          {loading ? (
            <>
              <div style={styles.spinner}></div>
              Creating Your Capsule...
            </>
          ) : (
            <>
              <span style={styles.btnIcon}>✨</span>
              Create Time Capsule
            </>
          )}
        </button>
      </form>
    </div>
  );
}

const styles = {
  container: {
    minHeight: "100vh",
    background: "linear-gradient(135deg, #0a0a12 0%, #1a1a2e 50%, #16213e 100%)",
    padding: "20px",
    margin: 0,
  },
  header: {
    textAlign: "center",
    marginBottom: "40px",
    padding: "40px 20px 20px",
  },
  headerIcon: {
    fontSize: "48px",
    marginBottom: "16px",
    filter: "drop-shadow(0 0 20px rgba(255, 215, 0, 0.6))",
  },
  title: {
    fontSize: "clamp(32px, 4vw, 48px)",
    fontWeight: "800",
    background: "linear-gradient(135deg, #ffd700 0%, #a8a8ff 100%)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    backgroundClip: "text",
    marginBottom: "16px",
  },
  subtitle: {
    fontSize: "18px",
    color: "#a8a8ff",
    opacity: 0.8,
    maxWidth: "500px",
    margin: "0 auto",
    lineHeight: "1.5",
  },
  form: {
    maxWidth: "800px",
    margin: "0 auto",
    background: "rgba(255, 255, 255, 0.02)",
    backdropFilter: "blur(10px)",
    padding: "40px",
    borderRadius: "20px",
    border: "1px solid rgba(255, 255, 255, 0.1)",
    boxShadow: "0 20px 40px rgba(0, 0, 0, 0.3)",
  },
  inputGroup: {
    marginBottom: "30px",
  },
  label: {
    display: "block",
    fontSize: "14px",
    fontWeight: "600",
    color: "#ffd700",
    marginBottom: "8px",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },
  required: {
    color: "#ff4d6d",
  },
  input: {
    width: "100%",
    padding: "16px",
    background: "rgba(255, 255, 255, 0.05)",
    border: "1px solid rgba(255, 255, 255, 0.1)",
    borderRadius: "12px",
    color: "#e6e6ff",
    fontSize: "16px",
    transition: "all 0.3s ease",
    outline: "none",
  },
  textarea: {
    width: "100%",
    padding: "16px",
    background: "rgba(255, 255, 255, 0.05)",
    border: "1px solid rgba(255, 255, 255, 0.1)",
    borderRadius: "12px",
    color: "#e6e6ff",
    fontSize: "16px",
    transition: "all 0.3s ease",
    outline: "none",
    resize: "vertical",
    fontFamily: "inherit",
  },
  row: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "20px",
  },
  timeInputs: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },
  timeInput: {
    flex: 1,
    padding: "16px",
    background: "rgba(255, 255, 255, 0.05)",
    border: "1px solid rgba(255, 255, 255, 0.1)",
    borderRadius: "12px",
    color: "#e6e6ff",
    fontSize: "16px",
    textAlign: "center",
    outline: "none",
  },
  timeSeparator: {
    color: "#a8a8ff",
    fontSize: "18px",
    fontWeight: "bold",
  },
  ampmSelect: {
    padding: "16px",
    background: "rgba(255, 255, 255, 0.05)",
    border: "1px solid rgba(255, 255, 255, 0.1)",
    borderRadius: "12px",
    color: "#e6e6ff",
    fontSize: "16px",
    outline: "none",
    cursor: "pointer",
  },
  fileUploadArea: {
    border: "2px dashed rgba(168, 168, 255, 0.3)",
    borderRadius: "12px",
    padding: "40px 20px",
    textAlign: "center",
    cursor: "pointer",
    transition: "all 0.3s ease",
    background: "rgba(255, 255, 255, 0.02)",
  },
  fileInput: {
    display: "none",
  },
  fileUploadContent: {
    color: "#a8a8ff",
  },
  uploadIcon: {
    fontSize: "32px",
    marginBottom: "12px",
    opacity: 0.7,
  },
  uploadText: {
    fontSize: "16px",
    fontWeight: "600",
    marginBottom: "8px",
  },
  uploadSubtext: {
    fontSize: "12px",
    opacity: 0.6,
  },
  reminderInput: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },
  reminderField: {
    flex: "0 0 100px",
    padding: "16px",
    background: "rgba(255, 255, 255, 0.05)",
    border: "1px solid rgba(255, 255, 255, 0.1)",
    borderRadius: "12px",
    color: "#e6e6ff",
    fontSize: "16px",
    outline: "none",
  },
  reminderText: {
    color: "#a8a8ff",
    fontSize: "14px",
    opacity: 0.8,
  },
  helperText: {
    fontSize: "12px",
    color: "#a8a8ff",
    opacity: 0.6,
    marginTop: "6px",
  },
  charCount: {
    fontSize: "12px",
    color: "#a8a8ff",
    opacity: 0.6,
    textAlign: "right",
    marginTop: "4px",
  },
  submitBtn: {
    width: "100%",
    padding: "20px",
    background: "linear-gradient(135deg, #ffd700 0%, #ffed4e 100%)",
    color: "#0a0a12",
    border: "none",
    borderRadius: "12px",
    fontSize: "18px",
    fontWeight: "700",
    cursor: "pointer",
    transition: "all 0.3s ease",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "10px",
    boxShadow: "0 8px 25px rgba(255, 215, 0, 0.3)",
  },
  submitBtnLoading: {
    width: "100%",
    padding: "20px",
    background: "rgba(255, 215, 0, 0.5)",
    color: "#0a0a12",
    border: "none",
    borderRadius: "12px",
    fontSize: "18px",
    fontWeight: "700",
    cursor: "not-allowed",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "10px",
  },
  btnIcon: {
    fontSize: "20px",
  },
  spinner: {
    width: "20px",
    height: "20px",
    border: "2px solid transparent",
    borderTop: "2px solid #0a0a12",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
  },
  // Success Styles
  successContainer: {
    minHeight: "100vh",
    background: "linear-gradient(135deg, #0a0a12 0%, #1a1a2e 50%, #16213e 100%)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "20px",
    margin: 0,
  },
  successCard: {
    background: "rgba(255, 255, 255, 0.02)",
    backdropFilter: "blur(20px)",
    padding: "50px",
    borderRadius: "20px",
    border: "1px solid rgba(255, 255, 255, 0.1)",
    textAlign: "center",
    maxWidth: "600px",
    width: "100%",
    boxShadow: "0 20px 40px rgba(0, 0, 0, 0.3)",
  },
  successIcon: {
    fontSize: "64px",
    marginBottom: "20px",
    filter: "drop-shadow(0 0 20px rgba(255, 215, 0, 0.6))",
  },
  successTitle: {
    fontSize: "32px",
    fontWeight: "700",
    color: "#ffd700",
    marginBottom: "16px",
  },
  successMessage: {
    fontSize: "16px",
    color: "#a8a8ff",
    lineHeight: "1.6",
    marginBottom: "30px",
  },
  successDetails: {
    background: "rgba(255, 255, 255, 0.05)",
    padding: "20px",
    borderRadius: "12px",
    marginBottom: "30px",
    textAlign: "left",
  },
  detailItem: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "12px",
  },
  detailLabel: {
    color: "#a8a8ff",
    fontWeight: "600",
    fontSize: "14px",
  },
  detailValue: {
    color: "#ffd700",
    fontWeight: "600",
    fontSize: "14px",
    wordBreak: "break-all",
  },
  shareSection: {
    marginBottom: "30px",
  },
  shareLabel: {
    display: "block",
    color: "#a8a8ff",
    fontWeight: "600",
    marginBottom: "8px",
    textAlign: "left",
  },
  linkContainer: {
    display: "flex",
    gap: "10px",
    alignItems: "center",
  },
  linkBox: {
    flex: 1,
    background: "rgba(255, 255, 255, 0.05)",
    padding: "12px 16px",
    borderRadius: "8px",
    color: "#e6e6ff",
    fontSize: "14px",
    wordBreak: "break-all",
    border: "1px solid rgba(255, 255, 255, 0.1)",
  },
  copyBtn: {
    background: "rgba(255, 215, 0, 0.1)",
    border: "1px solid rgba(255, 215, 0, 0.3)",
    color: "#ffd700",
    padding: "12px",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "16px",
    transition: "all 0.3s ease",
  },
  successActions: {
    display: "flex",
    gap: "16px",
    justifyContent: "center",
  },
  primaryAction: {
    padding: "16px 24px",
    background: "linear-gradient(135deg, #ffd700 0%, #ffed4e 100%)",
    color: "#0a0a12",
    border: "none",
    borderRadius: "12px",
    fontSize: "16px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.3s ease",
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  secondaryAction: {
    padding: "16px 24px",
    background: "rgba(255, 255, 255, 0.05)",
    color: "#e6e6ff",
    border: "1px solid rgba(255, 255, 255, 0.2)",
    borderRadius: "12px",
    fontSize: "16px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.3s ease",
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
};

// Add global styles for animations
const globalStyles = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }

  input:focus, textarea:focus, select:focus {
    border-color: rgba(255, 215, 0, 0.5) !important;
    box-shadow: 0 0 0 2px rgba(255, 215, 0, 0.1) !important;
  }

  .file-upload-area:hover {
    border-color: rgba(255, 215, 0, 0.5) !important;
    background: rgba(255, 215, 0, 0.05) !important;
  }

  .submit-btn:hover {
    transform: translateY(-2px) !important;
    box-shadow: 0 12px 30px rgba(255, 215, 0, 0.4) !important;
  }

  .copy-btn:hover {
    background: rgba(255, 215, 0, 0.2) !important;
    transform: scale(1.05) !important;
  }

  .primary-action:hover {
    transform: translateY(-2px) !important;
    box-shadow: 0 8px 20px rgba(255, 215, 0, 0.4) !important;
  }

  .secondary-action:hover {
    background: rgba(255, 255, 255, 0.1) !important;
    border-color: rgba(255, 215, 0, 0.3) !important;
    transform: translateY(-1px) !important;
  }

  @media (max-width: 768px) {
    .row {
      grid-template-columns: 1fr !important;
    }
    
    .form {
      padding: 30px 20px !important;
    }
    
    .success-actions {
      flex-direction: column !important;
    }
    
    .link-container {
      flex-direction: column !important;
    }
  }
`;

// Inject global styles
if (typeof document !== 'undefined') {
  const styleElement = document.createElement('style');
  styleElement.innerHTML = globalStyles;
  document.head.appendChild(styleElement);
}