# Sacred Tarot — app Android

App React Native (Expo, Expo Router) viết lại giao diện web trong `frontend/`, dùng chung backend FastAPI.

- **Giống bản web:** cổng 18+ kèm chọn giao diện (Đêm trong · Pixel hồng · Cúc hoạ mi), câu hỏi và gợi ý chủ đề, 4 kiểu trải bài với bàn trải đúng hình học (Celtic Cross có lá cắt ngang, móng ngựa hình chữ U), lá úp được chia lên bàn rồi lật lần lượt, lời đọc hiện dần theo luồng (có nút dừng), bảng chi tiết lá trượt từ dưới lên, sao chép lời đọc, lịch sử lưu trên máy.
- **Riêng cho Android:** nút Back đóng bảng chi tiết hoặc quay về form, rung nhẹ khi lật lá, màu thanh hệ thống theo giao diện, chuyển động tắt theo cài đặt "Xoá ảnh động".
- **Dùng chung với web, không sao chép:** kiểu dữ liệu, chữ tiếng Việt, kiểu trải bài và hình học bàn trải, cách lưu lịch sử (`frontend/app/lib/*`), và ảnh 78 lá RWS 1909 (`frontend/public/cards/`). Metro đọc trực tiếp các thư mục này (`metro.config.js`, alias `@shared/*`).

## Chạy thử

```bash
cd mobile
npm ci
cp .env.example .env            # điền EXPO_PUBLIC_API_URL
npx expo start                  # quét mã QR bằng Expo Go, hoặc nhấn a để mở máy ảo Android
npx expo start --web            # xem nhanh trên trình duyệt (backend cần cho phép CORS từ địa chỉ này)
```

## Kiểm tra

```bash
npm run typecheck
npm test                        # parser luồng SSE và định dạng lời đọc
```

## Build APK

GitHub Actions (`.github/workflows/mobile.yml`) build file APK ở mỗi lần push vào `mobile/`; tải ở mục **Artifacts** của lần chạy (`sacred-tarot-apk`).

- Đặt địa chỉ backend trong biến repository **`MOBILE_API_URL`** (Settings → Secrets and variables → Actions → Variables). Backend phải chạy HTTPS.
- APK được ký bằng khoá debug của template Expo: cài thử được, chưa nộp được Google Play. Khi lên Play cần tạo khoá upload riêng (hoặc dùng `eas build`).

Build trên máy có Android SDK:

```bash
npx expo prebuild --platform android
cd android && ./gradlew assembleRelease
```

Thư mục `android/` do `expo prebuild` sinh ra và không commit; cấu hình native nằm trong `app.json`.
