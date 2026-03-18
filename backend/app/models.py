"""
============================================================
Tarot Web App - SQLAlchemy Async Models (Phase 1: Foundation)
Agent 1: System Architect & Orchestrator
============================================================

Định nghĩa 4 bảng PostgreSQL theo ARCHITECTURE.md:
  - users       : Người dùng cuối
  - cards       : 78 lá bài Tarot + metadata JSONB
  - sessions    : Phiên trải bài (spread session)
  - draw_logs   : Log chi tiết từng lần rút bài
"""

from __future__ import annotations

import uuid
from datetime import datetime
from typing import Any, Dict, List, Optional

from sqlalchemy import (
    BigInteger,
    Boolean,
    DateTime,
    Enum,
    Float,
    ForeignKey,
    Integer,
    SmallInteger,
    String,
    Text,
    UniqueConstraint,
    func,
)
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship


# ------------------------------------------------------------
# Base & Mixins
# ------------------------------------------------------------

class Base(DeclarativeBase):
    """Shared declarative base cho tất cả model."""
    pass


class TimestampMixin:
    """Tự động ghi created_at và updated_at."""

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
        comment="Thời điểm tạo bản ghi",
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
        comment="Thời điểm cập nhật gần nhất",
    )


# ------------------------------------------------------------
# Enums (PostgreSQL native ENUMs)
# ------------------------------------------------------------

CardSuitEnum = Enum(
    "major_arcana",
    "wands",
    "cups",
    "swords",
    "pentacles",
    name="card_suit_enum",
)

CardOrientationEnum = Enum(
    "upright",
    "reversed",
    name="card_orientation_enum",
)

SpreadTypeEnum = Enum(
    "single",
    "three_card",
    "celtic_cross",
    "horseshoe",
    name="spread_type_enum",
)

SessionStatusEnum = Enum(
    "pending",
    "active",
    "completed",
    "expired",
    name="session_status_enum",
)


# ------------------------------------------------------------
# Table: users
# ------------------------------------------------------------

class User(TimestampMixin, Base):
    """
    Người dùng cuối của ứng dụng Tarot.

    Lưu ý:
      - Trường `is_adult_confirmed` là cổng Compliance Gate bắt buộc
        (xác nhận 18+) trước khi sử dụng bất kỳ tính năng rút bài nào.
      - `timezone` dùng cho tính năng Booking / lịch tư vấn.
    """

    __tablename__ = "users"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
        comment="UUID người dùng",
    )
    email: Mapped[str] = mapped_column(
        String(320),
        nullable=False,
        unique=True,
        index=True,
        comment="Địa chỉ email (unique)",
    )
    hashed_password: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
        comment="Mật khẩu đã băm (bcrypt)",
    )
    display_name: Mapped[Optional[str]] = mapped_column(
        String(100),
        nullable=True,
        comment="Tên hiển thị",
    )
    timezone: Mapped[str] = mapped_column(
        String(64),
        nullable=False,
        server_default="UTC",
        comment="Múi giờ client-side (VD: Asia/Ho_Chi_Minh)",
    )
    is_adult_confirmed: Mapped[bool] = mapped_column(
        Boolean,
        nullable=False,
        server_default="false",
        comment="[COMPLIANCE GATE] Đã xác nhận đủ 18 tuổi",
    )
    is_active: Mapped[bool] = mapped_column(
        Boolean,
        nullable=False,
        server_default="true",
        comment="Tài khoản còn hoạt động",
    )
    last_login_at: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
        comment="Lần đăng nhập gần nhất",
    )

    # Relationships
    sessions: Mapped[List["Session"]] = relationship(
        "Session", back_populates="user", cascade="all, delete-orphan"
    )

    def __repr__(self) -> str:
        return f"<User id={self.id} email={self.email!r}>"


# ------------------------------------------------------------
# Table: cards
# ------------------------------------------------------------

