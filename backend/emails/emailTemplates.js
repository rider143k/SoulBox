const getReminderEmailTemplate = (rem, unlockUrl) => {
  const capsuleTitle = rem.title || 'Your Memory Capsule';
  
  return {
    subject: `🔔 Reminder: Your "${capsuleTitle}" Capsule is Ready to Open - SoulBox`,
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Capsule Reminder - SoulBox</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; background-color: #f8fafc; }
    .email-container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06); }
    .header { background: linear-gradient(135deg, #8b5cf6 0%, #06b6d4 100%); padding: 40px 30px; text-align: center; color: white; }
    .logo { font-size: 28px; font-weight: 700; margin-bottom: 10px; letter-spacing: -0.5px; }
    .tagline { font-size: 16px; opacity: 0.9; font-weight: 300; }
    .content { padding: 40px 30px; }
    .greeting { font-size: 18px; color: #1f2937; margin-bottom: 24px; font-weight: 500; }
    .message { font-size: 16px; color: #4b5563; margin-bottom: 24px; line-height: 1.7; }
    .capsule-info { background: #f8fafc; border-radius: 8px; padding: 20px; margin: 24px 0; border-left: 4px solid #8b5cf6; }
    .capsule-title { font-size: 18px; font-weight: 600; color: #1f2937; margin-bottom: 8px; }
    .unlock-key { background: #f1f5f9; padding: 12px 16px; border-radius: 6px; font-family: 'Monaco', 'Consolas', monospace; font-size: 14px; color: #1e40af; margin: 16px 0; border: 1px dashed #cbd5e1; }
    .cta-button { display: inline-block; background: linear-gradient(135deg, #8b5cf6 0%, #06b6d4 100%); color: white; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 16px; margin: 20px 0; text-align: center; }
    .security-note { font-size: 14px; color: #6b7280; margin-top: 24px; padding-top: 16px; border-top: 1px solid #e5e7eb; }
    .footer { background: #f8fafc; padding: 24px 30px; text-align: center; color: #6b7280; font-size: 14px; }
    .social-links { margin: 16px 0; }
    .social-link { color: #8b5cf6; text-decoration: none; margin: 0 8px; }
    .contact-info { margin-top: 12px; font-size: 13px; }
    @media (max-width: 600px) { .header, .content { padding: 30px 20px; } .footer { padding: 20px; } }
  </style>
</head>
<body>
  <div class="email-container">
    <div class="header">
      <div class="logo">SoulBox</div>
      <div class="tagline">Where Emotions Sleep in Time and Wake with Love</div>
    </div>
    <div class="content">
      <div class="greeting">Hello,</div>
      <div class="message">This is a gentle reminder that your SoulBox time capsule is waiting to be opened and shared. The memories you've preserved are ready to be revisited.</div>
      <div class="capsule-info">
        <div class="capsule-title">"${capsuleTitle}"</div>
        <div style="color: #6b7280; font-size: 14px;">Is waiting for you to unlock</div>
      </div>
      <div style="text-align: center;">
        <a href="${unlockUrl}" class="cta-button">Open Your Capsule Now</a>
      </div>
      <div class="message">
        <strong>Your Unlock Key:</strong>
        <div class="unlock-key">${rem.encrypt_key}</div>
        <p style="font-size: 14px; color: #6b7280;">You'll need this key to access your capsule. Keep it safe and secure.</p>
      </div>
      <div class="security-note">
        <strong>Note:</strong> This is an automated reminder. Please do not share your unlock key with anyone. 
        If you didn't create this capsule, you can safely ignore this email.
      </div>
    </div>
    <div class="footer">
      <div class="social-links">
        <a href="${process.env.BASE_URL}" class="social-link">Website</a> • 
        <a href="${process.env.BASE_URL}/support" class="social-link">Support</a> • 
        <a href="${process.env.BASE_URL}/privacy" class="social-link">Privacy</a>
      </div>
      <div class="contact-info">
        © 2025 SoulBox by Team SNAPDG. All rights reserved.<br>
        This email was sent to ${rem.recipient_email}
      </div>
    </div>
  </div>
</body>
</html>
    `,
    text: `
REMINDER: Your SoulBox Capsule is Waiting

Hello,

This is a reminder that your SoulBox time capsule "${capsuleTitle}" is waiting to be opened.

Open your capsule here: ${unlockUrl}

Your Unlock Key: ${rem.encrypt_key}

Keep this key safe and secure. You'll need it to access your capsule.

If you didn't create this capsule, please ignore this email.

---
SoulBox - Where Emotions Sleep in Time and Wake with Love
© 2025 Team SNAPDG. All rights reserved.
    `
  };
};

const getUnlockEmailTemplate = (cap, unlockUrl) => {
  const capsuleTitle = cap.title || 'Your Memory Capsule';
  const createdDate = new Date(cap.created_at).toLocaleDateString();
  
  return {
    subject: `🎉 Time to Open Your "${capsuleTitle}" Capsule - SoulBox`,
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your Capsule is Ready - SoulBox</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; background-color: #f8fafc; }
    .email-container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06); }
    .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 40px 30px; text-align: center; color: white; position: relative; }
    .header::after { content: '🎉'; font-size: 48px; position: absolute; right: 30px; top: 50%; transform: translateY(-50%); }
    .logo { font-size: 28px; font-weight: 700; margin-bottom: 10px; letter-spacing: -0.5px; }
    .tagline { font-size: 16px; opacity: 0.9; font-weight: 300; }
    .content { padding: 40px 30px; }
    .greeting { font-size: 18px; color: #1f2937; margin-bottom: 24px; font-weight: 500; }
    .message { font-size: 16px; color: #4b5563; margin-bottom: 24px; line-height: 1.7; }
    .capsule-card { background: linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%); border: 1px solid #bbf7d0; border-radius: 12px; padding: 24px; margin: 32px 0; text-align: center; }
    .capsule-icon { font-size: 48px; margin-bottom: 16px; }
    .capsule-title { font-size: 20px; font-weight: 600; color: #065f46; margin-bottom: 8px; }
    .capsule-meta { color: #047857; font-size: 14px; margin-bottom: 16px; }
    .unlock-key { background: #ffffff; padding: 12px 16px; border-radius: 8px; font-family: 'Monaco', 'Consolas', monospace; font-size: 14px; color: #065f46; margin: 20px 0; border: 2px solid #86efac; font-weight: 600; letter-spacing: 1px; }
    .cta-button { display: inline-block; background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; text-decoration: none; padding: 16px 40px; border-radius: 10px; font-weight: 600; font-size: 16px; margin: 20px 0; text-align: center; box-shadow: 0 4px 15px rgba(16, 185, 129, 0.3); }
    .instructions { background: #f8fafc; border-radius: 8px; padding: 20px; margin: 24px 0; border-left: 4px solid #10b981; }
    .instructions h3 { color: #065f46; margin-bottom: 12px; font-size: 16px; }
    .instructions ol { padding-left: 20px; color: #4b5563; }
    .instructions li { margin-bottom: 8px; }
    .security-note { font-size: 14px; color: #6b7280; margin-top: 24px; padding-top: 16px; border-top: 1px solid #e5e7eb; background: #fefce8; padding: 16px; border-radius: 6px; border-left: 4px solid #f59e0b; }
    .footer { background: #f8fafc; padding: 24px 30px; text-align: center; color: #6b7280; font-size: 14px; }
    .social-links { margin: 16px 0; }
    .social-link { color: #10b981; text-decoration: none; margin: 0 8px; font-weight: 500; }
    .contact-info { margin-top: 12px; font-size: 13px; }
    @media (max-width: 600px) {
      .header { padding: 30px 20px; }
      .header::after { position: static; transform: none; margin-top: 16px; display: block; }
      .content, .footer { padding: 30px 20px; }
      .capsule-card { padding: 20px; }
    }
  </style>
</head>
<body>
  <div class="email-container">
    <div class="header">
      <div class="logo">SoulBox</div>
      <div class="tagline">Your Time Capsule is Ready to Open!</div>
    </div>
    <div class="content">
      <div class="greeting">Hello,</div>
      <div class="message">The moment has arrived! Your SoulBox time capsule has reached its scheduled unlock time and is now ready for you to explore the memories you've preserved.</div>
      <div class="capsule-card">
        <div class="capsule-icon">📦</div>
        <div class="capsule-title">"${capsuleTitle}"</div>
        <div class="capsule-meta">Created on ${createdDate} • Now Ready to Open</div>
        <div class="unlock-key">${cap.encrypt_key}</div>
        <div style="font-size: 14px; color: #047857; margin-bottom: 16px;">🔑 Your Unlock Key</div>
      </div>
      <div style="text-align: center;">
        <a href="${unlockUrl}" class="cta-button">Open Your Capsule Now</a>
      </div>
      <div class="instructions">
        <h3>How to Access Your Capsule:</h3>
        <ol>
          <li>Click the "Open Your Capsule Now" button above</li>
          <li>Enter your unlock key when prompted</li>
          <li>Explore your preserved memories and messages</li>
          <li>Share the experience with loved ones if you wish</li>
        </ol>
      </div>
      <div class="security-note">
        <strong>🔒 Security Notice:</strong> This unlock key is unique to your capsule. 
        Please keep it secure and do not share it with anyone you don't trust. 
        If you believe you received this email in error, please contact our support team.
      </div>
    </div>
    <div class="footer">
      <div class="social-links">
        <a href="${process.env.BASE_URL}" class="social-link">Visit Website</a> • 
        <a href="${process.env.BASE_URL}/support" class="social-link">Get Support</a> • 
        <a href="${process.env.BASE_URL}/privacy" class="social-link">Privacy Policy</a>
      </div>
      <div class="contact-info">
        © 2025 SoulBox by Team SNAPDG. All rights reserved.<br>
        Preserving your memories, one capsule at a time.
      </div>
    </div>
  </div>
</body>
</html>
    `,
    text: `
🎉 YOUR SOULBOX CAPSULE IS READY!

Hello,

Great news! Your SoulBox time capsule "${capsuleTitle}" has reached its scheduled unlock time and is now ready to be opened.

Open your capsule here: ${unlockUrl}

Your Unlock Key: ${cap.encrypt_key}

IMPORTANT: Keep this unlock key safe and secure. You'll need it to access your capsule.

How to access:
1. Click the link above
2. Enter your unlock key when prompted
3. Explore your preserved memories
4. Share with loved ones if desired

If you have any issues accessing your capsule, please contact our support team.

---
SoulBox - Where Emotions Sleep in Time and Wake with Love
© 2025 Team SNAPDG. All rights reserved.
This email was sent to ${cap.recipient_email}
    `
  };
};

module.exports = {
  getReminderEmailTemplate,
  getUnlockEmailTemplate
};