from __future__ import annotations

from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.db import get_db
from app.models import Group, MemberRole, Membership, User
from app.schemas import GroupCreate, GroupOut, GroupUpdate, JoinByCode
from app.security import get_current_user

router = APIRouter(prefix="/groups", tags=["groups"])


def _to_out(db: Session, group: Group, user: User) -> GroupOut:
    member_count = db.execute(
        select(func.count(Membership.id)).where(Membership.group_id == group.id)
    ).scalar_one()
    my = db.execute(
        select(Membership).where(Membership.group_id == group.id, Membership.user_id == user.id)
    ).scalar_one_or_none()
    out = GroupOut.model_validate(group)
    out.member_count = member_count
    out.my_role = my.role if my else None
    return out


def _require_member(db: Session, group_id: UUID, user: User) -> Membership:
    m = db.execute(
        select(Membership).where(Membership.group_id == group_id, Membership.user_id == user.id)
    ).scalar_one_or_none()
    if not m:
        raise HTTPException(status.HTTP_403_FORBIDDEN, "Not a member")
    return m


@router.get("", response_model=list[GroupOut])
def list_my_groups(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    groups = db.execute(
        select(Group).join(Membership, Membership.group_id == Group.id).where(
            Membership.user_id == user.id
        )
    ).scalars().all()
    return [_to_out(db, g, user) for g in groups]


@router.post("", response_model=GroupOut, status_code=status.HTTP_201_CREATED)
def create_group(
    payload: GroupCreate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    group = Group(**payload.model_dump())
    db.add(group)
    db.flush()
    db.add(Membership(group_id=group.id, user_id=user.id, role=MemberRole.ADMIN))
    db.commit()
    db.refresh(group)
    return _to_out(db, group, user)


@router.get("/{group_id}", response_model=GroupOut)
def get_group(
    group_id: UUID, db: Session = Depends(get_db), user: User = Depends(get_current_user)
):
    _require_member(db, group_id, user)
    group = db.get(Group, group_id)
    if not group:
        raise HTTPException(status.HTTP_404_NOT_FOUND)
    return _to_out(db, group, user)


@router.patch("/{group_id}", response_model=GroupOut)
def update_group(
    group_id: UUID,
    payload: GroupUpdate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    m = _require_member(db, group_id, user)
    if m.role != MemberRole.ADMIN:
        raise HTTPException(status.HTTP_403_FORBIDDEN, "Admin only")
    group = db.get(Group, group_id)
    if not group:
        raise HTTPException(status.HTTP_404_NOT_FOUND)
    for k, v in payload.model_dump(exclude_unset=True).items():
        setattr(group, k, v)
    db.commit()
    db.refresh(group)
    return _to_out(db, group, user)


@router.post("/join", response_model=GroupOut)
def join_group(
    payload: JoinByCode,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    group = db.execute(
        select(Group).where(Group.invite_code == payload.invite_code)
    ).scalar_one_or_none()
    if not group:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Invalid invite code")
    existing = db.execute(
        select(Membership).where(Membership.group_id == group.id, Membership.user_id == user.id)
    ).scalar_one_or_none()
    if not existing:
        db.add(Membership(group_id=group.id, user_id=user.id, role=MemberRole.MEMBER))
        db.commit()
    return _to_out(db, group, user)


@router.get("/{group_id}/members")
def list_members(
    group_id: UUID, db: Session = Depends(get_db), user: User = Depends(get_current_user)
):
    _require_member(db, group_id, user)
    rows = db.execute(
        select(User, Membership.role)
        .join(Membership, Membership.user_id == User.id)
        .where(Membership.group_id == group_id)
    ).all()
    return [
        {
            "id": str(u.id),
            "name": u.name,
            "email": u.email,
            "avatar_url": u.avatar_url,
            "role": role.value,
        }
        for u, role in rows
    ]
