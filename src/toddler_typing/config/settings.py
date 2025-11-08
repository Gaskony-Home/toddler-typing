"""
Application settings and configuration.

This module manages all configurable settings for the application,
including display settings, keyboard lock configuration, and content options.
"""

import json
import logging
import os
from pathlib import Path
from typing import List, Tuple, Dict, Any

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


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

        # Asset paths - IMMUTABLE, not configurable from JSON for security
        self._assets_dir: Path = self._get_validated_assets_dir()
        self._images_dir: Path = self._assets_dir / "images"
        self._sounds_dir: Path = self._assets_dir / "sounds"
        self._fonts_dir: Path = self._assets_dir / "fonts"

        # Load custom settings if config file exists
        self.config_file: Path = self._validate_config_path(config_file)
        self.load_config()

    def _get_validated_assets_dir(self) -> Path:
        """Get and validate the assets directory path."""
        base_dir = Path(__file__).parent.parent.resolve()
        assets_dir = base_dir / "assets"

        if not assets_dir.exists():
            logger.warning(f"Assets directory not found: {assets_dir}")
            # Create it if it doesn't exist
            assets_dir.mkdir(parents=True, exist_ok=True)

        if not assets_dir.is_dir():
            raise RuntimeError(f"Assets path is not a directory: {assets_dir}")

        return assets_dir

    def _validate_config_path(self, config_file: str) -> Path:
        """
        Validate that config file path is safe and within application directory.

        Args:
            config_file: Path to configuration file

        Returns:
            Validated Path object
        """
        # Get absolute path of application directory
        app_dir = Path(__file__).parent.parent.resolve()

        # Convert config file to absolute path
        try:
            config_path = Path(config_file).resolve()
        except (ValueError, OSError) as e:
            logger.error(f"Invalid config file path: {e}")
            return app_dir.parent.parent / "config.json"

        # Ensure config file is within application directory or its parent
        # (to allow config.json in the project root)
        allowed_dir = app_dir.parent.parent.resolve()

        try:
            config_path.relative_to(allowed_dir)
        except ValueError:
            logger.warning(f"Config file outside allowed directory: {config_path}")
            logger.warning("Using default config.json")
            return allowed_dir / "config.json"

        # Additional check: ensure filename has .json extension
        if config_path.suffix.lower() != '.json':
            logger.warning("Config file must be a .json file")
            return allowed_dir / "config.json"

        return config_path

    @property
    def assets_dir(self) -> Path:
        """Read-only access to assets directory."""
        return self._assets_dir

    @property
    def images_dir(self) -> Path:
        """Read-only access to images directory."""
        return self._images_dir

    @property
    def sounds_dir(self) -> Path:
        """Read-only access to sounds directory."""
        return self._sounds_dir

    @property
    def fonts_dir(self) -> Path:
        """Read-only access to fonts directory."""
        return self._fonts_dir

    def load_config(self) -> None:
        """Load settings from configuration file if it exists."""
        if self.config_file.exists():
            try:
                with open(self.config_file, "r") as f:
                    config_data = json.load(f)
                    self._apply_config(config_data)
                    logger.info("Configuration loaded successfully")
            except json.JSONDecodeError as e:
                logger.error(f"Invalid JSON in config file: {e}")
                print("Configuration file is invalid. Using default settings.")
            except PermissionError:
                logger.error(f"Permission denied reading config file: {self.config_file}")
                print("Cannot read configuration file. Using default settings.")
            except Exception as e:
                logger.exception("Unexpected error loading config")
                print("Error loading configuration. Using default settings.")
        else:
            logger.info("No config file found, using defaults")

    def _apply_config(self, config_data: Dict[str, Any]) -> None:
        """
        Apply configuration from dictionary with validation.

        Args:
            config_data: Dictionary containing configuration values.
        """
        # Define allowed config keys with type and validation
        allowed_configs = {
            "screen_width": (int, lambda v: 640 <= v <= 7680),
            "screen_height": (int, lambda v: 480 <= v <= 4320),
            "fullscreen": (bool, lambda v: True),
            "fps": (int, lambda v: 1 <= v <= 120),
            "enable_keyboard_lock": (bool, lambda v: True),
            "exit_combination": (list, lambda v: len(v) > 0 and all(isinstance(k, str) for k in v)),
            "blocked_keys": (list, lambda v: all(isinstance(k, str) for k in v)),
            "enable_letters": (bool, lambda v: True),
            "enable_numbers": (bool, lambda v: True),
            "enable_colors": (bool, lambda v: True),
            "enable_shapes": (bool, lambda v: True),
            "enable_sounds": (bool, lambda v: True),
            "default_brush_size": (int, lambda v: 1 <= v <= 100),
        }

        for key, value in config_data.items():
            # Skip internal/comment keys
            if key.startswith("_"):
                continue

            # Only allow whitelisted keys
            if key not in allowed_configs:
                logger.warning(f"Ignoring unknown config key: {key}")
                continue

            expected_type, validator = allowed_configs[key]

            # Validate type
            if not isinstance(value, expected_type):
                logger.warning(f"Invalid type for {key}, expected {expected_type.__name__}, got {type(value).__name__}")
                continue

            # Validate value
            try:
                if not validator(value):
                    logger.warning(f"Invalid value for {key}: {value}")
                    continue
            except Exception as e:
                logger.warning(f"Validation error for {key}: {e}")
                continue

            # Safe to apply after validation
            setattr(self, key, value)
            logger.debug(f"Applied config: {key} = {value}")

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
                logger.info("Configuration saved successfully")
        except PermissionError:
            logger.error(f"Permission denied writing config file: {self.config_file}")
            print("Cannot save configuration file. Permission denied.")
        except Exception as e:
            logger.exception("Unexpected error saving config")
            print("Error saving configuration file.")
