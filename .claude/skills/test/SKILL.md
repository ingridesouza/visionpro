---
name: test
description: Run the full test suite (frontend Vitest + backend pytest) with coverage
user-invocable: true
argument-hint: "[frontend|backend|all]"
allowed-tools: Bash(cd * && npm run test*) Bash(cd * && npm test) Bash(cd * && npx vitest *) Bash(cd * && pytest *) Bash(cd * && python -m pytest *) Bash(cd * && pip install *)
---

## Run VisionPro Test Suite

Run tests for VisionPro. Argument: `frontend`, `backend`, or `all` (default: `all`).

### Backend Tests (pytest)

```bash
cd backend
pip install -r requirements-dev.txt
pytest --cov --cov-report=term-missing -q
```

Test files:
- `tests/test_image_utils.py` — Image decode/resize
- `tests/test_rate_limiter.py` — Token-bucket rate limiter
- `tests/test_circuit_breaker.py` — Circuit breaker states
- `tests/test_schemas.py` — Pydantic validation
- `tests/test_auth.py` — Authentication module
- `tests/test_health.py` — Health endpoints
- `tests/test_frame_processor.py` — Frame processing pipeline

### Frontend Tests (Vitest)

```bash
cd frontend
npm install
npm run test
```

Test files:
- `src/lib/librasClassifier.test.ts` — Libras letter classification
- `src/lib/i18n.test.ts` — Internationalization
- `src/components/EmotionOverlay.test.tsx` — Emotion overlay component
- `src/components/ConnectionStatus.test.tsx` — Connection status component
- `src/components/FeatureToggles.test.tsx` — Feature toggle buttons

### Steps

1. Run the tests for the requested scope (`$ARGUMENTS` or `all`)
2. Show the test results with pass/fail counts
3. If coverage is available, highlight files below 60% coverage
4. If any tests fail, analyze the failures and suggest fixes
