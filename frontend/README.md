# Sacred Tarot — Frontend

Giao diện web cho ứng dụng đọc bài Tarot sử dụng Next.js 16, React 19 và Tailwind CSS 4.

## Yêu cầu

- **Node.js** >= 18
- **npm** >= 9
- Backend đang chạy tại `http://localhost:8001` (xem `../backend/README.md`)

## Cài đặt

```bash
npm install
```

## Biến môi trường

Tạo file `.env.local` ở thư mục `frontend/`:

```bash
echo "NEXT_PUBLIC_API_URL=http://localhost:8001" > .env.local
```

| Biến | Mô tả | Mặc định |
|------|-------|----------|
| `NEXT_PUBLIC_API_URL` | URL của backend API | `http://localhost:8001` |

## Chạy development

```bash
npm run dev
```

Mở trình duyệt tại [http://localhost:3000](http://localhost:3000).

> **Lưu ý:** Nếu port 3000 đã bị dùng, Next.js sẽ tự chọn port tiếp theo (3001, 3002, ...).
> Để chỉ định port cụ thể: `npm run dev -- --port 3000`

## Build production

```bash
npm run build
npm run start
```

## Lint

```bash
npm run lint
```

## Xử lý lỗi thường gặp

### `Unable to acquire lock` khi restart dev server

```bash
rm -f .next/dev/lock
npm run dev
```

### Port đã bị chiếm

```bash
# Tìm và kill process đang dùng port 3000
kill $(lsof -ti :3000)

# Hoặc chỉ định port khác
npm run dev -- --port 3001
```

## Công nghệ sử dụng

- [Next.js 16](https://nextjs.org/) — App Router + Turbopack
- [React 19](https://react.dev/)
- [TypeScript 5](https://www.typescriptlang.org/)
- [Tailwind CSS 4](https://tailwindcss.com/)
- Fonts: EB Garamond, Inter, JetBrains Mono (Google Fonts)
