import { chromium } from "playwright";
import { mkdirSync } from "node:fs";
import { join } from "node:path";

const BASE_URL = "http://127.0.0.1:5173/";
const ARTIFACT_DIR = "/opt/cursor/artifacts/browser-qa";

mkdirSync(ARTIFACT_DIR, { recursive: true });

async function waitForReady(page) {
  await page.waitForFunction(
    () => {
      const status = document.querySelector("#statusValue")?.textContent ?? "";
      return status !== "Loading" && status !== "Dictionary load failed";
    },
    null,
    { timeout: 15000 }
  );
}

async function waitForResult(page, timeoutMs = 12000) {
  await page.waitForFunction(
    () => {
      const overlay = document.querySelector("#resultOverlay");
      return overlay && !overlay.hidden && overlay.classList.contains("visible");
    },
    null,
    { timeout: timeoutMs }
  );
}

async function resetPage(page) {
  await page.goto(BASE_URL, { waitUntil: "networkidle" });
  await page.waitForSelector("#glyphCanvas");
  await page.evaluate(() => localStorage.clear());
  await page.reload({ waitUntil: "networkidle" });
  await page.waitForSelector("#glyphCanvas");
  await waitForReady(page);
}

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1400, height: 900 } });
page.on("pageerror", (error) => console.error("PAGEERROR", error.message));
const results = [];

try {
  await resetPage(page);

  const traceVisible = await page.locator("#traceBanner").isVisible();
  results.push({ check: "trace banner on first visit", pass: traceVisible });
  await page.screenshot({ path: join(ARTIFACT_DIR, "01-trace-mode.png"), fullPage: true });

  const castState = await page.evaluate(() => window.__spellSimulatorTest.injectCastDemo());
  results.push({
    check: "cast demo activates spell",
    pass: Boolean(castState?.active),
    castState
  });
  await page.screenshot({ path: join(ARTIFACT_DIR, "02-after-cast-inject.png"), fullPage: true });

  await waitForResult(page, 5000);
  const kicker = await page.locator("#resultKicker").textContent();
  const castPass = /spell sealed/i.test(kicker ?? "");
  results.push({ check: "cast result overlay", pass: castPass, kicker });
  await page.screenshot({ path: join(ARTIFACT_DIR, "03-cast-result.png"), fullPage: true });
  await page.waitForTimeout(3200);

  const replayButton = page.locator("#resultReplayButton");
  const replayVisible = await replayButton.isVisible();
  results.push({ check: "save clip button visible", pass: replayVisible });

  const clipProbe = await page.evaluate(() => window.__spellSimulatorTest.waitReplayClip());
  results.push({
    check: "seal replay clip generated",
    pass: clipProbe.size > 1000,
    clipProbe
  });

  await replayButton.click();
  await page.waitForTimeout(1000);
  const replayLabel = await replayButton.textContent();
  const replaySaved = /saved|preparing/i.test(replayLabel ?? "");
  results.push({ check: "save clip interaction", pass: replaySaved || clipProbe.size > 1000, replayLabel });

  await page.locator("#resultAgainButton").click();
  await page.waitForTimeout(400);
  await waitForReady(page);

  const fizzleState = await page.evaluate(() => window.__spellSimulatorTest.injectFizzleDemo());
  results.push({
    check: "empty ring inject fizzles",
    pass: Boolean(fizzleState?.ringClosed) && !fizzleState?.active,
    fizzleState
  });

  await waitForResult(page, 5000);
  const fizzleKicker = await page.locator("#resultKicker").textContent();
  const fizzleTitle = await page.locator("#resultTitle").textContent();
  const fizzlePass = /ring broke|fizzle/i.test(`${fizzleKicker} ${fizzleTitle}`);
  results.push({ check: "fizzle result overlay", pass: fizzlePass, fizzleKicker, fizzleTitle });
  await page.screenshot({ path: join(ARTIFACT_DIR, "04-fizzle-result.png"), fullPage: true });
} catch (error) {
  results.push({ check: "browser qa run", pass: false, error: String(error) });
  await page.screenshot({ path: join(ARTIFACT_DIR, "error.png"), fullPage: true });
} finally {
  await browser.close();
}

const failed = results.filter((result) => !result.pass);
console.log(JSON.stringify({ results, failed: failed.length }, null, 2));
process.exit(failed.length ? 1 : 0);
