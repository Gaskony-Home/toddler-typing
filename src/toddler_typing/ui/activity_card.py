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
    """A large, visual card for child-friendly activity selection with modern dark design."""

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
        subtitle: str = "",
        progress: float = 0.0,
        show_progress: bool = False,
        base_color: Tuple[int, int, int] = (45, 45, 45),
    ) -> None:
        """
        Initialize an activity card with modern dark design.

        Args:
            x: X coordinate of card's top-left corner.
            y: Y coordinate of card's top-left corner.
            width: Card width.
            height: Card height.
            title: Card title (shown small at bottom).
            color: Card accent/theme color for gradient overlay.
            icon: Icon name to display prominently.
            on_click: Callback function when card is clicked.
            text_color: Text color for the title.
            subtitle: Optional subtitle text.
            progress: Progress value (0.0-1.0).
            show_progress: Whether to show progress bar.
            base_color: Base card background color.
        """
        self.rect = pygame.Rect(x, y, width, height)
        self.title = title
        self.subtitle = subtitle
        self.color = color
        self.base_color = base_color
        self.icon = icon
        self.on_click = on_click
        self.text_color = text_color
        self.progress = max(0.0, min(1.0, progress))
        self.show_progress = show_progress
        self.hovered = False
        self.pressed = False

        # Hover and scale animation
        self.hover_offset = 0
        self.target_hover_offset = 0
        self.current_scale = 1.0
        self.target_scale = 1.0

        # Font sizes - responsive to card size
        self.title_font = get_font_manager().get_font(int(height * 0.08), bold=True)
        self.subtitle_font = get_font_manager().get_font(int(height * 0.05))
        self.progress_font = get_font_manager().get_font(int(height * 0.04))

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
            icon_font = get_font_manager().get_font(int(size * 0.45), bold=True)

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
            icon_font = get_font_manager().get_font(int(size * 0.5), bold=True)

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

            # Wood texture lines with anti-aliasing
            for i in range(4):
                line_y = center_y - body_height / 2 + (i + 1) * body_height / 5
                # Draw anti-aliased lines for smooth appearance
                for j in range(3):  # Draw 3 lines for thickness
                    pygame.draw.aaline(
                        screen, (200, 160, 80),
                        (center_x - body_width / 2 + 5, line_y + j),
                        (center_x + body_width / 2 - 5, line_y + j)
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
            # Add anti-aliased edges
            pygame.draw.aalines(screen, (40, 30, 20), True, tip_points, 1)

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
            # Add anti-aliased edges
            pygame.draw.aalines(screen, (0, 0, 0), True, triangle_points, 1)

            # Circle (top-right)
            circle_center = (int(center_x + offset), int(center_y - offset))
            radius = int(shape_size / 2)
            pygame.gfxdraw.filled_circle(screen, circle_center[0], circle_center[1], radius, colors[1])
            pygame.gfxdraw.aacircle(screen, circle_center[0], circle_center[1], radius, colors[1])
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
            pygame.gfxdraw.aacircle(screen, int(center_x), int(center_y), int(radius), color)
            for i in range(6):
                pygame.gfxdraw.circle(screen, int(center_x), int(center_y), int(radius - i), (0, 0, 0))

            # Thumb hole
            thumb_radius = int(radius * 0.3)
            thumb_x = int(center_x + radius * 0.5)
            thumb_y = int(center_y + radius * 0.4)
            pygame.gfxdraw.filled_circle(screen, thumb_x, thumb_y, thumb_radius, self.color)
            pygame.gfxdraw.aacircle(screen, thumb_x, thumb_y, thumb_radius, self.color)
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

    def update(self) -> None:
        """Update animation states with smooth interpolation."""
        # Smooth hover animation with subtle lift
        if self.hovered and not self.pressed:
            self.target_hover_offset = -6
            self.target_scale = 1.05  # Scale up 5% on hover
        else:
            self.target_hover_offset = 0
            self.target_scale = 1.0

        # Smooth lerp to target values
        self.hover_offset += (self.target_hover_offset - self.hover_offset) * 0.25
        self.current_scale += (self.target_scale - self.current_scale) * 0.2

    def _create_gradient_overlay(self, width: int, height: int, color: Tuple[int, int, int]) -> pygame.Surface:
        """
        Create a smooth gradient overlay surface.

        Args:
            width: Surface width.
            height: Surface height.
            color: Base accent color.

        Returns:
            Surface with gradient overlay.
        """
        surface = pygame.Surface((width, height), pygame.SRCALPHA)

        # Create vertical gradient from top to bottom (cleaner calculation)
        for y in range(height):
            # Linear interpolation from 30% to 5% opacity
            ratio = y / height
            alpha = int(76 * (1 - ratio) + 13 * ratio)

            # Draw line with gradient color
            pygame.draw.line(surface, (*color, alpha), (0, y), (width, y))

        return surface

    def _draw_progress_bar(self, screen: pygame.Surface, x: int, y: int, width: int) -> None:
        """
        Draw a modern progress bar.

        Args:
            screen: The pygame surface to draw on.
            x: X coordinate.
            y: Y coordinate.
            width: Progress bar width.
        """
        bar_height = 6
        border_radius = 3

        # Background track
        track_rect = pygame.Rect(x, y, width, bar_height)
        track_surface = pygame.Surface((width, bar_height), pygame.SRCALPHA)
        pygame.draw.rect(track_surface, (255, 255, 255, 26), track_surface.get_rect(), border_radius=border_radius)
        screen.blit(track_surface, (x, y))

        # Filled progress
        if self.progress > 0:
            fill_width = int(width * self.progress)
            if fill_width > 0:
                # Determine progress color based on percentage
                if self.progress < 0.3:
                    progress_color = (251, 146, 60)  # Orange
                elif self.progress < 0.7:
                    progress_color = (59, 130, 246)  # Blue
                else:
                    progress_color = (20, 184, 166)  # Teal

                fill_rect = pygame.Rect(x, y, fill_width, bar_height)
                pygame.draw.rect(screen, progress_color, fill_rect, border_radius=border_radius)

        # Progress percentage text
        progress_text = f"{int(self.progress * 100)}%"
        progress_surface = self.progress_font.render(progress_text, True, (176, 176, 176))
        progress_rect = progress_surface.get_rect(midleft=(x + width + 10, y + bar_height // 2))
        screen.blit(progress_surface, progress_rect)

    def draw(self, screen: pygame.Surface) -> None:
        """
        Draw the activity card with modern design, scale animation, and glassy effects.

        Args:
            screen: The pygame surface to draw on.
        """
        # Calculate scaled dimensions
        scaled_width = int(self.rect.width * self.current_scale)
        scaled_height = int(self.rect.height * self.current_scale)

        # Calculate centered position with hover offset and scale
        draw_x = self.rect.centerx - scaled_width // 2
        draw_y = self.rect.centery - scaled_height // 2 + int(self.hover_offset)
        draw_rect = pygame.Rect(draw_x, draw_y, scaled_width, scaled_height)

        # Border radius for modern look
        border_radius = 20

        # Draw soft, blurred shadow effect (optimized multi-layer blur)
        if not self.pressed:
            shadow_offset = 8 if self.hovered else 5
            shadow_layers = 5  # Optimized from 8 to 5 for better performance

            for i in range(shadow_layers):
                # Cleaner shadow spread calculation
                spread = shadow_layers - i
                alpha = int(60 - (i * 12))  # Fade from 60 to 12

                shadow_surface = pygame.Surface((draw_rect.width + spread * 2, draw_rect.height + spread * 2), pygame.SRCALPHA)
                pygame.draw.rect(
                    shadow_surface,
                    (0, 0, 0, alpha),
                    shadow_surface.get_rect(),
                    border_radius=border_radius
                )
                # Simpler offset positioning
                screen.blit(shadow_surface, (draw_rect.x - spread + shadow_offset // 2, draw_rect.y - spread + shadow_offset))

        # Draw base card background
        pygame.draw.rect(screen, self.base_color, draw_rect, border_radius=border_radius)

        # Draw gradient overlay for depth
        gradient_surface = self._create_gradient_overlay(draw_rect.width, draw_rect.height, self.color)
        screen.blit(gradient_surface, (draw_rect.x, draw_rect.y))

        # Add glassy shine effect at top (subtle highlight)
        shine_height = int(draw_rect.height * 0.3)
        shine_surface = pygame.Surface((draw_rect.width, shine_height), pygame.SRCALPHA)
        for y in range(shine_height):
            # Gradient from white with low opacity to transparent
            alpha = int(25 * (1 - y / shine_height))
            pygame.draw.line(shine_surface, (255, 255, 255, alpha), (0, y), (draw_rect.width, y))

        # Create a clipping surface for rounded corners
        shine_clipped = pygame.Surface((draw_rect.width, shine_height), pygame.SRCALPHA)
        pygame.draw.rect(shine_clipped, (255, 255, 255), shine_clipped.get_rect(), border_radius=border_radius)
        shine_clipped.blit(shine_surface, (0, 0), special_flags=pygame.BLEND_RGBA_MIN)
        screen.blit(shine_clipped, (draw_rect.x, draw_rect.y))

        # Subtle border for definition
        border_color = tuple(min(255, c + 30) for c in self.base_color)
        pygame.draw.rect(screen, border_color, draw_rect, 2, border_radius=border_radius)

        # Hover glow effect (subtle white overlay)
        if self.hovered and not self.pressed:
            glow_surface = pygame.Surface((draw_rect.width, draw_rect.height), pygame.SRCALPHA)
            pygame.draw.rect(
                glow_surface,
                (255, 255, 255, 25),
                glow_surface.get_rect(),
                border_radius=border_radius
            )
            screen.blit(glow_surface, (draw_rect.x, draw_rect.y))

        # Pressed effect - additive glow using accent color
        if self.pressed:
            glow_surface = pygame.Surface((draw_rect.width, draw_rect.height), pygame.SRCALPHA)
            # Use the card's accent color for glow
            glow_color = (*self.color, 60)
            pygame.draw.rect(
                glow_surface,
                glow_color,
                glow_surface.get_rect(),
                border_radius=border_radius
            )
            screen.blit(glow_surface, (draw_rect.x, draw_rect.y), special_flags=pygame.BLEND_RGBA_ADD)

        # Calculate layout areas
        padding = 24
        content_y = draw_rect.y + padding

        # Draw large icon in center area (70% of card height)
        icon_area_height = int(draw_rect.height * 0.7)
        icon_size = int(min(icon_area_height - padding * 2, draw_rect.width - padding * 2) * self.current_scale)
        icon_center_y = draw_rect.y + icon_area_height // 2

        self._draw_icon(screen, draw_rect.centerx, icon_center_y, icon_size)

        # Draw title and subtitle at bottom (30% of card)
        text_area_y = draw_rect.y + icon_area_height
        text_area_height = draw_rect.height - icon_area_height

        # Title
        title_surface = self.title_font.render(self.title, True, self.text_color)
        if self.subtitle:
            title_y = text_area_y + text_area_height // 3
        else:
            title_y = text_area_y + text_area_height // 2
        title_rect = title_surface.get_rect(center=(draw_rect.centerx, title_y))

        # Title shadow for depth (softer shadow)
        shadow_surface = self.title_font.render(self.title, True, (0, 0, 0, 100))
        shadow_rect = shadow_surface.get_rect(center=(draw_rect.centerx + 2, title_y + 2))
        screen.blit(shadow_surface, shadow_rect)
        screen.blit(title_surface, title_rect)

        # Subtitle (if present)
        if self.subtitle:
            subtitle_surface = self.subtitle_font.render(self.subtitle, True, (176, 176, 176))
            subtitle_y = title_y + int(draw_rect.height * 0.06)
            subtitle_rect = subtitle_surface.get_rect(center=(draw_rect.centerx, subtitle_y))
            screen.blit(subtitle_surface, subtitle_rect)

        # Progress bar (if enabled)
        if self.show_progress:
            progress_y = draw_rect.bottom - padding - 10
            progress_width = draw_rect.width - (padding * 2) - 60  # Leave space for percentage
            self._draw_progress_bar(screen, draw_rect.x + padding, progress_y, progress_width)
