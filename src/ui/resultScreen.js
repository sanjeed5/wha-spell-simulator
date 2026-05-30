import { GLYPH_WARNINGS } from "../parser/glyphWarnings.js";
import { clamp } from "../utils/geometry.js";

const CAST_REVEAL_DELAY_MS = 1400;
const FIZZLE_REVEAL_DELAY_MS = 700;

const ELEMENT_META = {
  fire: { emoji: "🔥", noun: "Flame", color: "#ff7a3d" },
  water: { emoji: "💧", noun: "Tide", color: "#3da5ff" },
  wind: { emoji: "🌪️", noun: "Gale", color: "#7fd4b0" },
  earth: { emoji: "🪨", noun: "Stone", color: "#c79a5b" },
  light: { emoji: "✨", noun: "Radiance", color: "#ffd66b" }
};

const FIZZLE_REASONS = {
  [GLYPH_WARNINGS.unsupportedMultipleRings]: "You drew more than one ring. The magic couldn't decide which circle to obey.",
  [GLYPH_WARNINGS.unsupportedMultipleSigils]: "Too many sigils inside the ring. The elements fought instead of casting.",
  [GLYPH_WARNINGS.primaryElementMissing]: "No element took hold in the center. The ring sealed around empty intent.",
  [GLYPH_WARNINGS.primaryElementUnsupported]: "That sigil isn't in the grimoire yet. The ring closed on an unknown rune.",
  [GLYPH_WARNINGS.symbolContaminated]: "Stray ink bled into your sigil and muddied the spell.",
  [GLYPH_WARNINGS.symbolAmbiguous]: "Your sigil was unclear — the magic scattered before it could form.",
  [GLYPH_WARNINGS.primarySigilAmbiguous]: "The ring couldn't tell which element you meant.",
  [GLYPH_WARNINGS.primarySigilConfidenceLow]: "The sigil was too faint to hold a spell."
};

const FIZZLE_ROASTS = [
  "Even Coco did better on her first try.",
  "The Knights Moralis are NOT impressed.",
  "Detention. Draw it again.",
  "A confident fizzle. Respectable.",
  "The ink dried laughing.",
  "Qifrey sighs from somewhere far away."
];

function elementMeta(element) {
  return ELEMENT_META[element] ?? { emoji: "🌀", noun: "Spell", color: "#b48a5a" };
}

function witchTitle(spellIR) {
  const meta = elementMeta(spellIR?.element);
  const stability = clamp(spellIR?.stability ?? 0);
  if (stability >= 0.82) {
    return `Master ${meta.noun}weaver`;
  }
  if (stability >= 0.62) {
    return `${meta.noun} Adept`;
  }
  if (stability >= 0.4) {
    return `Apprentice of ${meta.noun}`;
  }
  return `Chaos ${meta.noun}caller`;
}

function manifestationLabel(spellIR) {
  const entries = Object.entries(spellIR?.manifestations ?? {}).filter(
    ([, m]) => (m?.strength ?? 0) > 0
  );
  if (!entries.length || spellIR?.primaryManifestation === "none") {
    return "free-form";
  }
  return entries.map(([id]) => id).join(" + ");
}

function pct(value) {
  return `${Math.round(clamp(value ?? 0) * 100)}%`;
}

function barEmoji(value) {
  const filled = Math.round(clamp(value ?? 0) * 5);
  return "█".repeat(filled) + "░".repeat(5 - filled);
}

function fizzleReason(spellIR) {
  const warnings = spellIR?.warnings ?? [];
  for (const code of Object.keys(FIZZLE_REASONS)) {
    if (warnings.includes(code)) {
      return FIZZLE_REASONS[code];
    }
  }
  return "No stable magic formed inside the ring.";
}

function pickRoast() {
  return FIZZLE_ROASTS[Math.floor(Math.random() * FIZZLE_ROASTS.length)];
}

function meterRow(label, value, color) {
  return `
    <div class="result-meter">
      <span>${label}</span>
      <div class="result-meter-track"><span style="width:${pct(value)};background:${color}"></span></div>
      <span class="result-meter-value">${pct(value)}</span>
    </div>`;
}