class Card(TimestampMixin, Base):
    """
    78 lá bài Tarot chuẩn Rider-Waite-Smith.

    Cột `metadata_json` (JSONB) lưu toàn bộ dữ liệu phong phú:
      - Từ khóa Upright / Reversed
      - Nguyên tố (element), Hành tinh (planet), Cung hoàng đạo
      - Decan chiêm tinh (Zodiac Mode: Cardinal / Fixed / Mutable)
      - Số học (numerology), Thần học Kabalah, v.v.
      - Ánh xạ Elemental Dignities để tính trọng số
      - Raw search results từ Tavily (để tái sử dụng)
    """

    __tablename__ = "cards"

    id: Mapped[int] = mapped_column(
        SmallInteger,
        primary_key=True,
        autoincrement=True,
        comment="ID nội bộ (1–78)",
    )
    card_number: Mapped[int] = mapped_column(
        SmallInteger,
        nullable=False,
        comment="Số thứ tự trong bộ bài (0–77, theo chuẩn RWS)",
    )
    name: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
        unique=True,
        index=True,
        comment="Tên đầy đủ của lá bài (VD: 'The Fool', 'Ace of Wands')",
    )
    name_vi: Mapped[Optional[str]] = mapped_column(
        String(150),
        nullable=True,
        comment="Tên tiếng Việt (tuỳ chọn)",
    )
    suit: Mapped[str] = mapped_column(
        CardSuitEnum,
        nullable=False,
        index=True,
        comment="Bộ bài: major_arcana | wands | cups | swords | pentacles",
    )
    arcana: Mapped[str] = mapped_column(
        Enum("major", "minor", name="arcana_type_enum"),
        nullable=False,
        comment="Phân loại: major / minor",
    )
    element: Mapped[Optional[str]] = mapped_column(
        Enum("fire", "water", "air", "earth", "spirit", name="element_enum"),
        nullable=True,
        comment="Nguyên tố chiêm tinh (Wands=Fire, Cups=Water, ...)",
    )
    astro_decan: Mapped[Optional[str]] = mapped_column(
        String(50),
        nullable=True,
        comment="Decan chiêm tinh (VD: '1st decan of Aries')",
    )
    zodiac_mode: Mapped[Optional[str]] = mapped_column(
        Enum("cardinal", "fixed", "mutable", name="zodiac_mode_enum"),
        nullable=True,
        comment="Zodiac Mode cho tính Timing (Cardinal/Fixed/Mutable)",
    )
    numerology_value: Mapped[Optional[int]] = mapped_column(
        SmallInteger,
        nullable=True,
        comment="Giá trị số học (Ace=1, ..., King=14; Major: 0–21)",
    )
    image_url: Mapped[Optional[str]] = mapped_column(
        String(512),
        nullable=True,
        comment="URL hình ảnh lá bài (CDN hoặc public path)",
    )
    metadata_json: Mapped[Optional[Dict[str, Any]]] = mapped_column(
        JSONB,
        nullable=True,
        comment="Toàn bộ metadata phong phú (JSONB): keywords, dignities, decan...",
    )

    # Relationships
    draw_logs: Mapped[List["DrawLog"]] = relationship(
        "DrawLog", back_populates="card"
    )

    __table_args__ = (
        UniqueConstraint("card_number", "suit", name="uq_card_number_suit"),
    )

    def __repr__(self) -> str:
        return f"<Card id={self.id} name={self.name!r} suit={self.suit!r}>"


# ------------------------------------------------------------
# Table: sessions
# ------------------------------------------------------------

