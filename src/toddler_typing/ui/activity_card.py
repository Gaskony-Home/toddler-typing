"""
Activity Card UI component.

Provides a visual, icon-focused card for activity selection that
children can understand without reading.
"""

import pygame
import pygame.gfxdraw
import math
from typing import Tuple, Callable, Optional

from ..config.fonts import get_font_manager


class ActivityCard:
    """A large, visual card for child-friendly activity selection."""

    def __init__(
        self,
        x: int,
        y: int,
        width: int,
        height: int,
        title: str,
        color: Tuple[int, int, int],
        icon: str,
        on_click: Optional[Callable] = None,
        text_color: Tuple[int, int, int] = (255, 255, 255),
    ) -> None:
        """
        Initialize an activity card.

        Args:
            x: X coordinate of card's top-left corner.
            y: Y coordinate of card's top-left corner.
            width: Card width.
            height: Card height.
            title: Card title (shown small at bottom).
            color: Card background color.
            icon: Icon name to display prominently.
            on_click: Callback function when card is clicked.
            text_color: Text color for the title.
        """
        self.rect = pygame.Rect(x, y, width, height)
        self.title = title
        self.color = color
        self.icon = icon
        self.on_click = on_click
        self.text_color = text_color
        self.hovered = False
        self.pressed = False

        # Smaller title font since icon is primary
        self.title_font = get_font_manager().get_font(36, bold=True)

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

    def _draw_icon(self, screen: pygame.Surface, center_x: int, center_y: int, size: int) -> None:
        """
        Draw a large, prominent icon.

        Args:
            screen: The pygame surface to draw on.
            center_x: X coordinate of icon center.
            center_y: Y coordinate of icon center.
            size: Size of the icon.
        """
        color = self.text_color

        if self.icon == "letters":
            # Draw "ABC" in large bold letters stacked
            icon_font = pygame.font.Font(None, int(size * 0.45))
            icon_font.set_bold(True)

            # Draw letters vertically stacked
            letters = ["A", "B", "C"]
            letter_spacing = size * 0.35

            for i, letter in enumerate(letters):
                y_offset = (i - 1) * letter_spacing
                text_surface = icon_font.render(letter, True, color)
                text_rect = text_surface.get_rect(center=(center_x, center_y + y_offset))

                # Draw shadow for depth
                shadow = icon_font.render(letter, True, (0, 0, 0, 128))
                shadow_rect = shadow.get_rect(center=(center_x + 3, center_y + y_offset + 3))
                screen.blit(shadow, shadow_rect)
                screen.blit(text_surface, text_rect)

        elif self.icon == "numbers":
            # Draw "123" in large bold
            icon_font = pygame.font.Font(None, int(size * 0.5))
            icon_font.set_bold(True)

            text_surface = icon_font.render("123", True, color)
            text_rect = text_surface.get_rect(center=(center_x, center_y))

            # Draw shadow for depth
            shadow = icon_font.render("123", True, (0, 0, 0, 128))
            shadow_rect = shadow.get_rect(center=(center_x + 3, center_y + 3))
            screen.blit(shadow, shadow_rect)
            screen.blit(text_surface, text_rect)

        elif self.icon == "pencil":
            # Large detailed pencil
            scale = size / 100
            body_width = 30 * scale
            body_height = 70 * scale

            # Pencil body
            body_rect = pygame.Rect(
                center_x - body_width / 2,
                center_y - body_height / 2,
                body_width,
                body_height
            )
            pygame.draw.rect(screen, (255, 200, 100), body_rect, border_radius=5)
            pygame.draw.rect(screen, color, body_rect, 5, border_radius=5)

            # Wood texture lines
            for i in range(4):
                line_y = center_y - body_height / 2 + (i + 1) * body_height / 5
                pygame.draw.line(
                    screen, (200, 160, 80),
                    (center_x - body_width / 2 + 5, line_y),
                    (center_x + body_width / 2 - 5, line_y),
                    3
                )

            # Pencil tip
            tip_height = 30 * scale
            tip_points = [
                (int(center_x), int(center_y + body_height / 2 + tip_height)),
                (int(center_x - body_width / 2), int(center_y + body_height / 2)),
                (int(center_x + body_width / 2), int(center_y + body_height / 2))
            ]
            pygame.draw.polygon(screen, (80, 60, 40), tip_points)
            pygame.draw.polygon(screen, (40, 30, 20), tip_points, 4)

            # Eraser at top
            eraser_height = 20 * scale
            eraser_rect = pygame.Rect(
                center_x - body_width / 2,
                center_y - body_height / 2 - eraser_height,
                body_width,
                eraser_height
            )
            pygame.draw.rect(screen, (255, 150, 150), eraser_rect, border_radius=3)
            pygame.draw.rect(screen, (220, 100, 100), eraser_rect, 4, border_radius=3)

            # Metal band
            band_height = 8 * scale
            band_rect = pygame.Rect(
                center_x - body_width / 2,
                center_y - body_height / 2 - band_height,
                body_width,
                band_height
            )
            pygame.draw.rect(screen, (200, 200, 200), band_rect)
            pygame.draw.rect(screen, (150, 150, 150), band_rect, 3)

        elif self.icon == "shapes":
            # Large colorful shapes
            offset = size * 0.35
            shape_size = size * 0.4
            line_width = 6

            # Different colors for each shape
            colors = [
                (255, 100, 100),  # Red triangle
                (100, 150, 255),  # Blue circle
                (100, 220, 100),  # Green square
            ]

            # Triangle (top-left)
            triangle_points = [
                (int(center_x - offset), int(center_y)),
                (int(center_x - offset - shape_size / 2), int(center_y - shape_size / 2 - offset)),
                (int(center_x - offset + shape_size / 2), int(center_y - shape_size / 2 - offset))
            ]
            pygame.draw.polygon(screen, colors[0], triangle_points)
            pygame.draw.polygon(screen, (0, 0, 0), triangle_points, line_width)

            # Circle (top-right)
            circle_center = (int(center_x + offset), int(center_y - offset))
            radius = int(shape_size / 2)
            pygame.gfxdraw.filled_circle(screen, circle_center[0], circle_center[1], radius, colors[1])
            for i in range(line_width):
                pygame.gfxdraw.circle(screen, circle_center[0], circle_center[1], radius - i, (0, 0, 0))

            # Square (bottom-center)
            square_rect = pygame.Rect(
                center_x - shape_size / 2,
                center_y + offset - shape_size / 2,
                shape_size,
                shape_size
            )
            pygame.draw.rect(screen, colors[2], square_rect, border_radius=5)
            pygame.draw.rect(screen, (0, 0, 0), square_rect, line_width, border_radius=5)

        elif self.icon == "palette":
            # Large colorful paint palette
            radius = size * 0.45

            # Main palette shape
            pygame.gfxdraw.filled_circle(screen, int(center_x), int(center_y), int(radius), color)
            for i in range(6):
                pygame.gfxdraw.circle(screen, int(center_x), int(center_y), int(radius - i), (0, 0, 0))

            # Thumb hole
            thumb_radius = int(radius * 0.3)
            thumb_x = int(center_x + radius * 0.5)
            thumb_y = int(center_y + radius * 0.4)
            pygame.gfxdraw.filled_circle(screen, thumb_x, thumb_y, thumb_radius, self.color)
            for i in range(5):
                pygame.gfxdraw.circle(screen, thumb_x, thumb_y, thumb_radius - i, (0, 0, 0))

            # Paint blobs in rainbow colors
            dot_size = int(size * 0.18)
            paint_colors = [
                (255, 60, 60),    # Red
                (255, 165, 0),    # Orange
                (255, 220, 60),   # Yellow
                (80, 220, 80),    # Green
                (60, 100, 255),   # Blue
                (200, 60, 200),   # Purple
            ]

            positions = [
                (int(center_x - radius * 0.45), int(center_y - radius * 0.4)),
                (int(center_x + radius * 0.1), int(center_y - radius * 0.5)),
                (int(center_x - radius * 0.2), int(center_y)),
                (int(center_x - radius * 0.5), int(center_y + radius * 0.35)),
                (int(center_x), int(center_y + radius * 0.3)),
                (int(center_x + radius * 0.15), int(center_y + radius * 0.1))
            ]

            for paint_color, pos in zip(paint_colors, positions[:len(positions)]):
                # Paint blob
                pygame.gfxdraw.filled_circle(screen, pos[0], pos[1], dot_size, paint_color)
                pygame.gfxdraw.aacircle(screen, pos[0], pos[1], dot_size, paint_color)
                # Highlight
                highlight_size = int(dot_size * 0.5)
                pygame.gfxdraw.filled_circle(
                    screen,
                    pos[0] - dot_size // 3,
                    pos[1] - dot_size // 3,
                    highlight_size,
                    (255, 255, 255)
                )

    def draw(self, screen: pygame.Surface) -> None:
        """
        Draw the activity card.

        Args:
            screen: The pygame surface to draw on.
        """
        # Determine card color based on state
        current_color = self.color
        if self.pressed:
            current_color = tuple(max(0, c - 50) for c in self.color)
        elif self.hovered:
            current_color = tuple(min(255, c + 50) for c in self.color)

        # Draw shadow
        shadow_offset = 8 if not self.pressed else 3
        shadow_layers = 4

        for i in range(shadow_layers):
            shadow_alpha = 100 - (i * 20)
            shadow_rect = self.rect.copy()
            shadow_rect.x += shadow_offset - i
            shadow_rect.y += shadow_offset - i

            shadow_surface = pygame.Surface((shadow_rect.width, shadow_rect.height), pygame.SRCALPHA)
            pygame.draw.rect(
                shadow_surface,
                (0, 0, 0, shadow_alpha),
                shadow_surface.get_rect(),
                border_radius=25
            )
            screen.blit(shadow_surface, (shadow_rect.x, shadow_rect.y))

        # Draw card background with rounded corners
        pygame.draw.rect(screen, current_color, self.rect, border_radius=25)

        # Add highlight gradient at top for 3D effect
        if not self.pressed:
            highlight_rect = pygame.Rect(
                self.rect.x,
                self.rect.y,
                self.rect.width,
                self.rect.height // 3
            )
            highlight_surface = pygame.Surface((highlight_rect.width, highlight_rect.height), pygame.SRCALPHA)
            pygame.draw.rect(
                highlight_surface,
                (*current_color, 80),
                highlight_surface.get_rect(),
                border_radius=25
            )
            screen.blit(highlight_surface, (highlight_rect.x, highlight_rect.y))

        # Draw border
        border_color = tuple(max(0, c - 70) for c in self.color)
        pygame.draw.rect(screen, border_color, self.rect, 6, border_radius=25)

        # Pulse effect when hovered
        if self.hovered:
            pulse_surface = pygame.Surface((self.rect.width, self.rect.height), pygame.SRCALPHA)
            pygame.draw.rect(
                pulse_surface,
                (255, 255, 255, 30),
                pulse_surface.get_rect(),
                border_radius=25
            )
            screen.blit(pulse_surface, (self.rect.x, self.rect.y))

        # Draw large icon in center-top area
        icon_area_height = int(self.rect.height * 0.7)
        icon_size = min(icon_area_height, self.rect.width - 40)
        icon_center_y = self.rect.y + icon_area_height // 2

        self._draw_icon(screen, self.rect.centerx, icon_center_y, icon_size)

        # Draw title at bottom (small and subtle)
        title_y = self.rect.bottom - 50
        title_surface = self.title_font.render(self.title, True, self.text_color)
        title_rect = title_surface.get_rect(center=(self.rect.centerx, title_y))

        # Title shadow for better readability
        shadow_surface = self.title_font.render(self.title, True, (0, 0, 0, 180))
        shadow_rect = shadow_surface.get_rect(center=(self.rect.centerx + 2, title_y + 2))
        screen.blit(shadow_surface, shadow_rect)
        screen.blit(title_surface, title_rect)
