"""Tests for settings module."""

import pytest
from toddler_typing.config.settings import Settings


def test_settings_default_values():
    """Test that default settings are properly initialized."""
    settings = Settings()

    assert settings.screen_width == 1024
    assert settings.screen_height == 768
    assert settings.fullscreen is True
    assert settings.fps == 60
    assert settings.enable_keyboard_lock is True


def test_settings_colors():
    """Test that color settings are properly defined."""
    settings = Settings()

    assert "background" in settings.colors
    assert "primary" in settings.colors
    assert "secondary" in settings.colors
    assert isinstance(settings.colors["background"], tuple)
    assert len(settings.colors["background"]) == 3


def test_settings_educational_flags():
    """Test educational content flags."""
    settings = Settings()

    assert settings.enable_letters is True
    assert settings.enable_numbers is True
    assert settings.enable_colors is True
    assert settings.enable_shapes is True
