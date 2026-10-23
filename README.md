# 🔮 Sacred Tarot — Quantum-Powered AI Readings

Ứng dụng đọc bài Tarot sử dụng **entropy lượng tử thật** (ANU QRNG) để rút bài và **AI streaming** (Google Gemini / Anthropic Claude) để diễn giải bằng tiếng Việt theo thời gian thực.

---

## ✨ Tính năng

- **Quantum RNG** — Entropy thật từ [ANU Quantum RNG](https://qrng.anu.edu.au/), fallback Random.org → OS secrets
- **4 loại trải bài** — Single, Three Card, Horseshoe (7 lá), Celtic Cross (10 lá)
- **Elemental Dignities** — Tính tương tác nguyên tố theo truyền thống Golden Dawn
- **Bộ bài đầy đủ 78 lá** — Tên tiếng Việt, keywords thuận/ngược, nguyên tố & decan theo Golden Dawn (seed tự động)
- **Ảnh Rider-Waite-Smith gốc 1909** — Bản scan "Pam-A" (public domain), lật từ mặt sau "Roses & Lilies", lá ngược xoay 180°
- **Decan Timing** — Dự đoán thời gian theo Cardinal / Fixed / Mutable (Ace/Page theo mùa)
- **AI Streaming** — Google Gemini hoặc Claude diễn giải tiếng Việt, stream từng từ qua SSE
- **Compliance Gate** — Xác nhận 18+ bắt buộc (frontend modal + backend header check)
- **Mock mode** — Chạy được không cần API key (bản đọc mẫu dựng từ chính các lá đã rút)
- **Fully async** — FastAPI + SQLAlchemy async + Next.js App Router

---

## 🏗️ Tech Stack

| Layer | Công nghệ |
|-------|-----------|
| **Backend** | Python 3.13, FastAPI 0.111, Uvicorn |
| **Database** | PostgreSQL 15, SQLAlchemy 2.0 (async), asyncpg |
| **LLM** | Google Gemini 2.5 Flash · Anthropic Claude Opus 5.5 |
| **Frontend** | Next.js 16, React 19, TypeScript, Tailwind CSS 4 |
| **Infra** | Docker Compose, Nginx (reverse proxy + rate limiting) |

---

## 📁 Cấu trúc dự án

```
.
├── docker-compose.yml
├── scripts/
│   └── build_card_images.py    # Tạo ảnh WebP lá bài từ bản scan RWS 1909
├── nginx/
│   └── nginx.conf              # Reverse proxy + rate limiting
│
├── backend/
│   ├── main.py                 # FastAPI entry point
│   ├── requirements.txt
│   ├── .env.example
│   ├── seed.py                 # Seed / cập nhật 78 lá bài (+ ghép metadata Tavily)
│   └── app/
│       ├── core/
│       │   ├── config.py       # Pydantic settings (env vars)
│       │   ├── database.py     # Async session factory
│       │   ├── init_db.py      # Tạo schema + seed tự động khi khởi động
│       │   └── middleware.py   # Adult confirmation middleware
│       ├── data/tarot_deck.py  # Bộ bài chuẩn 78 lá (Golden Dawn)
│       ├── data/vi.py          # Từ vựng tiếng Việt (vị trí, từ khoá, chiêm tinh, thời điểm)
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
│           ├── ai_reader_service.py       # Chuỗi provider + retry
│           ├── providers/                 # Gemini / Claude / Mock
│           └── prompts/                   # System + user prompt (tiếng Việt)
│
└── frontend/
    ├── public/cards/           # 78 ảnh lá bài + mặt sau (xem CREDITS.txt)
    └── app/
        ├── layout.tsx          # Thanh điều hướng + cổng 18+
        ├── page.tsx            # Form rút bài → kết quả (bàn trải + lời đọc)
        ├── history/page.tsx    # Lịch sử trải bài (lưu trên trình duyệt)
        ├── globals.css         # Hệ màu, focus ring, reduced motion
        ├── components/
        │   ├── LegalGate.tsx   # Cổng xác nhận 18+
        │   ├── SpreadBoard.tsx # Bàn trải theo đúng hình học (Celtic Cross, móng ngựa…) + chú giải
        │   ├── CardSheet.tsx   # <dialog> chi tiết lá trên điện thoại (desktop hiện ngay dưới bàn trải)
        │   ├── InterpretationPanel.tsx  # Nội dung chi tiết một lá
        │   ├── AIReading.tsx   # Khu lời đọc (trạng thái, dừng, hành động)
        │   ├── ReadingText.tsx # Markdown nhẹ cho lời đọc
        │   ├── SpreadSelector.tsx / SpreadDiagram.tsx
        │   ├── IntentionInput.tsx  # Câu hỏi + gợi ý chủ đề
        │   └── DrawButton.tsx, BrandMark.tsx, HeroFan.tsx, NavLink.tsx
        └── lib/
            ├── api.ts          # fetch + SSE async generator, thông báo lỗi thân thiện
            ├── useTarotReading.ts  # State machine của một lượt đọc bài
            ├── spreadLayouts.ts    # Toạ độ các vị trí của từng kiểu trải
            ├── history.ts      # Lưu/đọc lịch sử (localStorage)
            ├── strings.ts      # Toàn bộ chữ giao diện (tiếng Việt)
            └── types.ts        # TypeScript interfaces
```

---

## 🚀 Chạy ứng dụng

### Với Docker (khuyến nghị)

```bash
# 1. Tạo file .env ở thư mục gốc (Compose đọc file này)
cp .env.docker .env
# → Điền API keys nếu có (không có vẫn chạy với bản đọc mẫu)

# 2. Khởi động tất cả services — backend tự tạo bảng + seed 78 lá lần đầu
docker compose up --build -d

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

uvicorn main:app --reload --port 8001   # tự tạo bảng + seed 78 lá nếu DB trống
# → http://localhost:8001/docs
```

**Frontend:**

```bash
cd frontend
npm install
npm run dev
# → http://localhost:3000 (dev tự gọi API ở http://localhost:8001;
#    đổi bằng NEXT_PUBLIC_API_URL nếu backend ở chỗ khác)
```

---

## ⚙️ Cấu hình môi trường

Tạo `backend/.env`:

```bash
# ── Database ──────────────────────────────────────────────
DATABASE_URL=postgresql+asyncpg://tarot_user:tarot_pass@localhost:5432/tarot_db

# ── LLM — chọn ít nhất 1 (nếu không có sẽ dùng mock) ────
GOOGLE_API_KEY=AIza...           # Gemini 2.5 Flash (ưu tiên 1)
ANTHROPIC_API_KEY=sk-ant-...     # Claude Opus 5.5 (ưu tiên 2)
CLAUDE_READING_EFFORT=medium     # low | medium | high | xhigh | max

# ── Tuỳ chọn ──────────────────────────────────────────────
TAVILY_API_KEY=tvly-...          # Dùng khi fetch metadata lá bài

# ── App ───────────────────────────────────────────────────
APP_ENV=development
SECRET_KEY=change-this-in-production
```

> **Không có key?** App vẫn chạy — AI stream dùng bản đọc mẫu tiếng Việt dựng từ các lá đã rút.
>
> Docker Compose không đọc `backend/.env` — dùng `.env` ở thư mục gốc (mẫu: `.env.docker`).

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

`user_id` (tuỳ chọn) phải là UUID của user đã tồn tại — nếu không trả `404`.

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
        "name_vi": "Mặt Trăng",
        "orientation": "reversed",
        "element": "water",
        "astro_decan": "Pisces",
        "dignity_weight": -0.5,
        "timing": { "timing_unit": "timeless", "timing_range": "timeless", ... },
        "keywords_reversed": ["clarity emerging", "released fear", ...],
        "raw_quantum_byte": 114,
        "orientation_byte": 175,
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

# Khi có lỗi (thay cho "done"):
data: {"type":"error","message":"..."}
```

`quantum_source`: `anu_qrng` | `random_org` | `os_entropy` (dự phòng). Mỗi lượt rút chỉ gọi nguồn entropy một lần;
nguồn nào lỗi sẽ bị bỏ qua 60 giây để request sau không phải chờ timeout.

---

## 🧠 AI Provider Logic

```
GOOGLE_API_KEY set?   →  Gemini 2.5 Flash
        ↓ không / lỗi trước khi stream
ANTHROPIC_API_KEY set? →  Claude Opus 5.5 (server-side refusal fallback)
        ↓ không / lỗi trước khi stream
Mock stream (bản đọc mẫu từ các lá đã rút)
```

Nếu provider đã stream được một phần rồi mới lỗi, client nhận event `error` (không ghép thêm
lời đọc của provider khác để tránh nội dung bị lặp).

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
| Ace / Page (không có decan) | Mùa | Fire → xuân, Water → hạ, Air → thu, Earth → đông |
| Major Arcana | — | Timeless |

Gán decan theo Golden Dawn: lá 2–4 = cung Cardinal, 5–7 = Fixed, 8–10 = Mutable của nguyên tố bộ bài;
Knight → Mutable, Queen → Cardinal, King → Fixed.

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
  id (1–78) · name · name_vi · suit · arcana · element
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
  raw_quantum_bytes (hex: byte chọn lá + byte hướng lá)
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
| `/api/v1/draw*` | backend | 10 req/min (vượt → `429`) |
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

Backend tự tạo bảng và đồng bộ bộ bài chuẩn (`app/data/tarot_deck.py`) vào bảng `cards` mỗi lần
khởi động (tắt bằng `AUTO_INIT_DB=false`). `metadata_json` được merge nên dữ liệu ghép thêm (VD: Tavily)
không bị mất. Chạy tay khi cần:

```bash
python seed.py                              # upsert bộ bài chuẩn 78 lá

# Tuỳ chọn: ghép thêm metadata từ Tavily
python fetch_tavily_data.py                 # cần TAVILY_API_KEY, ~2 phút cho 78 lá
python seed.py --file tarot_seed_data.json  # merge vào metadata_json, giữ keywords/decan
```

> `seed.py` là idempotent — `ON CONFLICT (name) DO UPDATE`, chạy lại sẽ sửa dữ liệu cũ thay vì bỏ qua.

---

## 🎴 Ảnh lá bài

Ảnh trong `frontend/public/cards/` là bản scan bộ **Rider-Waite-Smith in năm 1909 ("Pam-A")** của
Pamela Colman Smith, do [Steve-P.org](https://steve-p.org/cards/RWSa.html) phục chế, lấy qua
[mixvlad/TarotCards](https://github.com/mixvlad/TarotCards). Tác phẩm đã thuộc phạm vi công cộng
(xuất bản 1909; tác giả mất năm 1951 → hết bảo hộ ở các nước "đời + 70 năm" từ 2022).
Đây **không** phải bản tô màu lại năm 1971 của U.S. Games (bản đó còn bản quyền).

Tạo lại ảnh: xem hướng dẫn trong `scripts/build_card_images.py`. Mỗi lá có `image_url`
(`/cards/NN-ten-la.webp`) trong DB; frontend tự quay về mặt bài vẽ bằng CSS nếu ảnh lỗi.

---

## 📄 License

MIT
