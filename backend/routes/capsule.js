const express = require('express');
const router = express.Router();
const db = require('../db');
const multer = require('multer');
const path = require('path');
const auth = require('../middleware/auth');
const { generateEncryptKey, generateShareToken } = require('../utils/keygen');
const { sendMail } = require('../utils/mailer');

/* -------------------------
   UPLOAD SETTINGS
------------------------- */
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const fs = require('fs');
    const uploadsDir = 'uploads/';
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + '-' + Math.round(Math.random() * 1E9) + path.extname(file.originalname);
    cb(null, uniqueName);
  },
});

const upload = multer({ 
  storage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'image/jpeg', 'image/png', 'image/gif', 'image/webp',
      'video/mp4', 'video/webm', 'video/ogg', 'video/quicktime',
      'audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/aac'
    ];
    
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only images, videos, and audio files are allowed.'), false);
    }
  }
});

/* -------------------------
   UTIL: convert 12h -> 24h
------------------------- */
function convertTo24Hour(timeStr) {
  if (!timeStr) return null;
  timeStr = timeStr.trim();

  // CASE 1: is already 24h format "HH:MM" or "HH:MM:SS"
  if (/^\d{1,2}:\d{2}(:\d{2})?$/.test(timeStr)) {
    const parts = timeStr.split(":");
    const h = parts[0].padStart(2, "0");
    const m = parts[1].padStart(2, "0");
    const s = (parts[2] || "00").padStart(2, "0");
    return `${h}:${m}:${s}`;
  }

  // CASE 2: 12h AM/PM → "hh:mm AM"
  const match = timeStr.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (match) {
    let hour = parseInt(match[1], 10);
    const minute = match[2];
    const ampm = match[3].toUpperCase();

    if (ampm === "PM" && hour !== 12) hour += 12;
    if (ampm === "AM" && hour === 12) hour = 0;

    return `${hour.toString().padStart(2, "0")}:${minute}:00`;
  }

  return null;
}

/* -------------------------
   UTIL: Get media files array - handles both file_path and media_files
------------------------- */
function getMediaFiles(capsule) {
  let mediaFiles = [];
  
  // First check media_files field (JSON array)
  if (capsule.media_files && capsule.media_files !== 'null') {
    try {
      const parsed = JSON.parse(capsule.media_files);
      if (Array.isArray(parsed) && parsed.length > 0) {
        mediaFiles = parsed;
      }
    } catch (e) {
      console.error('Error parsing media_files:', e);
    }
  }
  
  // Fallback to file_path field (single file)
  if (capsule.file_path && capsule.file_path !== 'null') {
    // If we haven't found any files in media_files, use file_path
    if (mediaFiles.length === 0) {
      mediaFiles = [capsule.file_path];
    }
  }
  
  return mediaFiles;
}

