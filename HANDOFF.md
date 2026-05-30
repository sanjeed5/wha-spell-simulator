# Cloud Agent Handoff

Continue work on branch **`plan/social-shareable-loop`**.

## Quick start

```sh
git clone https://github.com/sanjeed5/wha-spell-simulator.git
cd wha-spell-simulator
git checkout plan/social-shareable-loop
npm install
npm run dev        # http://127.0.0.1:5173/
npm test           # 30 tests
npm run build
```

Read **`PLAN.md`** first — social/viral goal, trace onboarding, share loop.

## Live deploy

- **URL:** https://wha-spell-simulator.pages.dev
- **Host:** Cloudflare Pages (Git-connected)
- **Repo:** https://github.com/sanjeed5/wha-spell-simulator
- **Production branch:** `main` (auto-deploy on push)
- **Work branch:** `plan/social-shareable-loop` (merge to `main` when ready to ship)

Build: `npm run build` → output `dist`

## What's done

| Feature | Status | Files |
|---------|--------|-------|
| Product plan | Done | `PLAN.md` |
| Post-seal result screen | Done (needs browser QA) | `src/ui/resultScreen.js` |
| Save spell card PNG | Done | `resultScreen.js` |
| Copy share text | Done | `resultScreen.js` |
| Cast again | Done | clears canvas, keeps trace pref |
| Trace mode v0 | Done | `src/ui/traceMode.js`, `traceOverlayRenderer.js` |
| First-visit trace (Fire Shoot) | Done | localStorage |
| Load trace from sample spells | Done | Dictionary panel buttons |
| Cloudflare Pages + Git | Done | pushes to `main` deploy |
| Fix `npm test` | Done | `tests/*.test.js` |

## What's next (priority order)

1. **Browser QA** — draw Fire Shoot with trace, seal ring, confirm result overlay (cast + fizzle).
2. **Seal Replay recorder** — canvas timelapse clip export (highest viral leverage).
3. **Break seal** — reopen ring without full clear (currently only Cast again clears).
4. **Humanized failure on canvas** — not just result card.
5. **Daily Sigil v0** — seeded challenge + trace ghost + emoji share.
6. **Merge `plan/social-shareable-loop` → `main`** after QA to update live site.

## Architecture notes

```
draw → classifyDrawing → compileSpell → SpellIR → effects
                              ↓
                    result screen on seal
                    trace overlay (visual only, not in strokeStore)
```

- Trace ghosts use `sample-spells.json` normalized 0–1 coords × canvas size.
- Sealing locks input (`spellSummaryView.js`); result screen appears after delay.
- Renderer is swappable per `docs/effect-rendering.md`.

## Open decisions

See `PLAN.md` §12 — scope (party toy vs simulator), mobile-first, branding name.

## Fork vs upstream

- **Fork:** sanjeed5/wha-spell-simulator
- **Upstream:** ytnrvdf/wha-spell-simulator
