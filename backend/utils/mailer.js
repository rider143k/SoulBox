const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: Number(process.env.EMAIL_PORT),
  secure: Number(process.env.EMAIL_PORT) === 465, // 465 = SSL, 587 = TLS
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  },
  tls: {
    rejectUnauthorized: false
  }
});

async function sendMail({ to, subject, html, text }) {
  try {
    const info = await transporter.sendMail({
      from: `"SoulBox" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      text: text || "",
      html: html || ""
    });

    console.log("Mail sent:", info.messageId);
    return info;

  } catch (err) {
    console.error("Mail error:", err);
    throw err;
  }
}

transporter.verify(function(error, success) {
  if (error) {
    console.log("❌ SMTP ERROR:", error);
  } else {
    console.log("✔️ SMTP Server is Ready to Send Mails");
  }
});


module.exports = { sendMail };
