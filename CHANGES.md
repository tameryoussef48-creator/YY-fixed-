# What changed in this version
Security
- Hardened AI endpoint (origin check, JSON-only, 4 MB cap, magic-byte image check, dimension clamp, per-IP rate limit, generic errors, 503 if key missing).
- Single Gemini model (GEMINI_MODEL, default gemini-2.5-flash) instead of a 4-model fallback loop.
- Element/board sanitizer for JSON import, paste and IndexedDB loads (blocks CSS injection, remote image URLs, NaN/huge values, prototype keys).
- Security headers (server.ts, vercel.json, public/_headers); CSP is Report-Only for now.
- PDF.js worker is bundled instead of loaded from jsdelivr.
- .gitignore now ignores .env files.
Bugs
- Portrait PDF pages got a wrong width (dw never set).
- dashed / doubleArrow shapes from AI import were downgraded to plain line/arrow; AI line coordinates are now clamped.
- Save failures now show a warning toast; browser is asked for persistent storage.
Not done here (see prompt): self-hosted fonts, export/import ALL boards backup, AI-upload consent notice,
multi-tab conflict protection, service worker, CI, minification/fingerprinting of whiteboard-app.js.
