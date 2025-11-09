"""
Voice controls UI component.

This module provides mute and repeat buttons for voice functionality.
"""

import pygame
from typing import Optional

from .button import Button
from ..audio.voice_manager import VoiceManager


class VoiceControls:
    """UI component for voice mute and repeat controls."""

    def __init__(
        self,
        screen_width: int,
        screen_height: int,
        voice_manager: Optional[VoiceManager] = None
    ) -> None:
        """
        Initialize voice controls.

        Args:
            screen_width: Screen width for positioning.
            screen_height: Screen height for positioning.
            voice_manager: The voice manager instance.
        """
        self.voice_manager = voice_manager
        self.screen_width = screen_width
        self.screen_height = screen_height

        # Create mute button (top right, next to repeat button)
        mute_icon = "muted" if (voice_manager and voice_manager.is_muted()) else "sound"
        button_width = 110
        button_margin = 20
        self.mute_button = Button(
            screen_width - (button_width * 2) - (button_margin * 2),
            20,
            button_width,
            60,
            "Muted" if (voice_manager and voice_manager.is_muted()) else "Sound",
            (70, 130, 180),  # Steel blue
            font_size=28,
            on_click=self._toggle_mute,
            tooltip="Mute voice announcements" if not (voice_manager and voice_manager.is_muted()) else "Unmute voice announcements",
            icon=mute_icon,
        )

        # Create repeat button (far right)
        self.repeat_button = Button(
            screen_width - button_width - button_margin,
            20,
            button_width,
            60,
            "Repeat",
            (70, 180, 130),  # Medium sea green
            font_size=28,
            on_click=self._repeat,
            tooltip="Repeat last announcement",
            icon="repeat",
        )

    def _toggle_mute(self) -> None:
        """Toggle mute state."""
        if self.voice_manager:
            is_muted = self.voice_manager.toggle_mute()
            self.mute_button.text = "Muted" if is_muted else "Sound"
            self.mute_button.icon = "muted" if is_muted else "sound"
            self.mute_button.tooltip = "Unmute voice announcements" if is_muted else "Mute voice announcements"

    def _repeat(self) -> None:
        """Repeat last message."""
        if self.voice_manager:
            self.voice_manager.repeat()

    def handle_event(self, event: pygame.event.Event) -> None:
        """
        Handle pygame events for voice controls.

        Args:
            event: The pygame event to handle.
        """
        self.mute_button.handle_event(event)
        self.repeat_button.handle_event(event)

    def draw(self, screen: pygame.Surface) -> None:
        """
        Draw voice controls.

        Args:
            screen: The pygame surface to draw on.
        """
        self.mute_button.draw(screen)
        self.repeat_button.draw(screen)

    def speak(self, text: str, interrupt: bool = False) -> None:
        """
        Speak text using the voice manager.

        Args:
            text: Text to speak.
            interrupt: Whether to interrupt any currently playing speech.
        """
        if self.voice_manager:
            self.voice_manager.speak(text, interrupt=interrupt)
