# DeepVision Quick Scan (browser extension)

A floating button that follows you across any website (like an old chat-head
bubble) so you can scan an image for AI-generation / deepfake signs without
leaving the page. Talks directly to the DeepVision Python backend
(`backend/app.py`, `POST /api/detect`) — the same one the main web app uses.

## Install (Chrome / Edge, unpacked)

1. Make sure the DeepVision backend is running: `uvicorn app:app --port 8000` from `backend/`.
2. Go to `chrome://extensions` (or `edge://extensions`).
3. Turn on **Developer mode** (top right).
4. Click **Load unpacked** and select this `extension/` folder.
5. Pin the DeepVision icon from the extensions toolbar menu if you want quick access to settings.

## Use

- A small purple bubble appears bottom-right on every page. Click it, then
  click any image on the page to scan it — a result card pops up with the
  verdict and confidence.
- Or right-click any image → **Scan image with DeepVision**.
- Drag the bubble anywhere; its position is remembered per-browser.
- Click the extension icon in the toolbar to change the backend URL or hide
  the bubble.

## Notes

- If you point the backend URL (via the popup) at anything other than
  `localhost:8000` / `127.0.0.1:8000`, add that origin to `host_permissions`
  in `manifest.json` too, or the extension's fetch will be blocked.
- This is a dev-mode unpacked extension, not published to a store.
