"""Scheduler interno (APScheduler).

Solo se arranca si `ENABLE_INTERNAL_SCHEDULER=true`. En producción (Cloud Run)
debe quedar desactivado: el contenedor se escala a 0 y los procesos no son
persistentes, por lo que los cron jobs internos no se garantizan. En su lugar
se usa Cloud Scheduler haciendo POST a `/cron/monthly-draw`.
"""

from __future__ import annotations

import logging

from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.cron import CronTrigger

from app.config import get_settings
from app.draw import run_monthly_draws

logger = logging.getLogger("planly.scheduler")
_scheduler: BackgroundScheduler | None = None


def start_scheduler() -> BackgroundScheduler | None:
    global _scheduler
    settings = get_settings()
    if not settings.enable_internal_scheduler:
        logger.info("Scheduler interno desactivado (usa Cloud Scheduler en producción).")
        return None
    if _scheduler:
        return _scheduler

    sched = BackgroundScheduler(timezone=settings.timezone)
    sched.add_job(
        run_monthly_draws,
        CronTrigger(day=1, hour=9, minute=0),
        id="monthly_draws",
        replace_existing=True,
    )
    sched.start()
    _scheduler = sched
    logger.info("Scheduler interno arrancado (cron día 1 09:00 %s).", settings.timezone)
    return sched


def stop_scheduler() -> None:
    global _scheduler
    if _scheduler:
        _scheduler.shutdown(wait=False)
        _scheduler = None
