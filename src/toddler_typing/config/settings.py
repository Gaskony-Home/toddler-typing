"""
Application settings and configuration.

This module manages all configurable settings for the application,
including display settings, keyboard lock configuration, and content options.
"""

import json
import os
from pathlib import Path
from typing import List, Tuple, Dict, Any


class Settings:
    """Application settings manager."""

    def __init__(self, config_file: str = "config.json") -> None:
        """
        Initialize settings with defaults and load from config file if present.

        Args:
            config_file: Path to configuration file.
        """
        # Display settings
        self.screen_width: int = 1024
        self.screen_height: int = 768
        self.fullscreen: bool = True
        self.fps: int = 60

        # Color scheme (bright, child-friendly colors)
        self.colors: Dict[str, Tuple[int, int, int]] = {
            "background": (173, 216, 230),  # Light blue
            "primary": (255, 105, 180),  # Hot pink
            "secondary": (255, 215, 0),  # Gold
            "success": (50, 205, 50),  # Lime green
            "text": (0, 0, 0),  # Black
            "white": (255, 255, 255),  # White
        }

        # Keyboard lock settings
        self.enable_keyboard_lock: bool = True
        self.exit_combination: List[str] = ["ctrl", "shift", "esc"]
        self.blocked_keys: List[str] = [
            "windows",
            "cmd",
            "alt+tab",
            "alt+f4",
            "ctrl+alt+delete",
        ]

        # Educational content settings
        self.enable_letters: bool = True
        self.enable_numbers: bool = True
        self.enable_colors: bool = True
        self.enable_shapes: bool = True
        self.enable_sounds: bool = True

        # Drawing settings
        self.drawing_colors: List[Tuple[int, int, int]] = [
            (255, 0, 0),  # Red
            (0, 255, 0),  # Green
            (0, 0, 255),  # Blue
            (255, 255, 0),  # Yellow
            (255, 0, 255),  # Magenta
            (0, 255, 255),  # Cyan
            (0, 0, 0),  # Black
            (255, 255, 255),  # White
        ]
        self.brush_sizes: List[int] = [10, 20, 30, 40]
        self.default_brush_size: int = 20

        # Asset paths
        self.assets_dir: Path = Path(__file__).parent.parent / "assets"
        self.images_dir: Path = self.assets_dir / "images"
        self.sounds_dir: Path = self.assets_dir / "sounds"
        self.fonts_dir: Path = self.assets_dir / "fonts"

        # Load custom settings if config file exists
        self.config_file: Path = Path(config_file)
        self.load_config()

    def load_config(self) -> None:
        """Load settings from configuration file if it exists."""
        if self.config_file.exists():
            try:
                with open(self.config_file, "r") as f:
                    config_data = json.load(f)
                    self._apply_config(config_data)
            except Exception as e:
                print(f"Error loading config file: {e}")
                print("Using default settings.")

    def _apply_config(self, config_data: Dict[str, Any]) -> None:
        """
        Apply configuration from dictionary.

        Args:
            config_data: Dictionary containing configuration values.
        """
        for key, value in config_data.items():
            if hasattr(self, key):
                setattr(self, key, value)

    def save_config(self) -> None:
        """Save current settings to configuration file."""
        config_data = {
            "screen_width": self.screen_width,
            "screen_height": self.screen_height,
            "fullscreen": self.fullscreen,
            "fps": self.fps,
            "enable_keyboard_lock": self.enable_keyboard_lock,
            "exit_combination": self.exit_combination,
            "blocked_keys": self.blocked_keys,
            "enable_letters": self.enable_letters,
            "enable_numbers": self.enable_numbers,
            "enable_colors": self.enable_colors,
            "enable_shapes": self.enable_shapes,
            "enable_sounds": self.enable_sounds,
            "default_brush_size": self.default_brush_size,
        }

        try:
            with open(self.config_file, "w") as f:
                json.dump(config_data, f, indent=2)
        except Exception as e:
            print(f"Error saving config file: {e}")
