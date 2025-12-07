const cron = require('node-cron');
const db = require('../db');
const { sendMail } = require('../utils/mailer');

// Disable auto-unlock completely.
// This cron will ONLY send email notifications (optional).

function formatForMySQL(dt) {
  const y = dt.getFullYear();
  const m = String(dt.getMonth() + 1).padStart(2, '0');
  const d = String(dt.getDate()).padStart(2, '0');
  const hh = String(dt.getHours()).padStart(2, '0');
  const mm = String(dt.getMinutes()).padStart(2, '0');
  const ss = String(dt.getSeconds()).padStart(2, '0');
  return `${y}-${m}-${d} ${hh}:${mm}:${ss}`;
}

cron.schedule('* * * * *', async () => {
  try {
    // 🔥 DO NOTHING (NO AUTO-UNLOCK)
    return;

  } catch (error) {
    console.error("Cron error:", error);
  }
});

module.exports = {};
