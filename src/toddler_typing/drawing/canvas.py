"""
Drawing canvas with simple crayon-like drawing.

This module provides a child-friendly drawing interface with
simple color selection and brush sizes.
"""

import pygame
from typing import List, Tuple, Optional, Callable

from ..config.settings import Settings
from ..ui.button import Button


class DrawingCanvas:
    """Simple drawing canvas for children."""

    def __init__(
        self, screen: pygame.Surface, settings: Settings, switch_state: Callable
    ) -> None:
        """
        Initialize the drawing canvas.

        Args:
            screen: The pygame surface to draw on.
            settings: Application settings.
            switch_state: Callback function to switch application state.
        """
        self.screen = screen
        self.settings = settings
        self.switch_state = switch_state

        # Drawing state
        self.drawing = False
        self.current_color = self.settings.drawing_colors[0]
        self.current_brush_size = self.settings.default_brush_size
        self.last_pos: Optional[Tuple[int, int]] = None

        # Create canvas surface
        self.canvas = pygame.Surface((self.settings.screen_width, self.settings.screen_height))
        self.canvas.fill((255, 255, 255))  # White canvas

        # Back button
        self.back_button = Button(
            self.settings.screen_width - 180,
            20,
            150,
            60,
            "Back",
            (100, 100, 100),
            on_click=self._go_back,
        )

        # Create color palette buttons
        self.color_buttons: List[Button] = []
        self._create_color_palette()

        # Create brush size buttons
        self.size_buttons: List[Button] = []
        self._create_brush_sizes()

        # Clear button
        self.clear_button = Button(
            self.settings.screen_width - 180,
            self.settings.screen_height - 80,
            150,
            60,
            "Clear",
            (200, 50, 50),
            on_click=self._clear_canvas,
        )

    def _go_back(self) -> None:
        """Return to main menu."""
        from ..main import AppState

        self.switch_state(AppState.MENU)

    def _create_color_palette(self) -> None:
        """Create color selection buttons."""
        button_size = 60
        spacing = 10
        start_x = 20

        for i, color in enumerate(self.settings.drawing_colors):
            button = Button(
                start_x + i * (button_size + spacing),
                20,
                button_size,
                button_size,
                "",
                color,
                on_click=lambda c=color: self._set_color(c),
            )
            self.color_buttons.append(button)

    def _create_brush_sizes(self) -> None:
        """Create brush size selection buttons."""
        button_width = 50
        button_height = 50
        spacing = 10
        start_y = 100

        for i, size in enumerate(self.settings.brush_sizes):
            button = Button(
                20,
                start_y + i * (button_height + spacing),
                button_width,
                button_height,
                str(size),
                self.settings.colors["secondary"],
                font_size=32,
                on_click=lambda s=size: self._set_brush_size(s),
            )
            self.size_buttons.append(button)

    def _set_color(self, color: Tuple[int, int, int]) -> None:
        """
        Set the current drawing color.

        Args:
            color: RGB color tuple.
        """
        self.current_color = color

    def _set_brush_size(self, size: int) -> None:
        """
        Set the current brush size.

        Args:
            size: Brush size in pixels.
        """
        self.current_brush_size = size

    def _clear_canvas(self) -> None:
        """Clear the drawing canvas."""
        self.canvas.fill((255, 255, 255))

    def handle_event(self, event: pygame.event.Event) -> None:
        """
        Handle pygame events.

        Args:
            event: The pygame event to handle.
        """
        # Handle UI buttons
        for button in self.color_buttons + self.size_buttons + [self.clear_button, self.back_button]:
            button.handle_event(event)

        # Handle drawing
        if event.type == pygame.MOUSEBUTTONDOWN:
            if event.button == 1:  # Left click
                self.drawing = True
                self.last_pos = event.pos

        elif event.type == pygame.MOUSEBUTTONUP:
            if event.button == 1:
                self.drawing = False
                self.last_pos = None

        elif event.type == pygame.MOUSEMOTION:
            if self.drawing and self.last_pos:
                # Draw line from last position to current position
                pygame.draw.line(
                    self.canvas,
                    self.current_color,
                    self.last_pos,
                    event.pos,
                    self.current_brush_size,
                )
                # Draw circle at current position for smooth line
                pygame.draw.circle(
                    self.canvas, self.current_color, event.pos, self.current_brush_size // 2
                )
                self.last_pos = event.pos

    def update(self) -> None:
        """Update drawing state."""
        pass

    def draw(self) -> None:
        """Draw the canvas and UI."""
        # Draw the canvas
        self.screen.blit(self.canvas, (0, 0))

        # Draw UI elements on top
        for button in self.color_buttons:
            button.draw(self.screen)

        for button in self.size_buttons:
            button.draw(self.screen)

        self.clear_button.draw(self.screen)
        self.back_button.draw(self.screen)
