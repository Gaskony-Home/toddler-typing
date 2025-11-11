"""Gamification module for Toddler Typing."""

from .progress_manager import ProgressManager

# Note: Celebration and StarDisplay are pygame-based and not used in PyWebView version
# Celebrations and animations are now handled in JavaScript/CSS

__all__ = ["ProgressManager"]
