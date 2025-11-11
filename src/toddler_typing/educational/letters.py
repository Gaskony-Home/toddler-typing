"""
Letters learning activity.

This module provides an interactive activity for learning letters.
"""

import pygame
import random
from typing import Callable, Optional

from ..config.settings import Settings
from ..ui.button import Button
from ..audio.voice_manager import VoiceManager
from ..config.fonts import get_font_manager


class LettersActivity:
    """Interactive letters learning activity."""

    def __init__(
        self, screen: pygame.Surface, settings: Settings, switch_state: Callable, voice_manager: Optional[VoiceManager] = None
    ) -> None:
        """
        Initialize the letters activity.

        Args:
            screen: The pygame surface to draw on.
            settings: Application settings.
            switch_state: Callback function to switch application state.
            voice_manager: Optional voice manager for text-to-speech.
        """
        self.screen = screen
        self.settings = settings
        self.switch_state = switch_state
        self.voice_manager = voice_manager
        # Use font manager for crisp, anti-aliased text rendering
        self.font = get_font_manager().get_font(200, bold=True)
        self.instruction_font = get_font_manager().get_font(48)

        self.current_letter: str = ""
        self.success_flash = 0  # Frames to show success feedback

        # Back button
        self.back_button = Button(
            20, 20, 150, 60, "Back", (100, 100, 100), on_click=self._go_back
        )

        self.next_letter()

    def _go_back(self) -> None:
        """Return to main menu."""
        from ..main import AppState

        self.switch_state(AppState.MENU)

    def next_letter(self) -> None:
        """Select a random letter to display."""
        self.current_letter = random.choice("ABCDEFGHIJKLMNOPQRSTUVWXYZ")

    def handle_event(self, event: pygame.event.Event) -> None:
        """
        Handle pygame events.

        Args:
            event: The pygame event to handle.
        """
        self.back_button.handle_event(event)

        if event.type == pygame.KEYDOWN:
            if event.unicode.upper() == self.current_letter:
                # Correct key pressed!
                self.success_flash = 30  # Flash for 30 frames
                self.next_letter()

    def update(self) -> None:
        """Update activity state."""
        if self.success_flash > 0:
            self.success_flash -= 1

    def _draw_gradient_background(self) -> None:
        """Draw smooth gradient background."""
        start_color = self.settings.colors.get("bg_gradient_start", self.settings.colors["background"])
        end_color = self.settings.colors.get("bg_gradient_end", self.settings.colors["background"])

        # Create vertical gradient
        for y in range(self.settings.screen_height):
            # Calculate blend ratio
            ratio = y / self.settings.screen_height
            color = tuple(int(start_color[i] * (1 - ratio) + end_color[i] * ratio) for i in range(3))
            pygame.draw.line(self.screen, color, (0, y), (self.settings.screen_width, y))

    def draw(self) -> None:
        """Draw the letters activity."""
        # Background color changes briefly on success
        if self.success_flash > 0:
            self.screen.fill(self.settings.colors["success"])
        else:
            self._draw_gradient_background()

        # Draw instruction
        instruction = "Press the letter on the keyboard!"
        instruction_surface = self.instruction_font.render(
            instruction, True, self.settings.colors["text"]
        )
        instruction_rect = instruction_surface.get_rect(
            center=(self.settings.screen_width // 2, 150)
        )
        self.screen.blit(instruction_surface, instruction_rect)

        # Draw current letter
        letter_color = (
            self.settings.colors["white"]
            if self.success_flash > 0
            else self.settings.colors["primary"]
        )
        letter_surface = self.font.render(self.current_letter, True, letter_color)
        letter_rect = letter_surface.get_rect(
            center=(self.settings.screen_width // 2, self.settings.screen_height // 2)
        )
        self.screen.blit(letter_surface, letter_rect)

        # Draw back button
        self.back_button.draw(self.screen)
