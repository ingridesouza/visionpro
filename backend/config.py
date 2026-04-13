from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    # CORS
    CORS_ORIGINS: list[str] = ["http://localhost:5173"]
    CORS_ALLOW_METHODS: list[str] = ["GET", "OPTIONS"]
    CORS_ALLOW_HEADERS: list[str] = ["Content-Type", "Authorization"]

    # Detection
    DETECTOR_BACKEND: str = "opencv"
    TARGET_FRAME_WIDTH: int = 480

    # Security
    MAX_FRAME_SIZE: int = 500_000
    AUTH_ENABLED: bool = False
    API_SECRET_KEY: str = ""
    RATE_LIMIT_FPS: float = 5.0
    RATE_LIMIT_BURST: int = 10
    MAX_WS_CONNECTIONS: int = 10

    # Logging
    LOG_LEVEL: str = "INFO"
    LOG_FORMAT: str = "json"

    model_config = {"env_file": ".env", "env_file_encoding": "utf-8"}


settings = Settings()
