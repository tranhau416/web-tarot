# 🔮 Sacred Tarot — Quantum-Powered AI Readings

Ứng dụng đọc bài Tarot sử dụng **entropy lượng tử thật** (ANU QRNG) để rút bài và **AI streaming** (Google Gemini / Anthropic Claude) để diễn giải bằng tiếng Việt theo thời gian thực.

---

## ✨ Tính năng

- **Quantum RNG** — Entropy thật từ [ANU Quantum RNG](https://qrng.anu.edu.au/), fallback Random.org → OS secrets
- **4 loại trải bài** — Single, Three Card, Horseshoe (7 lá), Celtic Cross (10 lá)
- **Elemental Dignities** — Tính tương tác nguyên tố theo truyền thống Golden Dawn
- **Decan Timing** — Dự đoán thời gian theo Cardinal / Fixed / Mutable
- **AI Streaming** — Google Gemini hoặc Claude diễn giải tiếng Việt, stream từng từ qua SSE
- **Compliance Gate** — Xác nhận 18+ bắt buộc (frontend modal + backend header check)
- **Mock mode** — Chạy được không cần API key (demo stream sẵn có)
- **Fully async** — FastAPI + SQLAlchemy async + Next.js App Router

---

## 🏗️ Tech Stack

| Layer | Công nghệ |
|-------|-----------|
| **Backend** | Python 3.13, FastAPI 0.111, Uvicorn |
| **Database** | PostgreSQL 15, SQLAlchemy 2.0 (async), asyncpg |
| **LLM** | Google Gemini 2.0 Flash · Anthropic Claude 3.5 Sonnet |
| **Frontend** | Next.js 16, React 19, TypeScript, Tailwind CSS 4 |
| **Infra** | Docker Compose, Nginx (reverse proxy + rate limiting) |

---

## 📁 Cấu trúc dự án

```
.
├── docker-compose.yml
├── nginx/
│   └── nginx.conf              # Reverse proxy + rate limiting
│
├── backend/
│   ├── main.py                 # FastAPI entry point
│   ├── requirements.txt
│   ├── .env.example
│   ├── seed.py                 # Seed 78 lá bài vào DB
│   └── app/
│       ├── core/
│       │   ├── config.py       # Pydantic settings (env vars)
│       │   ├── database.py     # Async session factory
│       │   └── middleware.py   # Adult confirmation middleware
│       ├── api/v1/
│       │   ├── router.py
│       │   └── endpoints/
│       │       ├── draw.py     # POST /draw  &  POST /draw/ai-stream
│       │       └── cards.py    # GET /cards  &  GET /cards/{id}
│       ├── models.py           # ORM: User, Card, Session, DrawLog
│       ├── schemas/tarot.py    # Pydantic request/response models
│       └── services/
│           ├── quantum_engine.py          # RNG + draw logic
│           ├── interpretation_service.py  # Dignities + Timing
│           └── ai_reader_service.py       # LLM streaming (Gemini/Claude/Mock)
│
└── frontend/
    └── app/
        ├── layout.tsx
        ├── page.tsx            # Main UI
        ├── globals.css         # Custom color system
        ├── components/
        │   ├── LegalGate.tsx   # Age verification modal
        │   ├── AIReading.tsx   # Streaming AI text component
        │   ├── CardReveal.tsx  # 3D flip animation
        │   ├── SpreadSelector.tsx
        │   ├── IntentionInput.tsx
        │   └── DrawButton.tsx
        └── lib/
            ├── api.ts          # fetch + SSE async generator
            └── types.ts        # TypeScript interfaces
```

---

## 🚀 Chạy ứng dụng

### Với Docker (khuyến nghị)

```bash
# 1. Tạo file .env
cp backend/.env.example backend/.env
# → Điền API keys (xem phần Config bên dưới)

# 2. Khởi động tất cả services
docker compose up --build -d

# 3. Seed dữ liệu 78 lá bài (chỉ cần chạy 1 lần)
docker compose exec backend python seed.py

# App: http://localhost
# API docs: http://localhost/docs
```

### Development (local)

**Backend:**

```bash
cd backend
python -m venv venv && source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env          # điền DATABASE_URL + API keys

# Chạy PostgreSQL
docker run -d --name tarot-pg \
  -e POSTGRES_USER=tarot_user \
  -e POSTGRES_PASSWORD=tarot_pass \
  -e POSTGRES_DB=tarot_db \
  -p 5432:5432 postgres:15-alpine

python seed.py                # seed dữ liệu lần đầu
uvicorn main:app --reload --port 8001
# → http://localhost:8001/docs
```

**Frontend:**

```bash
cd frontend
npm install
npm run dev
# → http://localhost:3000
```

---

## ⚙️ Cấu hình môi trường

Tạo `backend/.env`:

```bash
# ── Database ──────────────────────────────────────────────
DATABASE_URL=postgresql+asyncpg://tarot_user:tarot_pass@localhost:5432/tarot_db

# ── LLM — chọn ít nhất 1 (nếu không có sẽ dùng mock) ────
GOOGLE_API_KEY=AIza...           # Gemini 2.0 Flash (ưu tiên 1)
ANTHROPIC_API_KEY=sk-ant-...     # Claude 3.5 Sonnet (ưu tiên 2)

# ── Tuỳ chọn ──────────────────────────────────────────────
TAVILY_API_KEY=tvly-...          # Dùng khi fetch metadata lá bài

# ── App ───────────────────────────────────────────────────
APP_ENV=development
SECRET_KEY=change-this-in-production
```

> **Không có key?** App vẫn chạy — AI stream sẽ dùng demo text tiếng Việt có sẵn.

---

## 🔌 API Reference

### Header bắt buộc cho `/draw*`

```
X-Adult-Confirmed: true
```

### Endpoints

| Method | Path | Mô tả |
|--------|------|-------|
| `GET` | `/health` | Kiểm tra server |
| `GET` | `/docs` | Swagger UI |
| `GET` | `/api/v1/cards` | Danh sách lá bài (`?suit=`, `?limit=`, `?offset=`) |
| `GET` | `/api/v1/cards/{id}` | Chi tiết 1 lá (id: 1–78) |
| `POST` | `/api/v1/draw` | Rút bài → JSON |
| `POST` | `/api/v1/draw/ai-stream` | Rút bài + stream AI → SSE |

---

#### `POST /api/v1/draw`

```json
// Request
{
  "spread_type": "three_card",
  "intention": "Tôi nên tập trung vào điều gì?",
  "user_id": null
}

// Response
{
  "session_id": "uuid",
  "interpretation": {
    "spread_type": "three_card",
    "cards": [
      {
        "position_index": 0,
        "position_label": "Past",
        "card_name": "The Moon",
        "orientation": "reversed",
        "element": "water",
        "dignity_weight": -0.5,
        "timing": { "timing_range": "1-4 weeks", ... },
        "keywords_reversed": ["confusion", "fear", ...],
        ...
      }
    ],
    "overall_dignity_score": 0.33,
    "dominant_element": "water",
    "quantum_source": "anu_qrng"
  },
  "disclaimer": "⚠️ DISCLAIMER: ..."
}
```

---

#### `POST /api/v1/draw/ai-stream`

Trả về [Server-Sent Events](https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events):

```bash
curl -X POST http://localhost:8001/api/v1/draw/ai-stream \
  -H "X-Adult-Confirmed: true" \
  -H "Content-Type: application/json" \
  -d '{"spread_type":"single","intention":"Tôi nên làm gì?"}' \
  --no-buffer
```

```
data: {"type":"draw_result","session_id":"...","interpretation":{...},"disclaimer":"..."}

data: {"type":"token","text":"✦ Vũ trụ "}
data: {"type":"token","text":"đang lắng nghe… "}
...
data: {"type":"done"}

# Khi có lỗi:
data: {"type":"error","message":"..."}
```

---

## 🧠 AI Provider Logic

```
GOOGLE_API_KEY set?   →  Gemini 2.0 Flash
        ↓ không
ANTHROPIC_API_KEY set? →  Claude 3.5 Sonnet
        ↓ không
Mock stream (demo text tiếng Việt)
```

**Ngôn ngữ diễn giải:** tiếng Việt, phong cách huyền bí & ấm áp.

**Cấu trúc lời đọc:**
1. Mở đầu — cảm nhận tổng thể
2. Từng lá bài theo vị trí
3. Dòng chảy giữa các lá (Elemental Dignities)
4. Thông điệp chính
5. Lời khuyên thực tế
6. Về thời gian (Decan Timing)

---

## 🃏 Hệ thống Tarot

### Elemental Dignities (Golden Dawn)

| Cặp nguyên tố | Tương tác | Điểm |
|---------------|-----------|------|
| Fire + Air | Dignified (Allied) | +1.0 |
| Water + Earth | Dignified (Allied) | +1.0 |
| Cùng nguyên tố | Dignified | +1.0 |
| Fire + Water | Ill-dignified (Opposed) | −1.0 |
| Air + Earth | Ill-dignified (Opposed) | −1.0 |
| Còn lại | Neutral | 0.0 |

### Decan Timing

| Zodiac Mode | Đơn vị | Khoảng thời gian |
|-------------|--------|-----------------|
| Cardinal | Tuần | 1–4 tuần |
| Fixed | Tháng | 1–4 tháng |
| Mutable | Ngày | 3–21 ngày |
| Major Arcana | — | Timeless |

### Loại trải bài

| Tên | Số lá | Ý nghĩa vị trí |
|-----|-------|---------------|
| Single | 1 | The Card |
| Three Card | 3 | Past · Present · Future |
| Horseshoe | 7 | Past → Outcome (7 vị trí) |
| Celtic Cross | 10 | Present Situation → Outcome (10 vị trí) |

---

## 🗄️ Database Schema

```
users
  id UUID · email (unique) · is_adult_confirmed · timezone

cards  (78 lá bài)
  id (1–78) · name · suit · arcana · element
  zodiac_mode · astro_decan · numerology_value
  metadata_json JSONB  ← keywords upright/reversed, dignity data

sessions
  id UUID · user_id FK (nullable = anonymous)
  spread_type · intention · quantum_seed (hex)
  interpretation_result JSONB · status · completed_at

draw_logs
  id UUID · session_id FK · card_id FK
  position_index · position_label · orientation
  dignity_weight (−1.0 → +1.0) · timing_output JSONB
  raw_quantum_bytes (hex)
  UNIQUE(session_id, position_index)
```

---

## 🐳 Docker Services

| Service | Image | Port (nội bộ) |
|---------|-------|--------------|
| `postgres` | postgres:15-alpine | 5432 |
| `backend` | (custom) | 8000 |
| `frontend` | (custom) | 3000 |
| `nginx` | nginx:1.25-alpine | **80** (public) |

**Nginx routing:**

| Path | Upstream | Rate limit |
|------|----------|-----------|
| `/api/v1/draw*` | backend | 10 req/min |
| `/api/*` | backend | 30 req/min |
| `/_next/static/*` | frontend | cache 1 year |
| `/*` | frontend | — |

---

## 🛡️ Compliance

Hai lớp kiểm tra tuổi 18+:

1. **Frontend** — `LegalGate` modal yêu cầu tick 2 checkbox trước khi vào app (lưu `localStorage`)
2. **Backend** — Middleware + endpoint check header `X-Adult-Confirmed: true` → 403 nếu thiếu

Disclaimer pháp lý đính kèm mọi response từ `/draw`.

---

## 🌱 Seed dữ liệu

```bash
# Seed từ dữ liệu mock (development)
python seed.py --file mock_tarot_seed_data.json

# Fetch metadata thật từ Tavily rồi seed (production)
python fetch_tavily_data.py   # cần TAVILY_API_KEY, ~2 phút cho 78 lá
python seed.py                # seed tarot_seed_data.json vào DB
```

> `seed.py` là idempotent — chạy nhiều lần không tạo duplicate (`ON CONFLICT DO NOTHING`).

---

## 📄 License

MIT
