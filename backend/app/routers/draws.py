from __future__ import annotations

import asyncio
from datetime import datetime
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import desc, select
from sqlalchemy.orm import Session, selectinload

from app.db import get_db
from app.draw import notify_draw, perform_draw_for_group
from app.models import (
    DrawSelection,
    Group,
    MemberRole,
    Membership,
    MonthlyDraw,
    Plan,
    User,
)
from app.schemas import DrawOut, DrawSelectionOut, PlanOut, UserOut
from app.security import get_current_user

router = APIRouter(prefix="/groups/{group_id}/draws", tags=["draws"])


def _require_member(db: Session, group_id: UUID, user: User) -> Membership:
    m = db.execute(
        select(Membership).where(Membership.group_id == group_id, Membership.user_id == user.id)
    ).scalar_one_or_none()
    if not m:
        raise HTTPException(status.HTTP_403_FORBIDDEN, "Not a member")
    return m


def _serialize_draw(db: Session, draw: MonthlyDraw) -> DrawOut:
    rows = db.execute(
        select(DrawSelection)
        .where(DrawSelection.draw_id == draw.id)
        .options(
            selectinload(DrawSelection.plan).selectinload(Plan.author),
        )
    ).scalars().all()

    selections: list[DrawSelectionOut] = []
    for s in rows:
        for_user = None
        if s.for_user_id:
            u = db.get(User, s.for_user_id)
            if u:
                for_user = UserOut.model_validate(u)
        selections.append(
            DrawSelectionOut(
                id=s.id,
                plan=PlanOut.model_validate(s.plan),
                for_user=for_user,
            )
        )

    out = DrawOut.model_validate(draw)
    out.selections = selections
    return out


@router.get("", response_model=list[DrawOut])
def list_draws(
    group_id: UUID, db: Session = Depends(get_db), user: User = Depends(get_current_user)
):
    _require_member(db, group_id, user)
    draws = db.execute(
        select(MonthlyDraw)
        .where(MonthlyDraw.group_id == group_id)
        .order_by(desc(MonthlyDraw.year), desc(MonthlyDraw.month))
    ).scalars().all()
    return [_serialize_draw(db, d) for d in draws]


@router.get("/current", response_model=DrawOut | None)
def current_draw(
    group_id: UUID, db: Session = Depends(get_db), user: User = Depends(get_current_user)
):
    _require_member(db, group_id, user)
    now = datetime.now()
    draw = db.execute(
        select(MonthlyDraw).where(
            MonthlyDraw.group_id == group_id,
            MonthlyDraw.year == now.year,
            MonthlyDraw.month == now.month,
        )
    ).scalar_one_or_none()
    return _serialize_draw(db, draw) if draw else None


@router.post("/{draw_id}/reveal", response_model=DrawOut)
def reveal_draw(
    group_id: UUID,
    draw_id: UUID,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    _require_member(db, group_id, user)
    draw = db.get(MonthlyDraw, draw_id)
    if not draw or draw.group_id != group_id:
        raise HTTPException(status.HTTP_404_NOT_FOUND)
    if not draw.revealed:
        draw.revealed = True
        db.commit()
        db.refresh(draw)
    return _serialize_draw(db, draw)


@router.post("/run-now", response_model=DrawOut)
def run_now(
    group_id: UUID, db: Session = Depends(get_db), user: User = Depends(get_current_user)
):
    """Lanza manualmente el sorteo del mes en curso (admin)."""
    m = _require_member(db, group_id, user)
    if m.role != MemberRole.ADMIN:
        raise HTTPException(status.HTTP_403_FORBIDDEN, "Admin only")
    group = db.get(Group, group_id)
    if not group:
        raise HTTPException(status.HTTP_404_NOT_FOUND)
    now = datetime.now()
    draw = perform_draw_for_group(db, group, now.year, now.month)
    if not draw:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "No active plans")
    asyncio.run(notify_draw(db, draw))
    return _serialize_draw(db, draw)
