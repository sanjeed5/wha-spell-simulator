const HAS_CAST_KEY = "spell-atelier-has-cast";
const TRACE_ENABLED_KEY = "spell-atelier-trace-enabled";
const DEFAULT_SPELL_ID = "fire-column";

export function createTraceMode({ dictionary, elements, onChange }) {
  let enabled = true;
  let spellId = DEFAULT_SPELL_ID;

  function sampleSpell() {
    return dictionary?.sampleSpells?.find((entry) => entry.id === spellId) ?? null;
  }

  function syncToggle() {
    if (elements.traceToggle) {
      elements.traceToggle.checked = enabled;
    }
  }

  function syncBanner() {
    if (!elements.traceBanner) {
      return;
    }
    const spell = sampleSpell();
    const visible = enabled && spell;
    elements.traceBanner.hidden = !visible;
    if (visible) {
      elements.traceBanner.textContent = `Tracing: ${spell.displayName ?? spell.id}. Draw over the faint lines, leave a gap in the ring, then close it to cast.`;
    }
  }

  function persistEnabled() {
    localStorage.setItem(TRACE_ENABLED_KEY, enabled ? "1" : "0");
  }

  function setEnabled(next) {
    enabled = Boolean(next);
    persistEnabled();
    syncToggle();
    syncBanner();
    onChange?.();
  }

  function loadSpell(id) {
    spellId = id;
    syncBanner();
    onChange?.();
  }

  function init() {
    const hasCast = localStorage.getItem(HAS_CAST_KEY) === "1";
    const saved = localStorage.getItem(TRACE_ENABLED_KEY);
    enabled = saved === null ? !hasCast : saved === "1";
    spellId = DEFAULT_SPELL_ID;
    syncToggle();
    syncBanner();
  }

  function markCastSuccess() {
    localStorage.setItem(HAS_CAST_KEY, "1");
  }

  function setupControls() {
    elements.traceToggle?.addEventListener("change", () => {
      setEnabled(elements.traceToggle.checked);
    });

    elements.sampleSpellReferenceCards?.addEventListener("click", (event) => {
      const button = event.target.closest("[data-trace-spell]");
      if (!button) {
        return;
      }
      loadSpell(button.dataset.traceSpell);
      setEnabled(true);
    });
  }

  return {
    init,
    setupControls,
    markCastSuccess,
    isEnabled: () => enabled,
    getSampleSpell: sampleSpell,
    loadSpell,
    setEnabled
  };
}
