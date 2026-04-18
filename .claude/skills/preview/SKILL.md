---
name: preview
description: Start the frontend dev server and open the application in the browser for visual testing
user-invocable: true
allowed-tools: Bash(cd * && npm install) Bash(cd * && npm run dev) Bash(cd * && npx vite *) Bash(start *) Bash(open *) Bash(xdg-open *)
---

## Preview Application in Browser

Start the Vite dev server and open VisionPro in the default browser.

### Steps

1. Install dependencies if needed:
   ```bash
   cd frontend
   npm install
   ```

2. Start the Vite dev server in the background:
   ```bash
   cd frontend
   npm run dev
   ```

3. Wait for the server to be ready (watch for "Local:" in output)

4. Open the browser:
   - **Windows**: `start http://localhost:5173`
   - **macOS**: `open http://localhost:5173`
   - **Linux**: `xdg-open http://localhost:5173`

5. Report the URL and status

### Notes
- The frontend will work standalone for hand tracking and Libras (client-side MediaPipe)
- Emotion detection requires the backend running at `ws://localhost:8000` — use `/dev backend` to start it
- The WebSocket connection status is shown in the top-left corner of the app
- Features can be toggled with keyboard shortcuts: `1` (Emotions), `2` (Drawing), `3` (Libras)
