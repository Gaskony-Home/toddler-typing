"""
Main menu interface.

This module provides the main menu where children can select
different activities.
"""

import pygame
from typing import List

from .button import Button
from ..config.settings import Settings


class MainMenu:
    """Main menu screen with activity selection."""

    def __init__(self, screen: pygame.Surface, settings: Settings) -> None:
        """
        Initialize the main menu.

        Args:
            screen: The pygame surface to draw on.
            settings: Application settings.
        """
        self.screen = screen
        self.settings = settings
        self.buttons: List[Button] = []

        # Title font
        self.title_font = pygame.font.Font(None, 96)
        self.title_text = "Let's Play!"
        self.title_color = self.settings.colors["primary"]

        # Create menu buttons
        self._create_buttons()

    def _create_buttons(self) -> None:
        """Create menu buttons for different activities."""
        button_width = 300
        button_height = 100
        button_spacing = 30

        # Calculate starting Y position to center buttons vertically
        total_buttons = 4
        total_height = (button_height * total_buttons) + (button_spacing * (total_buttons - 1))
        start_y = (self.settings.screen_height - total_height) // 2 + 100

        # Center X position
        center_x = self.settings.screen_width // 2 - button_width // 2

        # Define buttons
        button_configs = [
            ("Letters", self.settings.colors["primary"], self._start_letters),
            ("Numbers", self.settings.colors["secondary"], self._start_numbers),
            ("Drawing", self.settings.colors["success"], self._start_drawing),
            ("Colors & Shapes", self.settings.colors["primary"], self._start_colors_shapes),
        ]

        for i, (text, color, callback) in enumerate(button_configs):
            y_pos = start_y + i * (button_height + button_spacing)
            button = Button(
                center_x,
                y_pos,
                button_width,
                button_height,
                text,
                color,
                on_click=callback,
            )
            self.buttons.append(button)

    def _start_letters(self) -> None:
        """Start the letters learning activity."""
        # TODO: Implement letters activity
        print("Starting Letters activity...")

    def _start_numbers(self) -> None:
        """Start the numbers learning activity."""
        # TODO: Implement numbers activity
        print("Starting Numbers activity...")

    def _start_drawing(self) -> None:
        """Start the drawing activity."""
        # TODO: Implement drawing activity
        print("Starting Drawing activity...")

    def _start_colors_shapes(self) -> None:
        """Start the colors and shapes activity."""
        # TODO: Implement colors and shapes activity
        print("Starting Colors & Shapes activity...")

    def handle_event(self, event: pygame.event.Event) -> None:
        """
        Handle pygame events.

        Args:
            event: The pygame event to handle.
        """
        for button in self.buttons:
            button.handle_event(event)

    def update(self) -> None:
        """Update menu state (for animations, etc.)."""
        pass

    def draw(self) -> None:
        """Draw the main menu."""
        # Clear screen with background color
        self.screen.fill(self.settings.colors["background"])

        # Draw title
        title_surface = self.title_font.render(self.title_text, True, self.title_color)
        title_rect = title_surface.get_rect(center=(self.settings.screen_width // 2, 100))

        # Add shadow effect to title
        shadow_surface = self.title_font.render(self.title_text, True, (0, 0, 0))
        shadow_rect = shadow_surface.get_rect(
            center=(self.settings.screen_width // 2 + 4, 104)
        )
        self.screen.blit(shadow_surface, shadow_rect)
        self.screen.blit(title_surface, title_rect)

        # Draw buttons
        for button in self.buttons:
            button.draw(self.screen)