function composeShareCard({ glyphCanvas, effectCanvas, spellIR, outcome, title }) {
  const W = 1080;
  const H = 1350;
  const card = document.createElement("canvas");
  card.width = W;
  card.height = H;
  const ctx = card.getContext("2d");
  const meta = elementMeta(spellIR?.element);

  const bg = ctx.createLinearGradient(0, 0, 0, H);
  bg.addColorStop(0, "#1c1712");
  bg.addColorStop(1, "#0d0a07");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  const glow = ctx.createRadialGradient(W / 2, 560, 80, W / 2, 560, 620);
  glow.addColorStop(0, `${meta.color}33`);
  glow.addColorStop(1, "transparent");
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, W, H);

  const artX = 90;
  const artY = 250;
  const artW = W - 180;
  const artH = 620;
  ctx.save();
  ctx.globalAlpha = 0.95;
  if (effectCanvas) {
    ctx.drawImage(effectCanvas, artX, artY, artW, artH);
  }
  if (glyphCanvas) {
    ctx.drawImage(glyphCanvas, artX, artY, artW, artH);
  }
  ctx.restore();

  ctx.textAlign = "center";
  ctx.fillStyle = meta.color;
  ctx.font = "600 34px Georgia, serif";
  ctx.fillText(outcome === "cast" ? "SPELL SEALED" : "SPELL FIZZLED", W / 2, 150);

  ctx.fillStyle = "#f4ece0";
  ctx.font = "700 76px Georgia, serif";
  ctx.fillText(title, W / 2, 1010);

  ctx.fillStyle = "#c9bba8";
  ctx.font = "400 40px Georgia, serif";
  const sub = outcome === "cast"
    ? `${meta.emoji} ${spellIR.element} · ${manifestationLabel(spellIR)}`
    : `${meta.emoji} the ring rejected the spell`;
  ctx.fillText(sub, W / 2, 1075);

  if (outcome === "cast") {
    ctx.fillStyle = "#a89b88";
    ctx.font = "500 38px Georgia, serif";
    ctx.fillText(
      `Stability ${pct(spellIR.stability)}   ·   Quality ${pct(spellIR.quality)}`,
      W / 2,
      1150
    );
  }

  ctx.fillStyle = "#7d7264";
  ctx.font = "400 30px Georgia, serif";
  ctx.fillText("Spell Atelier · fan project", W / 2, 1280);

  return card;
}

function shareText({ spellIR, outcome, title }) {
  const meta = elementMeta(spellIR?.element);
  const url = window.location.origin + window.location.pathname;
  if (outcome === "cast") {
    return [
      `Spell Atelier 🪄`,
      `${meta.emoji} ${title}`,
      `Stability ${barEmoji(spellIR.stability)} ${pct(spellIR.stability)}`,
      `Cast yours: ${url}`
    ].join("\n");
  }
  return [
    `Spell Atelier 🪄`,
    `💨 I fizzled a ${meta.noun} spell.`,
    pickRoast(),
    `Try to do better: ${url}`
  ].join("\n");
}

