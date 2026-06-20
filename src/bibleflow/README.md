# BibleFlow Module

AI-powered Bible verse detection, live transcription, and display extension for FreeShow.

## Structure

| Directory | Purpose |
|-----------|---------|
| `transcription-adapter/` | Deepgram (cloud) and Whisper (local) adapters |
| `verse-detection/` | NLP reference parser + confidence scoring |
| `display-renderer/` | Integration with FreeShow's external display system |
| `theme-designer/` | Theme schema, WYSIWYG preview, JSON import/export |
| `remote-control/` | OSC/UDP server + HTTP REST API |

## Setup

See `docs/spec/integration-notes.md` for architecture decisions and session status.

## Running Tests

```bash
npm run test:unit          # unit tests (Vitest)
npm run test:playwright    # E2E tests (Playwright)
```
