const express = require("express");
const router = express.Router();
const puppeteer = require("puppeteer");
const db = require("../db");

router.get("/download/:capsuleId", async (req, res) => {
  let browser;
  try {
    const { capsuleId } = req.params;

    // Fetch capsule
    const [rows] = await db.query("SELECT * FROM capsules WHERE id = ?", [
      capsuleId,
    ]);

    if (!rows.length) {
      return res.status(404).json({ error: "Capsule not found" });
    }

    const cap = rows[0];

    if (cap.is_unlocked !== 1) {
      return res.status(403).json({ error: "Capsule is not unlocked yet" });
    }

    // Create HTML content directly with embedded CSS
    const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Certificate of Memory - SoulBox</title>
      <style>
        /* Certificate Styles for PDF Generation */
        @page {
          size: 1000px 700px;
          margin: 0;
        }
        
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        body {
          font-family: 'Georgia', 'Times New Roman', serif;
          background: linear-gradient(135deg, #1a1a2e 0%, #0f172a 100%) !important;
          color: #ffffff;
          width: 1000px;
          height: 700px;
          overflow: hidden;
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }
        
        .certificate {
          width: 1000px;
          height: 700px;
          padding: 50px;
          background: linear-gradient(145deg, rgba(26, 26, 46, 0.95) 0%, rgba(15, 23, 42, 0.98) 100%);
          position: relative;
          border: 15px solid rgba(139, 92, 246, 0.3);
          box-shadow: 
            0 20px 50px rgba(0, 0, 0, 0.5),
            inset 0 0 60px rgba(139, 92, 246, 0.1);
        }
        
        /* Decorative Corners */
        .corner {
          position: absolute;
          width: 30px;
          height: 30px;
          border: 2px solid #fbbf24;
          opacity: 0.7;
        }
        
        .corner-tl {
          top: 20px;
          left: 20px;
          border-right: none;
          border-bottom: none;
        }
        
        .corner-tr {
          top: 20px;
          right: 20px;
          border-left: none;
          border-bottom: none;
        }
        
        .corner-bl {
          bottom: 20px;
          left: 20px;
          border-right: none;
          border-top: none;
        }
        
        .corner-br {
          bottom: 20px;
          right: 20px;
          border-left: none;
          border-top: none;
        }
        
        /* Seal */
        .seal {
          position: absolute;
          top: 20px;
          right: 20px;
          width: 50px;
          height: 50px;
          background: rgba(251, 191, 36, 0.1);
          border: 2px solid rgba(251, 191, 36, 0.3);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #fbbf24;
          font-size: 20px;
        }
        
        /* Header */
        .header {
          text-align: center;
          margin-bottom: 25px;
        }
        
        .cert-title {
          font-size: 40px;
          font-weight: bold;
          color: #fff;
          margin-bottom: 10px;
          background: linear-gradient(45deg, #fbbf24, #8b5cf6);
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
        }
        
        .divider {
          width: 180px;
          height: 2px;
          background: linear-gradient(90deg, transparent, #8b5cf6, transparent);
          margin: 5px auto 15px;
        }
        
        /* Intro */
        .intro {
          text-align: center;
          font-size: 16px;
          color: rgba(255, 255, 255, 0.9);
          margin-bottom: 25px;
          font-style: italic;
        }
        
        /* Memory Section */
        .memory-section {
          text-align: center;
          margin-bottom: 30px;
          padding: 20px;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 10px;
          border: 1px solid rgba(255, 255, 255, 0.1);
        }
        
        .memory-label {
          font-size: 12px;
          color: #06b6d4;
          text-transform: uppercase;
          letter-spacing: 2px;
          margin-bottom: 5px;
        }
        
        .memory-name {
          font-size: 28px;
          font-weight: bold;
          color: #fff;
          margin: 10px 0;
          line-height: 1.3;
          min-height: 60px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .memory-subtitle {
          font-size: 14px;
          color: rgba(255, 255, 255, 0.7);
          font-style: italic;
        }
        
        /* Dates Section */
        .dates-section {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 30px;
          margin-bottom: 25px;
        }
        
        .date-card {
          flex: 1;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 10px;
          padding: 15px;
          border: 1px solid rgba(255, 255, 255, 0.1);
          min-width: 180px;
        }
        
        .date-header {
          text-align: center;
          margin-bottom: 10px;
        }
        
        .date-header h3 {
          color: #fbbf24;
          font-size: 14px;
          margin: 0;
        }
        
        .date-content {
          text-align: center;
        }
        
        .date-main {
          font-size: 14px;
          color: #fff;
          margin: 5px 0;
          font-weight: bold;
        }
        
        .date-time {
          font-size: 12px;
          color: rgba(255, 255, 255, 0.7);
          margin: 0;
        }
        
        .date-connector {
          color: #8b5cf6;
          font-size: 18px;
          font-weight: bold;
        }
        
        /* Quote Section */
        .quote-section {
          text-align: center;
          margin-bottom: 20px;
          padding: 15px;
        }
        
        .quote {
          font-size: 16px;
          color: #fff;
          font-style: italic;
          margin: 10px 0;
          font-weight: 300;
        }
        
        /* Footer */
        .footer {
          text-align: center;
          padding-top: 15px;
          border-top: 1px solid rgba(255, 255, 255, 0.2);
        }
        
        .brand-name {
          font-size: 22px;
          font-weight: bold;
          color: #8b5cf6;
          letter-spacing: 1px;
          display: block;
          margin-bottom: 5px;
        }
        
        .brand-tagline {
          font-size: 12px;
          color: rgba(255, 255, 255, 0.7);
          font-style: italic;
          display: block;
          margin-bottom: 10px;
        }
        
        .team-info {
          font-size: 11px;
          color: rgba(255, 255, 255, 0.5);
        }
        
        /* Certificate ID */
        .cert-id {
          position: absolute;
          bottom: 15px;
          left: 20px;
          font-size: 10px;
          color: rgba(255, 255, 255, 0.4);
          letter-spacing: 1px;
        }
        
        /* Utility Classes for PDF */
        .no-break {
          page-break-inside: avoid;
          break-inside: avoid;
        }
        
        .full-page {
          page-break-after: always;
          break-after: page;
        }
      </style>
    </head>
    <body>
      <div class="certificate full-page no-break">
        <!-- Decorative Corners -->
        <div class="corner corner-tl"></div>
        <div class="corner corner-tr"></div>
        <div class="corner corner-bl"></div>
        <div class="corner corner-br"></div>
        
        <!-- Seal -->
        <div class="seal">❤</div>
        
        <!-- Certificate Content -->
        <div class="header">
          <h1 class="cert-title">Certificate of Memory</h1>
          <div class="divider"></div>
        </div>
        
        <p class="intro">
          This certifies the preservation of a cherished memory
        </p>
        
        <div class="memory-section no-break">
          <div class="memory-label">Memory Title</div>
          <h2 class="memory-name">"${cap.title}"</h2>
          <div class="memory-subtitle">A timeless treasure preserved in SoulBox</div>
        </div>
        
        <div class="dates-section no-break">
          <div class="date-card">
            <div class="date-header">
              <h3>Created On</h3>
            </div>
            <div class="date-content">
              <p class="date-main">${new Date(cap.created_at).toLocaleDateString('en-US', { 
                weekday: 'long',
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}</p>
              <p class="date-time">${new Date(cap.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
            </div>
          </div>
          
          <div class="date-connector">→</div>
          
          <div class="date-card">
            <div class="date-header">
              <h3>Unlocked On</h3>
            </div>
            <div class="date-content">
              <p class="date-main">${new Date(cap.unlocked_at).toLocaleDateString('en-US', { 
                weekday: 'long',
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}</p>
              <p class="date-time">${new Date(cap.unlocked_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
            </div>
          </div>
        </div>
        
        <div class="quote-section no-break">
          <p class="quote">
            "Where Emotions Sleep in Time and Wake with Love"
          </p>
        </div>
        
        <div class="footer no-break">
          <span class="brand-name">SoulBox</span>
          <span class="brand-tagline">Preserving Memories, Creating Legacies</span>
          <div class="team-info">
            <span>by Team SNAPDG</span>
            <span> • © ${new Date().getFullYear()}</span>
          </div>
        </div>
        
        <!-- Certificate ID -->
        <div class="cert-id">
          Certificate ID: ${capsuleId.slice(-8)}
        </div>
      </div>
    </body>
    </html>
    `;

    // Launch Puppeteer
    browser = await puppeteer.launch({
      headless: true,
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--disable-gpu",
        "--disable-software-rasterizer",
      ],
    });

    const page = await browser.newPage();

    // Set viewport to exact certificate size
    await page.setViewport({
      width: 1000,
      height: 700,
      deviceScaleFactor: 2, // Higher DPI for better quality
    });

    // Set HTML content directly
    await page.setContent(htmlContent, {
      waitUntil: 'load',
      timeout: 30000
    });

    // Wait for fonts (alternative to waitForTimeout)
    await page.evaluate(() => {
      return new Promise((resolve) => {
        setTimeout(resolve, 1000);
      });
    });

    // Generate PDF with proper settings
    const pdfBuffer = await page.pdf({
      width: '1000px',
      height: '700px',
      printBackground: true,
      pageRanges: '1',
      scale: 1,
      margin: {
        top: '0px',
        right: '0px',
        bottom: '0px',
        left: '0px'
      },
      preferCSSPageSize: false // Set to false for custom size
    });

    await browser.close();

    res.set({
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename=soulbox-certificate-${capsuleId}.pdf`,
      "Content-Length": pdfBuffer.length
    });

    return res.send(pdfBuffer);
  } catch (err) {
    console.error("PDF GENERATION ERROR:", err);
    if (browser) {
      await browser.close();
    }
    return res
      .status(500)
      .json({ error: "Failed to generate certificate PDF", details: err.message });
  }
});

module.exports = router;