from pydantic_settings import BaseSettings
from typing import List


class Settings(BaseSettings):
    CORS_ORIGINS: List[str] = ["http://localhost:5173"]
    DETECTOR_BACKEND: str = "opencv"
    MAX_FRAME_SIZE: int = 500_000
    TARGET_FRAME_WIDTH: int = 480

    class Config:
        env_file = ".env"


settings = Settings()
