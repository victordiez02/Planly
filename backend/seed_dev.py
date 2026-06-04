"""
seed_dev.py — Datos ficticios para desarrollo de Planly
========================================================
Crea (o resetea) un escenario realista en la base de datos local:

  • 1 usuario dev   → dev@plans.local  (el mismo que genera /auth/dev-login)
  • 3 amigos ficticios →  @fake.dev
  • 1 grupo          → "Los Juernes"
  • 12 planes        → varios categorías; 5 ya completados, 7 activos
  • 5 sorteos        → enero–mayo 2026, cada uno revela 1 plan completado

Uso:
    cd backend
    python seed_dev.py            # inserta datos si no existen
    python seed_dev.py --reset    # borra todos los datos seed y los recrea
"""

from __future__ import annotations

import argparse
import sys
from datetime import datetime, timezone
from uuid import uuid4

from sqlalchemy.orm import Session

# ── importa la app sin levantar FastAPI ─────────────────────────────────────
from app.db import Base, SessionLocal, engine
from app.models import (
    DrawSelection,
    Group,
    Membership,
    MemberRole,
    MonthlyDraw,
    Plan,
    PlanStatus,
    User,
)

# ── Constantes ───────────────────────────────────────────────────────────────

SEED_GROUP_NAME = "Los Juernes"

DEV_USER = {
    "google_sub": "dev-bypass-sub",
    "email": "dev@planly.dev",
    "name": "Dev User",
    "avatar_url": "https://api.dicebear.com/8.x/lorelei/svg?seed=dev",
}

# Emails que el script considera "suyos" al hacer --reset
LEGACY_DEV_EMAILS = ["dev@plans.local"]

FAKE_FRIENDS = [
    {
        "google_sub": "fake-sub-laura",
        "email": "laura@fake.dev",
        "name": "Laura Martínez",
        "avatar_url": "https://api.dicebear.com/8.x/lorelei/svg?seed=laura",
    },
    {
        "google_sub": "fake-sub-marcos",
        "email": "marcos@fake.dev",
        "name": "Marcos Gil",
        "avatar_url": "https://api.dicebear.com/8.x/lorelei/svg?seed=marcos",
    },
    {
        "google_sub": "fake-sub-sofia",
        "email": "sofia@fake.dev",
        "name": "Sofía Ruiz",
        "avatar_url": "https://api.dicebear.com/8.x/lorelei/svg?seed=sofia",
    },
]

# (title, description, category, image_url, author_key, status, completed_month)
# author_key: "dev" | "laura" | "marcos" | "sofia"
# completed_month: (year, month) si ya fue realizado, None si está activo

UNSPLASH = {
    "cine":   "https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?auto=format&fit=crop&w=900&q=70",
    "comida": "https://images.unsplash.com/photo-1504754524776-8f4f37790ca0?auto=format&fit=crop&w=900&q=70",
    "café":   "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=900&q=70",
    "viaje":  "https://images.unsplash.com/photo-1500835556837-99ac94a94552?auto=format&fit=crop&w=900&q=70",
    "juego":  "https://images.unsplash.com/photo-1493711662062-fa541adb3fc8?auto=format&fit=crop&w=900&q=70",
    "música": "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=900&q=70",
    "arte":   "https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&w=900&q=70",
}

