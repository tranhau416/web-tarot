# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A full-stack quantum-powered Tarot reading web application. The backend uses FastAPI (Python) with async PostgreSQL, quantum RNG entropy, and streaming LLM interpretation. The frontend is Next.js 16 with React 19 and Tailwind CSS 4.

## Commands

### Docker (full stack)
```bash
docker compose up --build -d
docker compose exec backend python seed.py   # Seed 78 tarot cards
docker compose logs -f
docker compose down
```

### Backend (local dev)
```bash
cd backend
source venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8001        # Dev server
python seed.py                               # Seed cards from mock_tarot_seed_data.json
python fetch_tavily_data.py                  # Fetch card metadata from Tavily
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

- **`app/core/`** — Config (Pydantic Settings), async DB session factory, `AdultConfirmationMiddleware` (18+ compliance gate on all requests)
- **`app/api/v1/endpoints/`** — Two active endpoint files: `draw.py` (POST `/draw` for JSON response, POST `/draw/ai-stream` for SSE streaming) and `cards.py` (GET `/cards`, GET `/cards/{id}`)
- **`app/services/`** — Three service modules:
  - `quantum_engine.py` — Entropy from ANU QRNG → Random.org → local fallback; card selection logic
  - `interpretation_service.py` — Elemental dignities and decan timing calculations
  - `ai_reader_service.py` — LLM orchestration with provider chain: Google Gemini → Anthropic Claude → mock
- **`app/models.py`** — 4 SQLAlchemy ORM models: `User`, `Card`, `Session`, `DrawLog`
- **`app/schemas/tarot.py`** — Pydantic v2 request/response models

### Frontend (`frontend/app/`)
Single-page client component at `page.tsx` orchestrates the full UI flow. Components under `app/components/`:
- `LegalGate.tsx` — Age 18+ verification modal (required before any reading)
- `CardReveal.tsx` — 3D card flip animation grid
- `AIReading.tsx` — SSE streaming text renderer
- Others: `SpreadSelector`, `IntentionInput`, `DrawButton`, `InterpretationPanel`

API communication is in `app/lib/api.ts` — wraps fetch calls and exposes an async generator for SSE streaming. TypeScript types are in `app/lib/types.ts`.

### Database Schema
Four tables: `users`, `cards` (78 RWS deck entries, JSONB metadata), `sessions` (per-reading with quantum seed, JSONB results), `draw_logs` (per-card draws with orientation, dignity weight, timing).

### Key Environment Variables
See `backend/.env.example`:
- `DATABASE_URL` — PostgreSQL async connection string
- `ANTHROPIC_API_KEY`, `GOOGLE_API_KEY` — LLM providers
- `TAVILY_API_KEY` — card metadata fetching
- `ANU_QRNG_URL` — quantum entropy source

For Docker, use `.env.docker` as a template.

### Nginx
`nginx/nginx.conf` provides rate limiting (10 req/min on `/api/v1/draw`, 30 req/min on `/api/*`), 1-year static asset caching, and extended timeouts for SSE endpoints.

### API Documentation
Swagger UI available at `http://localhost:8001/docs` when running the backend.
