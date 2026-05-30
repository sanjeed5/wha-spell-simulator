import { CONFIG } from "./config.js";
import { loadDictionary } from "./dictionary/dictionaryLoader.js";
import { DrawingCapture } from "./input/drawingCapture.js";
import { createStrokeStore } from "./input/strokeStore.js";
import { classifyDrawing } from "./parser/drawingClassifier.js";
import { compileSpell } from "./compiler/spellBuilder.js";
import { CanvasRenderer } from "./renderer/canvasRenderer.js";
import { setupCanvasSizing as setupResponsiveCanvasSizing } from "./ui/canvasSizing.js";
import { updateDiagnostics, updateDiagnosticsMode } from "./ui/diagnosticsView.js";
import { getElements } from "./ui/elements.js";
import { renderDictionaryReference } from "./ui/dictionaryReferenceView.js";
import { updateStatus, updateSummary } from "./ui/spellSummaryView.js";
import { setupTabs } from "./ui/tabs.js";
import { createResultScreen } from "./ui/resultScreen.js";
import { createTraceMode } from "./ui/traceMode.js";
import { createSealReplay } from "./ui/sealReplay.js";
import { buildCastDemoStrokes, buildFizzleDemoStrokes } from "./ui/testStrokeFixtures.js";

const elements = getElements();
const store = createStrokeStore();
let dictionary = null;
let renderer = null;
let capture = null;
let pipeline = null;
let spellIR = null;
let previousRing = null;
let resizeObserver = null;
let resultScreen = null;
let traceMode = null;
let sealReplay = null;
let lastSealState = null;
let strokeCountAtLastRecompute = 0;

function setupCanvasSizing() {
  resizeObserver = setupResponsiveCanvasSizing({
    elements,
    store,
    onCanvasResized: () => {
      previousRing = null;
      recompute();
    }
  });
}

function recompute() {
  if (!dictionary) {
    return;
  }

  pipeline = classifyDrawing({
    strokes: store.getStrokes(),
    previousRing,
    dictionary,
    config: CONFIG
  });
  previousRing = pipeline.ring;
  spellIR = compileSpell({ glyphAST: pipeline.glyphAST, dictionary, config: CONFIG });
  updateSummary({ elements, store, capture, pipeline, spellIR });
  updateDiagnostics({ elements, store, pipeline, spellIR });

  const strokeCount = store.count();
  if (strokeCount > strokeCountAtLastRecompute) {
    sealReplay?.onFirstStroke();
  }
  strokeCountAtLastRecompute = strokeCount;

  detectSeal();
}

function detectSeal() {
  const ringClosed = Boolean(pipeline?.ring?.complete);
  const hasUnsupportedRings = Boolean(pipeline?.ring?.unsupportedMultipleRings?.length);
  const hasUnsupportedSigils = Boolean(pipeline?.glyphAST?.unsupportedMultipleSigils?.length);
  const sealState = spellIR?.active
    ? "cast"
    : ringClosed || hasUnsupportedRings || hasUnsupportedSigils
      ? "fizzle"
      : null;

  if (sealState && sealState !== lastSealState) {
    if (sealState === "cast") {
      traceMode?.markCastSuccess();
    }
    sealReplay?.onSeal();
    resultScreen?.scheduleShow(sealState, spellIR);
  } else if (!sealState) {
    resultScreen?.hide();
  }
  lastSealState = sealState;
}

function resetCanvas() {
  store.clear();
  previousRing = null;
  lastSealState = null;
  strokeCountAtLastRecompute = 0;
  sealReplay?.reset();
  recompute();
}

function animationFrame(timestamp) {
  renderer.renderGlyph({
    strokes: store.getStrokes(),
    currentStroke: capture.getCurrentStroke(),
    pipeline,
    showGuides: elements.guidesToggle.checked,
    showDebug: elements.diagnosticsToggle.checked,
    traceSampleSpell: traceMode?.isEnabled() ? traceMode.getSampleSpell() : null
  });

  if (spellIR.active) {
    renderer.renderActivatedGlyph({
      activatedAt: spellIR.activatedAt,
      duration: spellIR.duration,
      strokes: store.getStrokes(),
      pipeline,
      timestamp
    });
  }

  renderer.renderEffect({
    spellIR,
    ring: pipeline?.ring,
    timestamp,
    showGuides: elements.guidesToggle.checked
  });
  sealReplay?.captureFrame();
  requestAnimationFrame(animationFrame);
}

