from pydantic_settings import BaseSettings
from functools import lru_cache
from urllib.parse import quote_plus


class Settings(BaseSettings):
    # ── Database ──────────────────────────────────────────
    DB_HOST:     str
    DB_PORT:     int = 3306
    DB_USER:     str
    DB_PASSWORD: str
    DB_NAME:     str

    # ── Security ──────────────────────────────────────────
    SECRET_KEY: str
    ALGORITHM:  str = "HS256"

    # ✅ FIX: Changed from 1440 (24hrs) → 60 (1hr)
    # Clinical apps must expire sessions quickly
    # if device is stolen, attacker has max 60 min
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60

    # ── App ───────────────────────────────────────────────
    APP_NAME:    str  = "BioQentix"
    APP_VERSION: str  = "1.0.0"

    # ✅ FIX: Default False — only True in .env for local dev
    # Never True in production deployment
    DEBUG: bool = False

    # Optional — app works without it (rule-based fallback)
    ANTHROPIC_API_KEY: str = ""

    @property
    def DATABASE_URL(self) -> str:
        password = quote_plus(self.DB_PASSWORD)
        return (
            f"mysql+pymysql://{self.DB_USER}:{password}"
            f"@{self.DB_HOST}:{self.DB_PORT}/{self.DB_NAME}"
        )

    @property
    def AI_ENABLED(self) -> bool:
        return bool(self.ANTHROPIC_API_KEY)

    class Config:
        env_file = ".env"


@lru_cache()
def get_settings() -> Settings:
    return Settings()


settings = get_settings()