PLAN_DEFS = [
    # ── Completados (van a tener sorteo y foto) ──────────────────────────────
    {
        "title": "Cena japonesa en Koku",
        "description": "Ramen, gyozas y mucho sake. La nueva carta de Koku merece una visita.",
        "category": "comida",
        "author_key": "dev",
        "completed_month": (2026, 1),
        "completed_image": UNSPLASH["comida"],
    },
    {
        "title": "Late de Pedro Almodóvar",
        "description": "Pase doble de 'La habitación de al lado' y 'Madres paralelas' en el Cine Doré.",
        "category": "cine",
        "author_key": "laura",
        "completed_month": (2026, 2),
        "completed_image": UNSPLASH["cine"],
    },
    {
        "title": "Escape room en el centro",
        "description": "La sala 'El último tren' tiene muy buenas reseñas. Máximo 5 personas.",
        "category": "juego",
        "author_key": "marcos",
        "completed_month": (2026, 3),
        "completed_image": UNSPLASH["juego"],
    },
    {
        "title": "Concierto de jazz en Café Central",
        "description": "Viernes de jazz en uno de los mejores clubs de Madrid. Reservar con semanas de antelación.",
        "category": "música",
        "author_key": "sofia",
        "completed_month": (2026, 4),
        "completed_image": UNSPLASH["música"],
    },
    {
        "title": "Excursión a la Sierra de Guadarrama",
        "description": "Ruta circular por La Pedriza. Nivel medio, 12 km, vistas espectaculares.",
        "category": "viaje",
        "author_key": "dev",
        "completed_month": (2026, 5),
        "completed_image": UNSPLASH["viaje"],
    },
    # ── Activos (pendientes de sorteo) ───────────────────────────────────────
    {
        "title": "Exposición de Sorolla en el Museo del Prado",
        "description": "La muestra temporal estará hasta septiembre. Entradas agotadas en taquilla; hay que comprar online.",
        "category": "arte",
        "author_key": "laura",
        "completed_month": None,
        "completed_image": None,
    },
    {
        "title": "Ramen en el nuevo local de Chamberí",
        "description": "Han abierto un sitio de ramen kyushu estilo tonkotsu. Dicen que el caldo lleva 20 horas.",
        "category": "comida",
        "author_key": "marcos",
        "completed_month": None,
        "completed_image": None,
    },
    {
        "title": "Tarde de boardgames en House of Games",
        "description": "Precio por persona con consumición. Tienen más de 200 juegos de mesa.",
        "category": "juego",
        "author_key": "sofia",
        "completed_month": None,
        "completed_image": None,
    },
    {
        "title": "Vermut de domingo en La Latina",
        "description": "Bar hopping por Cava Baja terminando en El Viajero para el postre.",
        "category": "café",
        "author_key": "dev",
        "completed_month": None,
        "completed_image": None,
    },
    {
        "title": "Visita al Museo Arqueológico Nacional",
        "description": "La Dama de Elche, los tesoros ibéricos y la visita guiada de los sábados.",
        "category": "arte",
        "author_key": "laura",
        "completed_month": None,
        "completed_image": None,
    },
    {
        "title": "Película en versión original en los Renoir",
        "description": "Sesión de medianoche el último viernes de mes. Llevan poniendo cine independiente 30 años.",
        "category": "cine",
        "author_key": "marcos",
        "completed_month": None,
        "completed_image": None,
    },
    {
        "title": "Ruta por el Albaicín en Granada",
        "description": "Fin de semana largo. Alojamiento en casa rural, cena en el carmen con vistas a la Alhambra.",
        "category": "viaje",
        "author_key": "sofia",
        "completed_month": None,
        "completed_image": None,
    },
]


# ── Helpers ───────────────────────────────────────────────────────────────────

def dt(year: int, month: int, day: int = 15) -> datetime:
    return datetime(year, month, day, 10, 0, 0, tzinfo=timezone.utc)


def upsert_user(db: Session, data: dict) -> User:
    user = db.query(User).filter(User.email == data["email"]).one_or_none()
    if user:
        return user
    user = User(
        id=uuid4(),
        google_sub=data["google_sub"],
        email=data["email"],
        name=data["name"],
        avatar_url=data.get("avatar_url"),
    )
    db.add(user)
    db.flush()
    print(f"  + Usuario creado: {data['name']} <{data['email']}>")
    return user


def reset_seed(db: Session) -> None:
    """Elimina grupo seed y usuarios ficticios usando SQL directo para
    evitar problemas con los cascades del ORM cuando hay datos antiguos."""
    from sqlalchemy import text

    emails_to_remove = [DEV_USER["email"], *LEGACY_DEV_EMAILS, *[f["email"] for f in FAKE_FRIENDS]]

    # IDs implicados
    group_ids = [
        row[0]
        for row in db.execute(
            text("SELECT id FROM groups WHERE name = :name"),
            {"name": SEED_GROUP_NAME},
        ).all()
    ]
    user_ids = [
        row[0]
        for row in db.execute(
            text("SELECT id FROM users WHERE email = ANY(:emails)"),
            {"emails": emails_to_remove},
        ).all()
    ]

    # Borra en orden: selecciones → sorteos → planes → memberships → grupos → users
    if group_ids:
        db.execute(
            text(
                "DELETE FROM draw_selections WHERE draw_id IN "
                "(SELECT id FROM monthly_draws WHERE group_id = ANY(:gids))"
            ),
            {"gids": group_ids},
        )
        db.execute(text("DELETE FROM monthly_draws WHERE group_id = ANY(:gids)"), {"gids": group_ids})
        db.execute(text("DELETE FROM plans WHERE group_id = ANY(:gids)"), {"gids": group_ids})
        db.execute(text("DELETE FROM memberships WHERE group_id = ANY(:gids)"), {"gids": group_ids})
        db.execute(text("DELETE FROM groups WHERE id = ANY(:gids)"), {"gids": group_ids})
        print(f"  - Grupo '{SEED_GROUP_NAME}' y todos sus datos eliminados.")

    if user_ids:
        # Por si quedaron memberships/plans en otros grupos
        db.execute(text("DELETE FROM memberships WHERE user_id = ANY(:uids)"), {"uids": user_ids})
        db.execute(text("DELETE FROM plans WHERE author_id = ANY(:uids)"), {"uids": user_ids})
        db.execute(text("DELETE FROM users WHERE id = ANY(:uids)"), {"uids": user_ids})
        print(f"  - {len(user_ids)} usuario(s) seed eliminados.")

    db.commit()
    print("  Reset completado.\n")


# ── Seed principal ────────────────────────────────────────────────────────────

