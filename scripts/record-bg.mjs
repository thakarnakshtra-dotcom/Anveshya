// One-off recorder for the ambient background export (Instagram video task).
// Drives a real Chromium via Playwright at /capture-bg (the bare backdrop
// rig, see src/pages/CaptureBackground.jsx) and lets Playwright's built-in
// video recording capture actual rendered frames — the CSS animations here
// have no canvas for CCapture.js-style frame grabbing, so this is the
// correct approach, not a workaround.
//
// Usage: node scripts/record-bg.mjs <url> <durationSeconds> <width> <height> <outDir>
import { chromium } from "playwright";
import { mkdirSync } from "node:fs";

const [, , url, durationArg, widthArg, heightArg, outDir] = process.argv;
const duration = Number(durationArg || 18);
const width = Number(widthArg || 1080);
const height = Number(heightArg || 1920);

mkdirSync(outDir, { recursive: true });

const browser = await chromium.launch();
const context = await browser.newContext({
  viewport: { width, height },
  recordVideo: { dir: outDir, size: { width, height } },
});
const page = await context.newPage();
await page.goto(url, { waitUntil: "networkidle" });

console.log(`Recording ${duration}s at ${width}x${height}...`);
await page.waitForTimeout(duration * 1000);

await context.close(); // finalizes the video file
await browser.close();
console.log("Done.");
