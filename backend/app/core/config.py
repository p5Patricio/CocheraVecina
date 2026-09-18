from typing import List, Union
from pydantic import AnyHttpUrl, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    APP_NAME: str = "CocheraVecina"
    ENVIRONMENT: str = "development"
    DEBUG: bool = True
    API_V1_STR: str = "/api/v1"

    # Security
    SECRET_KEY: str = "dev-insecure-secret-key-cochera-vecina-change-me"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 1 day

    # Database
    DATABASE_URL: str = "sqlite+aiosqlite:///./cochera_vecina.db"

    # Storage & Media
    STORAGE_BACKEND: str = "local"  # "local" or "s3"
    MEDIA_ROOT: str = "./media"
    MEDIA_URL: str = "/media"

    # Stripe
    STRIPE_SECRET_KEY: str = ""
    STRIPE_PUBLISHABLE_KEY: str = ""
    STRIPE_WEBHOOK_SECRET: str = ""

    # Commission fees (percentages)
    # Default: 10% guest fee, 5% host fee
    GUEST_SERVICE_FEE_PERCENTAGE: float = 0.10
    HOST_SERVICE_FEE_PERCENTAGE: float = 0.05

    # Resend & Email
    RESEND_API_KEY: str = ""
    EMAIL_FROM: str = "verificacion@patodev.com"

    # CORS
    FRONTEND_URL: str = "https://cocheravecina.patodev.com"
    BACKEND_CORS_ORIGINS: Union[str, List[str]] = [
        "https://cocheravecina.patodev.com",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ]

    @field_validator("BACKEND_CORS_ORIGINS", mode="before")
    @classmethod
    def assemble_cors_origins(cls, v: Union[str, List[str]]) -> List[str]:
        if isinstance(v, str):
            if v.startswith("[") and v.endswith("]"):
                import json
                try:
                    return json.loads(v)
                except Exception:
                    pass
            return [i.strip() for i in v.split(",") if i.strip()]
        elif isinstance(v, (list, tuple, set)):
            return list(v)
        return []

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="allow",
    )


settings = Settings()
