"""
Button UI component.

Provides a simple, child-friendly button with visual feedback.
"""

import pygame
from typing import Tuple, Callable, Optional


class Button:
    """A simple, colorful button for child-friendly interfaces."""

    def __init__(
        self,
        x: int,
        y: int,
        width: int,
        height: int,
        text: str,
        color: Tuple[int, int, int],
        text_color: Tuple[int, int, int] = (255, 255, 255),
        font_size: int = 48,
        on_click: Optional[Callable] = None,
    ) -> None:
        """
        Initialize a button.

        Args:
            x: X coordinate of button's top-left corner.
            y: Y coordinate of button's top-left corner.
            width: Button width.
            height: Button height.
            text: Button text.
            color: Button background color.
            text_color: Text color.
            font_size: Font size for button text.
            on_click: Callback function when button is clicked.
        """
        self.rect = pygame.Rect(x, y, width, height)
        self.text = text
        self.color = color
        self.text_color = text_color
        self.on_click = on_click
        self.font = pygame.font.Font(None, font_size)
        self.hovered = False
        self.pressed = False

    def handle_event(self, event: pygame.event.Event) -> None:
        """
        Handle pygame events.

        Args:
            event: The pygame event to handle.
        """
        if event.type == pygame.MOUSEMOTION:
            self.hovered = self.rect.collidepoint(event.pos)

        elif event.type == pygame.MOUSEBUTTONDOWN:
            if event.button == 1 and self.rect.collidepoint(event.pos):
                self.pressed = True

        elif event.type == pygame.MOUSEBUTTONUP:
            if event.button == 1 and self.pressed and self.rect.collidepoint(event.pos):
                if self.on_click:
                    self.on_click()
            self.pressed = False

    def draw(self, screen: pygame.Surface) -> None:
        """
        Draw the button on the screen.

        Args:
            screen: The pygame surface to draw on.
        """
        # Determine button color based on state
        current_color = self.color
        if self.pressed:
            # Darken when pressed
            current_color = tuple(max(0, c - 30) for c in self.color)
        elif self.hovered:
            # Lighten when hovered
            current_color = tuple(min(255, c + 30) for c in self.color)

        # Draw button background with rounded corners
        pygame.draw.rect(screen, current_color, self.rect, border_radius=15)

        # Draw border
        border_color = tuple(max(0, c - 50) for c in self.color)
        pygame.draw.rect(screen, border_color, self.rect, 4, border_radius=15)

        # Draw text
        text_surface = self.font.render(self.text, True, self.text_color)
        text_rect = text_surface.get_rect(center=self.rect.center)
        screen.blit(text_surface, text_rect)
