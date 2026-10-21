"""
============================================================
Tarot Web App - Vietnamese vocabulary (single source)
backend/app/data/vi.py
============================================================

Dùng chung cho bộ bài (keywords / chiêm tinh tiếng Việt), kết quả API
(nhãn vị trí, dignity, timing) và prompt / bản đọc mẫu.
"""

from __future__ import annotations

import re

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
    "Crown": "Mục tiêu",
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

ZODIAC_MODE_VI: dict[str, str] = {
    "cardinal": "Thống lĩnh",
    "fixed": "Kiên định",
    "mutable": "Linh hoạt",
}

PLANET_VI: dict[str, str] = {
    "Sun": "Mặt Trời",
    "Moon": "Mặt Trăng",
    "Mercury": "Sao Thủy",
    "Venus": "Sao Kim",
    "Mars": "Sao Hỏa",
    "Jupiter": "Sao Mộc",
    "Saturn": "Sao Thổ",
}

SIGN_VI: dict[str, str] = {
    "Aries": "Bạch Dương",
    "Taurus": "Kim Ngưu",
    "Gemini": "Song Tử",
    "Cancer": "Cự Giải",
    "Leo": "Sư Tử",
    "Virgo": "Xử Nữ",
    "Libra": "Thiên Bình",
    "Scorpio": "Bọ Cạp",
    "Sagittarius": "Nhân Mã",
    "Capricorn": "Ma Kết",
    "Aquarius": "Bảo Bình",
    "Pisces": "Song Ngư",
}

_ELEMENT_TITLE_VI = {"Fire": "Lửa", "Water": "Nước", "Air": "Khí", "Earth": "Đất"}

