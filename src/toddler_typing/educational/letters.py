"""
Letters learning activity.

This module provides an interactive activity for learning letters.
"""

import pygame
import random
from typing import Optional

from ..config.settings import Settings


class LettersActivity:
    """Interactive letters learning activity."""

    def __init__(self, screen: pygame.Surface, settings: Settings) -> None:
        """
        Initialize the letters activity.

        Args:
            screen: The pygame surface to draw on.
            settings: Application settings.
        """
        self.screen = screen
        self.settings = settings
        self.font = pygame.font.Font(None, 200)
        self.instruction_font = pygame.font.Font(None, 48)

        self.current_letter: str = ""
        self.next_letter()

    def next_letter(self) -> None:
        """Select a random letter to display."""
        self.current_letter = random.choice("ABCDEFGHIJKLMNOPQRSTUVWXYZ")

    def handle_event(self, event: pygame.event.Event) -> None:
        """
        Handle pygame events.

        Args:
            event: The pygame event to handle.
        """
        if event.type == pygame.KEYDOWN:
            if event.unicode.upper() == self.current_letter:
                # Correct key pressed!
                # TODO: Add success sound and animation
                self.next_letter()

    def update(self) -> None:
        """Update activity state."""
        pass

    def draw(self) -> None:
        """Draw the letters activity."""
        self.screen.fill(self.settings.colors["background"])

        # Draw instruction
        instruction = "Press the letter on the keyboard!"
        instruction_surface = self.instruction_font.render(
            instruction, True, self.settings.colors["text"]
        )
        instruction_rect = instruction_surface.get_rect(
            center=(self.settings.screen_width // 2, 100)
        )
        self.screen.blit(instruction_surface, instruction_rect)

        # Draw current letter
        letter_surface = self.font.render(
            self.current_letter, True, self.settings.colors["primary"]
        )
        letter_rect = letter_surface.get_rect(
            center=(self.settings.screen_width // 2, self.settings.screen_height // 2)
        )
        self.screen.blit(letter_surface, letter_rect)
