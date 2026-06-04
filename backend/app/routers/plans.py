from __future__ import annotations

from datetime import datetime, timezone
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from app.db import get_db
from app.models import Membership, Plan, PlanStatus, User
from app.schemas import PlanCreate, PlanOut, PlanUpdate
from app.security import get_current_user

router = APIRouter(prefix="/groups/{group_id}/plans", tags=["plans"])


def _require_member(db: Session, group_id: UUID, user: User) -> None:
    m = db.execute(
        select(Membership).where(Membership.group_id == group_id, Membership.user_id == user.id)
    ).scalar_one_or_none()
    if not m:
        raise HTTPException(status.HTTP_403_FORBIDDEN, "Not a member")


@router.get("", response_model=list[PlanOut])
def list_plans(
    group_id: UUID,
    status_filter: PlanStatus | None = Query(default=None, alias="status"),
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    _require_member(db, group_id, user)
    stmt = (
        select(Plan)
        .where(Plan.group_id == group_id)
        .options(selectinload(Plan.author))
        .order_by(Plan.created_at.desc())
    )
    if status_filter:
        stmt = stmt.where(Plan.status == status_filter)
    return db.execute(stmt).scalars().all()


@router.post("", response_model=PlanOut, status_code=status.HTTP_201_CREATED)
def create_plan(
    group_id: UUID,
    payload: PlanCreate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    _require_member(db, group_id, user)
    plan = Plan(group_id=group_id, author_id=user.id, **payload.model_dump())
    db.add(plan)
    db.commit()
    db.refresh(plan)
    # carga author
    db.refresh(plan, attribute_names=["author"])
    return plan


@router.delete("/{plan_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_plan(
    group_id: UUID,
    plan_id: UUID,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    _require_member(db, group_id, user)
    plan = db.get(Plan, plan_id)
    if not plan or plan.group_id != group_id:
        raise HTTPException(status.HTTP_404_NOT_FOUND)
    if plan.author_id != user.id:
        raise HTTPException(status.HTTP_403_FORBIDDEN, "Only author can delete")
    db.delete(plan)
    db.commit()


@router.patch("/{plan_id}", response_model=PlanOut)
def update_plan(
    group_id: UUID,
    plan_id: UUID,
    payload: PlanUpdate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    _require_member(db, group_id, user)
    plan = db.get(Plan, plan_id)
    if not plan or plan.group_id != group_id:
        raise HTTPException(status.HTTP_404_NOT_FOUND)

    data = payload.model_dump(exclude_unset=True)
    completed = data.pop("completed", None)
    for k, v in data.items():
        setattr(plan, k, v)
    if completed is True:
        plan.completed_at = datetime.now(timezone.utc)
    elif completed is False:
        plan.completed_at = None

    db.commit()
    db.refresh(plan)
    db.refresh(plan, attribute_names=["author"])
    return plan
