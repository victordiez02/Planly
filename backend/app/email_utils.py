"""Envío de emails con backend pluggable.

Selecciona la implementación según `EMAIL_PROVIDER`:
- `smtp`    → aiosmtplib (Mailhog en local, cualquier SMTP en prod).
- `resend`  → HTTP API (https://resend.com). Recomendado en cloud.
- `console` → solo logging (útil en CI / debug rápido).

El resto del código siempre llama a `send_email(to, subject, html)` sin importar
qué proveedor esté configurado.
"""

from __future__ import annotations

import logging
from email.message import EmailMessage

import aiosmtplib
import httpx

from app.config import get_settings

settings = get_settings()
logger = logging.getLogger("planly.email")

RESEND_ENDPOINT = "https://api.resend.com/emails"


async def _send_smtp(to: str, subject: str, html: str) -> None:
    msg = EmailMessage()
    msg["From"] = settings.email_from
    msg["To"] = to
    msg["Subject"] = subject
    msg.set_content("Tu cliente no soporta HTML.")
    msg.add_alternative(html, subtype="html")

    await aiosmtplib.send(
        msg,
        hostname=settings.smtp_host,
        port=settings.smtp_port,
        username=settings.smtp_user or None,
        password=settings.smtp_password or None,
        start_tls=settings.smtp_tls,
    )


async def _send_resend(to: str, subject: str, html: str) -> None:
    if not settings.resend_api_key:
        raise RuntimeError("EMAIL_PROVIDER=resend pero falta RESEND_API_KEY")

    payload = {
        "from": settings.email_from,
        "to": [to],
        "subject": subject,
        "html": html,
    }
    headers = {
        "Authorization": f"Bearer {settings.resend_api_key}",
        "Content-Type": "application/json",
    }
    async with httpx.AsyncClient(timeout=15) as client:
        res = await client.post(RESEND_ENDPOINT, headers=headers, json=payload)
        if res.status_code >= 400:
            raise RuntimeError(f"Resend error {res.status_code}: {res.text}")


async def _send_console(to: str, subject: str, html: str) -> None:
    logger.info("[email:console] to=%s subject=%s html_len=%d", to, subject, len(html))


async def send_email(to: str, subject: str, html: str) -> None:
    provider = settings.email_provider.lower()
    if provider == "resend":
        await _send_resend(to, subject, html)
    elif provider == "console":
        await _send_console(to, subject, html)
    else:
        await _send_smtp(to, subject, html)


def render_draw_email(group_name: str, year: int, month: int, lines: list[str]) -> str:
    items = "".join(f"<li>{line}</li>" for line in lines)
    return f"""
    <div style="font-family: 'Inter', system-ui, sans-serif; max-width:560px; margin:auto; color:#1C1C1C;">
      <h2 style="font-weight:700; letter-spacing:-0.02em;">🎲 Planly · Sorteo de {month:02d}/{year}</h2>
      <p style="color:#555;">Estos son los planes que os ha tocado vivir en <b>{group_name}</b>:</p>
      <ul style="line-height:1.7;">{items}</ul>
      <p style="margin-top:24px;">Entra en la app para revelarlos con un toque más bonito ✨</p>
    </div>
    """
