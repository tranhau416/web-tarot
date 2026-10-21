/**
 * Chuỗi giao diện tiếng Việt — mọi chữ hiển thị cho người dùng nằm ở đây.
 * Tên lá bài gốc (tiếng Anh) chỉ xuất hiện như dòng phụ.
 */
export const STRINGS = {
  BRAND: "Sacred Tarot",

  // Legal gate
  GATE_TITLE: "Trước khi bước vào",
  GATE_SUBTITLE: "Không gian chiêm nghiệm cùng những lá bài Tarot",
  GATE_BODY:
    "Ứng dụng dành cho mục đích giải trí và tự chiêm nghiệm. Lời đọc không phải tư vấn y tế, pháp lý, tài chính hay tâm lý, và không khẳng định tương lai là chắc chắn.",
  GATE_CHECK_AGE: "Tôi xác nhận mình đủ 18 tuổi",
  GATE_CHECK_FUN: "Tôi hiểu đây là nội dung giải trí",
  GATE_ENTER: "Bước vào",
  GATE_REMEMBERED: "Lựa chọn được ghi nhớ trên trình duyệt này.",

  // Hero & form
  HERO_SUBTITLE:
    "Đặt một câu hỏi, chọn kiểu trải bài và rút bài từ bộ Rider-Waite-Smith in năm 1909. Mỗi lá được chọn bằng nguồn ngẫu nhiên lượng tử.",
  INTENTION_LABEL: "Câu hỏi của bạn",
  INTENTION_OPTIONAL: "không bắt buộc",
  INTENTION_PLACEHOLDER: "Bạn muốn hỏi điều gì với những lá bài?",
  TOPICS_LABEL: "Gợi ý chủ đề",
  SPREAD_LABEL: "Kiểu trải bài",
  DRAW: "Rút bài",

  // Result
  RESULT_FALLBACK_TITLE: "Trải bài của bạn",
  DRAWING: "Đang xáo và rút bài…",
  TAP_HINT: "Chọn một lá để xem ý nghĩa chi tiết",
  CARDS_HEADING: "Các lá bài",
  LEGEND_HEADING: "Vị trí các lá",
  DOMINANT_ELEMENT: "Nguyên tố chủ đạo",
  HARMONY: "Năng lượng",
  HARMONY_STRONG: "hài hoà",
  HARMONY_NEUTRAL: "cân bằng",
  HARMONY_TENSE: "giằng co",

  // Card detail
  UPRIGHT: "Thuận",
  REVERSED: "Ngược",
  MEANING: "Ý nghĩa",
  NEIGHBOURS: "Tương tác với các lá bên cạnh",
  TIMING: "Thời điểm",
  ASTROLOGY: "Chiêm tinh",
  TECHNICAL: "Chi tiết kỹ thuật",
  CLOSE: "Đóng",
  PREV_CARD: "Lá trước",
  NEXT_CARD: "Lá sau",

  // Reading
  READING_HEADING: "Lời đọc bài",
  READING_STREAMING: "đang đọc…",
  READING_THINKING: "Các lá bài đang thì thầm…",
  READING_EMPTY: "Vũ trụ im lặng lần này. Hãy thử lại với một câu hỏi khác.",
  READING_STOPPED: "Đã dừng lời đọc.",

  // Actions
  STOP: "Dừng đọc",
  COPY: "Sao chép lời đọc",
  COPIED: "Đã sao chép",
  NEW_READING: "Rút bài mới",
  RETRY: "Thử lại",
  BACK: "Quay lại",
  HISTORY: "Lịch sử",
  ENTROPY_SOURCE: "Nguồn ngẫu nhiên",

  DISCLAIMER:
    "Tarot chỉ mang tính giải trí và chiêm nghiệm, không thay thế tư vấn chuyên môn. Nếu bạn đang gặp khủng hoảng, hãy liên hệ người thân hoặc chuyên gia.",

  // Errors
  ERROR_UNKNOWN: "Đã có lỗi xảy ra. Vui lòng thử lại.",

  // History
  HISTORY_TITLE: "Lịch sử trải bài",
  HISTORY_SUBTITLE: "Các lần đọc gần đây được lưu trên trình duyệt này.",
  HISTORY_EMPTY: "Chưa có lần trải bài nào. Lời đọc sẽ được lưu ở đây sau khi hoàn tất.",
  HISTORY_CLEAR: "Xoá lịch sử",
  HISTORY_CONFIRM_CLEAR: "Bấm lần nữa để xoá",
  HISTORY_NO_QUESTION: "Không có câu hỏi cụ thể",
  HISTORY_SHOW: "Xem lời đọc",
  HISTORY_HIDE: "Thu gọn",
} as const;

export const TOPICS: { label: string; question: string }[] = [
  { label: "Tình yêu", question: "Chuyện tình cảm của tôi sắp tới sẽ ra sao?" },
  { label: "Công việc", question: "Công việc của tôi trong thời gian tới sẽ thế nào?" },
  { label: "Tài chính", question: "Tôi nên lưu ý điều gì về tài chính lúc này?" },
  { label: "Bản thân", question: "Tôi cần hiểu điều gì về bản thân mình lúc này?" },
  { label: "Gia đình", question: "Mối quan hệ trong gia đình tôi đang cần điều gì?" },
];