export function createResultScreen({ elements, onCastAgain, sealReplay }) {
  const overlay = document.querySelector("#resultOverlay");
  const card = document.querySelector("#resultCard");
  const kicker = document.querySelector("#resultKicker");
  const titleEl = document.querySelector("#resultTitle");
  const sigilEl = document.querySelector("#resultSigil");
  const lineEl = document.querySelector("#resultLine");
  const metersEl = document.querySelector("#resultMeters");
  const blurbEl = document.querySelector("#resultBlurb");
  const saveButton = document.querySelector("#resultSaveButton");
  const replayButton = document.querySelector("#resultReplayButton");
  const copyButton = document.querySelector("#resultCopyButton");
  const againButton = document.querySelector("#resultAgainButton");
  const dismissButton = document.querySelector("#resultDismissButton");

  let revealTimer = null;
  let current = null;

  if (replayButton) {
    replayButton.hidden = !sealReplay?.isSupported?.();
  }

  function hide() {
    if (revealTimer) {
      clearTimeout(revealTimer);
      revealTimer = null;
    }
    overlay.hidden = true;
    overlay.classList.remove("visible");
    current = null;
  }

  function renderCast(spellIR) {
    const meta = elementMeta(spellIR.element);
    const title = witchTitle(spellIR);
    current = { spellIR, outcome: "cast", title };
    card.className = "result-card cast";
    card.style.setProperty("--accent", meta.color);
    kicker.textContent = "Spell Sealed";
    titleEl.textContent = title;
    sigilEl.textContent = meta.emoji;
    lineEl.textContent = `${spellIR.element} · ${manifestationLabel(spellIR)}`;
    metersEl.innerHTML =
      meterRow("Stability", spellIR.stability, meta.color) +
      meterRow("Quality", spellIR.quality, meta.color) +
      meterRow("Force", spellIR.force, meta.color);
    blurbEl.textContent = "";
    blurbEl.hidden = true;
  }

  function renderFizzle(spellIR) {
    const meta = elementMeta(spellIR?.element);
    current = { spellIR, outcome: "fizzle", title: "Spell Fizzled" };
    card.className = "result-card fizzle";
    card.style.setProperty("--accent", "#b54a3a");
    kicker.textContent = "Ring Broke";
    titleEl.textContent = "Spell Fizzled";
    sigilEl.textContent = "💨";
    lineEl.textContent = fizzleReason(spellIR);
    metersEl.innerHTML = "";
    blurbEl.textContent = pickRoast();
    blurbEl.hidden = false;
  }

  function reveal(outcome, spellIR) {
    if (outcome === "cast") {
      renderCast(spellIR);
    } else {
      renderFizzle(spellIR);
    }
    overlay.hidden = false;
    requestAnimationFrame(() => overlay.classList.add("visible"));
  }

  function scheduleShow(outcome, spellIR) {
    if (revealTimer) {
      clearTimeout(revealTimer);
    }
    const delay = outcome === "cast" ? CAST_REVEAL_DELAY_MS : FIZZLE_REVEAL_DELAY_MS;
    revealTimer = setTimeout(() => {
      revealTimer = null;
      reveal(outcome, spellIR);
    }, delay);
  }

  saveButton.addEventListener("click", () => {
    if (!current) {
      return;
    }
    const cardCanvas = composeShareCard({
      glyphCanvas: elements.glyphCanvas,
      effectCanvas: elements.effectCanvas,
      spellIR: current.spellIR,
      outcome: current.outcome,
      title: current.title
    });
    cardCanvas.toBlob((blob) => {
      if (!blob) {
        return;
      }
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `spell-atelier-${current.outcome}.png`;
      link.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    }, "image/png");
  });

  copyButton.addEventListener("click", async () => {
    if (!current) {
      return;
    }
    const text = shareText(current);
    try {
      await navigator.clipboard.writeText(text);
      copyButton.textContent = "Copied!";
      setTimeout(() => (copyButton.textContent = "Copy result"), 1500);
    } catch {
      copyButton.textContent = "Copy failed";
      setTimeout(() => (copyButton.textContent = "Copy result"), 1500);
    }
  });

  replayButton?.addEventListener("click", async () => {
    if (!sealReplay) {
      return;
    }
    replayButton.disabled = true;
    replayButton.textContent = "Preparing clip…";
    const blob = await sealReplay.waitForClip();
    replayButton.disabled = false;
    if (!blob) {
      replayButton.textContent = "Clip unavailable";
      setTimeout(() => (replayButton.textContent = "Save clip"), 1800);
      return;
    }
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `spell-atelier-${current?.outcome ?? "replay"}.webm`;
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    replayButton.textContent = "Saved!";
    setTimeout(() => (replayButton.textContent = "Save clip"), 1500);
  });

  againButton.addEventListener("click", () => {
    hide();
    onCastAgain?.();
  });

  dismissButton.addEventListener("click", () => {
    hide();
  });

  return { scheduleShow, hide };
}
