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
| — | **Detention Cam** (wild card) | Opt-in facecam PiP on fizzle replay — reaction + fail = peak TikTok | ~4 hrs | 8? |

### Traps (look viral, eat weeks — avoid for now)

1. **3-player Pass the Ring** — URL state explodes, low completion. A 2-player duel gets
   ~80% of the magic at ~30% of the effort.
2. **Accounts + global leaderboard** — auth, moderation, costs. Clips spread; leaderboards don't.
3. **Live multiplayer rooms** — WebSockets, empty-room problem, griefing. A ghost overlay
   feels multiplayer enough.

---

## 7. Visuals & effects strategy

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

## 8. Roadmap

### Phase 0 — Foundation
- Fix `npm test` script + add CI (tests pass when invoked correctly; the script path is wrong).
- `CONTEXT.md` with domain glossary (ring/seal/prepared/contamination) + fan disclaimer in-app.
- JSDoc / `.d.ts` types for `GlyphAST` and `SpellIR` contracts.
- Branding decision (consider neutral public name + WHA credit in subtitle/README).

### Phase 1 — The shareable loop (highest leverage; start here)
- **Post-seal result screen** (cast + fizzle states). *(WIP in this branch.)*
- **Seal Replay recorder** — capture canvas timelapse + seal moment → downloadable clip.
- **Spell Card + Fizzle Letter** — composited PNGs. *(Card composer started in `resultScreen.js`.)*
- **Emoji result grid** + copy-to-clipboard. *(Started.)*
- Humanized failure messages + **Break seal / Cast again** to kill the dead-end.

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

## 9. Tighter MVP (4–6 weeks)

1. Result screen + Seal Replay + Spell Card (the loop).
2. Humanized failure + Break seal / Cast again.
3. Daily Sigil v0 (one challenge, local score, emoji share).
4. Mobile layout pass.
5. Procedural seal shockwave + fizzle VFX.
6. One new sign end-to-end.

---

## 10. Work already started in this branch

A first prototype of the **post-seal result screen** is included:

- `src/ui/resultScreen.js` — cast/fizzle result overlay, witch-title generation,
  humanized fizzle reasons + roasts, **Spell Card PNG composer**, emoji **share text**,
  Save image / Copy result / Cast again / Keep-looking actions.
- `index.html` — result overlay markup.
- `assets/css/styles.css` — result overlay styles (parchment card, Cinzel headings).
- `src/main.js` — seal-transition detection (`detectSeal`), `resetCanvas`, wiring.

**Status:** code is in place and serves without import errors; **not yet verified in a live
browser draw-test.** Next agent should run `npm run dev`, draw + seal a spell, and confirm the
overlay appears for both cast and fizzle, then iterate on timing, card layout, and add the
clip recorder.

### How to run
```sh
npm install
npm run dev          # http://127.0.0.1:5173/
npm test             # (note: test script needs fixing — see Phase 0)
```

---

## 11. Decisions still open

1. **Scope:** faithful simulator vs. social party toy? (This plan assumes the latter.)
2. **Platform:** desktop-first or mobile-first? (Virality argues mobile.)
3. **Recognition:** strict (current) vs. forgiving with user confirmation?
4. **Branding:** keep "Witch Hat Atelier Spell Simulator" or neutral name + credit?
5. **First social mode to ship:** Daily Sigil vs. Beat My Seal.