class Session(TimestampMixin, Base):
    """
    Phiên trải bài (spread session).

    Mỗi session thuộc về một User và lưu:
      - Loại spread (single / three_card / celtic_cross / ...)
      - Câu hỏi / ý định của người dùng
      - Trạng thái phiên (pending / active / completed / expired)
      - Quantum seed dùng để reproduce kết quả rút bài
        (entropy từ ANU QRNG hoặc Random.org)
    """

    __tablename__ = "sessions"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
        comment="UUID phiên trải bài",
    )
    user_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=True,   # Nullable để hỗ trợ anonymous sessions (Phase 1/2)
        index=True,
        comment="FK → users.id (NULL = anonymous session)",
    )
    spread_type: Mapped[str] = mapped_column(
        SpreadTypeEnum,
        nullable=False,
        server_default="single",
        comment="Kiểu trải bài",
    )
    intention: Mapped[Optional[str]] = mapped_column(
        Text,
        nullable=True,
        comment="Câu hỏi / ý định của người dùng",
    )
    status: Mapped[str] = mapped_column(
        SessionStatusEnum,
        nullable=False,
        server_default="pending",
        index=True,
        comment="Trạng thái phiên",
    )
    quantum_seed: Mapped[Optional[str]] = mapped_column(
        String(512),
        nullable=True,
        comment="Raw entropy JSON từ Quantum API (để audit / reproduce)",
    )
    interpretation_result: Mapped[Optional[Dict[str, Any]]] = mapped_column(
        JSONB,
        nullable=True,
        comment="Kết quả diễn giải tổng hợp (Elemental Dignities + Timing)",
    )
    completed_at: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
        comment="Thời điểm phiên hoàn tất",
    )

    # Relationships
    user: Mapped["User"] = relationship("User", back_populates="sessions")
    draw_logs: Mapped[List["DrawLog"]] = relationship(
        "DrawLog", back_populates="session", cascade="all, delete-orphan"
    )

    def __repr__(self) -> str:
        return f"<Session id={self.id} spread={self.spread_type!r} status={self.status!r}>"


# ------------------------------------------------------------
# Table: draw_logs
# ------------------------------------------------------------

class DrawLog(TimestampMixin, Base):
    """
    Log chi tiết từng lần rút bài trong một Session.

    Mỗi DrawLog = 1 lá bài được rút ra, lưu:
      - Vị trí trong spread (position_index)
      - Hướng ngửa/ngược (orientation)
      - Trọng số Elemental Dignity so với lá kề
      - Thời gian dự đoán (timing_output)
    """

    __tablename__ = "draw_logs"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
        comment="UUID bản ghi rút bài",
    )
    session_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("sessions.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
        comment="FK → sessions.id",
    )
    card_id: Mapped[int] = mapped_column(
        SmallInteger,
        ForeignKey("cards.id", ondelete="RESTRICT"),
        nullable=False,
        comment="FK → cards.id",
    )
    position_index: Mapped[int] = mapped_column(
        SmallInteger,
        nullable=False,
        comment="Thứ tự vị trí trong spread (0-based index)",
    )
    position_label: Mapped[Optional[str]] = mapped_column(
        String(100),
        nullable=True,
        comment="Nhãn vị trí (VD: 'Past', 'Present', 'Future')",
    )
    orientation: Mapped[str] = mapped_column(
        CardOrientationEnum,
        nullable=False,
        server_default="upright",
        comment="Hướng lá bài: upright (ngửa) / reversed (ngược)",
    )
    dignity_weight: Mapped[Optional[float]] = mapped_column(
        Float,
        nullable=True,
        comment="Trọng số Elemental Dignity [-1.0 (Ill) → +1.0 (Dignified)]",
    )
    timing_output: Mapped[Optional[Dict[str, Any]]] = mapped_column(
        JSONB,
        nullable=True,
        comment="Output tính Timing: { unit, value, zodiac_mode, decan }",
    )
    raw_quantum_bytes: Mapped[Optional[str]] = mapped_column(
        String(64),
        nullable=True,
        comment="Các byte entropy đã dùng để rút lá này (hex string)",
    )

    # Relationships
    session: Mapped["Session"] = relationship("Session", back_populates="draw_logs")
    card: Mapped["Card"] = relationship("Card", back_populates="draw_logs")

    __table_args__ = (
        UniqueConstraint(
            "session_id", "position_index",
            name="uq_session_position",
        ),
    )

    def __repr__(self) -> str:
        return (
            f"<DrawLog session={self.session_id} card_id={self.card_id} "
            f"pos={self.position_index} orient={self.orientation!r}>"
        )
