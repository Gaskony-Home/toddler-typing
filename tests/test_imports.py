"""Test that all modules can be imported successfully."""

import pytest


def test_import_main():
    """Test that main module imports."""
    from toddler_typing import main


def test_import_settings():
    """Test that settings module imports."""
    from toddler_typing.config import Settings


def test_import_button():
    """Test that button module imports."""
    from toddler_typing.ui import Button


def test_import_main_menu():
    """Test that main menu module imports."""
    from toddler_typing.ui import MainMenu


def test_import_letters():
    """Test that letters activity imports."""
    from toddler_typing.educational import LettersActivity


def test_import_numbers():
    """Test that numbers activity imports."""
    from toddler_typing.educational import NumbersActivity


def test_import_colors_shapes():
    """Test that colors/shapes activity imports."""
    from toddler_typing.educational import ColorsShapesActivity


def test_import_drawing():
    """Test that drawing canvas imports."""
    from toddler_typing.drawing import DrawingCanvas


def test_settings_initialization():
    """Test that settings can be initialized."""
    from toddler_typing.config import Settings

    settings = Settings()
    assert settings.screen_width > 0
    assert settings.screen_height > 0
    assert len(settings.colors) > 0
    assert len(settings.drawing_colors) > 0