/* ============================================
   CREATE CAPSULE - WITH VALIDATION
============================================ */
router.post('/create', auth, upload.single('file'), async (req, res) => {
  try {
    const userId = req.userId;
    let { title, message, unlock_date, unlock_time, recipient_email, repeat_days } = req.body;

    if (!title || !message || !unlock_date || (unlock_time === undefined || unlock_time === null)) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const unlock_time_24 = convertTo24Hour(unlock_time);
    if (!unlock_time_24) {
      return res.status(400).json({ error: 'Invalid time format' });
    }

    // Validate unlock date is in the future
    const unlockDateTime = new Date(`${unlock_date}T${unlock_time_24}`);
    const now = new Date();
    
    if (unlockDateTime <= now) {
      return res.status(400).json({ 
        error: 'Unlock date/time must be in the future' 
      });
    }

    const encrypt_key = generateEncryptKey(6);
    const share_token = generateShareToken();

    // Handle file upload
    let file_path = null;
    let file_type = null;
    let media_files = null;

    if (req.file) {
      file_path = `/uploads/${req.file.filename}`;
      file_type = req.file.mimetype;
      media_files = JSON.stringify([file_path]); // Store as JSON array
    }

    const [result] = await db.query(
      `INSERT INTO capsules 
       (user_id, title, message, unlock_date, unlock_time, recipient_email, repeat_days, file_path, file_type, media_files, encrypt_key, share_token)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        userId,
        title,
        message,
        unlock_date,
        unlock_time_24,
        recipient_email || null,
        repeat_days || 0,
        file_path,
        file_type,
        media_files,
        encrypt_key,
        share_token
      ]
    );

    const capsuleId = result.insertId;

    // Create reminder
    if (!isNaN(unlockDateTime.getTime())) {
      await db.query('INSERT INTO reminders (capsule_id, reminder_date) VALUES (?, ?)', [capsuleId, unlockDateTime]);
    }

    // Send notification to recipient
    if (recipient_email) {
      const html = `
        <p>Hello,</p>
        <p>A time capsule has been created for you on SoulBox.</p>
        <p>It will unlock on <b>${unlock_date} at ${unlock_time}</b>.</p>
        <p>— SoulBox Team</p>
      `;
      try { 
        await sendMail({ to: recipient_email, subject: 'A SoulBox capsule was created for you', html }); 
      } catch (e) { 
        console.warn('Mail send failed', e); 
      }
    }

    res.json({ 
      success: true,
      message: 'Capsule created successfully', 
      capsuleId, 
      encrypt_key, 
      share_token 
    });

  } catch (err) {
    console.error('Create capsule error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

/* ============================================
   GET USER CAPSULES - WITH AUTO-UNLOCK PREVENTION
============================================ */
router.get('/my', auth, async (req, res) => {
  try {
    const userId = req.userId;

    const [rows] = await db.query(
      `SELECT 
        id,
        user_id,
        title,
        message,
        DATE_FORMAT(unlock_date, '%Y-%m-%d') as unlock_date,
        unlock_time,
        recipient_email,
        repeat_days,
        file_path,
        file_type,
        media_files,
        encrypt_key,
        share_token,
        is_unlocked,
        created_at,
        unlocked_at
       FROM capsules 
       WHERE user_id = ? 
       ORDER BY created_at DESC`,
      [userId]
    );

    // ⭐ FIX: Normalize unlock_time ALWAYS to HH:MM:SS
    rows.forEach(capsule => {
      if (capsule.unlock_time instanceof Date) {
        const h = String(capsule.unlock_time.getHours()).padStart(2, '0');
        const m = String(capsule.unlock_time.getMinutes()).padStart(2, '0');
        const s = String(capsule.unlock_time.getSeconds()).padStart(2, '0');
        capsule.unlock_time = `${h}:${m}:${s}`;
      } else {
        capsule.unlock_time = String(capsule.unlock_time || "00:00:00").trim();
      }
    });

    const capsules = rows.map(capsule => ({
      ...capsule,
      media_files: getMediaFiles(capsule)
    }));

    res.json(capsules);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});


/* ============================================
   VIEW CAPSULE BY SHARE TOKEN
============================================ */
router.get('/view/:token', async (req, res) => {
  try {
    const token = req.params.token;
    const [rows] = await db.query(
      `SELECT 
        id,
        user_id,
        title,
        message,
        DATE_FORMAT(unlock_date, '%Y-%m-%d') as unlock_date,
        unlock_time,
        recipient_email,
        repeat_days,
        file_path,
        file_type,
        media_files,
        encrypt_key,
        share_token,
        is_unlocked,
        created_at,
        unlocked_at
       FROM capsules 
       WHERE share_token = ?`,
      [token]
    );

    if (!rows.length) return res.status(404).json({ error: 'Capsule not found' });

    const cap = rows[0];
    
    // Ensure unlock_time is string
    if (cap.unlock_time instanceof Date) {
      const hh = String(cap.unlock_time.getHours()).padStart(2, '0');
      const mm = String(cap.unlock_time.getMinutes()).padStart(2, '0');
      const ss = String(cap.unlock_time.getSeconds()).padStart(2, '0');
      cap.unlock_time = `${hh}:${mm}:${ss}`;
    } else {
      cap.unlock_time = String(cap.unlock_time).trim();
    }

    // Add media_files array
    cap.media_files = getMediaFiles(cap);

    return res.json(cap);

  } catch (err) {
    console.error('View capsule error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

/* ============================================
   VIEW CAPSULE BY ID (for certificate)
============================================ */
router.get('/view/byId/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await db.query(
      `SELECT 
        id,
        user_id,
        title,
        message,
        DATE_FORMAT(unlock_date, '%Y-%m-%d') as unlock_date,
        unlock_time,
        recipient_email,
        repeat_days,
        file_path,
        file_type,
        media_files,
        encrypt_key,
        share_token,
        is_unlocked,
        created_at,
        unlocked_at
       FROM capsules 
       WHERE id = ?`,
      [id]
    );
    if (!rows.length) return res.status(404).json({ error: 'Capsule not found' });
    
    const cap = rows[0];
    cap.unlock_time = String(cap.unlock_time).trim();
    // Add media_files array
    cap.media_files = getMediaFiles(cap);
    
    res.json(cap);
  } catch (err) {
    console.error('viewById error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

/* ============================================
   UNLOCK CAPSULE - STRICT VALIDATION
============================================ */
router.post('/unlock/:token', async (req, res) => {
  try {
    const token = req.params.token;
    const { key, viewer_email } = req.body;

    if (!key) {
      return res.status(400).json({ error: 'Unlock code is required' });
    }

    const [rows] = await db.query(
      `SELECT 
        id,
        title,
        message,
        DATE_FORMAT(unlock_date, '%Y-%m-%d') as unlock_date,
        unlock_time,
        encrypt_key,
        is_unlocked
       FROM capsules 
       WHERE share_token = ?`, 
      [token]
    );
    
    if (!rows.length) return res.status(404).json({ error: 'Capsule not found' });

    const capsule = rows[0];

    // Check if already unlocked
    if (capsule.is_unlocked === 1) {
      return res.status(400).json({ 
        success: false,
        error: 'Capsule is already unlocked' 
      });
    }

    // Check if capsule is ready to unlock
    const ut = String(capsule.unlock_time).trim();
    const unlockAt = new Date(`${capsule.unlock_date}T${ut}`);
    const now = new Date();

    if (now < unlockAt) {
      return res.status(403).json({ 
        success: false,
        error: 'Capsule is not ready yet',
        unlock_date: capsule.unlock_date,
        unlock_time: capsule.unlock_time
      });
    }

    // Verify unlock code
    if (key !== capsule.encrypt_key) {
      return res.status(401).json({ 
        success: false,
        error: 'Invalid unlock code' 
      });
    }

    // Update capsule as unlocked with CURRENT timestamp
    await db.query(
      'UPDATE capsules SET is_unlocked = 1, unlocked_at = NOW() WHERE id = ?', 
      [capsule.id]
    );
    
    // Record viewer if email provided
    if (viewer_email) {
      await db.query(
        'INSERT INTO capsule_viewers (capsule_id, viewer_email) VALUES (?,?)', 
        [capsule.id, viewer_email]
      );
    }

    // Get the updated capsule with full data
    const [updatedRows] = await db.query(
      `SELECT 
        id,
        user_id,
        title,
        message,
        DATE_FORMAT(unlock_date, '%Y-%m-%d') as unlock_date,
        unlock_time,
        recipient_email,
        repeat_days,
        file_path,
        file_type,
        media_files,
        encrypt_key,
        share_token,
        is_unlocked,
        created_at,
        unlocked_at
       FROM capsules 
       WHERE id = ?`,
      [capsule.id]
    );
    
    const updatedCapsule = updatedRows[0];
    const media_files = getMediaFiles(updatedCapsule);

    return res.json({
      success: true,
      message: 'Capsule unlocked successfully!',
      capsule_id: capsule.id,
      data: {
        title: updatedCapsule.title,
        message: updatedCapsule.message,
        media_files: media_files,
        created_at: updatedCapsule.created_at,
        unlocked_at: updatedCapsule.unlocked_at
      }
    });

  } catch (err) {
    console.error('Unlock error:', err);
    res.status(500).json({ 
      success: false,
      error: 'Server error' 
    });
  }
});

/* ============================================
   CHECK CAPSULE STATUS (Debugging)
============================================ */
router.get('/status/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;
    
    const [rows] = await db.query(
      `SELECT 
        id,
        title,
        DATE_FORMAT(unlock_date, '%Y-%m-%d') as unlock_date,
        unlock_time,
        is_unlocked,
        unlocked_at,
        TIMESTAMPDIFF(SECOND, NOW(), CONCAT(unlock_date, ' ', unlock_time)) as seconds_until_unlock
       FROM capsules 
       WHERE id = ? AND user_id = ?`,
      [id, userId]
    );
    
    if (!rows.length) return res.status(404).json({ error: 'Capsule not found' });
    
    const capsule = rows[0];
    const unlockAt = new Date(`${capsule.unlock_date}T${capsule.unlock_time}`);
    const now = new Date();
    const unlockedAt = capsule.unlocked_at ? new Date(capsule.unlocked_at) : null;
    
    // Check for auto-unlocking (unlocked_at matches unlock time)
    let autoUnlockDetected = false;
    if (capsule.is_unlocked === 1 && unlockedAt) {
      const timeDiff = Math.abs(unlockedAt - unlockAt);
      autoUnlockDetected = timeDiff < 300000; // Within 5 minutes
    }
    
    res.json({
      capsule: {
        id: capsule.id,
        title: capsule.title,
        unlock_date: capsule.unlock_date,
        unlock_time: capsule.unlock_time,
        is_unlocked: capsule.is_unlocked,
        unlocked_at: capsule.unlocked_at
      },
      time: {
        now: now.toISOString(),
        unlock_at: unlockAt.toISOString(),
        is_past: now >= unlockAt,
        seconds_until_unlock: capsule.seconds_until_unlock
      },
      status: capsule.is_unlocked === 1 ? 'UNLOCKED' : (now >= unlockAt ? 'READY' : 'ACTIVE'),
      auto_unlock_detected: autoUnlockDetected
    });
    
  } catch (err) {
    console.error('Status check error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

/* ============================================
   FIX AUTO-UNLOCKED CAPSULES
============================================ */
router.post('/fix-auto-unlocked', auth, async (req, res) => {
  try {
    const userId = req.userId;
    
    // Find capsules that were likely auto-unlocked (unlocked_at is close to unlock time)
    const [rows] = await db.query(
      `SELECT 
        id, 
        title, 
        unlock_date, 
        unlock_time, 
        unlocked_at,
        TIMESTAMPDIFF(SECOND, 
          CONCAT(unlock_date, ' ', unlock_time), 
          unlocked_at
        ) as time_diff_seconds
       FROM capsules 
       WHERE user_id = ? 
         AND is_unlocked = 1 
         AND unlocked_at IS NOT NULL
         AND ABS(TIMESTAMPDIFF(SECOND, 
               CONCAT(unlock_date, ' ', unlock_time), 
               unlocked_at)) < 300`, // Within 5 minutes
      [userId]
    );
    
    console.log('Found auto-unlocked capsules to fix:', rows.length);
    
    const fixedCapsules = [];
    
    // Re-lock these capsules
    for (const capsule of rows) {
      await db.query(
        'UPDATE capsules SET is_unlocked = 0, unlocked_at = NULL WHERE id = ?',
        [capsule.id]
      );
      
      fixedCapsules.push({
        id: capsule.id,
        title: capsule.title,
        unlock_time: `${capsule.unlock_date} ${capsule.unlock_time}`,
        unlocked_at: capsule.unlocked_at,
        time_diff_seconds: capsule.time_diff_seconds
      });
      
      console.log('Fixed capsule:', capsule.id, capsule.title);
    }
    
    res.json({ 
      success: true, 
      message: `Fixed ${rows.length} auto-unlocked capsules`,
      fixed_capsules: fixedCapsules 
    });
    
  } catch (err) {
    console.error('Fix auto-unlocked error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

/* ============================================
   CHECK CAPSULE READY STATUS
============================================ */
router.get('/check-ready/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;
    
    const [rows] = await db.query(
      `SELECT 
        id,
        title,
        DATE_FORMAT(unlock_date, '%Y-%m-%d') as unlock_date,
        unlock_time,
        is_unlocked
       FROM capsules 
       WHERE id = ? AND user_id = ?`,
      [id, userId]
    );
    
    if (!rows.length) return res.status(404).json({ error: 'Capsule not found' });
    
    const capsule = rows[0];
    const unlockAt = new Date(`${capsule.unlock_date}T${capsule.unlock_time}`);
    const now = new Date();
    
    const isReady = now >= unlockAt && capsule.is_unlocked === 0;
    
    res.json({
      capsule_id: capsule.id,
      title: capsule.title,
      unlock_date: capsule.unlock_date,
      unlock_time: capsule.unlock_time,
      is_unlocked: capsule.is_unlocked,
      is_ready: isReady,
      time_until_unlock: now < unlockAt ? Math.floor((unlockAt - now) / 1000) : 0,
      status: capsule.is_unlocked === 1 ? 'UNLOCKED' : (isReady ? 'READY' : 'ACTIVE')
    });
    
  } catch (err) {
    console.error('Check ready error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

/* ============================================
   DELETE CAPSULE
============================================ */
router.delete("/delete/:id", auth, async (req, res) => {
  try {
    const capsuleId = req.params.id;
    const userId = req.userId;

    const [rows] = await db.query(
      `SELECT 
        *,
        DATE_FORMAT(unlock_date, '%Y-%m-%d') as unlock_date
       FROM capsules 
       WHERE id = ? AND user_id = ?`,
      [capsuleId, userId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: "Capsule not found or unauthorized" });
    }

    const capsule = rows[0];

    // Delete related data
    await db.query("DELETE FROM reminders WHERE capsule_id = ?", [capsuleId]);
    await db.query("DELETE FROM capsule_viewers WHERE capsule_id = ?", [capsuleId]);
    await db.query("DELETE FROM capsules WHERE id = ?", [capsuleId]);

    // Delete uploaded files
    const fs = require("fs");
    const mediaFiles = getMediaFiles(capsule);
    
    mediaFiles.forEach(filePath => {
      if (filePath && filePath !== 'null') {
        const fullPath = path.join(__dirname, '..', filePath);
        if (fs.existsSync(fullPath)) {
          fs.unlinkSync(fullPath);
        }
      }
    });

    res.json({ 
      success: true,
      message: "Capsule deleted successfully" 
    });

  } catch (err) {
    console.error("Delete capsule error:", err);
    res.status(500).json({ error: "Server error deleting capsule" });
  }
});

module.exports = router;