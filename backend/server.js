process.env.TZ = "Asia/Kolkata";

const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
dotenv.config();
const path = require("path");
const cron = require("node-cron");
const db = require("./db");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ROUTES
const authRoutes = require("./routes/auth");
const capsuleRoutes = require("./routes/capsule");
const certificateRoutes = require('./routes/certificate');
app.use('/api/certificate', certificateRoutes);


// Use Routes
app.use("/api/auth", authRoutes);
app.use("/api/capsule", capsuleRoutes);
app.use("/api/certificate", certificateRoutes);

// Email service (for reminder only)
const EmailService = require("./services/emailService");
const { sendMail } = require("./utils/mailer");
const emailService = new EmailService(sendMail);

// PORT
const port = process.env.PORT || 5000;

// Start Server
app.listen(port, "0.0.0.0", () => {
  console.log(`🚀 Server running on http://0.0.0.0:${port}`);
});

// ===============================
//   UTIL: Format Date for MySQL
// ===============================
function formatForMySQL(dt) {
  const y = dt.getFullYear();
  const m = String(dt.getMonth() + 1).padStart(2, "0");
  const d = String(dt.getDate()).padStart(2, "0");
  const hh = String(dt.getHours()).padStart(2, "0");
  const mm = String(dt.getMinutes()).padStart(2, "0");
  const ss = String(dt.getSeconds()).padStart(2, "0");
  return `${y}-${m}-${d} ${hh}:${mm}:${ss}`;
}

// ===========================================
//   CRON JOB (Reminder System Only — SAFE)
// ===========================================
cron.schedule("* * * * *", async () => {
  try {
    const nowStr = formatForMySQL(new Date());
    console.log(`⏳ Cron run ${nowStr} — (Reminders ON, Auto Unlock OFF)`);

    // ============================
    // 1️⃣ PROCESS ONLY REMINDERS
    // ============================

    const [dueReminders] = await db.query(
      `SELECT r.id, r.capsule_id, r.reminder_date, r.is_sent,
              c.recipient_email, c.encrypt_key, c.share_token, 
              c.title, c.is_unlocked
       FROM reminders r
       JOIN capsules c ON r.capsule_id = c.id
       WHERE r.is_sent = 0 
       AND r.reminder_date <= ?`,
      [nowStr]
    );

    console.log(`📧 Found ${dueReminders.length} due reminders`);

    for (const rem of dueReminders) {
      // ❗ Reminder trigger condition:
      // Capsule must be READY (time passed) but NOT unlocked
      
      if (rem.is_unlocked === 0) {
        try {
          await emailService.sendReminderEmail(rem);
          console.log(`📨 Reminder email sent to: ${rem.recipient_email}`);
        } catch (e) {
          console.warn("❌ Reminder email failed:", e.message);
        }
      }

      // Mark reminder as sent
      await db.query(`UPDATE reminders SET is_sent = 1 WHERE id = ?`, [rem.id]);
    }

    console.log("✅ Reminder cron completed");
    return;

  } catch (err) {
    console.error("❌ Cron Error:", err);
  }
});

// HEALTH CHECK
app.get("/health", (req, res) => {
  res.json({
    status: "OK",
    message: "SoulBox Backend Server running",
    timestamp: new Date().toISOString(),
    timezone: process.env.TZ,
  });
});

module.exports = app;
