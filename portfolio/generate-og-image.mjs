import { chromium } from "playwright";
import { fileURLToPath } from "url";
import path from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;700;900&family=JetBrains+Mono:wght@400;500&display=swap');

    * { margin: 0; padding: 0; box-sizing: border-box; }

    body {
      width: 1200px;
      height: 630px;
      background: #0a0a0b;
      font-family: 'Space Grotesk', sans-serif;
      overflow: hidden;
      position: relative;
    }

    /* Gradient orb on the right */
    .orb {
      position: absolute;
      top: 50%;
      right: -60px;
      transform: translateY(-50%);
      width: 480px;
      height: 480px;
      border-radius: 50%;
      background: radial-gradient(circle at center,
        rgba(210, 255, 0, 0.18) 0%,
        rgba(210, 255, 0, 0.06) 40%,
        transparent 70%
      );
      filter: blur(40px);
      pointer-events: none;
    }

    /* Subtle grid lines */
    .grid {
      position: absolute;
      inset: 0;
      background-image:
        linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px),
        linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px);
      background-size: 60px 60px;
      pointer-events: none;
    }

    /* Top accent line */
    .accent-line {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 3px;
      background: linear-gradient(90deg, #D2FF00 0%, transparent 60%);
    }

    .content {
      position: relative;
      z-index: 1;
      padding: 80px 90px;
      height: 100%;
      display: flex;
      flex-direction: column;
      justify-content: center;
    }

    .name {
      font-size: 72px;
      font-weight: 900;
      color: #ffffff;
      letter-spacing: -2px;
      line-height: 1.05;
    }

    .role {
      font-family: 'JetBrains Mono', monospace;
      font-size: 28px;
      font-weight: 500;
      color: #D2FF00;
      margin-top: 18px;
      letter-spacing: -0.5px;
    }

    .company {
      font-size: 20px;
      color: #94a3b8;
      margin-top: 12px;
      font-weight: 400;
      letter-spacing: 0.5px;
    }

    .url {
      position: absolute;
      bottom: 40px;
      left: 90px;
      font-size: 16px;
      color: #64748b;
      font-family: 'JetBrains Mono', monospace;
      letter-spacing: 0.5px;
    }
  </style>
</head>
<body>
  <div class="accent-line"></div>
  <div class="grid"></div>
  <div class="orb"></div>
  <div class="content">
    <div class="name">Fernando Prada</div>
    <div class="role">AI Architect & Tech Lead</div>
    <div class="company">Devoteam &middot; Spain</div>
  </div>
  <div class="url">fernandoprada.com</div>
</body>
</html>`;

async function generate() {
  const browser = await chromium.launch();
  const page = await browser.newPage({
    viewport: { width: 1200, height: 630 },
  });

  await page.setContent(html, { waitUntil: "networkidle" });

  // Give fonts a moment to load
  await page.waitForTimeout(2000);

  const outputPath = path.join(__dirname, "public", "og-image.jpg");

  await page.screenshot({
    path: outputPath,
    type: "jpeg",
    quality: 92,
  });

  await browser.close();
  console.log(`OG image saved to: ${outputPath}`);
}

generate().catch((err) => {
  console.error("Failed to generate OG image:", err);
  process.exit(1);
});
