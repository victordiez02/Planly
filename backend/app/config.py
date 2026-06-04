from __future__ import annotations

from functools import lru_cache

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    # ── Entorno ───────────────────────────────────────────────────────────────
    # "development" | "production". Controla defaults sensatos (cookies, scheduler, etc.).
    environment: str = Field(default="development", alias="ENVIRONMENT")

    # ── Core ──────────────────────────────────────────────────────────────────
    database_url: str = Field(alias="DATABASE_URL")
    secret_key: str = Field(alias="SECRET_KEY")
    jwt_algorithm: str = Field(default="HS256", alias="JWT_ALGORITHM")
    jwt_expires_min: int = Field(default=43200, alias="JWT_EXPIRES_MIN")

    # ── Google OAuth ──────────────────────────────────────────────────────────
    google_client_id: str = Field(alias="GOOGLE_CLIENT_ID")
    google_client_secret: str = Field(alias="GOOGLE_CLIENT_SECRET")
    google_redirect_uri: str = Field(alias="GOOGLE_REDIRECT_URI")

    # ── Frontend / CORS ───────────────────────────────────────────────────────
    # `FRONTEND_URL` se usa para construir las URLs de redirección tras OAuth.
    frontend_url: str = Field(default="http://localhost:5173", alias="FRONTEND_URL")
    # Lista CSV de orígenes permitidos por CORS (incluye al frontend_url).
    cors_origins: str = Field(default="http://localhost:5173", alias="CORS_ORIGINS")

    # ── Cookies (auth) ────────────────────────────────────────────────────────
    # En local: False / "lax". En producción cross-origin: True / "none".
    cookie_secure: bool = Field(default=False, alias="COOKIE_SECURE")
    cookie_samesite: str = Field(default="lax", alias="COOKIE_SAMESITE")  # lax|strict|none
    # Dominio raíz de la cookie (ej. ".planly.app"). Vacío → host de la API.
    cookie_domain: str | None = Field(default=None, alias="COOKIE_DOMAIN")

    # ── Email ─────────────────────────────────────────────────────────────────
    # "smtp" (Mailhog/local) | "resend" (HTTP) | "console" (solo log).
    email_provider: str = Field(default="smtp", alias="EMAIL_PROVIDER")
    email_from: str = Field(default="Planly <planly@local.test>", alias="EMAIL_FROM")

    # SMTP (cuando email_provider=smtp)
    smtp_host: str = Field(default="localhost", alias="SMTP_HOST")
    smtp_port: int = Field(default=1025, alias="SMTP_PORT")
    smtp_user: str | None = Field(default=None, alias="SMTP_USER")
    smtp_password: str | None = Field(default=None, alias="SMTP_PASSWORD")
    smtp_tls: bool = Field(default=False, alias="SMTP_TLS")

    # Resend (cuando email_provider=resend)
    resend_api_key: str | None = Field(default=None, alias="RESEND_API_KEY")

    # ── Scheduler ─────────────────────────────────────────────────────────────
    # APScheduler interno: útil en local. NO recomendado en Cloud Run (servicios
    # se escalan a 0 y los procesos no son persistentes). En producción usa
    # Cloud Scheduler → POST /cron/monthly-draw.
    enable_internal_scheduler: bool = Field(default=False, alias="ENABLE_INTERNAL_SCHEDULER")
    timezone: str = Field(default="Europe/Madrid", alias="TIMEZONE")

    # ── Cron HTTP ─────────────────────────────────────────────────────────────
    # Token compartido con Cloud Scheduler. Si está vacío, /cron/* responde 503.
    cron_secret: str | None = Field(default=None, alias="CRON_SECRET")

    # ── Dev helpers ───────────────────────────────────────────────────────────
    dev_bypass_auth: bool = Field(default=False, alias="DEV_BYPASS_AUTH")

    # ── Derivados ─────────────────────────────────────────────────────────────
    @property
    def cors_origins_list(self) -> list[str]:
        return [o.strip() for o in self.cors_origins.split(",") if o.strip()]

    @property
    def is_production(self) -> bool:
        return self.environment.lower() == "production"


@lru_cache
def get_settings() -> Settings:
    return Settings()  # type: ignore[call-arg]
