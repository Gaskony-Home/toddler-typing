"""
Colors and shapes learning activity.

This module provides an interactive activity for learning colors and shapes.
"""

import pygame
import random
from typing import Tuple, List, Callable

from ..config.settings import Settings
from ..ui.button import Button


class ColorsShapesActivity:
    """Interactive colors and shapes learning activity."""

    def __init__(
        self, screen: pygame.Surface, settings: Settings, switch_state: Callable
    ) -> None:
        """
        Initialize the colors and shapes activity.

        Args:
            screen: The pygame surface to draw on.
            settings: Application settings.
            switch_state: Callback function to switch application state.
        """
        self.screen = screen
        self.settings = settings
        self.switch_state = switch_state
        self.font = pygame.font.Font(None, 72)

        # Define shapes and colors
        self.shapes = ["circle", "square", "triangle"]
        self.shape_colors = {
            "red": (255, 0, 0),
            "blue": (0, 0, 255),
            "green": (0, 255, 0),
            "yellow": (255, 255, 0),
        }

        self.current_shape: str = ""
        self.current_color_name: str = ""
        self.current_color: Tuple[int, int, int] = (0, 0, 0)

        # Back button
        self.back_button = Button(
            20, 20, 150, 60, "Back", (100, 100, 100), on_click=self._go_back
        )

        # Next button (large and colorful for toddlers)
        self.next_button = Button(
            self.settings.screen_width // 2 - 100,
            self.settings.screen_height - 100,
            200,
            70,
            "Next",
            self.settings.colors["secondary"],
            font_size=42,
            on_click=self.next_shape,
        )

        self.next_shape()

    def _go_back(self) -> None:
        """Return to main menu."""
        from ..main import AppState

        self.switch_state(AppState.MENU)

    def next_shape(self) -> None:
        """Select a random shape and color to display."""
        self.current_shape = random.choice(self.shapes)
        self.current_color_name = random.choice(list(self.shape_colors.keys()))
        self.current_color = self.shape_colors[self.current_color_name]

    def handle_event(self, event: pygame.event.Event) -> None:
        """
        Handle pygame events.

        Args:
            event: The pygame event to handle.
        """
        self.back_button.handle_event(event)
        self.next_button.handle_event(event)

        if event.type == pygame.MOUSEBUTTONDOWN:
            # Also allow clicking anywhere on the shape area to advance
            if event.button == 1:
                # Check if click is not on a button
                if (
                    not self.back_button.rect.collidepoint(event.pos)
                    and not self.next_button.rect.collidepoint(event.pos)
                ):
                    self.next_shape()

    def update(self) -> None:
        """Update activity state."""
        pass

    def draw(self) -> None:
        """Draw the colors and shapes activity."""
        self.screen.fill(self.settings.colors["background"])

        # Calculate center position
        center_x = self.settings.screen_width // 2
        center_y = self.settings.screen_height // 2

        # Draw the shape
        if self.current_shape == "circle":
            pygame.draw.circle(self.screen, self.current_color, (center_x, center_y), 150)
        elif self.current_shape == "square":
            rect = pygame.Rect(0, 0, 300, 300)
            rect.center = (center_x, center_y)
            pygame.draw.rect(self.screen, self.current_color, rect)
        elif self.current_shape == "triangle":
            points = [
                (center_x, center_y - 150),
                (center_x - 150, center_y + 150),
                (center_x + 150, center_y + 150),
            ]
            pygame.draw.polygon(self.screen, self.current_color, points)

        # Draw labels
        shape_text = f"{self.current_color_name.capitalize()} {self.current_shape.capitalize()}"
        text_surface = self.font.render(shape_text, True, self.settings.colors["text"])
        text_rect = text_surface.get_rect(center=(center_x, 150))
        self.screen.blit(text_surface, text_rect)

        # Draw buttons
        self.back_button.draw(self.screen)
        self.next_button.draw(self.screen)
