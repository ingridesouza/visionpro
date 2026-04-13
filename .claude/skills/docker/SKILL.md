---
name: docker
description: Build and run VisionPro with Docker Compose (full stack)
user-invocable: true
argument-hint: "[up|down|build|logs|status]"
allowed-tools: Bash(docker *) Bash(docker-compose *) Bash(docker compose *)
---

## Docker Operations

Manage VisionPro Docker containers. Argument: `up`, `down`, `build`, `logs`, or `status` (default: `up`).

### Commands

- **up**: Build and start all services
  ```bash
  docker compose up --build -d
  ```

- **down**: Stop and remove containers
  ```bash
  docker compose down
  ```

- **build**: Build images without starting
  ```bash
  docker compose build
  ```

- **logs**: Show container logs
  ```bash
  docker compose logs -f --tail=50
  ```

- **status**: Show running containers and health
  ```bash
  docker compose ps
  ```

### Architecture
- **frontend** (nginx:alpine) → port 80 → serves React app + proxies `/ws/` and `/health` to backend
- **backend** (python:3.11-slim) → port 8000 → FastAPI + DeepFace + MediaPipe
- **deepface-models** volume → persists downloaded ML models

### Steps

1. Run the Docker command based on `$ARGUMENTS`
2. If `up`, wait for health checks to pass and report service URLs
3. If any service fails, show logs and diagnose the issue
4. Frontend: http://localhost — Backend API: http://localhost:8000
