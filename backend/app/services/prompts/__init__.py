"""
app/services/prompts/__init__.py

Re-export các helpers để import ngắn gọn:
  from app.services.prompts import SYSTEM_PROMPT, build_user_prompt
"""
from app.services.prompts.system_prompt import SYSTEM_PROMPT
from app.services.prompts.user_prompt import build_user_prompt

__all__ = ["SYSTEM_PROMPT", "build_user_prompt"]
