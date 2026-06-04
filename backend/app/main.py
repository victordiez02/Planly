from __future__ import annotations

from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import get_settings
from app.db import Base, engine
from app.routers import auth, cron, draws, groups, plans, users
from app.scheduler import start_scheduler, stop_scheduler

settings = get_settings()


@asynccontextmanager
async def lifespan(_: FastAPI):
    # Para desarrollo: crear tablas. En producción usar Alembic.
    Base.metadata.create_all(bind=engine)
    start_scheduler()  # no-op si ENABLE_INTERNAL_SCHEDULER=false
    try:
        yield
    finally:
        stop_scheduler()


app = FastAPI(title="Planly API", version="0.3.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(groups.router)
app.include_router(plans.router)
app.include_router(draws.router)
app.include_router(users.router)
app.include_router(cron.router)


@app.get("/health")
def health():
    return {"status": "ok", "env": settings.environment}
