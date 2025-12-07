import { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import api from "../utils/api";
import "./CertificatePage.css";
import { FaDownload, FaSpinner, FaCertificate, FaCalendarAlt, FaEnvelope, FaHeart, FaStar, FaQuoteLeft, FaQuoteRight } from "react-icons/fa";

export default function CertificatePage() {
  const { id } = useParams();
  const [capsule, setCapsule] = useState(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const certificateRef = useRef(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await api.get(`/capsule/view/byId/${id}`);
        setCapsule(res.data);
      } catch (e) {
        alert("Failed to load certificate");
      }
      setLoading(false);
    }
    load();
  }, [id]);

  const downloadCertificate = async () => {
    setDownloading(true);
    try {
      const apiBase = process.env.REACT_APP_API_URL || "http://localhost:5000/api";
      window.location.href = `${apiBase}/certificate/download/${id}`;
    } catch (error) {
      alert("Failed to download certificate");
    } finally {
      setDownloading(false);
    }
  };

  if (loading) {
    return (
      <div className="certificate-loading">
        <div className="loading-spinner">
          <FaSpinner className="spinner-icon" />
        </div>
        <h2>Loading Your Memory Certificate...</h2>
        <p>Preparing your special moment...</p>
      </div>
    );
  }

  if (!capsule) {
    return (
      <div className="certificate-error">
        <FaCertificate className="error-icon" />
        <h2>Certificate Not Found</h2>
        <p>The requested memory certificate could not be loaded.</p>
        <button className="back-btn" onClick={() => window.history.back()}>
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="certificate-page">
      {/* Animated Background Elements */}
      <div className="cert-background">
        <div className="cert-particle particle-1"></div>
        <div className="cert-particle particle-2"></div>
        <div className="cert-particle particle-3"></div>
        <div className="cert-glow glow-1"></div>
        <div className="cert-glow glow-2"></div>
      </div>

      <div className="cert-container">
        <div className="cert-header">
          <div className="cert-badge">
            <FaCertificate className="badge-icon" />
            <span>Official Certificate</span>
          </div>
          
          
          
        </div>

        <div className="cert-wrapper" ref={certificateRef} id="cert-print-area">
          <div className="cert-border">
            {/* Decorative Corner Elements */}
            <div className="corner corner-tl"></div>
            <div className="corner corner-tr"></div>
            <div className="corner corner-bl"></div>
            <div className="corner corner-br"></div>
            
            {/* Seal Element */}
            <div className="cert-seal">
              <FaHeart className="seal-icon" />
              <span>Sealed</span>
            </div>

            {/* Certificate Content */}
            <div className="cert-content">
              <div className="cert-header-section">
                <h1 className="cert-title">
                  <FaStar className="title-star star-left" />
                  Certificate of Memory
                  <FaStar className="title-star star-right" />
                </h1>
                <div className="cert-divider">
                  <div className="divider-line"></div>
                  <div className="divider-ornament">✦</div>
                  <div className="divider-line"></div>
                </div>
              </div>

              <p className="cert-intro">
                <FaQuoteLeft className="quote-icon" />
                This certifies the preservation of a cherished memory
                <FaQuoteRight className="quote-icon" />
              </p>

              <div className="cert-memory-section">
                <div className="memory-label">Memory Title</div>
                <h2 className="cert-memory-name">"{capsule.title}"</h2>
                <div className="memory-subtitle">A timeless treasure preserved in SoulBox</div>
              </div>

              <div className="cert-dates">
                <div className="date-card">
                  <div className="date-header">
                    <FaCalendarAlt className="date-icon" />
                    <h3>Created On</h3>
                  </div>
                  <div className="date-content">
                    <p className="date-main">{new Date(capsule.created_at).toLocaleDateString('en-US', { 
                      weekday: 'long',
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}</p>
                    <p className="date-time">{new Date(capsule.created_at).toLocaleTimeString()}</p>
                  </div>
                </div>

                <div className="date-connector">→</div>

                <div className="date-card">
                  <div className="date-header">
                    <FaCalendarAlt className="date-icon" />
                    <h3>Unlocked On</h3>
                  </div>
                  <div className="date-content">
                    <p className="date-main">{new Date(capsule.unlocked_at).toLocaleDateString('en-US', { 
                      weekday: 'long',
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}</p>
                    <p className="date-time">{new Date(capsule.unlocked_at).toLocaleTimeString()}</p>
                  </div>
                </div>
              </div>

              {capsule.recipient_email && (
                <div className="cert-recipient">
                  <div className="recipient-header">
                    <FaEnvelope className="recipient-icon" />
                    <h3>Memory Shared With</h3>
                  </div>
                  <div className="recipient-email">{capsule.recipient_email}</div>
                </div>
              )}

              <div className="cert-quote-section">
                <div className="quote-decoration">
                  <div className="quote-line"></div>
                  <FaHeart className="quote-heart" />
                  <div className="quote-line"></div>
                </div>
                <p className="cert-quote">
                  "Where Emotions Sleep in Time and Wake with Love"
                </p>
              </div>

              <div className="cert-footer">
                <div className="footer-content">
                  <div className="footer-brand">
                    <span className="brand-name">SoulBox</span>
                    <span className="brand-tagline">Preserving Memories, Creating Legacies</span>
                  </div>
                  <div className="footer-team">
                    <span className="team-name">by Team SNAPDG</span>
                    <span className="team-year">© {new Date().getFullYear()}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Certificate ID */}
            <div className="cert-id">
              Certificate ID: {capsule._id?.slice(-8) || id.slice(-8)}
            </div>
          </div>
        </div>

        <div className="cert-actions">
  
  <button
    className="download-btn"
    onClick={async () => {
      setDownloading(true);

      try {
        const apiBase = process.env.REACT_APP_API_URL || "http://localhost:5000/api";
        const url = `${apiBase}/certificate/download/${id}`;
        window.open(url, "_blank"); // FIXED
      } catch (err) {
        alert("Failed to download certificate");
      }

      setDownloading(false);
    }}
    disabled={downloading}
  >
    <FaDownload className="btn-icon" />
    {downloading ? "Downloading..." : "Download Certificate as PDF"}
  </button>

  <button className="share-btn" onClick={() => window.print()}>
    Print Certificate
  </button>

</div>


        {/* Info Notice */}
        <div className="cert-notice">
          <p>This certificate is digitally signed and authenticated by SoulBox.</p>
          <p>Valid only for the original memory capsule.</p>
        </div>
      </div>
    </div>
  );
}