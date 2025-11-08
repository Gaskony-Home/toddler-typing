"""
Numbers learning activity.

This module provides an interactive activity for learning numbers.
"""

import pygame
import random
from typing import Optional

from ..config.settings import Settings


class NumbersActivity:
    """Interactive numbers learning activity."""

    def __init__(self, screen: pygame.Surface, settings: Settings) -> None:
        """
        Initialize the numbers activity.

        Args:
            screen: The pygame surface to draw on.
            settings: Application settings.
        """
        self.screen = screen
        self.settings = settings
        self.font = pygame.font.Font(None, 200)
        self.instruction_font = pygame.font.Font(None, 48)

        self.current_number: int = 0
        self.next_number()

    def next_number(self) -> None:
        """Select a random number to display."""
        self.current_number = random.randint(0, 9)

    def handle_event(self, event: pygame.event.Event) -> None:
        """
        Handle pygame events.

        Args:
            event: The pygame event to handle.
        """
        if event.type == pygame.KEYDOWN:
            if event.unicode == str(self.current_number):
                # Correct key pressed!
                # TODO: Add success sound and animation
                self.next_number()

    def update(self) -> None:
        """Update activity state."""
        pass

    def draw(self) -> None:
        """Draw the numbers activity."""
        self.screen.fill(self.settings.colors["background"])

        # Draw instruction
        instruction = "Press the number on the keyboard!"
        instruction_surface = self.instruction_font.render(
            instruction, True, self.settings.colors["text"]
        )
        instruction_rect = instruction_surface.get_rect(
            center=(self.settings.screen_width // 2, 100)
        )
        self.screen.blit(instruction_surface, instruction_rect)

        # Draw current number
        number_surface = self.font.render(
            str(self.current_number), True, self.settings.colors["secondary"]
        )
        number_rect = number_surface.get_rect(
            center=(self.settings.screen_width // 2, self.settings.screen_height // 2)
        )
        self.screen.blit(number_surface, number_rect)
