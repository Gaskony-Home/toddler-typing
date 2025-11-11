"""
Star Display UI component for showing star count.

This module provides a visual counter that displays in the top-right corner
and animates when stars are earned.
"""

import math
import pygame
from typing import Tuple, Optional


class StarDisplay:
    """Displays star count in top-right corner with animations."""

    def __init__(self, screen_width: int, screen_height: int) -> None:
        """
        Initialize the star display.

        Args:
            screen_width: Width of the screen.
            screen_height: Height of the screen.
        """
        self.screen_width = screen_width
        self.screen_height = screen_height
        self.star_count = 0
        self.displayed_count = 0  # For smooth counting animation
        self.font = pygame.font.Font(None, 48)
        self.star_font = pygame.font.Font(None, 60)

        # Animation state
        self.pulse_phase = 0.0
        self.is_pulsing = False
        self.pulse_duration = 0

        # Position in top-right corner
        self.padding = 20
        self.x = screen_width - self.padding
        self.y = self.padding

    def set_star_count(self, count: int, animate: bool = False) -> None:
        """
        Set the star count.

        Args:
            count: The new star count.
            animate: Whether to animate the change (pulse effect).
        """
        self.star_count = count

        if animate and count > self.displayed_count:
            # Trigger pulse animation
            self.is_pulsing = True
            self.pulse_duration = 30  # 30 frames
            self.pulse_phase = 0.0

    def update(self) -> None:
        """Update the display animations."""
        # Smoothly animate count changes
        if self.displayed_count < self.star_count:
            # Count up quickly
            diff = self.star_count - self.displayed_count
            increment = max(1, diff // 5)  # Faster for larger differences
            self.displayed_count = min(self.star_count, self.displayed_count + increment)
        elif self.displayed_count > self.star_count:
            # Count down (shouldn't happen normally, but handle it)
            diff = self.displayed_count - self.star_count
            decrement = max(1, diff // 5)
            self.displayed_count = max(self.star_count, self.displayed_count - decrement)

        # Update pulse animation
        if self.is_pulsing:
            self.pulse_phase += 1
            if self.pulse_phase >= self.pulse_duration:
                self.is_pulsing = False
                self.pulse_phase = 0.0

    def draw(self, screen: pygame.Surface) -> None:
        """
        Draw the star display.

        Args:
            screen: The pygame surface to draw on.
        """
        # Calculate pulse scale
        scale = 1.0
        if self.is_pulsing:
            # Pulse from 1.0 to 1.3 and back
            progress = self.pulse_phase / self.pulse_duration
            scale = 1.0 + 0.3 * math.sin(progress * math.pi)

        # Draw background panel
        self._draw_background(screen, scale)

        # Draw star icon
        star_x = self.x - 140
        star_y = self.y + 25
        self._draw_star_icon(screen, star_x, star_y, int(25 * scale))

        # Draw count text
        count_text = f"x {self.displayed_count}"
        self._draw_count_text(screen, count_text, scale)

    def _draw_background(self, screen: pygame.Surface, scale: float) -> None:
        """
        Draw the background panel for the star display.

        Args:
            screen: The pygame surface to draw on.
            scale: Scale factor for pulse animation.
        """
        # Calculate dimensions
        width = int(150 * scale)
        height = int(50 * scale)
        x = self.x - width
        y = self.y

        # Create background with rounded corners
        background_rect = pygame.Rect(x, y, width, height)

        # Draw shadow
        shadow_rect = background_rect.copy()
        shadow_rect.x += 3
        shadow_rect.y += 3
        shadow_surface = pygame.Surface((shadow_rect.width, shadow_rect.height), pygame.SRCALPHA)
        pygame.draw.rect(shadow_surface, (0, 0, 0, 100), shadow_surface.get_rect(), border_radius=25)
        screen.blit(shadow_surface, (shadow_rect.x, shadow_rect.y))

        # Draw background
        bg_color = (30, 41, 59)  # Dark slate
        pygame.draw.rect(screen, bg_color, background_rect, border_radius=25)

        # Draw border
        border_color = (100, 116, 139)  # Lighter slate
        if self.is_pulsing:
            # Gold border when pulsing
            border_color = (255, 215, 0)
        pygame.draw.rect(screen, border_color, background_rect, 3, border_radius=25)

    def _draw_star_icon(self, screen: pygame.Surface, x: int, y: int, size: int) -> None:
        """
        Draw a star icon.

        Args:
            screen: The pygame surface to draw on.
            x: Center x position.
            y: Center y position.
            size: Size of the star.
        """
        # Create star points
        points = []
        num_points = 5
        outer_radius = size
        inner_radius = size * 0.4

        for i in range(num_points * 2):
            angle = math.radians(i * 180 / num_points - 90)
            radius = outer_radius if i % 2 == 0 else inner_radius
            px = x + radius * math.cos(angle)
            py = y + radius * math.sin(angle)
            points.append((px, py))

        # Draw the star
        if len(points) > 2:
            # Fill
            pygame.draw.polygon(screen, (255, 215, 0), points)
            # Outline
            pygame.draw.polygon(screen, (255, 255, 200), points, 2)

            # Add glow effect when pulsing
            if self.is_pulsing:
                glow_surface = pygame.Surface((size * 4, size * 4), pygame.SRCALPHA)
                for i in range(3):
                    alpha = 60 - (i * 20)
                    glow_radius = size + (i * 5)
                    pygame.draw.circle(
                        glow_surface,
                        (255, 215, 0, alpha),
                        (size * 2, size * 2),
                        glow_radius
                    )
                screen.blit(glow_surface, (x - size * 2, y - size * 2), special_flags=pygame.BLEND_ALPHA_SDL2)

    def _draw_count_text(self, screen: pygame.Surface, text: str, scale: float) -> None:
        """
        Draw the count text.

        Args:
            screen: The pygame surface to draw on.
            text: The text to display.
            scale: Scale factor for pulse animation.
        """
        # Render text
        text_color = (248, 250, 252)  # Light slate
        if self.is_pulsing:
            # Make text brighter when pulsing
            text_color = (255, 255, 255)

        text_surface = self.font.render(text, True, text_color)

        # Apply scale with smoothscale for anti-aliased quality
        if scale != 1.0:
            new_width = int(text_surface.get_width() * scale)
            new_height = int(text_surface.get_height() * scale)
            text_surface = pygame.transform.smoothscale(text_surface, (new_width, new_height))

        # Position text
        text_x = self.x - 90
        text_y = self.y + 25 - text_surface.get_height() // 2
        screen.blit(text_surface, (text_x, text_y))

    def get_bounds(self) -> pygame.Rect:
        """
        Get the bounding rectangle of the star display.

        Returns:
            pygame.Rect representing the display bounds.
        """
        return pygame.Rect(self.x - 150, self.y, 150, 50)

    def resize(self, screen_width: int, screen_height: int) -> None:
        """
        Update the display position when screen is resized.

        Args:
            screen_width: New screen width.
            screen_height: New screen height.
        """
        self.screen_width = screen_width
        self.screen_height = screen_height
        self.x = screen_width - self.padding
        self.y = self.padding

    def get_position(self) -> Tuple[int, int]:
        """
        Get the center position of the star display (for animations).

        Returns:
            Tuple of (x, y) coordinates.
        """
        return self.x - 75, self.y + 25
