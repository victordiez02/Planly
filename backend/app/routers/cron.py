"""Endpoints HTTP para schedulers externos (Cloud Scheduler, GitHub Actions, etc.).

Autenticados con un token compartido `CRON_SECRET` enviado en `X-Cron-Token`.
Permiten ejecutar las mismas tareas que el scheduler interno desde un cron
externo, sin depender de procesos persistentes.
"""

from __future__ import annotations

import logging
from datetime import datetime

from fastapi import APIRouter, Header, HTTPException, status

from app.config import get_settings
from app.draw import run_monthly_draws

router = APIRouter(prefix="/cron", tags=["cron"])
logger = logging.getLogger("planly.cron")
settings = get_settings()


def _check_token(token: str | None) -> None:
    if not settings.cron_secret:
        raise HTTPException(
            status.HTTP_503_SERVICE_UNAVAILABLE,
            "CRON_SECRET no configurado; endpoint deshabilitado",
        )
    if token != settings.cron_secret:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Token inválido")


@router.post("/monthly-draw")
def trigger_monthly_draw(x_cron_token: str | None = Header(default=None)):
    """Ejecuta el sorteo mensual para todos los grupos con autodraw=true.

    Pensado para invocarse desde Cloud Scheduler:

        gcloud scheduler jobs create http planly-monthly-draw \\
          --schedule="0 9 1 * *" \\
          --time-zone="Europe/Madrid" \\
          --uri="https://<cloud-run-url>/cron/monthly-draw" \\
          --http-method=POST \\
          --headers="X-Cron-Token=<CRON_SECRET>"
    """
    _check_token(x_cron_token)
    started = datetime.utcnow()
    logger.info("Cron monthly-draw disparado a %s", started.isoformat())
    run_monthly_draws()
    return {"ok": True, "started_at": started.isoformat() + "Z"}


@router.get("/healthz")
def cron_health():
    return {"ok": True, "cron_enabled": bool(settings.cron_secret)}
