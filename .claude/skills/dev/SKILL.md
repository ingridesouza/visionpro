---
name: dev
description: Start the full-stack development environment (frontend Vite + backend FastAPI)
user-invocable: true
argument-hint: "[frontend|backend|all]"
allowed-tools: Bash(cd * && npm install) Bash(cd * && npm run dev) Bash(cd * && pip install *) Bash(cd * && uvicorn *) Bash(cd * && python *) Bash(cd * && source *) Bash(npx *) Bash(start *)
---

## Start VisionPro Development Environment

Start the development servers for VisionPro. Argument: `frontend`, `backend`, or `all` (default: `all`).

### Frontend (Vite + React)

```bash
cd frontend
npm install
npm run dev
```

The frontend runs at **http://localhost:5173** with hot module reload.

### Backend (FastAPI + Uvicorn)

```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

The backend runs at **http://localhost:8000** with auto-reload.

### Steps

1. If `$ARGUMENTS` is `frontend` or `all`, start the Vite dev server in the background
2. If `$ARGUMENTS` is `backend` or `all`, activate the Python venv and start Uvicorn in the background
3. Open **http://localhost:5173** in the browser after both servers are running
4. Report the URLs and status of each server

### Notes
- The frontend expects the backend WebSocket at `ws://localhost:8000/ws/emotion`
- Backend needs the Python venv activated: `source backend/venv/Scripts/activate` (Windows) or `source backend/venv/bin/activate` (Linux/Mac)
- First run may take 30-60s for DeepFace model download