KEYWORDS_VI: dict[str, str] = {
    "absolution": "được giải thoát",
    "abundance": "sung túc",
    "abuse of power": "lạm quyền",
    "acceptance": "chấp nhận",
    "accomplishment": "thành tựu",
    "accountability": "chịu trách nhiệm",
    "adaptability": "khả năng thích nghi",
    "adventure": "phiêu lưu",
    "aggression": "hung hăng",
    "aimless drifting": "trôi dạt vô định",
    "aligned values": "giá trị đồng điệu",
    "ambition": "tham vọng",
    "anxiety": "lo âu",
    "apathy": "thờ ơ",
    "arrogance": "kiêu ngạo",
    "assertiveness": "quyết đoán",
    "attachment": "ràng buộc",
    "authority": "quyền uy",
    "averting disaster": "tránh được tai hoạ",
    "avoidance": "né tránh",
    "avoiding accountability": "trốn tránh trách nhiệm",
    "avoiding conflict": "né tránh xung đột",
    "awakening": "thức tỉnh",
    "bad luck": "vận rủi",
    "balance": "cân bằng",
    "betrayal": "phản bội",
    "bias": "thiên vị",
    "bitterness": "cay đắng",
    "blocked joy": "niềm vui bị chặn",
    "boldness": "táo bạo",
    "bondage": "trói buộc",
    "boredom": "chán nản",
    "boundaries": "ranh giới",
    "breaking free": "thoát khỏi xiềng xích",
    "breakthrough": "đột phá",
    "breakup": "chia tay",
    "broken family": "gia đình rạn nứt",
    "burden": "gánh nặng",
    "burnout": "kiệt sức",
    "business acumen": "nhạy bén kinh doanh",
    "calm control": "điềm tĩnh làm chủ",
    "cause and effect": "nhân quả",
    "celebration": "ăn mừng",
    "challenge": "thử thách",
    "change": "thay đổi",
    "chaos": "hỗn loạn",
    "charisma": "sức hút",
    "charity": "bác ái",
    "charm": "duyên dáng",
    "childhood memories": "ký ức tuổi thơ",
    "choices": "lựa chọn",
    "clarity": "sáng tỏ",
    "clarity emerging": "dần sáng tỏ",
    "clear boundaries": "ranh giới rõ ràng",
    "clouded judgment": "phán đoán mờ mịt",
    "codependence": "phụ thuộc lẫn nhau",
    "coldness": "lạnh lùng",
    "collaboration": "hợp tác",
    "collapse of illusions": "ảo tưởng sụp đổ",
    "coming clean": "thành thật thú nhận",
    "community": "cộng đồng",
    "compassion": "lòng trắc ẩn",
    "competition": "cạnh tranh",
    "completion": "hoàn thành",
    "confession": "thú nhận",
    "confidence": "tự tin",
    "conflict": "xung đột",
    "confusion": "bối rối",
    "connection": "kết nối",
    "conscience": "lương tâm",
    "conservation": "gìn giữ",
    "contemplation": "chiêm nghiệm",
    "contentment": "mãn nguyện",
    "control": "kiểm soát",
    "control issues": "kiểm soát quá mức",
    "courage": "can đảm",
    "craftsmanship": "tay nghề",
    "creative block": "bế tắc sáng tạo",
    "creative opportunity": "cơ hội sáng tạo",
    "creative spark": "tia lửa sáng tạo",
    "creativity": "sáng tạo",
    "crisis": "khủng hoảng",
    "curiosity": "tò mò",
    "cycles": "chu kỳ",
    "debt": "nợ nần",
    "decay": "suy tàn",
    "deception": "lừa dối",
    "decisions": "quyết định",
    "decisiveness": "dứt khoát",
    "dedication": "tận tâm",
    "defeat": "thất bại",
    "defending your position": "giữ vững lập trường",
    "defensiveness": "phòng thủ",
    "delayed collapse": "sụp đổ bị trì hoãn",
    "delays": "trì hoãn",
    "delegation": "giao phó",
    "demanding": "đòi hỏi",
    "dependence": "phụ thuộc",
    "despair": "tuyệt vọng",
    "destiny": "định mệnh",
    "detachment": "buông bỏ ràng buộc",
    "determination": "quyết tâm",
    "difficult choice": "lựa chọn khó khăn",
    "difficult decision": "quyết định khó khăn",
    "diligence": "siêng năng",
    "diplomacy": "khéo léo ngoại giao",
    "disappointment": "thất vọng",
    "discipline": "kỷ luật",
    "disconnection": "mất kết nối",
    "discord": "bất hoà",
    "discouragement": "nản lòng",
    "discovery": "khám phá",
    "disharmony": "lệch nhịp",
    "dishonesty": "thiếu trung thực",
    "disorganization": "thiếu tổ chức",
    "disregard for skill": "coi nhẹ tay nghề",
    "dissatisfaction": "bất mãn",
    "dogma": "giáo điều",
    "domination": "áp đặt",
    "drive": "động lực",
    "ego": "cái tôi",
    "emotional awakening": "cảm xúc thức tỉnh",
    "emotional balance": "cân bằng cảm xúc",
    "emotional blockage": "cảm xúc bị dồn nén",
    "emotional fulfillment": "viên mãn cảm xúc",
    "emotional immaturity": "non nớt cảm xúc",
    "emotional overwhelm": "quá tải cảm xúc",
    "emotional security": "an toàn cảm xúc",
    "emotional volatility": "cảm xúc thất thường",
    "emptiness": "trống rỗng",
    "endings": "kết thúc",
    "energy": "năng lượng",
    "enthusiasm": "nhiệt huyết",
    "entrepreneurship": "tinh thần khởi nghiệp",
    "ethics": "đạo đức",
    "excess": "thái quá",
    "exhaustion": "mệt mỏi rã rời",
    "expansion": "mở rộng",
    "exploration": "khám phá",
    "fairness": "công bằng",
    "faith": "niềm tin",
    "fall from grace": "thất sủng",
    "false start": "khởi đầu sai",
    "family": "gia đình",
    "family disputes": "bất hoà gia đình",
    "fantasy": "mộng tưởng",
    "fast thinking": "tư duy nhanh",
    "fatigue": "mệt mỏi",
    "fear": "sợ hãi",
    "fear of change": "sợ thay đổi",
    "fear of endings": "sợ kết thúc",
    "fear of the unknown": "sợ điều chưa biết",
    "feeling stuck": "cảm thấy bế tắc",
    "feeling trapped": "cảm thấy bị mắc kẹt",
    "fertility": "sinh sôi",
    "financial failure": "thất bại tài chính",
    "financial loss": "mất mát tài chính",
    "financial security": "vững vàng tài chính",
    "financial strain": "căng thẳng tài chính",
    "flexibility": "linh hoạt",
    "following the heart": "nghe theo trái tim",
    "foresight": "tầm nhìn xa",
    "forgiveness": "tha thứ",
    "free spirit": "tâm hồn tự do",
    "friendship": "tình bạn",
    "frustration": "bực bội",
    "fulfillment": "viên mãn",
    "future vision": "tầm nhìn tương lai",
    "generosity": "hào phóng",
    "gentle influence": "ảnh hưởng nhẹ nhàng",
    "getting away with something": "lách luật thoát thân",
    "giving and receiving": "cho và nhận",
    "giving up": "bỏ cuộc",
    "good luck": "may mắn",
    "gossip": "đàm tiếu",
    "gratitude": "biết ơn",
    "greed": "tham lam",
    "grief": "đau buồn",
    "groundedness": "vững chãi",
    "happiness": "hạnh phúc",
    "hard work": "chăm chỉ",
    "hardship": "gian khó",
    "harmony": "hài hoà",
    "harsh judgment": "phán xét khắt khe",
    "harsh self-judgment": "tự trách khắt khe",
    "haste": "vội vã",
    "hasty ideas": "ý tưởng vội vàng",
    "hasty words": "lời nói vội vàng",
    "heartbreak": "tan vỡ",
    "hesitation": "do dự",
    "hidden agendas": "toan tính ngầm",
    "homecoming": "trở về nhà",
    "honesty": "trung thực",
    "honor": "danh dự",
    "hope": "hy vọng",
    "idealism": "lý tưởng",
    "idealized memories": "ký ức tô hồng",
    "ignored intuition": "phớt lờ trực giác",
    "ignoring the call": "làm ngơ tiếng gọi",
    "illusion": "ảo ảnh",
    "imbalance": "mất cân bằng",
    "impatience": "thiếu kiên nhẫn",
    "improvement": "cải thiện",
    "impulsiveness": "bốc đồng",
    "incompletion": "dang dở",
    "indecision": "thiếu quyết đoán",
    "independence": "độc lập",
    "information overload": "quá tải thông tin",
    "injustice": "bất công",
    "inner calling": "tiếng gọi bên trong",
    "inner conflict": "giằng xé nội tâm",
    "inner guidance": "dẫn dắt nội tâm",
    "inner strength": "sức mạnh nội tâm",
    "inner upheaval": "biến động nội tâm",
    "inner wisdom": "minh triết nội tâm",
    "innocence": "ngây thơ",
    "insecurity": "bất an",
    "inspiration": "cảm hứng",
    "inspired action": "hành động đầy cảm hứng",
    "instability": "bất ổn",
    "institutions": "thể chế",
    "integration": "hợp nhất",
    "intellectual authority": "uy quyền trí tuệ",
    "introspection": "tự soi xét",
    "intuition": "trực giác",
    "intuitive messages": "thông điệp trực giác",
    "investment": "đầu tư",
    "isolation": "cô lập",
    "jealousy": "ghen tuông",
    "joy": "niềm vui",
    "juggling priorities": "xoay xở nhiều việc",
    "lack of closure": "chưa khép lại",
    "lack of direction": "thiếu phương hướng",
    "lack of discipline": "thiếu kỷ luật",
    "lack of faith": "thiếu niềm tin",
    "lack of focus": "thiếu tập trung",
    "lack of motivation": "thiếu động lực",
    "lack of progress": "chậm tiến triển",
    "lack of recognition": "không được ghi nhận",
    "lack of reward": "không được đền đáp",
    "lack of support": "thiếu hỗ trợ",
    "lack of teamwork": "thiếu tinh thần đồng đội",
    "last stand": "trận chiến cuối",
    "laziness": "lười biếng",
    "leadership": "lãnh đạo",
    "leap of faith": "bước nhảy niềm tin",
    "learning": "học hỏi",
    "leaving behind": "bỏ lại phía sau",
    "legacy": "di sản",
    "letting go": "buông bỏ",
    "letting go of control": "buông bớt kiểm soát",
    "limited vision": "tầm nhìn hạn hẹp",
    "lingering resentment": "oán giận dai dẳng",
    "living in the past": "sống trong quá khứ",
    "loneliness": "cô đơn",
    "long-term success": "thành công lâu dài",
    "long-term vision": "tầm nhìn dài hạn",
    "loss": "mất mát",
    "loss of control": "mất kiểm soát",
    "lost direction": "lạc hướng",
    "love": "tình yêu",
    "luxury": "xa hoa",
    "making amends": "sửa sai",
    "manifestation": "hiện thực hoá",
    "manipulation": "thao túng",
    "martyrdom": "hy sinh quá mức",
    "mastery": "thành thạo",
    "materialism": "thực dụng",
    "meaningful choice": "lựa chọn ý nghĩa",
    "mediocrity": "tầm thường",
    "methodical progress": "tiến bộ có phương pháp",
    "milestones": "cột mốc",
    "misaligned values": "giá trị lệch nhau",
    "misalignment": "lệch hướng",
    "miscommunication": "hiểu lầm",
    "missed lessons": "bài học bị bỏ lỡ",
    "missed opportunity": "lỡ cơ hội",
    "moderation": "điều độ",
    "momentum": "đà tiến",
    "moodiness": "thất thường",
    "movement": "chuyển động",
    "moving forward": "tiến về phía trước",
    "moving on": "bước tiếp",
    "mutual attraction": "thu hút lẫn nhau",
    "mystery": "bí ẩn",
    "naivety": "cả tin",
    "needless sacrifice": "hy sinh vô ích",
    "new beginnings": "khởi đầu mới",
    "new idea": "ý tưởng mới",
    "new ideas": "ý tưởng mới",
    "new love": "tình yêu mới",
    "new opportunity": "cơ hội mới",
    "new perspective": "góc nhìn mới",
    "new skill": "kỹ năng mới",
    "new venture": "dự định mới",
    "news": "tin tức",
    "nightmares": "ác mộng",
    "nostalgia": "hoài niệm",
    "nurturing": "nuôi dưỡng",
    "obstacles": "trở ngại",
    "one-sided giving": "cho đi một chiều",
    "opportunities abroad": "cơ hội phương xa",
    "overcommitment": "ôm đồm",
    "overconfidence": "quá tự tin",
    "overindulgence": "buông thả",
    "overwhelm": "choáng ngợp",
    "overworking": "làm việc quá sức",
    "painful ending": "kết thúc đau đớn",
    "painful truth": "sự thật đau lòng",
    "paranoia": "hoang tưởng",
    "partnership": "đồng hành",
    "passion": "đam mê",
    "patience": "kiên nhẫn",
    "pause": "tạm dừng",
    "perceptiveness": "tinh ý",
    "perfectionism": "cầu toàn",
    "perseverance": "bền bỉ",
    "persistence": "kiên trì",
    "planning": "lên kế hoạch",
    "playing it safe": "chơi an toàn",
    "poor investment": "đầu tư sai",
    "poor judgment": "phán đoán sai",
    "poor planning": "kế hoạch kém",
    "positivity": "lạc quan",
    "possessiveness": "chiếm hữu",
    "potential": "tiềm năng",
    "practicality": "thực tế",
    "procrastination": "chần chừ",
    "progress": "tiến triển",
    "prosperity": "thịnh vượng",
    "public acclaim": "được công nhận rộng rãi",
    "purpose": "mục đích",
    "rapid change": "thay đổi nhanh",
    "raw emotion": "cảm xúc thô",
    "reaching out": "tìm sự giúp đỡ",
    "reality check": "đối diện thực tế",
    "rebellion": "nổi loạn",
    "rebirth": "tái sinh",
    "recklessness": "liều lĩnh",
    "reckoning": "phán xét",
    "reclaiming power": "giành lại sức mạnh",
    "recognition": "được ghi nhận",
    "reconciliation": "hoà giải",
    "recovery": "hồi phục",
    "reevaluation": "đánh giá lại",
    "regeneration": "tái tạo",
    "regret": "hối tiếc",
    "release": "giải phóng",
    "released fear": "nỗi sợ được giải toả",
    "releasing fear": "giải toả nỗi sợ",
    "releasing pain": "buông bỏ nỗi đau",
    "reliability": "đáng tin cậy",
    "renewal": "đổi mới",
    "renewed interest": "hứng thú trở lại",
    "repeating cycles": "lặp lại vòng cũ",
    "repetitive work": "công việc lặp lại",
    "repressed emotion": "cảm xúc bị kìm nén",
    "repressed feelings": "cảm xúc bị đè nén",
    "resilience": "kiên cường",
    "resistance": "kháng cự",
    "resistance to change": "chống lại thay đổi",
    "resisting the inevitable": "cưỡng lại điều tất yếu",
    "resolution": "giải quyết",
    "resourcefulness": "tháo vát",
    "responsibility": "trách nhiệm",
    "rest": "nghỉ ngơi",
    "restlessness": "bồn chồn",
    "restriction": "giới hạn",
    "retreat": "lui về",
    "reunion": "đoàn tụ",
    "revelation": "khải thị",
    "rigidity": "cứng nhắc",
    "rite of passage": "bước chuyển trưởng thành",
    "rivalry": "ganh đua",
    "rock bottom": "chạm đáy",
    "romance": "lãng mạn",
    "routine": "nề nếp",
    "satisfaction": "hài lòng",
    "saving": "tiết kiệm",
    "scarcity": "thiếu thốn",
    "scattered energy": "năng lượng phân tán",
    "secrets": "bí mật",
    "security": "an toàn",
    "seeking meaning": "tìm kiếm ý nghĩa",
    "self-acceptance": "chấp nhận bản thân",
    "self-doubt": "nghi ngờ bản thân",
    "self-imposed limits": "tự giới hạn mình",
    "self-neglect": "bỏ bê bản thân",
    "self-sufficiency": "tự chủ",
    "sensitivity": "nhạy cảm",
    "sensuality": "gợi cảm",
    "serenity": "thanh thản",
    "setbacks": "trắc trở",
    "shadow self": "mặt tối bản thân",
    "shared values": "giá trị chung",
    "sharing": "sẻ chia",
    "shortcuts": "đi tắt",
    "skill": "kỹ năng",
    "skill development": "rèn luyện kỹ năng",
    "slowing down": "chậm lại",
    "smothering": "bao bọc ngột ngạt",
    "smugness": "tự mãn",
    "solitude": "tĩnh lặng một mình",
    "sorrow": "sầu muộn",
    "soul-searching": "tìm về bản ngã",
    "spiritual guidance": "dẫn dắt tâm linh",
    "spiritual help": "trợ giúp tâm linh",
    "spontaneity": "ngẫu hứng",
    "stability": "ổn định",
    "stagnation": "trì trệ",
    "stalemate": "thế giằng co",
    "stalling": "dậm chân tại chỗ",
    "standing firm": "đứng vững",
    "staying too long": "ở lại quá lâu",
    "stealth": "lén lút",
    "strategy": "chiến lược",
    "strings attached": "kèm điều kiện",
    "structure": "trật tự",
    "stubbornness": "bướng bỉnh",
    "success": "thành công",
    "sudden upheaval": "biến cố bất ngờ",
    "superficiality": "hời hợt",
    "surrender": "buông xuôi chấp nhận",
    "swift action": "hành động nhanh",
    "teamwork": "làm việc nhóm",
    "temporary sadness": "buồn thoáng qua",
    "temptation": "cám dỗ",
    "tension": "căng thẳng",
    "the subconscious": "tiềm thức",
    "thirst for knowledge": "khát khao hiểu biết",
    "tradition": "truyền thống",
    "transformation": "chuyển hoá",
    "transition": "chuyển giao",
    "travel": "du hành",
    "trickery": "mánh khoé",
    "truth": "sự thật",
    "turning point": "bước ngoặt",
    "tyranny": "chuyên quyền",
    "uncertainty": "bất định",
    "unconventional paths": "lối đi khác thường",
    "unfinished business": "việc còn dang dở",
    "union": "kết hợp",
    "unity": "đồng lòng",
    "unrealistic expectations": "kỳ vọng phi thực tế",
    "untapped potential": "tiềm năng chưa khai phá",
    "victim mentality": "tâm lý nạn nhân",
    "victory": "chiến thắng",
    "vigilance": "cảnh giác",
    "visionary leadership": "lãnh đạo có tầm nhìn",
    "vitality": "sức sống",
    "walking away": "rời đi",
    "warmth": "ấm áp",
    "weakness": "yếu đuối",
    "wealth": "giàu có",
    "willpower": "ý chí",
    "winning at all costs": "thắng bằng mọi giá",
    "wisdom": "minh triết",
    "wishes fulfilled": "ước nguyện thành",
    "wishful thinking": "mơ mộng hão",
    "withdrawal": "thu mình",
    "work-life imbalance": "mất cân bằng công việc – cuộc sống",
    "worry": "lo lắng",
}


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def keywords_vi(keywords: list[str]) -> list[str]:
    """Dịch keywords; giữ nguyên từ chưa có trong từ điển (không làm mất dữ liệu)."""
    return [KEYWORDS_VI.get(k, k) for k in keywords]


