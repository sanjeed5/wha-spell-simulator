# Spell Atelier — Product & Engineering Plan

> Fork of [ytnrvdf/wha-spell-simulator](https://github.com/ytnrvdf/wha-spell-simulator).
> A fan-made Witch Hat Atelier spell-drawing simulator. This plan reframes it from a
> tech demo into a **shareable, social experience**.

**One-line goal:** make closing a spell circle something people send to friends.

---

## TL;DR for the next agent

- **Keep the engine.** Do not rewrite in React. The parser → compiler → renderer pipeline
  (~6K LOC) works. The gap is *everything after the seal*.
- **The core problem:** the app ends at the exact moment it should begin. Sealing the ring
  locks the canvas and dead-ends. There is no payoff, no capture, no share.
- **The fix that unlocks everything:** a post-seal **result screen** + **clip/card capture**.
  A work-in-progress version is already in this branch (`src/ui/resultScreen.js`).
- **North-star metric:** spells *shared* per spell *cast*. Target 15%+ of casts clicking
  any share/export action before building any backend.
- **Beginners need tracing, not tutorials.** Blank canvas kills first-time casts. Show faint
  ghost overlays from existing `sample-spells.json` / dictionary templates so new users can
  trace their first spell in under 60 seconds.
- **Build solo-shareable loops first; add multiplayer backend only once clips are spreading.**

---

## 1. Who this is for

Not "WHA lore fans who want accurate magic." The real audience is **performers**:

- Anime fans who watched Witch Hat Atelier and want to LARP the magic system.
- People who like drawing party games (Gartic Phone, Jackbox, skribbl).
- TikTok / Reels viewers who share satisfying or funny 3-second moments.

They want a **moment**, a **flex**, or a **fail** — not a compiler.

---

## 2. The viral moment

> You draw messy lines in silence. You close the ring. Something explodes — or fizzles
> embarrassingly. That 3-second payoff is the product.

Everything we build serves that clip, that screenshot, that "beat this" link.
Recognition accuracy, parchment textures, and compiler depth only matter insofar as
they make that moment land.

---

## 3. Current state (what the app is today)

A **3-column developer tech-demo**:

- **Left:** Undo / Clear / Guides / Diagnostics toggles, spell-state meters.
- **Center:** dual-canvas drawing surface (`glyphCanvas` ink + `effectCanvas` particles).
- **Right:** Dictionary reference + **Parser / AST / IR JSON** diagnostic panels.

Pipeline:

```
Pointer strokes → strokeStore → classifyDrawing() → GlyphAST
  → compileSpell() → SpellIR → SpellEffectRenderer (particles)
```

Content: 5 sigils (fire, water, wind, earth, light), 3 signs (column, levitation,
convergence), one ring at a time. Vite + vanilla ES modules, Canvas 2D, no backend,
GitHub Pages deploy. Live demo: https://ytnrvdf.github.io/wha-spell-simulator

---

## 4. Gaps in the user flow

| # | Gap | Why it hurts |
|---|-----|--------------|
| 1 | No goal on arrival — hint assumes you know WHA | New users freeze |
| 2 | Blank-canvas cold start, no example to trace | High bounce before first cast |
| 3 | **Dead end after cast** — input locks, only Clear/Undo | The moment ends and nothing follows |
| 4 | Failure is a cul-de-sac — can't fix, must clear & restart | Frustration, no second try |
| 5 | Failure messages are diagnostic ("contaminated sigil") | Reads like a compiler error, not a game |
| 6 | No replay / no capture of the payoff | The shareable 3s is never saved |
| 7 | Success feels small (meters tick, particles fade) | No climax, no "YOU DID IT" |
| 8 | Diagnostics (Parser/AST/IR JSON) dominate the UI | Signals "this is for programmers" |
| 9 | No mobile consideration (fixed 1200×800, 3-col) | TikTok traffic is mobile and can't play |
| 10 | No progression / no reason to cast a second spell | Zero retention |

**Core insight:** the seal is the climax, and right now the climax leads to a locked canvas.

---

## 5. Gaps to make it social

Nothing social exists today. Mapped to the funnel:

| Stage | Missing piece | What to add |
|-------|---------------|-------------|
| Capture | No recording of the cast | Replay recorder (canvas → clip) |
| Package | No artifact to send | Spell Card PNG + Fizzle Letter |
| Distribute | No link, no copy text | Challenge link + emoji result grid |
| Return | No reason to come back | Daily Sigil challenge |
| Compete | No one else exists | "Beat my seal" ghost / coven counter |
| Identity | No persona | Witch title / element badge on card |

---

## 6. High-impact / low-effort ideas (ranked by impact ÷ effort)

All of these are **no-backend** unless noted.

| Rank | Idea | Hook | Effort | Impact |
|------|------|------|--------|--------|
| 1 | **Seal Replay** | 5s vertical clip: draw → seal → boom/fizzle, one tap | 8–16 hrs | 10 |
| 2 | **Spell Card** | Story-size PNG: glyph, element, score, CAST/FIZZLE stamp | 4–8 hrs | 9 |
| 3 | **Fizzle Letter** | Parchment roast card when you fail — fails are funnier on TikTok | 4–6 hrs | 9 |
| 4 | **Daily Sigil** | Wordle for glyphs; spoiler-free emoji result (`🔥🟢🟡⚪ 72%`) | ~1 day | 9 |
| 5 | **Beat My Seal** | Link loads opponent's ghost strokes + target score | 1–1.5 days | 8 |
| 6 | **Emoji Seal Grid** | Copy-paste result for Discord/Twitter, no image gen | 2 hrs | 7 |
| 7 | **Percentile Lie** | "Top 8% fire stability today" — formula from score, no DB | 2 hrs | 8 |
| 8 | **Fake Coven** | "412 witches sealed this hour" — seeded counter, feels alive | 1–2 hrs | 7 |
| 9 | **Remix Link** | "Fix my spell" — URL encodes strokes, friend redraws | 6–8 hrs | 7 |
| 10 | **Witch Title** | "Chaos Pyromancer" badge from element + stability band | 3–4 hrs | 6 |
| 11 | **Trace Mode** | Faint ghost overlay on canvas — trace fire column, first cast in 60s | 4–8 hrs | 9 |
| — | **Detention Cam** (wild card) | Opt-in facecam PiP on fizzle replay — reaction + fail = peak TikTok | ~4 hrs | 8? |

### Traps (look viral, eat weeks — avoid for now)

1. **3-player Pass the Ring** — URL state explodes, low completion. A 2-player duel gets
   ~80% of the magic at ~30% of the effort.
2. **Accounts + global leaderboard** — auth, moderation, costs. Clips spread; leaderboards don't.
3. **Live multiplayer rooms** — WebSockets, empty-room problem, griefing. A ghost overlay
   feels multiplayer enough.

---

## 7. Beginner onboarding — tracing for new users

Most visitors have never drawn a WHA glyph. They will not read the dictionary panel, parse
JSON, or freehand a valid fire sigil on a blank canvas. **Tracing is the on-ramp.**

### Why tracing matters (for virality too)

- A user who fizzles on attempt #1 leaves before they ever share anything.
- A user who **traces a ghost, seals the ring, and sees fire explode** hits the viral moment
  on their first visit — then shares the clip.
- Tracing is not "cheating." In WHA, apprentices copy masters. The fantasy supports it.

### What already exists (reuse, don't rebuild)

| Asset | Location | Today |
|-------|----------|-------|
| Full spell layouts | `src/dictionary/sample-spells.json` | Fire Shoot, Water Orb — complete stroke arrays |
| Sigil / sign templates | `src/dictionary/sigils.json`, `signs.json` | `strokeTemplate` per symbol |
| Sidebar previews | `src/ui/dictionaryReferenceView.js` | Tiny SVG previews in Dictionary tab |
| Layer guides | `src/renderer/paperRenderer.js` + Guides toggle | Concentric ring layers on canvas |

**Gap:** reference data lives in the sidebar. It is **not on the canvas** as something to trace.

### Trace Mode — MVP spec

**Goal:** first-time user lands → sees a faint spell on the canvas → traces over it → seals → cast.

```
Land on app
  → default: "Try your first spell" with Fire Shoot ghost loaded
  → user draws over ghost (their ink is dark; ghost is faint teal/gray)
  → optional step hints: "1. Trace the ring" → "2. Sigil" → "3. Signs" → "4. Close the gap"
  → seal → result screen → share clip
```

**Implementation sketch:**

1. **`src/ui/traceOverlay.js`** (or extend `glyphOverlayRenderer.js`)
   - Load strokes from `sample-spells.json` entry or composed sigil + signs + ring template.
   - Normalize 0–1 coords → canvas space (same math as `strokeTemplateViewer.js`).
   - Draw ghost layer *under* user ink: `globalAlpha ~0.18`, dashed or soft color, non-interactive.
   - Toggle: **Trace** on/off, **Opacity** slider (optional v2).

2. **First-visit flow**
   - `localStorage.hasCastBefore` — if false, auto-enable Trace Mode with `fire-column`.
   - One-line banner: *"Trace the glowing lines, then close the ring to cast."*
   - Dismiss after first successful cast OR user clicks "Draw freehand."

3. **Practice picker** (sidebar or modal)
   - List from `sample-spells.json`: Fire Shoot, Water Orb, + one more as added.
   - "Load trace" button → clears canvas, loads ghost, does **not** inject strokes into
     `strokeStore` (ghost is visual only; user must draw).

4. **Progressive difficulty**
   - **Level 1 — Full trace:** complete spell ghost (ring + sigil + signs).
   - **Level 2 — Partial trace:** ring + sigil only; user adds signs from memory/reference card.
   - **Level 3 — Ring only:** faint circle; user draws sigil + signs freehand.
   - **Level 4 — Freehand:** no ghost (current app behavior).
   - Store highest level completed in `localStorage`; unlock next after one successful cast at current level.

5. **Daily Sigil integration (later)**
   - Daily challenge ships with trace ghost pre-loaded — same data as daily target spell.
   - Share card says "Daily #047 · traced" vs "freehand" (optional flex).

### UX copy (human, not compiler)

| Instead of | Say |
|------------|-----|
| "Draw an open spell ring..." | "Trace the faint circle. Leave a small gap." |
| "Place sigils in the center" | "Draw the fire symbol in the middle." |
| "Seal the circle" | "Close the gap to cast." |
| Ring closed - ambiguous sigil | "Your symbol wasn't clear enough — try tracing again." |

### Step-by-step coach (lightweight, Phase 1B)

Optional pulsing highlight on the *next* ghost segment (ring arc → sigil → sign → gap).
No full tutorial video — just **one active hint** at a time:

```
Step 1/4: Trace the outer ring (leave the gap at the top)
Step 2/4: Draw the fire sigil in the center
Step 3/4: Add the column signs on the sides
Step 4/4: Close the ring to cast
```

Advance step when recognizer detects partial progress (ring found, sigil candidate, etc.) —
reuse existing parser output, don't build new logic.

### What NOT to do

- **Don't auto-fill strokes** into `strokeStore` — user must draw; ghost is guide only.
- **Don't require WHA lore** in onboarding — "trace and cast" beats "sigils are modifiers."
- **Don't block freehand** — Trace Mode is default for first visit, always optional after.
- **Don't build a separate tutorial app** — one canvas, one ghost layer, one banner.

### Effort & impact

| Piece | Effort | Notes |
|-------|--------|-------|
| Ghost renderer on canvas | 4–6 hrs | Reuse template coord math from tools/ |
| Auto-load fire-column on first visit | 1 hr | localStorage flag |
| Practice picker (load trace) | 2–3 hrs | Wire sample-spells to overlay |
| Step coach (parser-driven hints) | 4–6 hrs | Optional; high polish |
| Progressive levels (partial ghost) | 3–4 hrs | Phase 2 |

**Impact:** converts cold-start bounce into first-cast rate. Prerequisite for social — nobody
shares what they never cast.

### Success metrics

- **First-session cast rate:** % of new visitors who achieve `spellIR.active` once.
- **Trace → freehand graduation:** % who disable trace and still cast within 7 days.
- Target: **>40% first-session cast rate** with trace enabled (vs ~5–10% estimated freehand cold start).

---

## 8. Visuals & effects strategy

Effects matter for virality, but **where** you spend polish matters more than how much.

**Sandwich model:**

```
[Real-time layer]  user draws, ring closes, something happens NOW   → procedural (code)
[Juice layer]      shockwave, glow, screen shake, slow-mo seal      → procedural (code)
[Export layer]     pretty clip + AI-static cards + pre-baked bursts  → assets
```

- **Live casting must stay real-time.** AI video/image generation is too slow for the loop.
- **AI is used to generate assets *beforehand*** (the user's intent), then loaded at runtime:
  - Pre-baked **seal burst** loops (one WebM per element) composited at `activatedAt`.
  - Fizzle bursts (ink splatter, smoke, ring crack).
  - Share-card backgrounds / frames, parchment texture, element icons, daily sigil art.
- **Keep AI out of the per-cast loop** (latency, cost, inconsistency). Generate once, curate,
  compress, commit.
- The renderer is explicitly swappable (see `docs/effect-rendering.md`) as long as it consumes
  the `SpellIR` contract — add an asset/video layer without touching parser/compiler.

Suggested asset library layout:

```
assets/
  bursts/    fire-seal.webm, water-seal.webm, ...   (one-time AI video, ~2-3s)
  fizzle/    crack-01.webm, puff-02.webm
  ui/        share-frame-cast.png, share-frame-fail.png
  textures/  parchment-tile.png
  icons/     fire.png, water.png, ...
```

Asset boundaries: WHA-*inspired*, never traced from manga; no character likenesses; no
screenshots. This is both legally safer and keeps a consistent "original magical diagram" look.

---

## 9. Roadmap

### Phase 0 — Foundation
- Fix `npm test` script + add CI (tests pass when invoked correctly; the script path is wrong).
- `CONTEXT.md` with domain glossary (ring/seal/prepared/contamination) + fan disclaimer in-app.
- JSDoc / `.d.ts` types for `GlyphAST` and `SpellIR` contracts.
- Branding decision (consider neutral public name + WHA credit in subtitle/README).

### Phase 1 — First cast + shareable loop (highest leverage; start here)
- **Trace Mode v0** — ghost overlay from `sample-spells.json` (Fire Shoot default on first visit).
- **Post-seal result screen** (cast + fizzle states). *(WIP in this branch.)*
- **Seal Replay recorder** — capture canvas timelapse + seal moment → downloadable clip.
- **Spell Card + Fizzle Letter** — composited PNGs. *(Card composer started in `resultScreen.js`.)*
- **Emoji result grid** + copy-to-clipboard. *(Started.)*
- Humanized failure messages + **Break seal / Cast again** to kill the dead-end.

### Phase 1B — Onboarding polish
- Practice picker: load trace for Fire Shoot / Water Orb from sidebar.
- Step coach: parser-driven hints ("trace the ring" → "add sigil" → "close gap").
- Progressive levels: full trace → partial trace → ring only → freehand.

### Phase 2 — Async social
- **Daily Sigil** — seeded daily challenge, spoiler-free share text.
- **Beat My Seal** — URL-encoded ghost strokes + target score.
- **Percentile Lie** + **Fake Coven** social-proof.

### Phase 3 — Polish & feel
- Procedural seal shockwave + fizzle VFX (code).
- Pre-baked AI burst loops per element (assets).
- Bloom / glow pass; quality & stability visibly affect the effect.
- Mobile layout + touch smoothing.

### Phase 4 — Recognition reliability (do before expanding vocabulary)
- 2–3 template variants per symbol (clean / messy / bold).
- Stroke simplification (Douglas-Peucker); better sign orientation.
- Ambiguity confirmation UI ("Did you mean Fire or Water?").
- **Stroke fixture corpus in CI** — gate recognition changes on score.
- Do NOT pursue $1/QuickDraw/ML; multi-stroke sigils don't fit single-stroke recognizers.

### Phase 5 — Content & game layer
- Add signs one at a time, full pipeline (template → parser → compiler → effect):
  dispersion, billowing, then repetition, vision, serpent.
- Local spell history, simple challenges, encoded-stroke sharing.

### Future (only if validated by usage)
- Nested rings (requires ring-detector redesign), split-ring mode (Sylph Shoes).
- React/Svelte UI shell, `@wha/engine` package extraction.

---

## 10. Tighter MVP (4–6 weeks)

1. **Trace Mode** — ghost overlay, Fire Shoot on first visit, practice picker.
2. Result screen + Seal Replay + Spell Card (the share loop).
3. Humanized failure + Break seal / Cast again.
4. Daily Sigil v0 (challenge + trace ghost + emoji share).
5. Mobile layout pass.
6. Procedural seal shockwave + fizzle VFX.

---

## 11. Work already started in this branch

| Feature | Status |
|---------|--------|
| `PLAN.md` | Done |
| `HANDOFF.md` | Done — cloud agent quick start |
| Post-seal result screen | Done — needs browser QA |
| Trace mode v0 | Done — ghost overlay, first-visit Fire Shoot, load from dictionary |
| Cloudflare Pages deploy | Live at https://wha-spell-simulator.pages.dev (Git → `main`) |
| `npm test` fix | Done |

**Key files:** `src/ui/resultScreen.js`, `src/ui/traceMode.js`, `src/renderer/traceOverlayRenderer.js`

**Next agent:** read `HANDOFF.md`, then build Seal Replay recorder.

### How to run
```sh
npm install
npm run dev          # http://127.0.0.1:5173/
npm test             # (note: test script needs fixing — see Phase 0)
```

---

## 12. Decisions still open

1. **Scope:** faithful simulator vs. social party toy? (This plan assumes the latter.)
2. **Platform:** desktop-first or mobile-first? (Virality argues mobile.)
3. **Recognition:** strict (current) vs. forgiving with user confirmation?
4. **Branding:** keep "Witch Hat Atelier Spell Simulator" or neutral name + credit?
5. **First social mode to ship:** Daily Sigil vs. Beat My Seal.
