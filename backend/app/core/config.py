from __future__ import annotations

import secrets
from functools import lru_cache
from typing import Any, List

from pydantic import Field, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    project_name: str = "DropSpot Backend"
    api_prefix: str = "/api"

    secret_key: str = Field(
        default_factory=lambda: secrets.token_urlsafe(32),
        validation_alias="SECRET_KEY",
    )
    algorithm: str = Field(default="HS256", validation_alias="ALGORITHM")
    access_token_expire_minutes: int = Field(
        default=60, validation_alias="ACCESS_TOKEN_EXPIRE_MINUTES"
    )

    database_url: str = Field(
        default="sqlite+aiosqlite:///./drop_spot.db",
        validation_alias="DATABASE_URL",
    )
    sync_database_url: str | None = Field(
        default=None,
        validation_alias="SYNC_DATABASE_URL",
    )

    cors_allow_origins: List[str] = Field(
        default=["*"], validation_alias="CORS_ALLOW_ORIGINS"
    )
    cors_allow_methods: List[str] = Field(
        default=["*"], validation_alias="CORS_ALLOW_METHODS"
    )
    cors_allow_headers: List[str] = Field(
        default=["*"], validation_alias="CORS_ALLOW_HEADERS"
    )

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")

    @field_validator("cors_allow_origins", mode="before")
    @classmethod
    def assemble_cors_origins(cls, v: Any) -> List[str]:
        if isinstance(v, str) and not v.startswith("["):
            return [i.strip() for i in v.split(",") if i.strip()]
        if isinstance(v, (list, tuple)):
            return list(v)
        return ["*"]

    @property
    def sync_database_uri(self) -> str:
        if self.sync_database_url:
            return self.sync_database_url
        if self.database_url.startswith("sqlite+aiosqlite"):
            return self.database_url.replace("sqlite+aiosqlite", "sqlite")
        if self.database_url.startswith("postgresql+asyncpg"):
            return self.database_url.replace("postgresql+asyncpg", "postgresql+psycopg")
        return self.database_url


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()

