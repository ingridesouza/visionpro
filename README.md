# VisionPro

Real-time computer vision application that detects **emotions**, **drowsiness**, **hand gestures**, and **Libras** (Brazilian Sign Language) letters through webcam input.

## Architecture

```
visionpro/
├── frontend/          React 19 + TypeScript + Vite
│   ├── src/
│   │   ├── components/   UI components (CameraFeed, Overlays, Toggles)
│   │   ├── hooks/        Custom hooks (useCamera, useWebSocket, useHandTracking)
│   │   ├── lib/          Libras classifier, i18n
│   │   ├── constants/    Config, emotion mappings
│   │   └── types/        TypeScript interfaces
│   └── Dockerfile
├── backend/           Python FastAPI
│   ├── services/      Detectors (emotion, drowsiness, frame processor)
│   ├── routers/       API routes (health, WebSocket)
│   ├── middleware/     Security (auth, rate limiter, headers)
│   ├── models/        Pydantic schemas
│   ├── utils/         Image processing utilities
│   ├── tests/         pytest test suite
│   └── Dockerfile
├── docker-compose.yml
└── .github/           CI/CD workflows, Dependabot
```

## Features

| Feature | Technology | Description |
|---------|-----------|-------------|
| Emotion Detection | DeepFace + OpenCV | 7 emotions: happy, sad, angry, surprise, neutral, fear, disgust |
| Drowsiness Detection | MediaPipe FaceLandmarker | Eye Aspect Ratio (EAR) with consecutive frame threshold |
| Hand Drawing | MediaPipe HandLandmarker | Real-time index finger tip tracking on canvas |
| Libras Recognition | Geometry-based classifier | 22 letters (A-G, I-W, Y) via landmark analysis |

## Quick Start

### Prerequisites
- Python 3.11+
- Node.js 22+
- Webcam

### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate   # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
uvicorn main:app --reload
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:5173 in your browser.

### Docker

```bash
docker compose up --build
```

Frontend at http://localhost, backend at http://localhost:8000.

## Security

| Feature | Implementation |
|---------|---------------|
| Authentication | Token-based WebSocket auth (configurable) |
| Rate Limiting | Token-bucket per client (5 req/s default) |
| Input Validation | Pydantic schemas + base64 format validation |
| CORS | Restricted origins, methods, and headers |
| Security Headers | X-Content-Type-Options, X-Frame-Options, Referrer-Policy, Permissions-Policy |
| CSP | Content-Security-Policy in nginx production config |
| Connection Limits | Max 10 concurrent WebSocket connections |
| Circuit Breaker | Auto-disable failing detectors with recovery timeout |
| Dependency Scanning | Dependabot (npm + pip + GitHub Actions) |

## Configuration

Environment variables (see `backend/.env.example`):

| Variable | Default | Description |
|----------|---------|-------------|
| `CORS_ORIGINS` | `["http://localhost:5173"]` | Allowed frontend origins |
| `DETECTOR_BACKEND` | `opencv` | Face detection backend |
| `AUTH_ENABLED` | `false` | Enable WebSocket authentication |
| `API_SECRET_KEY` | `` | Secret for token validation |
| `RATE_LIMIT_FPS` | `5.0` | Max frames per second per client |
| `MAX_WS_CONNECTIONS` | `10` | Max concurrent WebSocket connections |
| `LOG_LEVEL` | `INFO` | Logging level |
| `LOG_FORMAT` | `json` | Log format (json or text) |

## Testing

### Backend
```bash
cd backend
pip install -r requirements-dev.txt
pytest --cov -q
ruff check .
```

### Frontend
```bash
cd frontend
npm run test
npm run lint
```

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `1` | Toggle Emotion Detection |
| `2` | Toggle Hand Drawing |
| `3` | Toggle Libras Recognition |
| `Esc` | Clear drawing canvas |

## Accessibility

- WCAG 2.1 AA compliant ARIA labels on all interactive elements
- `aria-live` regions for real-time status updates (screen reader friendly)
- Keyboard navigation with visible focus indicators
- Skip-to-content link
- `prefers-reduced-motion` support
- i18n: Portuguese (pt-BR) and English

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/health` | GET | Service status + uptime |
| `/health/ready` | GET | Detector readiness check |
| `/ws/emotion` | WebSocket | Real-time frame processing |

### WebSocket Protocol

**Send:**
```json
{ "frame": "data:image/jpeg;base64,..." }
```

**Receive:**
```json
{
  "emotion": "happy",
  "confidence": 0.95,
  "all_scores": { "happy": 95.0, "sad": 2.0 },
  "face_region": { "x": 10, "y": 10, "w": 50, "h": 50 },
  "face_detected": true,
  "processing_time_ms": 120
}
```

## Tech Stack

**Frontend:** React 19, TypeScript, Vite, MediaPipe Tasks Vision
**Backend:** FastAPI, DeepFace, MediaPipe, OpenCV, Pydantic
**DevOps:** Docker, GitHub Actions, Dependabot, Ruff
**Testing:** Vitest + Testing Library (frontend), pytest (backend)
