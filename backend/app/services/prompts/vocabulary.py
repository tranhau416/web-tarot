"""Từ vựng tiếng Việt dùng chung cho prompt và mock reading."""

POSITION_VI: dict[str, str] = {
    "The Card": "Lá bài chính",
    "Past": "Quá khứ",
    "Present": "Hiện tại",
    "Future": "Tương lai",
    "Hidden Influences": "Ảnh hưởng tiềm ẩn",
    "Obstacles": "Trở ngại",
    "External Influences": "Tác động bên ngoài",
    "Hopes & Fears": "Hy vọng & nỗi sợ",
    "Outcome": "Kết quả",
    "Present Situation": "Tình huống hiện tại",
    "Crossing": "Thử thách cắt ngang",
    "Root": "Gốc rễ",
    "Crown": "Mục tiêu / điều ý thức",
    "Near Future": "Tương lai gần",
    "Self": "Bản thân",
    "Environment": "Môi trường xung quanh",
}

SPREAD_VI: dict[str, str] = {
    "single": "Một lá",
    "three_card": "Ba lá (Quá khứ · Hiện tại · Tương lai)",
    "horseshoe": "Móng ngựa (7 lá)",
    "celtic_cross": "Celtic Cross (10 lá)",
}

ELEMENT_VI: dict[str, str] = {
    "fire": "Lửa",
    "water": "Nước",
    "air": "Khí",
    "earth": "Đất",
    "spirit": "Tinh thần",
}

SEASON_VI: dict[str, str] = {
    "spring": "mùa xuân",
    "summer": "mùa hạ",
    "autumn": "mùa thu",
    "winter": "mùa đông",
}


def position_vi(label: str | None, index: int) -> str:
    if not label:
        return f"Vị trí {index + 1}"
    return POSITION_VI.get(label, label)


def element_vi(element: str | None) -> str:
    return ELEMENT_VI.get((element or "").lower(), "không xác định")


def dignity_vi(weight: float) -> str:
    if weight >= 0.5:
        return "được nâng đỡ mạnh bởi các lá bên cạnh"
    if weight > 0:
        return "được các lá bên cạnh hỗ trợ nhẹ"
    if weight <= -0.5:
        return "bị các lá bên cạnh làm suy yếu"
    if weight < 0:
        return "hơi bị cản trở bởi các lá bên cạnh"
    return "đứng trung tính giữa các lá bên cạnh"


def timing_vi(timing_unit: str, timing_range: str) -> str:
    unit = (timing_unit or "").lower()
    if unit == "weeks":
        return "trong khoảng 1–4 tuần"
    if unit == "months":
        return "trong khoảng 1–4 tháng"
    if unit == "days":
        return "trong khoảng 3–21 ngày"
    if unit == "season":
        season = next((vi for en, vi in SEASON_VI.items() if en in timing_range), "mùa tới")
        return f"trong {season} sắp tới"
    if unit == "timeless":
        return "vượt ngoài khung thời gian cụ thể"
    return "chưa xác định"
