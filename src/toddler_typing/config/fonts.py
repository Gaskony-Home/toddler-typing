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

        # Load custom font paths - using Fredoka (Nunito has pygame compatibility issues)
        self.fredoka_regular = self.fonts_dir / "Fredoka-Regular.ttf"
        self.fredoka_bold = self.fonts_dir / "Fredoka-Bold.ttf"

        # Check if fonts exist
        fonts_exist = (
            self.fredoka_regular.exists() and
            self.fredoka_bold.exists()
        )

        # Temporarily disable custom fonts due to pygame render() NULL pointer issues
        # Will need to investigate font file compatibility or try alternative font sources
        self.has_custom_fonts = False

        if fonts_exist:
            print(f"Info: Custom fonts found but disabled due to compatibility issues")
            print(f"Info: Using default pygame font with anti-aliasing for crisp rendering")
        else:
            print(f"Info: Using default pygame font (custom fonts not found at {self.fonts_dir})")

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
            # Use Fredoka Bold for bold and large titles, Regular otherwise
            font_path = self.fredoka_bold if bold else self.fredoka_regular

            try:
                font = pygame.font.Font(str(font_path), size)
                if font is None:
                    raise ValueError(f"Font loaded as None from {font_path}")
                self._font_cache[cache_key] = font
                return font
            except Exception as e:
                print(f"Error loading custom Fredoka font from {font_path}: {e}")
                # Fall back to default font
                font = pygame.font.Font(None, size)
                if font is None:
                    raise ValueError("Default font is also None!")
                self._font_cache[cache_key] = font
                return font
        else:
            # Use default pygame font
            font = pygame.font.Font(None, size)
            if font is None:
                raise ValueError("Default font loaded as None!")
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
