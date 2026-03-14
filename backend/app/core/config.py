from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", case_sensitive=True)

    # Application
    APP_NAME: str = "Corefront API"
    DEBUG: bool = False
    API_V1_PREFIX: str = "/api/v1"

    # Database
    DATABASE_URL: str = "postgresql://postgres:postgres@db:5432/corefront"

    # JWT
    SECRET_KEY: str = "your-secret-key-change-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30

    # Claude AI
    ANTHROPIC_API_KEY: str = ""

    # Redis
    REDIS_URL: str = "redis://redis:6379/0"

    # CORS
    CORS_ORIGINS: str = "http://localhost:3000,https://corefront.ai,https://selfless-tenderness-production.up.railway.app"


@lru_cache()
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
