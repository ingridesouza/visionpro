# VisionPro

Plataforma de analise visual em tempo real que combina deteccao de emocoes, reconhecimento de gestos em Libras e desenho com as maos — tudo direto no navegador.

---

## Funcionalidades

### Deteccao de Emocoes
- Identifica 7 emocoes (feliz, triste, raiva, surpresa, medo, nojo, neutro) + sonolencia
- Processamento via DeepFace no backend com resultados em tempo real
- Overlay discreto sobre o video com emoji, label e confianca

### Reconhecimento de Libras
- Classifica 21 letras estaticas do alfabeto de Libras (A-Y)
- Classificador geometrico baseado em landmarks da mao — sem modelo ML externo
- Filtro de estabilidade: exige 10 frames consecutivos para confirmar uma letra
- Acumula texto como legenda em tempo real (pausa de 1.5s insere espaco)

### Desenho com as Maos
- O dedo indicador funciona como pincel digital
- Deteccao de mao roda no frontend via MediaPipe WASM a ~30 FPS
- Canvas incremental para performance suave

### Interface
- UI minimalista com glassmorphism e paleta dark premium
- Toggles independentes: cada feature pode ser ativada/desativada separadamente
- Status de conexao flutuante com auto-fade
- Layout full viewport com video centralizado

---

## Arquitetura

```
Browser (React + Vite)              Backend (FastAPI)
┌─────────────────────┐             ┌──────────────────────┐
│  Camera Feed        │  WebSocket  │  /ws/emotion         │
│  useCamera          │────────────>│  FrameProcessor      │
│  useFrameCapture    │<────────────│    EmotionDetector    │
│                     │  JSON       │    DrowsinessDetector │
│  useHandTracking    │             └──────────────────────┘
│  (MediaPipe WASM)   │
│                     │
│  librasClassifier   │
│  useLibrasRecognition│
└─────────────────────┘
```

- **Emocoes e sonolencia**: frames capturados no frontend, enviados via WebSocket ao backend, processados com DeepFace + MediaPipe FaceLandmarker, resultado retornado como JSON
- **Maos e Libras**: processamento 100% no frontend usando `@mediapipe/tasks-vision` (HandLandmarker WASM) para baixa latencia (~30 FPS vs ~3 FPS se fosse backend)

---

## Stack

| Camada   | Tecnologia                                             |
| -------- | ------------------------------------------------------ |
| Frontend | React 19, TypeScript 5.9, Vite 7                      |
| Backend  | Python, FastAPI 0.115, Uvicorn                         |
| ML       | DeepFace 0.0.93, MediaPipe 0.10, @mediapipe/tasks-vision |
| Visao    | OpenCV (headless), Canvas API                          |
| Comunicacao | WebSocket (bidirectional streaming)                 |

---

## Estrutura do Projeto

```
visionpro/
├── backend/
│   ├── main.py                  # Entrypoint FastAPI + lifespan
│   ├── config.py                # Settings via pydantic-settings
│   ├── requirements.txt
│   ├── .env.example
│   ├── routers/
│   │   ├── health.py            # GET /health
│   │   └── websocket.py         # WebSocket /ws/emotion
│   ├── services/
│   │   ├── emotion_detector.py  # DeepFace wrapper
│   │   ├── drowsiness_detector.py # Eye aspect ratio (EAR)
│   │   ├── hand_detector.py     # MediaPipe HandLandmarker
│   │   └── frame_processor.py   # Orquestra deteccoes em paralelo
│   ├── models/
│   │   └── schemas.py           # Pydantic schemas
│   └── utils/
│       └── image_utils.py       # Base64 decode, resize
│
├── frontend/
│   ├── package.json
│   ├── vite.config.ts
│   ├── tsconfig.json
│   └── src/
│       ├── App.tsx
│       ├── components/
│       │   ├── CameraFeed.tsx       # Componente principal
│       │   ├── EmotionOverlay.tsx    # Overlay de emocoes
│       │   ├── LibrasOverlay.tsx     # Legenda de Libras
│       │   ├── FeatureToggles.tsx    # Barra de toggles
│       │   ├── ConnectionStatus.tsx  # Pill de status
│       │   └── PermissionPrompt.tsx  # Tela inicial
│       ├── hooks/
│       │   ├── useCamera.ts         # Acesso a camera
│       │   ├── useWebSocket.ts      # Conexao WS com reconnect
│       │   ├── useFrameCapture.ts   # Captura de frames
│       │   ├── useHandTracking.ts   # MediaPipe WASM + drawing
│       │   └── useLibrasRecognition.ts # Filtro de estabilidade
│       ├── lib/
│       │   └── librasClassifier.ts  # Classificador geometrico
│       ├── constants/
│       │   ├── config.ts            # URLs, FPS, qualidade
│       │   └── emotions.ts          # Labels e cores
│       └── types/
│           └── emotion.ts           # TypeScript interfaces
│
└── README.md
```

---

## Como Rodar

### Pre-requisitos

- Python 3.11+
- Node.js 18+
- Webcam

### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
uvicorn main:app --reload
```

O backend roda em `http://localhost:8000`. Na primeira execucao, o DeepFace baixa os modelos automaticamente (~100MB).

### Frontend

```bash
cd frontend
npm install
npm run dev
```

O frontend roda em `http://localhost:5173`. Abra no navegador e permita acesso a camera.

---

## Variaveis de Ambiente

| Variavel             | Default                       | Descricao                        |
| -------------------- | ----------------------------- | -------------------------------- |
| `CORS_ORIGINS`       | `["http://localhost:5173"]`   | Origens permitidas pelo CORS     |
| `DETECTOR_BACKEND`   | `opencv`                      | Backend do DeepFace              |
| `TARGET_FRAME_WIDTH` | `480`                         | Largura do frame para processamento |

---

## Decisoes Tecnicas

- **Hand tracking no frontend**: mover a deteccao de maos do backend (3 FPS) para WASM no browser (30 FPS) eliminou a latencia de rede e melhorou drasticamente a experiencia de desenho
- **Classificador geometrico para Libras**: usar distancias e angulos entre landmarks ao inves de um modelo ML permite funcionar offline, sem download de modelo, com baixa latencia
- **WebSocket bidirecional**: permite streaming contínuo sem polling, com reconexao automatica e backoff exponencial (2s → 4s → 8s → max 30s)
- **Processamento paralelo**: emocao e sonolencia rodam em `asyncio.gather` no backend para minimizar latencia por frame

---

## Licenca

Este projeto foi desenvolvido para fins educacionais e de portfolio.
