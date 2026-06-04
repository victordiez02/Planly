from __future__ import annotations

from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict, EmailStr

from app.models import MemberRole, PlanStatus, SelectionMode


class ORM(BaseModel):
    model_config = ConfigDict(from_attributes=True)


# ---------- Users ----------
class UserOut(ORM):
    id: UUID
    email: EmailStr
    name: str
    avatar_url: str | None = None


# ---------- Groups ----------
class GroupBase(BaseModel):
    name: str
    description: str | None = None
    selection_mode: SelectionMode = SelectionMode.GLOBAL
    picks_count: int = 1
    avoid_recent_months: int = 3
    autodraw_enabled: bool = True


class GroupCreate(GroupBase):
    pass


class GroupUpdate(BaseModel):
    name: str | None = None
    description: str | None = None
    selection_mode: SelectionMode | None = None
    picks_count: int | None = None
    avoid_recent_months: int | None = None
    autodraw_enabled: bool | None = None


class GroupOut(ORM, GroupBase):
    id: UUID
    invite_code: str
    created_at: datetime
    member_count: int = 0
    my_role: MemberRole | None = None


# ---------- Plans ----------
class PlanCreate(BaseModel):
    title: str
    description: str | None = None
    category: str | None = None
    image_url: str | None = None


class PlanUpdate(BaseModel):
    title: str | None = None
    description: str | None = None
    category: str | None = None
    image_url: str | None = None
    completed: bool | None = None


class PlanOut(ORM):
    id: UUID
    group_id: UUID
    author: UserOut
    title: str
    description: str | None
    category: str | None
    image_url: str | None = None
    status: PlanStatus
    completed_at: datetime | None = None
    created_at: datetime


# ---------- Draws ----------
class DrawSelectionOut(ORM):
    id: UUID
    plan: PlanOut
    for_user: UserOut | None = None


class DrawOut(ORM):
    id: UUID
    group_id: UUID
    year: int
    month: int
    revealed: bool
    created_at: datetime
    selections: list[DrawSelectionOut] = []


# ---------- Join ----------
class JoinByCode(BaseModel):
    invite_code: str
