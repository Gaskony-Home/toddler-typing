"""
Button UI component.

Provides a simple, child-friendly button with visual feedback.
"""

import math
import pygame
import pygame.gfxdraw
from typing import Tuple, Callable, Optional

from ..config.fonts import get_font_manager


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
        font_size: int = 60,  # Increased from 48
        on_click: Optional[Callable] = None,
        tooltip: str = "",
        icon: Optional[str] = None,
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
            tooltip: Tooltip text to display on hover.
            icon: Optional icon name to display on the button.
        """
        self.rect = pygame.Rect(x, y, width, height)
        self.text = text
        self.color = color
        self.text_color = text_color
        self.on_click = on_click
        self.tooltip = tooltip
        self.icon = icon
        self.base_font_size = font_size
        # Calculate responsive font size based on button height
        self.font_size = self._calculate_font_size()
        self.font = get_font_manager().get_font(self.font_size)
        self.tooltip_font = get_font_manager().get_font(36)  # Increased from 32
        self.hovered = False
        self.pressed = False

    def _calculate_font_size(self) -> int:
        """
        Calculate a responsive font size based on button height.

        Returns:
            The calculated font size.
        """
        # Responsive font size - reduce if button height is small
        # Use a fraction of button height with padding consideration
        max_font_size = int(self.rect.height * 0.45)  # Increased from 0.4
        return min(self.base_font_size, max_font_size)

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

    def _draw_glow(self, screen: pygame.Surface, x: int, y: int, radius: int, color: Tuple[int, int, int], intensity: int = 3) -> None:
        """
        Draw a subtle glow effect around a circular area.

        Args:
            screen: The pygame surface to draw on.
            x: X coordinate of glow center.
            y: Y coordinate of glow center.
            radius: Radius of the glow.
            color: Color of the glow.
            intensity: Number of glow layers.
        """
        for i in range(intensity):
            alpha = 60 - (i * 15)  # Decreasing alpha for outer layers
            glow_radius = radius + (i * 2)
            glow_surface = pygame.Surface((glow_radius * 2, glow_radius * 2), pygame.SRCALPHA)
            pygame.draw.circle(glow_surface, (*color, alpha), (glow_radius, glow_radius), glow_radius)
            screen.blit(glow_surface, (x - glow_radius, y - glow_radius), special_flags=pygame.BLEND_ALPHA_SDL2)

    def _draw_icon(self, screen: pygame.Surface, x: int, y: int, size: int) -> None:
        """
        Draw a high-quality icon with anti-aliasing using self.text_color.

        Args:
            screen: The pygame surface to draw on.
            x: X coordinate of icon center.
            y: Y coordinate of icon center.
            size: Size of the icon.
        """
        if not self.icon:
            return

        # Use self.text_color for all icon drawing
        color = self.text_color

        if self.icon == "letters":
            # Draw a bold, large "A" in a book/square frame
            frame_size = size * 0.85
            frame_thickness = 5

            # Book frame (rectangle with rounded corners)
            frame_rect = pygame.Rect(x - frame_size / 2, y - frame_size / 2, frame_size, frame_size)
            pygame.draw.rect(screen, color, frame_rect, frame_thickness, border_radius=8)

            # Inner frame for book effect
            inner_frame = pygame.Rect(x - frame_size / 2 + 8, y - frame_size / 2 + 8,
                                     frame_size - 16, frame_size - 16)
            pygame.draw.rect(screen, color, inner_frame, 3, border_radius=5)

            # Large bold "A" in the center
            icon_font = pygame.font.Font(None, int(size * 0.7))
            icon_font.set_bold(True)
            text_surface = icon_font.render("A", True, color)
            text_rect = text_surface.get_rect(center=(x, y))
            screen.blit(text_surface, text_rect)

            # Add subtle glow for emphasis
            if self.hovered:
                self._draw_glow(screen, int(x), int(y), int(frame_size / 2), color, 2)

        elif self.icon == "numbers":
            # Draw bold "1 2 3" arranged nicely with better spacing
            icon_font = pygame.font.Font(None, int(size * 0.45))
            icon_font.set_bold(True)

            # Draw numbers in a grid-like pattern
            numbers = ["1", "2", "3"]
            spacing = size * 0.35

            # Position "1" at top
            text_1 = icon_font.render("1", True, color)
            rect_1 = text_1.get_rect(center=(x, y - spacing * 0.6))
            screen.blit(text_1, rect_1)

            # Position "2" and "3" at bottom
            text_2 = icon_font.render("2", True, color)
            rect_2 = text_2.get_rect(center=(x - spacing * 0.5, y + spacing * 0.4))
            screen.blit(text_2, rect_2)

            text_3 = icon_font.render("3", True, color)
            rect_3 = text_3.get_rect(center=(x + spacing * 0.5, y + spacing * 0.4))
            screen.blit(text_3, rect_3)

            # Add decorative circles around numbers
            circle_radius = int(size * 0.18)
            pygame.draw.circle(screen, color, (int(x), int(y - spacing * 0.6)), circle_radius, 4)
            pygame.draw.circle(screen, color, (int(x - spacing * 0.5), int(y + spacing * 0.4)), circle_radius, 4)
            pygame.draw.circle(screen, color, (int(x + spacing * 0.5), int(y + spacing * 0.4)), circle_radius, 4)

        elif self.icon == "pencil":
            # Much more detailed pencil with better proportions and thicker lines
            # Pencil body (wider and taller)
            body_width = size * 0.28
            body_height = size * 0.55
            body_rect = pygame.Rect(x - body_width / 2, y - body_height / 2, body_width, body_height)

            # Wood color body with gradient effect
            pygame.draw.rect(screen, (255, 200, 100), body_rect, border_radius=3)
            pygame.draw.rect(screen, color, body_rect, 4, border_radius=3)

            # Wood texture lines
            for i in range(3):
                line_y = y - body_height / 2 + (i + 1) * body_height / 4
                pygame.draw.line(screen, (200, 160, 80),
                               (x - body_width / 2 + 3, line_y),
                               (x + body_width / 2 - 3, line_y), 2)

            # Pencil tip (larger triangle)
            tip_height = size * 0.25
            tip_points = [
                (int(x), int(y + body_height / 2 + tip_height)),
                (int(x - body_width / 2), int(y + body_height / 2)),
                (int(x + body_width / 2), int(y + body_height / 2))
            ]
            pygame.draw.polygon(screen, (80, 60, 40), tip_points)
            pygame.draw.polygon(screen, (40, 30, 20), tip_points, 4)

            # Graphite point
            graphite_height = tip_height * 0.4
            graphite_points = [
                (int(x), int(y + body_height / 2 + tip_height)),
                (int(x - body_width / 6), int(y + body_height / 2 + tip_height - graphite_height)),
                (int(x + body_width / 6), int(y + body_height / 2 + tip_height - graphite_height))
            ]
            pygame.draw.polygon(screen, (30, 30, 30), graphite_points)

            # Eraser (larger pink rectangle at top)
            eraser_height = size * 0.18
            eraser_rect = pygame.Rect(x - body_width / 2, y - body_height / 2 - eraser_height,
                                     body_width, eraser_height)
            pygame.draw.rect(screen, (255, 150, 150), eraser_rect, border_radius=2)
            pygame.draw.rect(screen, (220, 100, 100), eraser_rect, 3, border_radius=2)

            # Metal band between eraser and body (more prominent)
            band_height = size * 0.08
            band_rect = pygame.Rect(x - body_width / 2, y - body_height / 2 - band_height,
                                   body_width, band_height)
            pygame.draw.rect(screen, (200, 200, 200), band_rect)
            pygame.draw.rect(screen, (150, 150, 150), band_rect, 2)

            # Shine lines on metal band
            pygame.draw.line(screen, (240, 240, 240),
                           (x - body_width / 3, y - body_height / 2 - band_height / 2),
                           (x + body_width / 3, y - body_height / 2 - band_height / 2), 2)

        elif self.icon == "shapes":
            # Larger, filled shapes with thick outlines for clarity
            offset = size * 0.32
            small_size = size * 0.32
            line_width = 5

            # Triangle (filled with thick outline)
            triangle_points = [
                (int(x - offset), int(y + small_size / 2)),
                (int(x - offset - small_size / 2), int(y - small_size / 2)),
                (int(x - offset + small_size / 2), int(y - small_size / 2))
            ]
            # Draw filled triangle with gradient
            pygame.draw.polygon(screen, color, triangle_points)
            pygame.draw.polygon(screen, color, triangle_points, line_width)
            # Add anti-aliased edges
            pygame.draw.aalines(screen, color, True, triangle_points, 1)

            # Circle with thick outline and fill
            radius = int(small_size / 2)
            pygame.gfxdraw.filled_circle(screen, int(x), int(y), radius, color)
            pygame.gfxdraw.aacircle(screen, int(x), int(y), radius, color)
            # Thick outline
            for i in range(line_width):
                pygame.gfxdraw.circle(screen, int(x), int(y), radius - i, color)

            # Square (filled with thick outline)
            square_rect = pygame.Rect(x + offset - small_size / 2, y - small_size / 2,
                                     small_size, small_size)
            pygame.draw.rect(screen, color, square_rect, border_radius=3)
            pygame.draw.rect(screen, color, square_rect, line_width, border_radius=3)

            # Add glow effect if hovered
            if self.hovered:
                self._draw_glow(screen, int(x), int(y), int(size * 0.5), color, 2)

        elif self.icon == "palette":
            # Larger palette with bigger paint blobs and clearer thumb hole
            radius = size * 0.42
            outline_width = 5

            # Main palette oval shape with thick outline
            pygame.gfxdraw.filled_circle(screen, int(x), int(y), int(radius), color)
            pygame.gfxdraw.aacircle(screen, int(x), int(y), int(radius), color)

            # Thick outline
            for i in range(outline_width):
                pygame.gfxdraw.circle(screen, int(x), int(y), int(radius - i), color)

            # Thumb hole (larger and clearer)
            thumb_radius = int(radius * 0.28)
            thumb_x = int(x + radius * 0.55)
            thumb_y = int(y + radius * 0.45)
            pygame.gfxdraw.filled_circle(screen, thumb_x, thumb_y, thumb_radius, self.color)
            pygame.gfxdraw.aacircle(screen, thumb_x, thumb_y, thumb_radius, color)
            # Thick outline for thumb hole
            for i in range(4):
                pygame.gfxdraw.circle(screen, thumb_x, thumb_y, thumb_radius - i, color)

            # Paint blobs (larger and more vibrant)
            dot_size = int(size * 0.15)
            paint_colors = [
                (255, 60, 60),    # Bright Red
                (60, 100, 255),   # Bright Blue
                (255, 220, 60),   # Bright Yellow
                (80, 220, 80),    # Bright Green
                (200, 60, 200),   # Purple
            ]
            positions = [
                (int(x - radius * 0.4), int(y - radius * 0.35)),
                (int(x + radius * 0.15), int(y - radius * 0.4)),
                (int(x - radius * 0.15), int(y + radius * 0.15)),
                (int(x - radius * 0.4), int(y + radius * 0.4)),
                (int(x + radius * 0.1), int(y + radius * 0.25))
            ]

            for paint_color, pos in zip(paint_colors, positions):
                # Draw paint blob with glow
                pygame.gfxdraw.filled_circle(screen, pos[0], pos[1], dot_size, paint_color)
                pygame.gfxdraw.aacircle(screen, pos[0], pos[1], dot_size, paint_color)
                # Highlight on paint blob
                highlight_size = int(dot_size * 0.4)
                pygame.gfxdraw.filled_circle(screen, pos[0] - dot_size // 3, pos[1] - dot_size // 3,
                                            highlight_size, (255, 255, 255))

        elif self.icon == "sound":
            # Much clearer speaker with 3-4 sound waves and thicker lines
            line_width = 5

            # Speaker box (larger rectangle)
            box_width = size * 0.2
            box_height = size * 0.32
            box_rect = pygame.Rect(x - size * 0.38, y - box_height / 2, box_width, box_height)
            pygame.draw.rect(screen, color, box_rect, border_radius=3)
            pygame.draw.rect(screen, color, box_rect, line_width, border_radius=3)

            # Speaker cone (larger trapezoid)
            cone_points = [
                (int(x - size * 0.18), int(y - size * 0.15)),
                (int(x - size * 0.18), int(y + size * 0.15)),
                (int(x), int(y + size * 0.25)),
                (int(x), int(y - size * 0.25))
            ]
            pygame.draw.polygon(screen, color, cone_points)
            pygame.draw.polygon(screen, color, cone_points, line_width)

            # Sound waves (4 clear curved arcs with thick lines)
            for i in range(1, 5):
                wave_x = int(x + size * 0.08 * i)
                wave_radius = int(size * 0.15 * i)
                wave_thickness = line_width - (i // 2)  # Slightly thinner for outer waves

                # Draw smooth arc
                arc_points = []
                for angle in range(-30, 31, 2):
                    rad = math.radians(angle)
                    px = int(wave_x + math.cos(rad) * wave_radius)
                    py = int(y + math.sin(rad) * wave_radius)
                    arc_points.append((px, py))

                if len(arc_points) > 1:
                    pygame.draw.lines(screen, color, False, arc_points, wave_thickness)

            # Add glow effect
            if self.hovered:
                self._draw_glow(screen, int(x + size * 0.2), int(y), int(size * 0.3), color, 2)

        elif self.icon == "muted":
            # Same speaker with thick red X
            line_width = 5

            # Speaker box (larger rectangle)
            box_width = size * 0.2
            box_height = size * 0.32
            box_rect = pygame.Rect(x - size * 0.38, y - box_height / 2, box_width, box_height)
            pygame.draw.rect(screen, color, box_rect, border_radius=3)
            pygame.draw.rect(screen, color, box_rect, line_width, border_radius=3)

            # Speaker cone (larger trapezoid)
            cone_points = [
                (int(x - size * 0.18), int(y - size * 0.15)),
                (int(x - size * 0.18), int(y + size * 0.15)),
                (int(x), int(y + size * 0.25)),
                (int(x), int(y - size * 0.25))
            ]
            pygame.draw.polygon(screen, color, cone_points)
            pygame.draw.polygon(screen, color, cone_points, line_width)

            # Large, bold red X (6px width minimum)
            x_offset = size * 0.3
            x_line_width = 7
            x_color = (255, 50, 50)

            # Draw X with rounded ends
            x_start = int(x + size * 0.05)
            x_end = int(x + size * 0.4)

            pygame.draw.line(screen, x_color,
                           (x_start, int(y - x_offset)),
                           (x_end, int(y + x_offset)), x_line_width)
            pygame.draw.line(screen, x_color,
                           (x_start, int(y + x_offset)),
                           (x_end, int(y - x_offset)), x_line_width)

            # Add circles at X intersection for better look
            pygame.draw.circle(screen, x_color, (int(x + size * 0.225), int(y)), int(x_line_width * 0.8))

        elif self.icon == "repeat":
            # Much clearer circular arrows with bigger arrow heads
            radius = size * 0.36
            line_width = 5
            center_offset = size * 0.1

            # Draw two curved arrows forming a circle with thick lines
            # Top-right arc
            top_arc_points = []
            for angle_deg in range(20, 165, 3):
                angle = math.radians(angle_deg)
                px = int(x + math.cos(angle) * radius)
                py = int(y - center_offset + math.sin(angle) * radius)
                top_arc_points.append((px, py))

            if len(top_arc_points) > 1:
                pygame.draw.lines(screen, color, False, top_arc_points, line_width)

            # Bottom-left arc
            bottom_arc_points = []
            for angle_deg in range(200, 345, 3):
                angle = math.radians(angle_deg)
                px = int(x + math.cos(angle) * radius)
                py = int(y + center_offset + math.sin(angle) * radius)
                bottom_arc_points.append((px, py))

            if len(bottom_arc_points) > 1:
                pygame.draw.lines(screen, color, False, bottom_arc_points, line_width)

            # Arrow heads (larger triangles)
            arrow_size = size * 0.22

            # Top arrow (pointing left and down)
            top_arrow = [
                (int(x - radius * 0.8), int(y - center_offset - radius * 0.6)),
                (int(x - radius * 0.55), int(y - center_offset - radius * 0.85)),
                (int(x - radius * 1.0), int(y - center_offset - radius * 0.85))
            ]
            pygame.draw.polygon(screen, color, top_arrow)

            # Bottom arrow (pointing right and up)
            bottom_arrow = [
                (int(x + radius * 0.8), int(y + center_offset + radius * 0.6)),
                (int(x + radius * 0.55), int(y + center_offset + radius * 0.85)),
                (int(x + radius * 1.0), int(y + center_offset + radius * 0.85))
            ]
            pygame.draw.polygon(screen, color, bottom_arrow)

            # Add glow for emphasis
            if self.hovered:
                self._draw_glow(screen, int(x), int(y), int(radius), color, 2)

        elif self.icon == "sun":
            # Larger center, more prominent rays (thicker triangular rays)
            center_radius = int(size * 0.22)
            line_width = 4

            # Sun center with thick outline
            pygame.gfxdraw.filled_circle(screen, int(x), int(y), center_radius, color)
            pygame.gfxdraw.aacircle(screen, int(x), int(y), center_radius, color)

            # Thick outline
            for i in range(line_width):
                pygame.gfxdraw.circle(screen, int(x), int(y), center_radius - i, color)

            # Sun rays (12 thick triangular rays)
            ray_length = size * 0.32
            ray_width = size * 0.12

            for i in range(12):
                angle = i * math.pi / 6  # 12 rays evenly spaced

                # Calculate ray positions
                inner_dist = center_radius * 1.2
                outer_dist = inner_dist + ray_length

                # Ray as a thick triangle
                start_x = x + math.cos(angle) * inner_dist
                start_y = y + math.sin(angle) * inner_dist
                end_x = x + math.cos(angle) * outer_dist
                end_y = y + math.sin(angle) * outer_dist

                # Draw ray as a prominent triangle
                perp_angle = angle + math.pi / 2
                ray_points = [
                    (int(end_x), int(end_y)),
                    (int(start_x + math.cos(perp_angle) * ray_width / 2),
                     int(start_y + math.sin(perp_angle) * ray_width / 2)),
                    (int(start_x - math.cos(perp_angle) * ray_width / 2),
                     int(start_y - math.sin(perp_angle) * ray_width / 2))
                ]
                pygame.draw.polygon(screen, color, ray_points)
                pygame.draw.polygon(screen, color, ray_points, 2)

            # Add warm glow effect
            self._draw_glow(screen, int(x), int(y), center_radius + 5, (255, 220, 100), 3)

        elif self.icon == "moon":
            # Much clearer crescent with better visibility
            radius = int(size * 0.42)
            line_width = 4

            # Outer circle (full moon) with thick outline
            pygame.gfxdraw.filled_circle(screen, int(x), int(y), radius, color)
            pygame.gfxdraw.aacircle(screen, int(x), int(y), radius, color)

            # Thick outline
            for i in range(line_width):
                pygame.gfxdraw.circle(screen, int(x), int(y), radius - i, color)

            # Inner circle to create clearer crescent
            offset_x = int(x + radius * 0.5)
            inner_radius = int(radius * 0.8)
            pygame.gfxdraw.filled_circle(screen, offset_x, int(y), inner_radius, self.color)

            # Add stars around the moon for better visual
            star_positions = [
                (int(x - radius * 0.9), int(y - radius * 0.7)),
                (int(x - radius * 0.6), int(y + radius * 0.8)),
                (int(x + radius * 0.2), int(y - radius * 1.0))
            ]

            for star_x, star_y in star_positions:
                star_size = 3
                # Draw 4-pointed star
                pygame.draw.line(screen, color, (star_x - star_size, star_y),
                               (star_x + star_size, star_y), 3)
                pygame.draw.line(screen, color, (star_x, star_y - star_size),
                               (star_x, star_y + star_size), 3)

            # Add glow effect
            self._draw_glow(screen, int(x), int(y), radius + 5, (200, 200, 255), 3)

    def draw(self, screen: pygame.Surface) -> None:
        """
        Draw the button on the screen with responsive scaling, proper padding, and 3D shadow effect.

        Args:
            screen: The pygame surface to draw on.
        """
        # Determine button color based on state
        current_color = self.color
        if self.pressed:
            # Darken when pressed
            current_color = tuple(max(0, c - 40) for c in self.color)
        elif self.hovered:
            # Lighten when hovered
            current_color = tuple(min(255, c + 40) for c in self.color)

        # Draw 3D shadow effect (multiple layers for depth)
        shadow_offset = 6 if not self.pressed else 2
        shadow_layers = 3

        for i in range(shadow_layers):
            shadow_alpha = 80 - (i * 20)
            shadow_rect = self.rect.copy()
            shadow_rect.x += shadow_offset - i
            shadow_rect.y += shadow_offset - i

            shadow_surface = pygame.Surface((shadow_rect.width, shadow_rect.height), pygame.SRCALPHA)
            pygame.draw.rect(shadow_surface, (0, 0, 0, shadow_alpha),
                           shadow_surface.get_rect(), border_radius=18)
            screen.blit(shadow_surface, (shadow_rect.x, shadow_rect.y))

        # Draw button background with rounded corners
        pygame.draw.rect(screen, current_color, self.rect, border_radius=18)

        # Add highlight gradient at top for 3D effect
        if not self.pressed:
            highlight_rect = pygame.Rect(self.rect.x, self.rect.y,
                                        self.rect.width, self.rect.height // 3)
            highlight_surface = pygame.Surface((highlight_rect.width, highlight_rect.height), pygame.SRCALPHA)
            pygame.draw.rect(highlight_surface, (*current_color, 60),
                           highlight_surface.get_rect(), border_radius=18)
            screen.blit(highlight_surface, (highlight_rect.x, highlight_rect.y))

        # Draw thick border
        border_color = tuple(max(0, c - 60) for c in self.color)
        pygame.draw.rect(screen, border_color, self.rect, 5, border_radius=18)

        # Define padding/margins so content doesn't touch button edges
        padding = max(12, int(self.rect.height * 0.12))

        # Calculate icon size based on whether text is present (larger sizes)
        if self.icon and self.text:
            # Both icon and text: use larger icon size
            icon_size = min(self.rect.height // 2, 50)
        elif self.icon:
            # Only icon: use much larger icon size
            icon_size = min(int(self.rect.height * 0.7), 80)
        else:
            icon_size = 0

        # Draw icon and text based on what's available
        if self.icon and self.text:
            # Both icon and text: icon on left, text on right
            # Calculate total width needed
            text_surface = self.font.render(self.text, True, self.text_color)
            spacing = 20
            total_width = icon_size + spacing + text_surface.get_width()

            # Ensure content fits within button with padding
            available_width = self.rect.width - (2 * padding)
            if total_width > available_width:
                # Scale down if needed
                scale_factor = available_width / total_width
                icon_size = int(icon_size * scale_factor)
                # Recalculate with new icon size
                total_width = icon_size + spacing + text_surface.get_width()

            # Calculate starting position to center the combination
            start_x = self.rect.centerx - total_width / 2

            # Draw icon on the left
            icon_x = start_x + icon_size / 2
            icon_y = self.rect.centery
            self._draw_icon(screen, int(icon_x), int(icon_y), int(icon_size))

            # Draw text on the right
            text_x = start_x + icon_size + spacing
            text_rect = text_surface.get_rect(midleft=(text_x, self.rect.centery))
            screen.blit(text_surface, text_rect)

        elif self.icon:
            # Only icon: center it with padding consideration
            max_icon_size = min(self.rect.width - 2 * padding, self.rect.height - 2 * padding)
            icon_size = min(icon_size, max_icon_size)
            self._draw_icon(screen, int(self.rect.centerx), int(self.rect.centery), int(icon_size))

        elif self.text:
            # Only text: center it with padding consideration
            text_surface = self.font.render(self.text, True, self.text_color)
            text_rect = text_surface.get_rect(center=self.rect.center)
            screen.blit(text_surface, text_rect)

    def draw_tooltip(self, screen: pygame.Surface) -> None:
        """
        Draw the tooltip if the button is hovered.

        Args:
            screen: The pygame surface to draw on.
        """
        # Draw tooltip if hovered and tooltip is not empty
        if self.hovered and self.tooltip:
            # Render tooltip text with larger font
            tooltip_surface = self.tooltip_font.render(self.tooltip, True, (255, 255, 255))
            tooltip_rect = tooltip_surface.get_rect()

            # Add more padding
            padding = 12
            tooltip_width = tooltip_rect.width + padding * 2
            tooltip_height = tooltip_rect.height + padding * 2

            # Position tooltip below the button with 8px gap
            tooltip_x = self.rect.centerx - tooltip_width // 2
            tooltip_y = self.rect.bottom + 8

            # Ensure tooltip stays within screen bounds
            screen_width = screen.get_width()
            screen_height = screen.get_height()
            if tooltip_x < 0:
                tooltip_x = 0
            elif tooltip_x + tooltip_width > screen_width:
                tooltip_x = screen_width - tooltip_width
            if tooltip_y + tooltip_height > screen_height:
                tooltip_y = self.rect.top - tooltip_height - 8

            # Create semi-transparent background surface with rounded corners
            tooltip_bg = pygame.Surface((tooltip_width, tooltip_height), pygame.SRCALPHA)
            pygame.draw.rect(tooltip_bg, (0, 0, 0, 220), tooltip_bg.get_rect(), border_radius=8)

            # Draw tooltip background
            screen.blit(tooltip_bg, (tooltip_x, tooltip_y))

            # Draw subtle border
            pygame.draw.rect(screen, (100, 100, 100),
                           pygame.Rect(tooltip_x, tooltip_y, tooltip_width, tooltip_height),
                           2, border_radius=8)

            # Draw tooltip text
            tooltip_text_rect = tooltip_surface.get_rect(
                center=(tooltip_x + tooltip_width // 2, tooltip_y + tooltip_height // 2))
            screen.blit(tooltip_surface, tooltip_text_rect)
