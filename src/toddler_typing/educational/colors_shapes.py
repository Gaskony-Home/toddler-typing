"""
Colors and shapes learning activity.

This module provides an interactive activity for learning colors and shapes.
"""

import pygame
import random
from typing import Tuple, List

from ..config.settings import Settings


class ColorsShapesActivity:
    """Interactive colors and shapes learning activity."""

    def __init__(self, screen: pygame.Surface, settings: Settings) -> None:
        """
        Initialize the colors and shapes activity.

        Args:
            screen: The pygame surface to draw on.
            settings: Application settings.
        """
        self.screen = screen
        self.settings = settings
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
        self.next_shape()

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
        if event.type == pygame.MOUSEBUTTONDOWN:
            # Move to next shape on click
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
        text_rect = text_surface.get_rect(center=(center_x, 100))
        self.screen.blit(text_surface, text_rect)

        # Draw instruction
        instruction = "Click to see another shape!"
        instruction_font = pygame.font.Font(None, 36)
        instruction_surface = instruction_font.render(
            instruction, True, self.settings.colors["text"]
        )
        instruction_rect = instruction_surface.get_rect(
            center=(center_x, self.settings.screen_height - 50)
        )
        self.screen.blit(instruction_surface, instruction_rect)