def astro_vi(text: str | None) -> str | None:
    """
    Dịch chuỗi chiêm tinh của bộ bài:
      'Mars in Aries (0°–10°)'        → 'Sao Hỏa trong Bạch Dương (0°–10°)'
      '20° Scorpio – 20° Sagittarius' → '20° Bọ Cạp – 20° Nhân Mã'
      'Root of Fire' / 'Earth of Fire' / 'Element of Air' / 'Aries' / 'Mercury'
    """
    if not text:
        return text
    m = re.fullmatch(r"Root of (\w+)", text)
    if m:
        return f"Gốc rễ của {_ELEMENT_TITLE_VI[m[1]]}"
    m = re.fullmatch(r"Element of (\w+)", text)
    if m:
        return f"Nguyên tố {_ELEMENT_TITLE_VI[m[1]]}"
    m = re.fullmatch(r"(Fire|Water|Air|Earth) of (\w+)", text)
    if m:
        return f"{_ELEMENT_TITLE_VI[m[1]]} của {_ELEMENT_TITLE_VI[m[2]]}"
    out = text.replace(" in ", " trong ")
    for en, vi in {**PLANET_VI, **SIGN_VI}.items():
        out = re.sub(rf"\b{en}\b", vi, out)
    return out


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


def timing_notes_vi(timing_unit: str, timing_range: str, zodiac_mode: str | None) -> str:
    unit = (timing_unit or "").lower()
    if unit in ("weeks", "months", "days"):
        mode = ZODIAC_MODE_VI.get((zodiac_mode or "").lower(), "")
        return {
            "weeks": f"Lá thuộc cung {mode} — năng lượng khởi đầu, sự việc thường hiện ra trong vài tuần.",
            "months": f"Lá thuộc cung {mode} — năng lượng bền bỉ, sự việc diễn tiến chậm, tính bằng tháng.",
            "days": f"Lá thuộc cung {mode} — năng lượng chuyển đổi, thay đổi đến nhanh, tính bằng ngày.",
        }[unit]
    if unit == "season":
        return (
            "Ace và Page là gốc rễ của nguyên tố: sự việc như hạt giống, "
            f"thành hình {timing_vi(timing_unit, timing_range)}."
        )
    if unit == "timeless":
        return (
            "Lá Ẩn Chính mang sức mạnh nguyên mẫu, không gắn với một mốc thời gian cụ thể — "
            "nó đến khi bạn sẵn sàng cho bài học của nó."
        )
    return ""
