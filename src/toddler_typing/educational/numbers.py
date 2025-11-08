"""
Numbers learning activity.

This module provides an interactive activity for learning numbers.
"""

import pygame
import random
from typing import Callable

from ..config.settings import Settings
from ..ui.button import Button


class NumbersActivity:
    """Interactive numbers learning activity."""

    def __init__(
        self, screen: pygame.Surface, settings: Settings, switch_state: Callable
    ) -> None:
        """
        Initialize the numbers activity.

        Args:
            screen: The pygame surface to draw on.
            settings: Application settings.
            switch_state: Callback function to switch application state.
        """
        self.screen = screen
        self.settings = settings
        self.switch_state = switch_state
        self.font = pygame.font.Font(None, 200)
        self.instruction_font = pygame.font.Font(None, 48)

        self.current_number: int = 0
        self.success_flash = 0  # Frames to show success feedback

        # Back button
        self.back_button = Button(
            20, 20, 150, 60, "Back", (100, 100, 100), on_click=self._go_back
        )

        self.next_number()

    def _go_back(self) -> None:
        """Return to main menu."""
        from ..main import AppState

        self.switch_state(AppState.MENU)

    def next_number(self) -> None:
        """Select a random number to display."""
        self.current_number = random.randint(0, 9)

    def handle_event(self, event: pygame.event.Event) -> None:
        """
        Handle pygame events.

        Args:
            event: The pygame event to handle.
        """
        self.back_button.handle_event(event)

        if event.type == pygame.KEYDOWN:
            if event.unicode == str(self.current_number):
                # Correct key pressed!
                self.success_flash = 30  # Flash for 30 frames
                self.next_number()

    def update(self) -> None:
        """Update activity state."""
        if self.success_flash > 0:
            self.success_flash -= 1

    def draw(self) -> None:
        """Draw the numbers activity."""
        # Background color changes briefly on success
        if self.success_flash > 0:
            self.screen.fill(self.settings.colors["success"])
        else:
            self.screen.fill(self.settings.colors["background"])

        # Draw instruction
        instruction = "Press the number on the keyboard!"
        instruction_surface = self.instruction_font.render(
            instruction, True, self.settings.colors["text"]
        )
        instruction_rect = instruction_surface.get_rect(
            center=(self.settings.screen_width // 2, 150)
        )
        self.screen.blit(instruction_surface, instruction_rect)

        # Draw current number
        number_color = (
            self.settings.colors["white"]
            if self.success_flash > 0
            else self.settings.colors["secondary"]
        )
        number_surface = self.font.render(str(self.current_number), True, number_color)
        number_rect = number_surface.get_rect(
            center=(self.settings.screen_width // 2, self.settings.screen_height // 2)
        )
        self.screen.blit(number_surface, number_rect)

        # Draw back button
        self.back_button.draw(self.screen)
