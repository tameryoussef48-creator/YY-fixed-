# Yow Yow — Smart Whiteboard

Local-first whiteboard (TanStack Start + canvas editor). Boards are stored in the browser's IndexedDB.
The optional "import image → editable board" feature calls Google Gemini from a server route.

## Run
```
npm install
cp .env.example .env     # add GEMINI_API_KEY (optional feature)
npm run dev
npm test
```

## Deploy
- **Cloudflare (default Lovable/Nitro target)**: works as configured. `public/_headers` sets security headers.
- **Vercel**: build with `NITRO_PRESET=vercel npm run build` (set it as an Environment Variable in the project), then add `GEMINI_API_KEY` in Project → Settings → Environment Variables. `vercel.json` sets security headers. Vercel Hobby is for non-commercial use only.
- Set a **spend cap / quota alert** on the Google API key and restrict it in Google Cloud.
- After deploying, check headers at https://securityheaders.com and watch the browser console for
  `Content-Security-Policy-Report-Only` violations before switching it to an enforced `Content-Security-Policy`.

## Security notes
- `/api/convert-whiteboard-image` validates origin, content type, size (4 MB), real image type (magic bytes),
  clamps dimensions, rate-limits per IP and hides internal errors (`src/server/convert-handler.ts`).
  The in-memory limiter is best-effort on serverless; use your host's firewall for a hard limit.
- All imported/pasted/stored board data passes through `src/lib/element-validator.ts`
  (mirrored in `public/whiteboard-store.js`): colors, fonts, numbers, image sources and point arrays are validated.
- Never commit `.env`.
