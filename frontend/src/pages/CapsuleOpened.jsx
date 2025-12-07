// src/pages/CapsuleOpened.jsx
import { useLocation, useNavigate } from "react-router-dom";
import "./CapsuleOpened.css";

export default function CapsuleOpened() {
  const location = useLocation();
  const navigate = useNavigate();

  const { capsuleData, capsuleId } = location.state || {};

  if (!capsuleData || !capsuleId) {
    return (
      <div className="capsule-error">
        <div className="error-icon">❌</div>
        <h2>Invalid Capsule Data</h2>
        <p>The time capsule information couldn't be loaded.</p>
        <button 
          className="back-button"
          onClick={() => navigate("/dashboard")}
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  const handleViewCertificate = () => {
    navigate(`/certificate/${capsuleId}`);
  };

  // Check if media files exist and are valid
  const hasMedia = () => {
    if (!capsuleData.media_files) return false;
    
    // If it's a string, check if it's not empty
    if (typeof capsuleData.media_files === 'string') {
      return capsuleData.media_files.trim().length > 0 && capsuleData.media_files !== 'null';
    }
    
    // If it's an array, check if it has items
    if (Array.isArray(capsuleData.media_files)) {
      return capsuleData.media_files.length > 0;
    }
    
    return false;
  };

  // Parse media files - handle both string and array formats
  const getMediaFiles = () => {
    if (!hasMedia()) return [];
    
    try {
      let files = [];
      
      if (typeof capsuleData.media_files === 'string') {
        // Try to parse as JSON first
        try {
          const parsed = JSON.parse(capsuleData.media_files);
          files = Array.isArray(parsed) ? parsed : [capsuleData.media_files];
        } catch {
          // If not JSON, treat as single file path
          files = [capsuleData.media_files];
        }
      } else if (Array.isArray(capsuleData.media_files)) {
        files = capsuleData.media_files;
      }
      
      // Filter out empty or null values
      return files.filter(file => file && file.trim() && file !== 'null');
    } catch (error) {
      console.error('Error parsing media files:', error);
      return [];
    }
  };

  // Determine file type and render appropriate media
  const renderMedia = (filePath, index) => {
    if (!filePath) return null;

    // Extract filename and extension
    const fileName = filePath.split('/').pop() || filePath;
    const extension = fileName.split('.').pop()?.toLowerCase();

    // Construct full URL - adjust based on your backend URL structure
    const mediaUrl = filePath.startsWith('http') 
      ? filePath 
      : `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}${filePath}`;

    // Render based on file type
    if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp'].includes(extension)) {
      return (
        <div className="media-item image-item" key={index}>
          <img 
            src={mediaUrl} 
            alt={`Capsule memory - ${fileName}`}
            className="media-image"
            onError={(e) => {
              e.target.style.display = 'none';
              const fallback = e.target.parentElement.querySelector('.media-fallback');
              if (fallback) fallback.style.display = 'flex';
            }}
          />
          <div className="media-fallback">
            <div className="fallback-icon">🖼️</div>
            <div className="fallback-content">
              <span className="fallback-text">Image not available</span>
              <span className="file-name">{fileName}</span>
            </div>
          </div>
        </div>
      );
    }
    
    else if (['mp4', 'webm', 'ogg', 'mov', 'avi'].includes(extension)) {
      return (
        <div className="media-item video-item" key={index}>
          <video 
            controls 
            className="media-video"
            onError={(e) => {
              e.target.style.display = 'none';
              const fallback = e.target.parentElement.querySelector('.media-fallback');
              if (fallback) fallback.style.display = 'flex';
            }}
          >
            <source src={mediaUrl} type={`video/${extension}`} />
            Your browser does not support the video tag.
          </video>
          <div className="media-fallback">
            <div className="fallback-icon">🎥</div>
            <div className="fallback-content">
              <span className="fallback-text">Video not available</span>
              <span className="file-name">{fileName}</span>
            </div>
          </div>
        </div>
      );
    }
    
    else if (['mp3', 'wav', 'ogg', 'aac', 'm4a'].includes(extension)) {
      return (
        <div className="media-item audio-item" key={index}>
          <div className="audio-player">
            <div className="audio-icon">🎵</div>
            <audio 
              controls 
              className="media-audio"
              onError={(e) => {
                e.target.style.display = 'none';
                const fallback = e.target.parentElement.parentElement.querySelector('.media-fallback');
                if (fallback) fallback.style.display = 'flex';
              }}
            >
              <source src={mediaUrl} type={`audio/${extension}`} />
              Your browser does not support the audio tag.
            </audio>
          </div>
          <div className="media-fallback">
            <div className="fallback-icon">🎵</div>
            <div className="fallback-content">
              <span className="fallback-text">Audio not available</span>
              <span className="file-name">{fileName}</span>
            </div>
          </div>
        </div>
      );
    }
    
    else {
      // For unknown file types or documents
      return (
        <div className="media-item document-item" key={index}>
          <a 
            href={mediaUrl} 
            target="_blank" 
            rel="noopener noreferrer"
            className="document-link"
            onClick={(e) => {
              // Check if file might not exist
              fetch(mediaUrl, { method: 'HEAD' })
                .then(res => {
                  if (!res.ok) {
                    e.preventDefault();
                    alert('File not available');
                  }
                })
                .catch(() => {
                  e.preventDefault();
                  alert('File not available');
                });
            }}
          >
            <div className="document-icon">📄</div>
            <span className="document-name">{fileName}</span>
          </a>
        </div>
      );
    }
  };

  const mediaFiles = getMediaFiles();

  return (
    <div className="capsule-opened-container">
      {/* Certificate Frame */}
      <div className="certificate-frame">
        
        {/* Header */}
        <div className="certificate-header">
          <div className="header-icon">⏳</div>
          <h1 className="certificate-title">Time Capsule Opened</h1>
          <p className="certificate-subtitle">
            Your preserved memory has been successfully unlocked
          </p>
        </div>

        {/* Capsule Information - Compact */}
        <div className="capsule-info-compact">
          <div className="info-item">
            <span className="info-label">Title:</span>
            <span className="info-value">{capsuleData.title}</span>
          </div>
          <div className="info-row">
            <div className="info-item">
              <span className="info-label">Created:</span>
              <span className="info-value">
                {new Date(capsuleData.created_at).toLocaleDateString()}
              </span>
            </div>
            <div className="info-item">
              <span className="info-label">Unlocked:</span>
              <span className="info-value">
                {capsuleData.unlocked_at 
                  ? new Date(capsuleData.unlocked_at).toLocaleDateString()
                  : 'Just now'
                }
              </span>
            </div>
          </div>
        </div>

        {/* Media Files Section - Only show if media exists */}
        {hasMedia() && (
          <div className="media-section">
            <div className="section-label">
              <span className="label-icon">📁</span>
              Attached Media ({mediaFiles.length})
            </div>
            <div className="media-grid">
              {mediaFiles.map((filePath, index) => renderMedia(filePath, index))}
            </div>
          </div>
        )}

        {/* Main Message - Prominent Display */}
        <div className="message-display">
          <div className="message-label">Your Message</div>
          <div className="message-content">
            {capsuleData.message || "No message provided"}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="action-buttons">
          <button 
            className="certificate-button"
            onClick={handleViewCertificate}
          >
            <span className="button-icon">📜</span>
            View Certificate
          </button>
          <button 
            className="back-button"
            onClick={() => navigate("/dashboard")}
          >
            <span className="button-icon">←</span>
            Back to Dashboard
          </button>
        </div>

        {/* Footer */}
        <div className="certificate-footer">
          <span className="footer-icon">✨</span>
          <span>SoulBox - Preserving Your Precious Moments</span>
        </div>
      </div>
    </div>
  );
}