function setupControls() {
  elements.undoButton.addEventListener("click", () => {
    store.undo();
    previousRing = null;
    lastSealState = null;
    strokeCountAtLastRecompute = store.count();
    recompute();
  });

  elements.clearButton.addEventListener("click", () => {
    resetCanvas();
  });

  elements.guidesToggle.addEventListener("change", () => {
    updateSummary({ elements, store, capture, pipeline, spellIR });
    updateDiagnostics({ elements, store, pipeline, spellIR });
  });

  elements.diagnosticsToggle.addEventListener("change", () => {
    updateDiagnosticsMode(elements);
    updateDiagnostics({ elements, store, pipeline, spellIR });
  });

  updateDiagnosticsMode(elements);
}

function injectStrokes(strokeEntries) {
  store.clear();
  for (const stroke of strokeEntries) {
    store.addStroke(stroke.points);
  }
  previousRing = null;
  lastSealState = null;
  strokeCountAtLastRecompute = 0;
  sealReplay?.reset();
  recompute();
  if (store.count() > 0) {
    sealReplay?.onFirstStroke();
  }
  return {
    status: elements.statusValue.textContent,
    active: spellIR?.active,
    ringClosed: Boolean(pipeline?.ring?.complete)
  };
}

function injectSampleSpell(spellId, strokeLimit) {
  const spell = dictionary?.sampleSpells?.find((entry) => entry.id === spellId);
  if (!spell) {
    return null;
  }
  const width = elements.glyphCanvas.width;
  const height = elements.glyphCanvas.height;
  const sourceStrokes =
    typeof strokeLimit === "number" ? spell.strokes.slice(0, strokeLimit) : spell.strokes;
  const strokeEntries = sourceStrokes
    .filter((stroke) => Array.isArray(stroke) && stroke.length >= 2)
    .map((stroke) => ({
      points: stroke.map((point, pointIndex) => ({
        x: point.x * width,
        y: point.y * height,
        pressure: 0.5,
        t: performance.now() + pointIndex
      }))
    }));
  return injectStrokes(strokeEntries);
}

function injectCastDemo() {
  const spell = dictionary?.sampleSpells?.find((entry) => entry.id === "fire-column");
  if (!spell) {
    return null;
  }
  const width = elements.glyphCanvas.width;
  const height = elements.glyphCanvas.height;
  return injectStrokes(buildCastDemoStrokes({ sampleSpell: spell, width, height }));
}

function injectFizzleDemo() {
  const width = elements.glyphCanvas.width;
  const height = elements.glyphCanvas.height;
  return injectStrokes(buildFizzleDemoStrokes({ width, height }));
}

async function init() {
  setupTabs(elements);
  setupControls();
  setupCanvasSizing();
  renderer = new CanvasRenderer({
    glyphCanvas: elements.glyphCanvas,
    effectCanvas: elements.effectCanvas,
    config: CONFIG
  });
  sealReplay = createSealReplay({
    glyphCanvas: elements.glyphCanvas,
    effectCanvas: elements.effectCanvas
  });
  resultScreen = createResultScreen({ elements, onCastAgain: resetCanvas, sealReplay });
  capture = new DrawingCapture(elements.glyphCanvas, store, CONFIG, {
    onPreview: () => {},
    onCommit: recompute
  });

  try {
    dictionary = await loadDictionary();
    traceMode = createTraceMode({ dictionary, elements, onChange: () => {} });
    traceMode.init();
    traceMode.setupControls();
    renderDictionaryReference(elements, dictionary);
    capture.enable();
    recompute();
    requestAnimationFrame(animationFrame);

    if (import.meta.env.DEV) {
      window.__spellSimulatorTest = {
        injectSampleSpell,
        injectCastDemo,
        injectFizzleDemo,
        async waitReplayClip() {
          const blob = await sealReplay.waitForClip(8000);
          return { size: blob?.size ?? 0, type: blob?.type ?? null };
        }
      };
    }
  } catch (error) {
    console.error(error);
    updateStatus(elements, "Dictionary load failed", "invalid");
  }
}

init();
