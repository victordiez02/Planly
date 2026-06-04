from __future__ import annotations

import secrets
from urllib.parse import urlencode

import httpx
from fastapi import APIRouter, Depends, HTTPException, Request, Response, status
from fastapi.responses import RedirectResponse
from sqlalchemy.orm import Session

from app.config import get_settings
from app.db import get_db
from app.models import User
from app.security import create_access_token, get_current_user

router = APIRouter(prefix="/auth", tags=["auth"])
settings = get_settings()

DEV_USER_EMAIL = "dev@planly.dev"
DEV_USER_NAME = "Dev User"

GOOGLE_AUTH = "https://accounts.google.com/o/oauth2/v2/auth"
GOOGLE_TOKEN = "https://oauth2.googleapis.com/token"
GOOGLE_USERINFO = "https://openidconnect.googleapis.com/v1/userinfo"


def _set_session_cookie(response: Response, token: str) -> None:
    """Cookie de sesión con flags adaptados al entorno (dev vs prod cross-origin)."""
    response.set_cookie(
        "access_token",
        token,
        httponly=True,
        secure=settings.cookie_secure,
        samesite=settings.cookie_samesite,  # type: ignore[arg-type]
        domain=settings.cookie_domain,
        max_age=settings.jwt_expires_min * 60,
        path="/",
    )


@router.get("/google/login")
def google_login(response: Response):
    state = secrets.token_urlsafe(16)
    params = {
        "client_id": settings.google_client_id,
        "redirect_uri": settings.google_redirect_uri,
        "response_type": "code",
        "scope": "openid email profile",
        "state": state,
        "access_type": "online",
        "prompt": "select_account",
    }
    url = f"{GOOGLE_AUTH}?{urlencode(params)}"
    response.set_cookie(
        "oauth_state",
        state,
        httponly=True,
        secure=settings.cookie_secure,
        samesite=settings.cookie_samesite,  # type: ignore[arg-type]
        domain=settings.cookie_domain,
        max_age=600,
    )
    return {"authorization_url": url}


@router.get("/google/callback")
async def google_callback(
    request: Request, code: str, state: str, db: Session = Depends(get_db)
):
    expected_state = request.cookies.get("oauth_state")
    if not expected_state or expected_state != state:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Invalid OAuth state")

    async with httpx.AsyncClient(timeout=10) as client:
        token_res = await client.post(
            GOOGLE_TOKEN,
            data={
                "code": code,
                "client_id": settings.google_client_id,
                "client_secret": settings.google_client_secret,
                "redirect_uri": settings.google_redirect_uri,
                "grant_type": "authorization_code",
            },
        )
        token_res.raise_for_status()
        access_token = token_res.json()["access_token"]

        userinfo_res = await client.get(
            GOOGLE_USERINFO, headers={"Authorization": f"Bearer {access_token}"}
        )
        userinfo_res.raise_for_status()
        info = userinfo_res.json()

    google_sub = info["sub"]
    email = info.get("email")
    if not email:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Google account has no email")

    user = db.query(User).filter(User.google_sub == google_sub).one_or_none()
    if not user:
        user = User(
            google_sub=google_sub,
            email=email,
            name=info.get("name") or email.split("@")[0],
            avatar_url=info.get("picture"),
        )
        db.add(user)
        db.commit()
        db.refresh(user)
    else:
        user.name = info.get("name") or user.name
        user.avatar_url = info.get("picture") or user.avatar_url
        db.commit()

    jwt_token = create_access_token(user.id)
    redirect = RedirectResponse(url=f"{settings.frontend_url}/auth/callback")
    _set_session_cookie(redirect, jwt_token)
    redirect.delete_cookie("oauth_state", domain=settings.cookie_domain, path="/")
    return redirect


@router.post("/dev-login")
def dev_login(response: Response, db: Session = Depends(get_db)):
    """Bypass de autenticación solo disponible cuando DEV_BYPASS_AUTH=true."""
    if not settings.dev_bypass_auth:
        raise HTTPException(status.HTTP_403_FORBIDDEN, "Dev auth is disabled")

    user = db.query(User).filter(User.email == DEV_USER_EMAIL).one_or_none()
    if not user:
        user = User(
            google_sub="dev-bypass-sub",
            email=DEV_USER_EMAIL,
            name=DEV_USER_NAME,
            avatar_url="https://api.dicebear.com/8.x/lorelei/svg?seed=dev",
        )
        db.add(user)
        db.commit()
        db.refresh(user)

    jwt_token = create_access_token(user.id)
    _set_session_cookie(response, jwt_token)
    return {"ok": True, "user": {"id": str(user.id), "email": user.email, "name": user.name}}


@router.post("/logout")
def logout(response: Response):
    response.delete_cookie("access_token", domain=settings.cookie_domain, path="/")
    return {"ok": True}


@router.get("/me")
def me(user: User = Depends(get_current_user)):
    return {
        "id": str(user.id),
        "email": user.email,
        "name": user.name,
        "avatar_url": user.avatar_url,
    }
