# BibleFlow Integration Notes

## Session Status

**Last updated:** 2026-06-20  
**Current phase:** Phase 0 complete — awaiting go-ahead for Phase 1

---

## What's Done

- [x] GitHub CLI installed and authenticated (account: oloyerocs)
- [x] Fork created: https://github.com/oloyerocs/FreeShow
- [x] Cloned to `C:\projects\FreeShow`
- [x] Upstream remote added → `https://github.com/ChurchApps/FreeShow.git`
- [x] Branch `feat/bibleflow-integration` created and checked out
- [x] npm install running (in progress at end of session)
- [x] Codebase investigated — findings documented below
- [x] BibleFlow directory scaffold created (empty folders + READMEs)

## What's In Progress

- [ ] npm install completion + dependency verification
- [ ] Build verification (will need `npm run build` or `npm start`)
- [ ] Existing test suite run (`npm test`)

## What's Next

- Phase 1: External Display Decision (FR-01)
- Waiting for explicit go-ahead from user

## Open Decisions

- None yet — Phase 1 decision will be documented here after go-ahead

---

## Confirmed Tech Stack

| Layer | Technology |
|-------|-----------|
| Shell | Electron (entry: `build/electron/index.js`) |
| Frontend | Svelte + TypeScript (Vite bundler) |
| Electron process | TypeScript → compiled via `tsc` |
| Unit tests | Vitest (`config/testing/vitest.config.ts`) |
| E2E tests | Playwright (`config/testing/playwright.config.ts`) |
| Node version | v24.14.0 |
| npm version | 11.9.0 |

**License:** GPL-3.0 — attribution required in NOTICE file.

---

## FreeShow External Display System — Architecture

### How it works

FreeShow's external display is a **multi-window Electron architecture**:

1. **Main window** (`src/electron/index.ts`) — the operator UI
2. **Output window(s)** (`src/electron/output/`) — one `BrowserWindow` per configured output, created on demand

### Key files

| File | Role |
|------|------|
| `src/electron/output/OutputHelper.ts` | Central registry; routes IPC messages to the right output window |
| `src/electron/output/helpers/OutputLifecycle.ts` | `createOutput()` / `removeOutput()` — creates the `BrowserWindow`, loads content, sets up NDI/Blackmagic capture |
| `src/electron/output/helpers/OutputSend.ts` | `sendToOutputWindow(msg)` — broadcasts a message to all output windows (or a specific one by ID) |
| `src/electron/output/helpers/OutputBounds.ts` | Position/size persistence, move/resize listeners |
| `src/electron/output/helpers/OutputVisibility.ts` | Show/hide toggle logic |
| `src/electron/output/helpers/OutputAlwaysOnTop.ts` | Always-on-top management |
| `src/frontend/MainOutput.svelte` | Svelte component loaded into each output window |
| `src/frontend/components/output/Output.svelte` | Renders the actual slide content |

### IPC flow

```
Frontend UI  →  send(OUTPUT, ["CHANNEL"], data)
                    ↓  (Electron IPC)
OutputHelper.receiveOutput()
  → OutputLifecycle.createOutput()   (CREATE)
  → OutputVisibility.toggleOutputs() (TOGGLE_OUTPUTS)
  → OutputSend.sendToOutputWindow()  (all other channels → forwarded to output BrowserWindow)
                    ↓
Output BrowserWindow  →  MainOutput.svelte renders slide
```

### State persistence

- Window bounds, `alwaysOnTop`, `boundsLocked`, `transparent` are stored in the `Output` type (`src/types/Output.ts`) and persisted to app data
- Each output has a unique `id`; multiple outputs are supported natively

### Key insight for Phase 1

`OutputSend.sendToOutputWindow(msg)` is the **single send-to-display primitive**. BibleFlow should reuse this exact mechanism — send a message on the `OUTPUT` IPC channel with a custom channel name (e.g. `BIBLEFLOW_VERSE`), and handle it inside `MainOutput.svelte`. This avoids creating a second competing window.

**Recommended choice: Option A (Integrate)** — extend the existing output window to also render BibleFlow verse overlays. No new BrowserWindow needed.

---

## Project Conventions

- **File/folder structure:** feature-grouped under `src/electron/` (main process) and `src/frontend/` (renderer)
- **TypeScript:** strict mode, separate tsconfigs per target
- **Linting:** no `.eslintrc` found — project uses `npm run test:format` (likely Prettier)
- **Commit style:** not yet inspected — check `git log` in Phase 1
- **Test framework:** Vitest (unit) + Playwright (E2E)
- **IPC pattern:** typed channels in `src/types/Channels.ts`; messages use `{ channel: string, data: any }` shape

---

## Scaffolded Structure

```
src/bibleflow/
  transcription-adapter/   ← Deepgram + Whisper adapters (empty)
  verse-detection/         ← NLP parser + confidence scoring (empty)
  display-renderer/        ← FreeShow output integration (empty)
  theme-designer/          ← Theme schema + import/export (empty)
  remote-control/          ← OSC server + HTTP REST API (empty)
  README.md
assets/favicon/            ← BibleFlow favicon assets (empty)
tests/unit/                ← Vitest unit tests (empty)
tests/integration/         ← Integration tests (empty)
tests/e2e/                 ← Playwright E2E tests (empty)
docs/spec/
  integration-notes.md     ← this file
```
