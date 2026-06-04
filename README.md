# 🎲 Planly · Pequeños sorteos para grandes recuerdos

Aplicación web para **proponer planes en grupo** (parejas, amigos, familia) y dejar que **la suerte decida cada mes**. El día 1, Planly sortea uno o varios planes, los anuncia por email y los revela en la app con una animación tipo _cards stack_.

> Stack: **FastAPI + PostgreSQL** (backend) · **React + Vite + Tailwind + shadcn-style** (frontend) · **APScheduler** en local / **Cloud Scheduler** en prod · **Google OAuth** + modo dev · listo para desplegar en **Cloud Run + Supabase + Firebase Hosting + Resend**.

---

## 📚 Tabla de contenidos

1. [Identidad y diseño](#-identidad-y-diseño)
2. [Funcionalidades](#-funcionalidades)
3. [Arquitectura general](#-arquitectura-general)
4. [Estructura de carpetas](#-estructura-de-carpetas)
5. [Modelo de datos](#-modelo-de-datos)
6. [Flujo de autenticación](#-flujo-de-autenticación)
7. [Sorteo mensual](#-sorteo-mensual)
8. [Cómo ejecutar el proyecto](#-cómo-ejecutar-el-proyecto)
9. [Decisiones técnicas y UX](#-decisiones-técnicas-y-ux)
10. [☁️ Despliegue en producción (Google Cloud)](#️-despliegue-en-producción-google-cloud)
11. [Mejoras futuras](#-mejoras-futuras)

---

## 🎨 Identidad y diseño

**Planly** es deliberadamente **editorial + social + lifestyle**, no una SaaS más:

- **Paleta**: blanco cálido `#F8F7F4`, negro suave `#1C1C1C`, primario azul profundo `#4A6FFF`, coral `#FF7A64`, oliva `#7FA87F`.
- **Tipografía**: titulares con **Fraunces** (serif moderna) e **Inter Tight**; cuerpo con **Inter**. Sensación de “diario compartido”.
- **Layout**: mucho aire, esquinas `rounded-2xl/3xl`, separadores tipográficos en mayúsculas, gradientes muy sutiles.
- **Microinteracciones**: `framer-motion` para entradas escalonadas (fade + translate + spring), pill animada en los tabs, _cards stack_ en la revelación del sorteo, tarjetas que se elevan al hover.
- **Iconos**: `lucide-react`, sin estridencias.
- **Concepto de logo**: dado redondeado con un check superpuesto (ver `frontend/public/favicon.svg`).

> El objetivo es que abrir la app cada mes apetezca: que parezca una invitación, no una herramienta.

---

## 🧩 Funcionalidades

### Usuarios

- Login con **Google OAuth** o **modo dev** (bypass para probar la UI sin Google).
- Cookie httpOnly con JWT.
- **Perfil de usuario**: avatar grande, grupos en común, planes propuestos, estadísticas (creados / veces sorteados).

### Grupos

- Crear, unirse por **código de invitación** (o copiando el código del header), listar como **feed editorial**.
- **Header de grupo** con descripción, _avatar stack_ de miembros, contador de tiempo al próximo sorteo, botón “sortear ahora” (admin).
- Tabs animados: **Planes**, **Miembros**, **Historial**.
- Roles `admin / member`.

### Planes

- Tarjetas tipo _lifestyle_: imagen (URL manual o **placeholder automático por categoría** vía Unsplash), título, autor, categoría con icono + tinte.
- Marcar como **hecho** (estado `completed_at`) y **añadir foto** del recuerdo.
- Estados: `active`, `selected`, `archived`.

### Sorteo

- **Cron mensual día 1, 09:00** (`APScheduler`).
- Modos: **global** (`n` entre todos) o **por persona** (`n` por cada autor).
- `avoid_recent_months` evita repetir lo seleccionado en los últimos meses.
- **Revelación animada** tipo _cards stack_ (entrada escalonada con spring), tarjeta de **plan destacado del mes** y email transaccional con la lista.
- Endpoint manual `POST /groups/{id}/draws/run-now` para forzar (admin).

### Historial (clave del proyecto)

- **Timeline vertical** estilo álbum de recuerdos, con marcadores en cronología, mes/año en _display serif_, tarjetas con imagen + autor + estado “hecho”.
- Permite **añadir foto a posteriori** y **marcar como hecho** desde el historial.

---

## 🧱 Arquitectura general

```
┌────────────────┐    HTTPS / cookies    ┌────────────────┐    SQLAlchemy    ┌────────────┐
│  Frontend SPA  │ ───────────────────▶ │  FastAPI API   │ ───────────────▶ │ PostgreSQL │
│ React + Vite   │  ◀──────────────────  │  (REST + Auth) │                  └────────────┘
└────────────────┘    JSON                └──────┬─────────┘
                                                 │
   Cron mensual:                                  │
     · LOCAL : APScheduler embebido            (ENABLE_INTERNAL_SCHEDULER=true)
     · PROD  : Cloud Scheduler → POST /cron/monthly-draw  (X-Cron-Token)
                                                 │
                                                 ▼
   Email: SMTP / Mailhog (local)  │  Resend HTTP API (prod)  → miembros
```

- SPA en React (Vite) consume la API por `/api/*` (proxy en dev) o por URL absoluta (prod).
- FastAPI con OAuth Google + JWT en cookie httpOnly.
- PostgreSQL 16 vía SQLAlchemy 2.x (local con Docker, prod con Supabase/Neon).
- Cron mensual: APScheduler embebido en local, Cloud Scheduler externo en producción.
- Email: backend pluggable (`EMAIL_PROVIDER=smtp|resend|console`).

---

## 📂 Estructura de carpetas

```
.
├── backend/
│   └── app/
│       ├── main.py            # FastAPI + CORS + lifespan + routers
│       ├── config.py          # Settings (incl. DEV_BYPASS_AUTH)
│       ├── db.py, models.py, schemas.py
│       ├── security.py        # JWT + get_current_user
│       ├── email_utils.py     # SMTP + plantilla HTML
│       ├── draw.py            # Sorteo y notificación
│       ├── scheduler.py       # APScheduler
│       └── routers/
│           ├── auth.py        # Google OAuth + /auth/dev-login + /auth/me
│           ├── groups.py      # CRUD grupos, join, members
│           ├── plans.py       # CRUD planes, PATCH (completado/imagen)
│           ├── draws.py       # Sorteos: list, current, reveal, run-now
│           └── users.py       # Perfil público
│
└── frontend/
    └── src/
        ├── App.tsx, main.tsx, index.css, types.ts
        ├── lib/{api, utils, categories}.ts
        ├── components/
        │   ├── AppLayout.tsx, ProtectedRoute.tsx, Countdown.tsx
        │   └── ui/  (button, card, input, badge, avatar, tabs)
        ├── features/
        │   ├── auth/store.ts
        │   ├── groups/queries.ts            # React Query hooks
        │   └── draws/
        │       ├── RevealAnimation.tsx      # cards stack
        │       └── HistoryTimeline.tsx      # timeline editorial
        └── pages/
            ├── LoginPage.tsx                # hero + tarjetas flotantes
            ├── DashboardPage.tsx            # feed editorial + countdown
            ├── GroupPage.tsx                # header + tabs (planes/miembros/historial)
            ├── ProfilePage.tsx              # perfil con stats
            └── AuthCallbackPage.tsx
```

---

## 🗃️ Modelo de datos

```mermaid
erDiagram
    USERS ||--o{ MEMBERSHIPS : has
    GROUPS ||--o{ MEMBERSHIPS : has
    GROUPS ||--o{ PLANS : contains
    USERS ||--o{ PLANS : authors
    GROUPS ||--o{ MONTHLY_DRAWS : has
    MONTHLY_DRAWS ||--o{ DRAW_SELECTIONS : produces
    PLANS ||--o{ DRAW_SELECTIONS : selected_in
    USERS ||--o{ DRAW_SELECTIONS : for_user

    USERS {
      uuid id PK
      string google_sub UK
      string email UK
      string name
      string avatar_url
      datetime created_at
    }
    GROUPS {
      uuid id PK
      string name
      string description
      string invite_code UK
      enum  selection_mode  "global | per_user"
      int   picks_count
      int   avoid_recent_months
      bool  autodraw_enabled
    }
    MEMBERSHIPS {
      uuid id PK
      uuid user_id FK
      uuid group_id FK
      enum role "admin | member"
    }
    PLANS {
      uuid id PK
      uuid group_id FK
      uuid author_id FK
      string title
      string description
      string category
      string image_url
      enum status "active | selected | archived"
      datetime completed_at
    }
    MONTHLY_DRAWS {
      uuid id PK
      uuid group_id FK
      int  year
      int  month
      bool revealed
    }
    DRAW_SELECTIONS {
      uuid id PK
      uuid draw_id FK
      uuid plan_id FK
      uuid for_user_id FK "null en modo global"
    }
```

`MonthlyDraw` tiene `UNIQUE(group_id, year, month)` → sorteo idempotente.

---

## 🔐 Flujo de autenticación

1. `GET /auth/google/login` → URL de autorización + `state` en cookie httpOnly.
2. Google redirige a `GET /auth/google/callback?code&state`.
3. Backend valida `state`, intercambia `code`, obtiene `userinfo`, hace upsert por `google_sub`.
4. Firma un JWT y lo guarda en cookie httpOnly `access_token`. Redirige a `${FRONTEND_URL}/auth/callback`.
5. El frontend hace `GET /auth/me` y entra al dashboard.

### Modo dev (sin Google)

- En backend `.env`: `DEV_BYPASS_AUTH=true`.
- En frontend `.env`: `VITE_DEV_BYPASS_AUTH=true`.
- Aparece un botón **“Entrar en modo dev”** que llama a `POST /auth/dev-login` (devuelve 403 si la flag está apagada). Crea un usuario `dev@plans.local`.

---

## 🎲 Sorteo mensual

`app.scheduler.start_scheduler()` se registra en el `lifespan` de FastAPI.

- Cron **día 1 09:00** en `TIMEZONE` (defecto `Europe/Madrid`).
- Para cada grupo con `autodraw_enabled=true`:
  1. Si ya existe `MonthlyDraw(group, year, month)`, no hace nada.
  2. Carga planes `status = active`.
  3. Excluye los seleccionados en los últimos `avoid_recent_months`.
  4. Selección aleatoria:
     - `global`: `picks_count` planes en total.
     - `per_user`: `picks_count` planes **por cada autor con planes activos**.
  5. Persiste `MonthlyDraw` + `DrawSelection[]` y envía email a miembros.
- Manual (admin): `POST /groups/{id}/draws/run-now`.

Revelación:

- Mientras `revealed=false`, el frontend muestra **“Revelar”**.
- Al pulsar, llama `POST /groups/{id}/draws/{draw_id}/reveal` y dispara la animación _cards stack_ (`features/draws/RevealAnimation.tsx`): cada tarjeta entra con `spring`, una cada ~650 ms, con imagen + categoría con icono + autor.

---

## 🚀 Cómo ejecutar el proyecto

### Requisitos

- Docker + Docker Compose
- Python 3.11+
- Node 20+ y `pnpm` 9+

### 1) Servicios

```bash
docker compose up -d
# Postgres: localhost:5432 (plans/plans)
# Mailhog UI: http://localhost:8025
```

> Si modificas `models.py` (como esta versión, que añade `image_url` y `completed_at` a `plans`), recrea el volumen para que `create_all` cree las columnas: `docker compose down -v && docker compose up -d`. En producción usa Alembic.

### 2) Backend

```bash
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -e ".[dev]"
cp .env.example .env
uvicorn app.main:app --reload --port 8000
```

Docs: <http://localhost:8000/docs>

### 3) Frontend

```bash
cd frontend
pnpm install
cp .env.example .env
pnpm dev
```

App: <http://localhost:5173>

### 4) Probar el sorteo

1. Login (Google o modo dev).
2. **Nuevo grupo** → añade planes con categoría (cine, comida, viaje…).
3. Como admin → **Sortear ahora** desde el header.
4. Pulsa **Revelar** para disparar la animación.
5. Marca planes como **hecho** y añade fotos desde el **Historial**.

---

## 🛠️ Decisiones técnicas y UX

- **FastAPI + SQLAlchemy 2.x** para tipado fuerte y docs automáticas.
- **JWT en cookie httpOnly** (mitiga XSS); CORS con `allow_credentials=True` y origen explícito.
- **APScheduler en proceso** para empezar simple; en producción puede sustituirse por un worker dedicado + advisory lock en Postgres.
- **React Query** para fetching/caché; **Zustand** para auth (mínimo).
- **shadcn-style components** copiados localmente (`components/ui`) → control total del diseño en lugar de una librería opaca.
- **framer-motion** en momentos clave: hero de login (tarjetas flotantes), tabs con `layoutId`, _cards stack_ del sorteo, timeline con `whileInView`.
- **Categorías visuales**: mapa centralizado `lib/categories.ts` → cada categoría tiene icono, tinte y una imagen Unsplash por defecto. Si más adelante quieres integrar la API real de Unsplash, basta cambiar `categoryImage()`.
- **Contador al próximo sorteo** (`components/Countdown.tsx`) en header del dashboard y en cada grupo.
- **Perfil de usuario** con grupos compartidos y estadísticas (planes creados / veces sorteado), construido sobre `/users/{id}/profile`.
- **Edición de planes** (`PATCH /groups/{id}/plans/{plan_id}`): marca como hecho (`completed_at`) y añade `image_url`, todo desde el historial.

### Seguridad

- Validación de `state` OAuth contra cookie httpOnly.
- Cookie `samesite=lax`, `httponly=true` (añade `secure=True` en producción).
- Comprobación de pertenencia (`_require_member`) en cada endpoint de grupo/plan/sorteo; permisos por rol para configurar el grupo o forzar sorteo.

---

## ☁️ Despliegue en producción (Google Cloud)

Esta sección explica cómo pasar Planly de `docker compose up` a una arquitectura
**serverless, gratuita o casi gratuita, y mantenible** en Google Cloud.

> **Principio rector**: una sola base de código que se comporta igual en local y
> en producción. Lo único que cambia son variables de entorno.

---

### 1. Visión general

```
                ┌──────────────────────────┐
                │     Usuario (browser)    │
                └─────────────┬────────────┘
                              │ HTTPS + cookie httpOnly
                              ▼
   ┌──────────────────────────────────────────────────┐
   │  Frontend SPA  (Firebase Hosting · CDN global)   │
   └─────────────┬───────────────────────┬────────────┘
                 │  fetch /api/*         │ Google OAuth redirect
                 ▼                       ▼
   ┌──────────────────────┐    ┌──────────────────────┐
   │  Backend FastAPI     │    │  Google OAuth        │
   │  (Cloud Run, 0→N)    │    └──────────────────────┘
   └────┬─────────┬───────┘
        │         │
        │         └─────────────► Resend HTTP API   (emails)
        ▼
   ┌──────────────────────┐
   │  PostgreSQL          │
   │  (Supabase Free)     │
   └──────────────────────┘

   ┌──────────────────────────┐
   │  Cloud Scheduler         │  cron "0 9 1 * *" (Europe/Madrid)
   │  (job HTTP)              │ ─── POST /cron/monthly-draw
   └──────────────────────────┘     X-Cron-Token: <CRON_SECRET>
```

Todo el flujo de petición de usuario y el job mensual entran al **mismo
servicio Cloud Run**; la diferencia es que el job lo dispara un scheduler
externo en vez de un proceso en memoria.

---

### 2. Componentes del sistema

| Componente             | Servicio elegido                   | Por qué                                                                                                                               | Alternativa                                |
| ---------------------- | ---------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------ |
| Hosting frontend       | **Firebase Hosting**               | CDN global, HTTPS automático, `firebase deploy` en un comando, free tier muy generoso.                                                | Vercel, Cloudflare Pages                   |
| API HTTP               | **Cloud Run**                      | Serverless, escala 0→N, paga por uso, soporta cualquier contenedor (FastAPI sin tocar nada). Free tier: 2M peticiones/mes.            | Fly.io, Render                             |
| Base de datos          | **Supabase** (Postgres gestionado) | Postgres real (no un fork), free tier 500 MB + 2 GB transfer, conexiones `sslmode=require`. SQLAlchemy se conecta igual que en local. | Neon, Aiven Free, Cloud SQL (de pago)      |
| Cron mensual           | **Cloud Scheduler**                | Un único cron HTTP por proyecto incluido en free tier. Garantiza ejecución aunque Cloud Run esté escalado a 0.                        | GitHub Actions schedule, Cloud Tasks       |
| Emails transaccionales | **Resend**                         | API HTTP simple, free tier 3.000 emails/mes, no requiere SMTP ni puertos abiertos.                                                    | SendGrid, Mailgun, Postmark                |
| Secretos               | **Secret Manager**                 | Cloud Run los monta como variables de entorno con un flag.                                                                            | `.env` cifrado en el repo (no recomendado) |

---

### 3. Flujo completo

**Petición de usuario**

1. El navegador descarga la SPA desde Firebase Hosting (CDN).
2. La SPA hace `fetch('https://api.planly.app/...')` con `credentials: 'include'`.
3. Cloud Run recibe la petición, valida la cookie JWT, consulta Supabase.
4. La respuesta vuelve con CORS y cookie `Secure; SameSite=None`.

**Login con Google**

1. Frontend pide `GET /auth/google/login` → URL de autorización.
2. Google redirige a `https://api.planly.app/auth/google/callback`.
3. Backend valida `state`, intercambia el code y setea la cookie de sesión.
4. Redirige a `${FRONTEND_URL}/auth/callback` y el usuario entra al dashboard.

**Sorteo mensual**

1. Cloud Scheduler dispara `POST /cron/monthly-draw` con `X-Cron-Token: <CRON_SECRET>`.
2. El endpoint valida el token, recorre los grupos con `autodraw_enabled=true`,
   crea el `MonthlyDraw` (idempotente por `UNIQUE(group, year, month)`).
3. Para cada grupo nuevo, llama a Resend → email a los miembros.
4. Devuelve `200 OK` (cualquier 5xx hace que Scheduler reintente).

---

### 4. ❌ Por qué eliminar APScheduler en producción

APScheduler vive **dentro del proceso de FastAPI**. En Cloud Run eso es un problema:

- **Cloud Run escala a 0** cuando no hay tráfico. Si el día 1 a las 09:00 nadie ha
  usado la app, no hay proceso vivo → **el cron no se ejecuta**.
- **Múltiples instancias**: con tráfico real, Cloud Run levanta varias réplicas.
  Cada una tendría su propio APScheduler y **dispararía el sorteo N veces**.
- **No hay persistencia**: si el contenedor se recicla, los jobs en memoria se pierden.

**Solución**: scheduler externo. Cloud Scheduler garantiza disparo único en el
momento exacto, y nuestro endpoint es idempotente gracias al `UNIQUE` en
`monthly_draws`. Si Scheduler reintenta por un 5xx puntual, no se duplican
sorteos.

| Antes (local)                                  | Después (Cloud Run)                                    |
| ---------------------------------------------- | ------------------------------------------------------ |
| `APScheduler` dentro de uvicorn                | `Cloud Scheduler` externo                              |
| Cron en memoria, requiere proceso siempre vivo | Job HTTP, dispara aunque el servicio esté escalado a 0 |
| Riesgo de duplicación con N réplicas           | Disparo único garantizado por GCP                      |
| Sin trazabilidad                               | Logs y reintentos en Cloud Console                     |

> El scheduler interno **sigue existiendo** controlado por `ENABLE_INTERNAL_SCHEDULER`.
> Está activo en local (`true`) y desactivado en producción (`false`). Mismo código,
> mismo comportamiento, distinto disparo.

---

### 5. Coste estimado (uso personal)

| Servicio         | Free tier mensual                | Coste esperado                        |
| ---------------- | -------------------------------- | ------------------------------------- |
| Cloud Run        | 2M req · 360k GB-s · 180k vCPU-s | **0 €**                               |
| Cloud Scheduler  | 3 jobs gratis                    | **0 €**                               |
| Firebase Hosting | 10 GB transfer, 360 MB/día       | **0 €**                               |
| Supabase Free    | 500 MB DB, 2 GB transfer         | **0 €**                               |
| Resend Free      | 3.000 emails/mes, 100/día        | **0 €**                               |
| Secret Manager   | 10k accesos, 6 secretos activos  | **0 €**                               |
| **Total**        | —                                | **0 €/mes** para uso personal/pruebas |

Cualquier crecimiento sería lineal y predecible; el primer cuello de botella
realista es Supabase (pasar a su plan Pro de ~25 $/mes cuando se pase de 500 MB).

---

### 6. Pasos de despliegue

#### Pre-requisitos

```bash
# CLI
brew install --cask google-cloud-sdk      # o ver https://cloud.google.com/sdk/docs/install
npm i -g firebase-tools

# Login y proyecto
gcloud auth login
gcloud config set project <TU_PROYECTO>
gcloud services enable run.googleapis.com \
                       cloudscheduler.googleapis.com \
                       secretmanager.googleapis.com \
                       artifactregistry.googleapis.com
firebase login
firebase use <TU_PROYECTO>
```

#### 6.1 Base de datos (Supabase)

1. Crea un proyecto en <https://supabase.com> (región eu-west-3 o eu-central-1).
2. Copia la `Connection string` (modo **Transaction pooler** si vas a tener
   varias réplicas, modo **Session** si vas a usar `min-instances=1`).
3. Convierte el esquema a SQLAlchemy:
   ```
   postgresql+psycopg://postgres:<PASS>@db.xxxx.supabase.co:5432/postgres?sslmode=require
   ```

> El driver es el mismo (`psycopg`) que en local. **Cero cambios de código.**

#### 6.2 Secretos en Secret Manager

```bash
echo -n "<DATABASE_URL>"   | gcloud secrets create DATABASE_URL   --data-file=-
echo -n "<SECRET_KEY>"     | gcloud secrets create SECRET_KEY     --data-file=-
echo -n "<GOOGLE_CLIENT_SECRET>" | gcloud secrets create GOOGLE_CLIENT_SECRET --data-file=-
echo -n "<RESEND_API_KEY>" | gcloud secrets create RESEND_API_KEY --data-file=-
python -c "import secrets;print(secrets.token_urlsafe(32))" \
  | tr -d '\n' \
  | gcloud secrets create CRON_SECRET --data-file=-
```

#### 6.3 Backend (Cloud Run)

```bash
cd backend

# Build & push (Cloud Build hace todo: no necesitas docker local)
gcloud builds submit --tag europe-west1-docker.pkg.dev/<PROYECTO>/planly/api:latest

# Deploy
gcloud run deploy planly-api \
  --image europe-west1-docker.pkg.dev/<PROYECTO>/planly/api:latest \
  --region europe-west1 \
  --allow-unauthenticated \
  --min-instances=0 --max-instances=3 \
  --cpu=1 --memory=512Mi \
  --set-env-vars="ENVIRONMENT=production,\
ENABLE_INTERNAL_SCHEDULER=false,\
COOKIE_SECURE=true,COOKIE_SAMESITE=none,\
FRONTEND_URL=https://planly.web.app,\
CORS_ORIGINS=https://planly.web.app,\
EMAIL_PROVIDER=resend,\
EMAIL_FROM=Planly <hola@planly.app>,\
GOOGLE_CLIENT_ID=xxxx.apps.googleusercontent.com,\
GOOGLE_REDIRECT_URI=https://<API_URL>/auth/google/callback,\
TIMEZONE=Europe/Madrid" \
  --set-secrets="DATABASE_URL=DATABASE_URL:latest,\
SECRET_KEY=SECRET_KEY:latest,\
GOOGLE_CLIENT_SECRET=GOOGLE_CLIENT_SECRET:latest,\
RESEND_API_KEY=RESEND_API_KEY:latest,\
CRON_SECRET=CRON_SECRET:latest"
```

Cloud Run te devuelve la URL pública (`https://planly-api-xxxx.run.app`). Cópiala
y úsala como `VITE_API_URL` en el frontend y como `GOOGLE_REDIRECT_URI`.

#### 6.4 Frontend (Firebase Hosting)

```bash
cd frontend

# Apunta a la URL real de la API
echo "VITE_API_URL=https://planly-api-xxxx.run.app" > .env.production
pnpm build

# Inicializa una sola vez
firebase init hosting
#   - Public directory: dist
#   - Single-page app: Yes
#   - Set up automatic builds with GitHub: opcional

firebase deploy --only hosting
```

> Si quieres un dominio custom (`planly.app`), Firebase Hosting lo gestiona desde la consola y emite certificado Let's Encrypt automático.

#### 6.5 Cloud Scheduler (cron mensual)

```bash
gcloud scheduler jobs create http planly-monthly-draw \
  --location=europe-west1 \
  --schedule="0 9 1 * *" \
  --time-zone="Europe/Madrid" \
  --uri="https://planly-api-xxxx.run.app/cron/monthly-draw" \
  --http-method=POST \
  --headers="X-Cron-Token=<EL_VALOR_DE_CRON_SECRET>" \
  --attempt-deadline=120s \
  --max-retry-attempts=3
```

Prueba el endpoint a mano antes de esperar al día 1:

```bash
curl -X POST https://planly-api-xxxx.run.app/cron/monthly-draw \
     -H "X-Cron-Token: <CRON_SECRET>"
```

---

### 7. Variables de entorno (resumen)

| Variable                    | Local                                                   | Producción                            |
| --------------------------- | ------------------------------------------------------- | ------------------------------------- |
| `ENVIRONMENT`               | `development`                                           | `production`                          |
| `DATABASE_URL`              | `postgresql+psycopg://plans:plans@localhost:5434/plans` | Supabase URL con `?sslmode=require`   |
| `SECRET_KEY`                | dev random                                              | **64+ bytes random** (Secret Manager) |
| `GOOGLE_CLIENT_ID/SECRET`   | credenciales OAuth (web)                                | mismas, redirect distinto             |
| `GOOGLE_REDIRECT_URI`       | `http://localhost:8000/auth/google/callback`            | `https://<api>/auth/google/callback`  |
| `FRONTEND_URL`              | `http://localhost:5173`                                 | `https://planly.web.app`              |
| `CORS_ORIGINS`              | `http://localhost:5173`                                 | CSV con tu dominio (y custom)         |
| `COOKIE_SECURE`             | `false`                                                 | `true`                                |
| `COOKIE_SAMESITE`           | `lax`                                                   | `none` (cross-origin)                 |
| `EMAIL_PROVIDER`            | `smtp` (Mailhog)                                        | `resend`                              |
| `EMAIL_FROM`                | `Planly <planly@local.test>`                            | `Planly <hola@planly.app>`            |
| `RESEND_API_KEY`            | —                                                       | Secret Manager                        |
| `ENABLE_INTERNAL_SCHEDULER` | `true`                                                  | **`false`**                           |
| `CRON_SECRET`               | (opcional)                                              | Secret Manager                        |
| `DEV_BYPASS_AUTH`           | `true`                                                  | **`false`**                           |

Hay plantillas listas en [`backend/.env.example`](backend/.env.example) y
[`backend/.env.production.example`](backend/.env.production.example).

---

### 8. Posibles problemas y cómo evitarlos

**Cold starts (~1–2 s la primera petición)**

- Ajusta `--min-instances=1` (deja de ser free, ~5 €/mes) si te molesta.
- Suele compensar mantenerlo en 0 y aceptar el primer hit lento.

**CORS bloqueado**

- Añade el dominio exacto del frontend en `CORS_ORIGINS` (con esquema, sin
  barra final).
- La cookie cross-origin necesita `COOKIE_SECURE=true` **y** `COOKIE_SAMESITE=none`.

**OAuth: `redirect_uri_mismatch`**

- En Google Cloud Console → OAuth client, añade el callback exacto
  (`https://<api>/auth/google/callback`). Recuerda mantener también el local
  para desarrollo.

**Cookie no llega al frontend**

- Si el front (`planly.web.app`) y la API (`*.run.app`) están en dominios
  totalmente distintos: necesitas `Secure; SameSite=None`.
- Si los pones bajo el mismo dominio raíz (`planly.app` + `api.planly.app`)
  puedes fijar `COOKIE_DOMAIN=.planly.app` y mantener `SameSite=Lax`.

**Supabase: "too many connections"**

- Usa la cadena de conexión del **pooler** (Transaction mode) y `pool_size=5`
  en SQLAlchemy. Cloud Run con `max-instances=3` rara vez supera 15 conexiones.

**Cloud Scheduler retorna error**

- El endpoint exige `CRON_SECRET` configurado; si no, responde 503.
- Idempotencia: si el sorteo ya existe, el endpoint sigue respondiendo 200.

**Schema migrations**

- En producción **no uses `Base.metadata.create_all`** para cambios.
  Sustituye por [Alembic](https://alembic.sqlalchemy.org/) y ejecuta las
  migraciones desde Cloud Build (`gcloud builds submit`) o como un job aparte.

---

### 9. Buenas prácticas

- **No** subas `.env` con secretos reales; usa Secret Manager.
- Versiona la imagen con SHA del commit:
  ```bash
  gcloud builds submit --tag .../api:$(git rev-parse --short HEAD)
  ```
- Activa **Cloud Logging structured logs** con `python-json-logger` cuando
  añadas observabilidad seria.
- Crea un segundo servicio Cloud Run (`planly-api-staging`) para validar
  cambios antes de pasar a prod, con su propio job de Cloud Scheduler.
- Limita el OAuth client de Google a los dominios concretos
  (`http://localhost:5173`, `https://planly.web.app`).

---

## 🔮 Mejoras futuras

- **Alembic** para migraciones versionadas.
- **Upload real de imágenes** (S3/MinIO) en lugar de URL manual.
- **Integración Unsplash API** con búsqueda por categoría.
- **Tests**: pytest (backend) + Vitest + Testing Library (frontend).
- **Notificaciones push** Web Push.
- **Votación previa** para ponderar planes en el sorteo.
- **Recordatorios** automáticos a mitad de mes.
- **Stats avanzadas** (categorías favoritas, racha de meses activos).
- **i18n** y zonas horarias por grupo.
- **CI/CD** con GitHub Actions; Dockerfiles multi-stage.
- **Observabilidad**: logs estructurados, Sentry, Prometheus.

---

Hecho con ❤️ para convertir “¿qué hacemos este finde?” en una pequeña ceremonia mensual.