def seed(db: Session) -> None:
    # Comprueba si ya existe para no duplicar
    existing_group = db.query(Group).filter(Group.name == SEED_GROUP_NAME).one_or_none()
    if existing_group:
        print(f"  ⚠  El grupo '{SEED_GROUP_NAME}' ya existe. Usa --reset para recrear los datos.")
        sys.exit(0)

    print("\n── Usuarios ─────────────────────────────────────────────────────")
    dev_user = upsert_user(db, DEV_USER)
    friends: dict[str, User] = {}
    for f in FAKE_FRIENDS:
        key = f["email"].split("@")[0]
        friends[key] = upsert_user(db, f)

    user_by_key: dict[str, User] = {
        "dev": dev_user,
        "laura": friends["laura"],
        "marcos": friends["marcos"],
        "sofia": friends["sofia"],
    }

    print("\n── Grupo ────────────────────────────────────────────────────────")
    group = Group(
        id=uuid4(),
        name=SEED_GROUP_NAME,
        description="El grupo de los planes del jueves. Cuatro personas, muchas ganas.",
        picks_count=1,
        avoid_recent_months=2,
        autodraw_enabled=True,
    )
    db.add(group)
    db.flush()
    print(f"  + Grupo '{group.name}' (invite: {group.invite_code})")

    print("\n── Membresías ───────────────────────────────────────────────────")
    for i, (key, user) in enumerate(user_by_key.items()):
        role = MemberRole.ADMIN if key == "dev" else MemberRole.MEMBER
        m = Membership(id=uuid4(), user_id=user.id, group_id=group.id, role=role)
        db.add(m)
        print(f"  + {user.name} ({role.value})")

    print("\n── Planes ───────────────────────────────────────────────────────")
    plans_by_month: dict[tuple[int, int], Plan] = {}

    for pdef in PLAN_DEFS:
        author = user_by_key[pdef["author_key"]]
        is_done = pdef["completed_month"] is not None

        plan = Plan(
            id=uuid4(),
            group_id=group.id,
            author_id=author.id,
            title=pdef["title"],
            description=pdef["description"],
            category=pdef["category"],
            image_url=pdef["completed_image"] if is_done else None,
            status=PlanStatus.SELECTED if is_done else PlanStatus.ACTIVE,
            completed_at=dt(*pdef["completed_month"]) if is_done else None,
        )
        db.add(plan)
        db.flush()

        state_label = f"✓ completado {pdef['completed_month']}" if is_done else "activo"
        print(f"  + [{pdef['category']:8}] {pdef['title'][:45]:<45}  {state_label}")

        if is_done:
            plans_by_month[pdef["completed_month"]] = plan  # type: ignore[assignment]

    print("\n── Sorteos históricos ───────────────────────────────────────────")
    for (year, month), plan in sorted(plans_by_month.items()):
        draw = MonthlyDraw(
            id=uuid4(),
            group_id=group.id,
            year=year,
            month=month,
            revealed=True,
        )
        db.add(draw)
        db.flush()

        selection = DrawSelection(
            id=uuid4(),
            draw_id=draw.id,
            plan_id=plan.id,
        )
        db.add(selection)
        print(f"  + Sorteo {year}-{month:02d} \u2192 \u201c{plan.title}\u201d")

    db.commit()
    print("\n── Seed completado ──────────────────────────────────────────────")
    print(f"  Grupo : {SEED_GROUP_NAME}")
    print(f"  Invite: {group.invite_code}")
    print(f"  Planes: {len(PLAN_DEFS)} ({len(plans_by_month)} completados, {len(PLAN_DEFS)-len(plans_by_month)} activos)")
    print(f"  Sorteos históricos: {len(plans_by_month)}")
    print()


# ── Migración inline ──────────────────────────────────────────────────────────

def _ensure_columns(db: Session) -> None:
    """Añade columnas nuevas de plans si la BD viene del esquema v0.1."""
    migrations = [
        "ALTER TABLE plans ADD COLUMN IF NOT EXISTS image_url VARCHAR(512)",
        "ALTER TABLE plans ADD COLUMN IF NOT EXISTS completed_at TIMESTAMP WITH TIME ZONE",
    ]
    for sql in migrations:
        db.execute(__import__("sqlalchemy").text(sql))
    db.commit()


# ── Entrypoint ────────────────────────────────────────────────────────────────

def main() -> None:
    parser = argparse.ArgumentParser(description="Seed de datos ficticios para Planly Dev")
    parser.add_argument(
        "--reset",
        action="store_true",
        help="Elimina los datos seed existentes antes de volver a insertarlos.",
    )
    args = parser.parse_args()

    # Crea las tablas si no existen (útil en entorno limpio)
    Base.metadata.create_all(bind=engine)

    with SessionLocal() as db:
        _ensure_columns(db)

        if args.reset:
            print("\n── Reset ────────────────────────────────────────────────────────")
            reset_seed(db)

        seed(db)


if __name__ == "__main__":
    main()
