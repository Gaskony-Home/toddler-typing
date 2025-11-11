"""
Font management for the application.

This module provides custom font loading and management.
"""

import pygame
import os
from pathlib import Path
from typing import Optional, Dict


class FontManager:
    """Manages custom fonts for the application."""

    def __init__(self):
        """Initialize the font manager."""
        # Get the path to the fonts directory
        self.fonts_dir = Path(__file__).parent.parent / "assets" / "fonts"

        # Font cache to avoid reloading
        self._font_cache: Dict[tuple, pygame.font.Font] = {}

        # Load custom font paths
        self.fredoka_regular = self.fonts_dir / "Fredoka-Regular.ttf"
        self.fredoka_bold = self.fonts_dir / "Fredoka-Bold.ttf"

        # Check if fonts exist and are compatible
        self.has_custom_fonts = False  # Disabled due to pygame compatibility issues
        # self.has_custom_fonts = self.fredoka_regular.exists() and self.fredoka_bold.exists()

        if not self.has_custom_fonts:
            print(f"Info: Using default pygame font (custom fonts disabled for compatibility)")

    def get_font(self, size: int, bold: bool = False) -> pygame.font.Font:
        """
        Get a font with the specified size and weight.

        Args:
            size: Font size in pixels.
            bold: Whether to use bold weight.

        Returns:
            pygame.font.Font: The requested font.
        """
        cache_key = (size, bold)

        # Check cache first
        if cache_key in self._font_cache:
            return self._font_cache[cache_key]

        # Load font
        if self.has_custom_fonts:
            font_path = self.fredoka_bold if bold else self.fredoka_regular
            try:
                font = pygame.font.Font(str(font_path), size)
                self._font_cache[cache_key] = font
                return font
            except Exception as e:
                print(f"Error loading custom font: {e}")
                # Fall back to default font
                font = pygame.font.Font(None, size)
                self._font_cache[cache_key] = font
                return font
        else:
            # Use default pygame font
            font = pygame.font.Font(None, size)
            self._font_cache[cache_key] = font
            return font

    def clear_cache(self):
        """Clear the font cache."""
        self._font_cache.clear()


# Global font manager instance
_font_manager: Optional[FontManager] = None


def get_font_manager() -> FontManager:
    """
    Get the global font manager instance.

    Returns:
        FontManager: The global font manager.
    """
    global _font_manager
    if _font_manager is None:
        _font_manager = FontManager()
    return _font_manager
