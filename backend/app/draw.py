from __future__ import annotations

import asyncio
import random
from datetime import datetime
from uuid import UUID

from sqlalchemy import and_, select
from sqlalchemy.orm import Session, selectinload

from app.db import SessionLocal
from app.email_utils import render_draw_email, send_email
from app.models import (
    DrawSelection,
    Group,
    Membership,
    MonthlyDraw,
    Plan,
    PlanStatus,
    SelectionMode,
    User,
)


def _recent_selected_plan_ids(
    db: Session, group_id: UUID, year: int, month: int, lookback_months: int
) -> set[UUID]:
    if lookback_months <= 0:
        return set()
    # Calcula los (year, month) recientes
    periods: list[tuple[int, int]] = []
    y, m = year, month
    for _ in range(lookback_months):
        m -= 1
        if m == 0:
            m = 12
            y -= 1
        periods.append((y, m))

    if not periods:
        return set()

    conds = [and_(MonthlyDraw.year == y, MonthlyDraw.month == m) for y, m in periods]
    from sqlalchemy import or_

    rows = db.execute(
        select(DrawSelection.plan_id)
        .join(MonthlyDraw, MonthlyDraw.id == DrawSelection.draw_id)
        .where(MonthlyDraw.group_id == group_id, or_(*conds))
    ).all()
    return {r[0] for r in rows}


def _pick(plans: list[Plan], n: int, exclude: set[UUID]) -> list[Plan]:
    pool = [p for p in plans if p.id not in exclude] or plans
    n = min(n, len(pool))
    return random.sample(pool, n) if n else []


def perform_draw_for_group(db: Session, group: Group, year: int, month: int) -> MonthlyDraw | None:
    """Crea el sorteo del mes para un grupo (si no existe ya)."""
    existing = db.execute(
        select(MonthlyDraw).where(
            MonthlyDraw.group_id == group.id,
            MonthlyDraw.year == year,
            MonthlyDraw.month == month,
        )
    ).scalar_one_or_none()
    if existing:
        return existing

    active_plans = db.execute(
        select(Plan).where(Plan.group_id == group.id, Plan.status == PlanStatus.ACTIVE)
    ).scalars().all()
    if not active_plans:
        return None

    exclude = _recent_selected_plan_ids(db, group.id, year, month, group.avoid_recent_months)

    draw = MonthlyDraw(group_id=group.id, year=year, month=month, revealed=False)
    db.add(draw)
    db.flush()

    selections: list[DrawSelection] = []

    if group.selection_mode == SelectionMode.GLOBAL:
        for plan in _pick(active_plans, group.picks_count, exclude):
            selections.append(DrawSelection(draw_id=draw.id, plan_id=plan.id))
    else:  # PER_USER
        by_user: dict[UUID, list[Plan]] = {}
        for p in active_plans:
            by_user.setdefault(p.author_id, []).append(p)
        for user_id, user_plans in by_user.items():
            for plan in _pick(user_plans, group.picks_count, exclude):
                selections.append(
                    DrawSelection(draw_id=draw.id, plan_id=plan.id, for_user_id=user_id)
                )

    db.add_all(selections)
    db.commit()
    db.refresh(draw)
    return draw


async def notify_draw(db: Session, draw: MonthlyDraw) -> None:
    group = db.get(Group, draw.group_id)
    if not group:
        return
    members = db.execute(
        select(User).join(Membership, Membership.user_id == User.id).where(
            Membership.group_id == group.id
        )
    ).scalars().all()

    sel_rows = db.execute(
        select(DrawSelection)
        .where(DrawSelection.draw_id == draw.id)
        .options(selectinload(DrawSelection.plan).selectinload(Plan.author))
    ).scalars().all()

    lines = []
    for s in sel_rows:
        suffix = f" — para {s.plan.author.name}" if s.for_user_id else ""
        lines.append(f"<b>{s.plan.title}</b>{suffix}")

    html = render_draw_email(group.name, draw.year, draw.month, lines)
    subject = f"🎲 Planly · Sorteo {draw.month:02d}/{draw.year} — {group.name}"
    await asyncio.gather(*(send_email(u.email, subject, html) for u in members if u.email))


def run_monthly_draws(now: datetime | None = None) -> None:
    """Punto de entrada del scheduler: ejecuta sorteo de todos los grupos para el mes actual."""
    now = now or datetime.now()
    year, month = now.year, now.month
    db = SessionLocal()
    try:
        groups = db.execute(select(Group).where(Group.autodraw_enabled.is_(True))).scalars().all()
        for g in groups:
            draw = perform_draw_for_group(db, g, year, month)
            if draw:
                asyncio.run(notify_draw(db, draw))
    finally:
        db.close()
