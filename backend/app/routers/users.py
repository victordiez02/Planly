from __future__ import annotations

from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import func, select
from sqlalchemy.orm import Session, selectinload

from app.db import get_db
from app.models import DrawSelection, Group, Membership, Plan, User
from app.schemas import GroupOut, PlanOut, UserOut
from app.security import get_current_user

router = APIRouter(prefix="/users", tags=["users"])


@router.get("/{user_id}/profile")
def user_profile(
    user_id: UUID,
    db: Session = Depends(get_db),
    me: User = Depends(get_current_user),
):
    target = db.get(User, user_id)
    if not target:
        raise HTTPException(status.HTTP_404_NOT_FOUND)

    # Grupos en común
    my_group_ids = {
        gid for (gid,) in db.execute(
            select(Membership.group_id).where(Membership.user_id == me.id)
        ).all()
    }
    their_groups = db.execute(
        select(Group)
        .join(Membership, Membership.group_id == Group.id)
        .where(Membership.user_id == target.id)
    ).scalars().all()
    shared = [g for g in their_groups if g.id in my_group_ids]

    # Planes que el target ha creado en grupos compartidos
    plans = db.execute(
        select(Plan)
        .where(
            Plan.author_id == target.id,
            Plan.group_id.in_(my_group_ids) if my_group_ids else False,
        )
        .options(selectinload(Plan.author))
        .order_by(Plan.created_at.desc())
        .limit(50)
    ).scalars().all() if my_group_ids else []

    # Estadísticas
    plans_created = db.execute(
        select(func.count(Plan.id)).where(Plan.author_id == target.id)
    ).scalar_one()
    times_selected = db.execute(
        select(func.count(DrawSelection.id))
        .join(Plan, Plan.id == DrawSelection.plan_id)
        .where(Plan.author_id == target.id)
    ).scalar_one()

    return {
        "user": UserOut.model_validate(target).model_dump(mode="json"),
        "shared_groups": [
            {
                "id": str(g.id),
                "name": g.name,
                "description": g.description,
            }
            for g in shared
        ],
        "plans": [PlanOut.model_validate(p).model_dump(mode="json") for p in plans],
        "stats": {
            "plans_created": plans_created,
            "times_selected": times_selected,
        },
    }
