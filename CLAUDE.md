# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A full-stack quantum-powered Tarot reading web application. The backend uses FastAPI (Python) with async PostgreSQL, quantum RNG entropy, and streaming LLM interpretation. The frontend is Next.js 16 with React 19 and Tailwind CSS 4.

## Commands

### Docker (full stack)
```bash
cp .env.docker .env                          # Compose reads the root .env
docker compose up --build -d                 # backend auto-creates tables + seeds 78 cards
docker compose logs -f
docker compose down
```

### Backend (local dev)
```bash
cd backend
source venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8001        # Dev server (auto-inits DB on startup)
python seed.py                               # Upsert the built-in 78-card deck
python fetch_tavily_data.py                  # Fetch card metadata from Tavily
python seed.py --file tarot_seed_data.json   # Merge Tavily metadata into the deck
```

### Frontend (local dev)
```bash
cd frontend
npm install
npm run dev        # http://localhost:3000
npm run build
npm run start
npm run lint
```

## Architecture

### Stack
- **Backend**: FastAPI + SQLAlchemy 2.0 async + asyncpg → PostgreSQL 15
- **Frontend**: Next.js 16 (App Router) + React 19 + TypeScript 5 + Tailwind CSS 4
- **Infra**: Docker Compose (postgres, backend, frontend, nginx), Nginx reverse proxy

### Backend (`backend/`)
Entry point is `main.py` (FastAPI app). All business logic lives under `app/`:

- **`app/core/`** — Config (Pydantic Settings), async DB session factory, `init_db.py` (create schema + seed deck on startup under a Postgres advisory lock), `AdultConfirmationMiddleware` (18+ gate on `POST /api/v1/draw*`)
- **`app/data/tarot_deck.py`** — Canonical 78-card RWS deck: `name_vi`, keywords, Golden Dawn elements/decans/zodiac modes, numerology. `id = card_number + 1`.
- **`app/api/v1/endpoints/`** — `draw.py` (POST `/draw` JSON, POST `/draw/ai-stream` SSE; both use `_perform_draw`) and `cards.py` (GET `/cards`, GET `/cards/{id}`)
- **`app/services/`**:
  - `quantum_engine.py` — One entropy fetch per draw (ANU QRNG → Random.org → OS entropy, failed sources skipped for 60s); unbiased partial Fisher–Yates selection
  - `interpretation_service.py` — Elemental dignities (same element = +1) and decan timing (Ace/Page → season)
  - `ai_reader_service.py` — Provider chain from `providers/` registry: Gemini → Claude → mock. Falls through only on failures before the first token; a mid-stream failure becomes an SSE `error` event
  - `providers/`, `prompts/` — LLM providers (Claude uses `claude-opus-5-5` with server-side refusal fallback, no `temperature`) and shared Vietnamese prompts
- **`app/models.py`** — 4 SQLAlchemy ORM models: `User`, `Card`, `Session`, `DrawLog`
- **`app/schemas/tarot.py`** — Pydantic v2 request/response models

### Frontend (`frontend/app/`)
Single-page client component at `page.tsx` renders the flow; reading state lives in the `useTarotReading` hook (`app/lib/useTarotReading.ts`: idle → drawing → reading → done/error, with AbortController). Components under `app/components/`:
- `LegalGate.tsx` — Age 18+ verification modal (required before any reading)
- `CardReveal.tsx` — 3D card flip animation grid; selecting a card shows `InterpretationPanel`
- `AIReading.tsx` — Presentational reading renderer (light markdown)
- Others: `SpreadSelector`, `IntentionInput`, `DrawButton`

API communication is in `app/lib/api.ts` — wraps fetch calls (friendly `ApiError` messages) and exposes an async generator for SSE streaming. Base URL: `NEXT_PUBLIC_API_URL` (inlined at build; empty = same origin via nginx), defaulting to `http://localhost:8001` in `npm run dev`. TypeScript types are in `app/lib/types.ts`.

### Database Schema
Four tables: `users`, `cards` (78 RWS deck entries, JSONB metadata), `sessions` (per-reading with quantum seed, JSONB results), `draw_logs` (per-card draws with orientation, dignity weight, timing).

### Key Environment Variables
See `backend/.env.example`:
- `DATABASE_URL` — PostgreSQL async connection string
- `ANTHROPIC_API_KEY`, `GOOGLE_API_KEY` — LLM providers; `CLAUDE_MODEL`, `CLAUDE_READING_EFFORT` (not `CLAUDE_EFFORT`, which Claude Code itself sets)
- `TAVILY_API_KEY` — card metadata fetching
- `ANU_QRNG_URL`, `ANU_API_KEY` — quantum entropy source
- `AUTO_INIT_DB`, `CORS_ORIGINS`

For Docker, use `.env.docker` as a template.

### Nginx
`nginx/nginx.conf` provides rate limiting (10 req/min on `/api/v1/draw*` → 429, 30 req/min on `/api/*`), 1-year static asset caching, and unbuffered, extended-timeout proxying for the SSE endpoint.

### API Documentation
Swagger UI available at `http://localhost:8001/docs` when running the backend.
