"""
Coloring, Tracing, and Dot-to-Dot activity.

This module provides structured drawing activities with templates.
"""

import pygame
import random
import math
from typing import List, Tuple, Optional, Callable
from enum import Enum

from ..config.settings import Settings
from ..ui.button import Button
from ..ui.voice_controls import VoiceControls
from ..audio.voice_manager import VoiceManager
from ..gamification import ProgressManager, Celebration, StarDisplay
from ..config.fonts import get_font_manager


class ActivityMode(Enum):
    """Different activity modes."""
    COLORING = "coloring"
    TRACING = "tracing"
    DOT_TO_DOT = "dot_to_dot"


class ColoringActivity:
    """Interactive coloring, tracing, and dot-to-dot activity."""

    def __init__(
        self, screen: pygame.Surface, settings: Settings, switch_state: Callable, voice_manager: Optional[VoiceManager] = None
    ) -> None:
        """
        Initialize the coloring activity.

        Args:
            screen: The pygame surface to draw on.
            settings: Application settings.
            switch_state: Callback function to switch application state.
            voice_manager: Optional voice manager for text-to-speech.
        """
        self.screen = screen
        self.settings = settings
        self.switch_state = switch_state
        self.voice_manager = voice_manager
        self.first_draw = True

        # Activity state
        self.mode = ActivityMode.COLORING
        self.current_color = self.settings.drawing_colors[0]
        self.current_brush_size = 20
        self.drawing = False
        self.last_pos: Optional[Tuple[int, int]] = None
        self.stroke_count = 0  # Count drawing strokes for star rewards

        # Canvas for user's drawing
        self.canvas = pygame.Surface((self.settings.screen_width, self.settings.screen_height))
        self.canvas.fill((255, 255, 255))
        self.canvas.set_colorkey(None)

        # Template surface (for outlines, dots, etc.)
        self.template = pygame.Surface((self.settings.screen_width, self.settings.screen_height))
        self.template.fill((255, 255, 255))

        # Gamification system
        self.progress_manager = ProgressManager()
        self.celebration = Celebration(settings.screen_width, settings.screen_height)
        self.star_display = StarDisplay(settings.screen_width, settings.screen_height)
        self.star_display.set_star_count(self.progress_manager.total_stars)
        # Template library - 16 templates suitable for 3-year-olds
        self.templates = [
            "circle",
            "square",
            "triangle",
            "star",
            "heart",
            "flower",
            "sun",
            "moon",
            "house",
            "tree",
            "car",
            "fish",
            "butterfly",
            "balloon",
            "apple",
            "cloud"
        ]
        self.current_template = 0

        # Back button
        self.back_button = Button(
            20, 20, 150, 60, "Back", (100, 100, 100), on_click=self._go_back,
            tooltip="Return to main menu"
        )

        # Mode selection buttons - moved to bottom center
        mode_button_width = 140
        mode_button_spacing = 20
        mode_button_y = self.settings.screen_height - 100  # 100px from bottom
        # Calculate center position for 3 buttons
        total_mode_width = (mode_button_width * 3) + (mode_button_spacing * 2)
        mode_start_x = (self.settings.screen_width - total_mode_width) // 2

        self.coloring_button = Button(
            mode_start_x, mode_button_y, mode_button_width, 70,
            "Color", self.settings.colors["primary"], on_click=self._set_coloring_mode,
            tooltip="Fill shapes with colors"
        )
        self.tracing_button = Button(
            mode_start_x + mode_button_width + mode_button_spacing, mode_button_y, mode_button_width, 70,
            "Trace", self.settings.colors["secondary"], on_click=self._set_tracing_mode,
            tooltip="Trace over dotted lines"
        )
        self.dot_button = Button(
            mode_start_x + (mode_button_width + mode_button_spacing) * 2, mode_button_y, mode_button_width, 70,
            "Dots", self.settings.colors["success"], on_click=self._set_dot_mode,
            tooltip="Connect numbered dots"
        )

        # Template navigation arrows - positioned at middle-left and middle-right
        arrow_y = self.settings.screen_height // 2
        arrow_size = 80

        self.prev_button = Button(
            30, arrow_y - arrow_size // 2, arrow_size, arrow_size,
            "<", (150, 150, 150), on_click=self._previous_template,
            tooltip="Previous template"
        )
        self.next_button = Button(
            self.settings.screen_width - 30 - arrow_size, arrow_y - arrow_size // 2, arrow_size, arrow_size,
            ">", (150, 150, 150), on_click=self._next_template,
            tooltip="Next template"
        )

        # Color palette
        self.color_buttons: List[Button] = []
        self._create_color_palette()

        # Voice controls
        self.voice_controls: Optional[VoiceControls] = None
        if self.voice_manager:
            self.voice_controls = VoiceControls(
                settings.screen_width,
                settings.screen_height,
                voice_manager
            )

        # Generate initial template
        self._generate_template()

    def _go_back(self) -> None:
        """Return to main menu."""
        from ..main import AppState
        self.switch_state(AppState.MENU)

    def _create_color_palette(self) -> None:
        """Create color selection buttons."""
        button_size = 70  # Increased from 50px for better toddler usability
        spacing = 15  # Increased from 10px for better spacing
        start_x = 20
        start_y = 150  # Adjusted to be below the mode heading

        for i, color in enumerate(self.settings.drawing_colors):
            button = Button(
                start_x,
                start_y + i * (button_size + spacing),
                button_size,
                button_size,
                "",
                color,
                on_click=lambda c=color: self._set_color(c),
            )
            self.color_buttons.append(button)

    def _set_color(self, color: Tuple[int, int, int]) -> None:
        """Set the current drawing color."""
        self.current_color = color

    def _set_coloring_mode(self) -> None:
        """Set mode to coloring."""
        self.mode = ActivityMode.COLORING
        self.current_template = 0  # Reset to first template
        self._generate_template()
        if self.voice_controls:
            self.voice_controls.speak("Coloring mode! Fill in the shape with colors")

    def _set_tracing_mode(self) -> None:
        """Set mode to tracing."""
        self.mode = ActivityMode.TRACING
        self.current_template = 0  # Reset to first template
        self._generate_template()
        if self.voice_controls:
            self.voice_controls.speak("Tracing mode! Follow the dotted lines")

    def _set_dot_mode(self) -> None:
        """Set mode to dot-to-dot."""
        self.mode = ActivityMode.DOT_TO_DOT
        self.current_template = 0  # Reset to first template
        self._generate_template()
        if self.voice_controls:
            self.voice_controls.speak("Dot to dot mode! Connect the numbered dots")

    def _previous_template(self) -> None:
        """Navigate to the previous template."""
        self.current_template = (self.current_template - 1) % len(self.templates)
        self._generate_template()
        template_name = self.templates[self.current_template].replace("_", " ").title()
        if self.voice_controls:
            self.voice_controls.speak(f"{template_name}")

    def _next_template(self) -> None:
        """Navigate to the next template."""
        self.current_template = (self.current_template + 1) % len(self.templates)
        self._generate_template()
        template_name = self.templates[self.current_template].replace("_", " ").title()
        if self.voice_controls:
            self.voice_controls.speak(f"{template_name}")

    def _generate_template(self) -> None:
        """Generate the current template based on mode and shape."""
        self.template.fill((255, 255, 255))

        center_x = self.settings.screen_width // 2
        center_y = self.settings.screen_height // 2

        shape_name = self.templates[self.current_template]

        if self.mode == ActivityMode.COLORING:
            self._draw_coloring_template(shape_name, center_x, center_y)
        elif self.mode == ActivityMode.TRACING:
            self._draw_tracing_template(shape_name, center_x, center_y)
        else:
            self._draw_dot_to_dot_template(shape_name, center_x, center_y)

    def _draw_coloring_template(self, shape: str, cx: int, cy: int) -> None:
        """Draw a solid outline for coloring."""
        if shape == "circle":
            pygame.draw.circle(self.template, (0, 0, 0), (cx, cy), 150, 4)
        elif shape == "square":
            rect = pygame.Rect(0, 0, 300, 300)
            rect.center = (cx, cy)
            pygame.draw.rect(self.template, (0, 0, 0), rect, 4)
        elif shape == "triangle":
            points = [
                (cx, cy - 150),
                (cx - 130, cy + 75),
                (cx + 130, cy + 75)
            ]
            pygame.draw.polygon(self.template, (0, 0, 0), points, 4)
        elif shape == "star":
            self._draw_star_outline(self.template, cx, cy, 150, 5, (0, 0, 0), 4)
        elif shape == "heart":
            self._draw_heart_outline(self.template, cx, cy, 100, (0, 0, 0), 4)
        elif shape == "flower":
            self._draw_flower_outline(self.template, cx, cy, 80, (0, 0, 0), 4)
        elif shape == "sun":
            self._draw_sun_outline(self.template, cx, cy, 100, (0, 0, 0), 4)
        elif shape == "moon":
            self._draw_moon_outline(self.template, cx, cy, 120, (0, 0, 0), 4)
        elif shape == "house":
            self._draw_house_outline(self.template, cx, cy, 200, (0, 0, 0), 4)
        elif shape == "tree":
            self._draw_tree_outline(self.template, cx, cy, 150, (0, 0, 0), 4)
        elif shape == "car":
            self._draw_car_outline(self.template, cx, cy, 180, (0, 0, 0), 4)
        elif shape == "fish":
            self._draw_fish_outline(self.template, cx, cy, 150, (0, 0, 0), 4)
        elif shape == "butterfly":
            self._draw_butterfly_outline(self.template, cx, cy, 120, (0, 0, 0), 4)
        elif shape == "balloon":
            self._draw_balloon_outline(self.template, cx, cy, 100, (0, 0, 0), 4)
        elif shape == "apple":
            self._draw_apple_outline(self.template, cx, cy, 100, (0, 0, 0), 4)
        elif shape == "cloud":
            self._draw_cloud_outline(self.template, cx, cy, 120, (0, 0, 0), 4)

    def _draw_tracing_template(self, shape: str, cx: int, cy: int) -> None:
        """Draw a dotted outline for tracing."""
        if shape == "circle":
            self._draw_dotted_circle(self.template, cx, cy, 150, (100, 100, 100))
        elif shape == "square":
            self._draw_dotted_rect(self.template, cx, cy, 300, 300, (100, 100, 100))
        elif shape == "triangle":
            points = [
                (cx, cy - 150),
                (cx - 130, cy + 75),
                (cx + 130, cy + 75),
                (cx, cy - 150)
            ]
            self._draw_dotted_polygon(self.template, points, (100, 100, 100))
        elif shape == "star":
            self._draw_star_outline(self.template, cx, cy, 150, 5, (100, 100, 100), 2)
        elif shape == "heart":
            self._draw_heart_outline(self.template, cx, cy, 100, (100, 100, 100), 2)
        elif shape == "flower":
            self._draw_flower_outline(self.template, cx, cy, 80, (100, 100, 100), 2)
        elif shape == "sun":
            self._draw_sun_outline(self.template, cx, cy, 100, (100, 100, 100), 2)
        elif shape == "moon":
            self._draw_moon_outline(self.template, cx, cy, 120, (100, 100, 100), 2)
        elif shape == "house":
            self._draw_house_outline(self.template, cx, cy, 200, (100, 100, 100), 2)
        elif shape == "tree":
            self._draw_tree_outline(self.template, cx, cy, 150, (100, 100, 100), 2)
        elif shape == "car":
            self._draw_car_outline(self.template, cx, cy, 180, (100, 100, 100), 2)
        elif shape == "fish":
            self._draw_fish_outline(self.template, cx, cy, 150, (100, 100, 100), 2)
        elif shape == "butterfly":
            self._draw_butterfly_outline(self.template, cx, cy, 120, (100, 100, 100), 2)
        elif shape == "balloon":
            self._draw_balloon_outline(self.template, cx, cy, 100, (100, 100, 100), 2)
        elif shape == "apple":
            self._draw_apple_outline(self.template, cx, cy, 100, (100, 100, 100), 2)
        elif shape == "cloud":
            self._draw_cloud_outline(self.template, cx, cy, 120, (100, 100, 100), 2)

    def _draw_dot_to_dot_template(self, shape: str, cx: int, cy: int) -> None:
        """Draw numbered dots for connecting."""
        points = []

        if shape == "circle":
            num_points = 12
            for i in range(num_points):
                angle = (i / num_points) * 2 * math.pi
                x = cx + int(150 * math.cos(angle))
                y = cy + int(150 * math.sin(angle))
                points.append((x, y))
        elif shape == "square":
            points = [
                (cx - 150, cy - 150), (cx - 75, cy - 150), (cx, cy - 150), (cx + 75, cy - 150), (cx + 150, cy - 150),
                (cx + 150, cy - 75), (cx + 150, cy), (cx + 150, cy + 75), (cx + 150, cy + 150),
                (cx + 75, cy + 150), (cx, cy + 150), (cx - 75, cy + 150), (cx - 150, cy + 150),
                (cx - 150, cy + 75), (cx - 150, cy), (cx - 150, cy - 75)
            ]
        elif shape == "triangle":
            points = [
                (cx, cy - 150),
                (cx - 65, cy - 75),
                (cx - 130, cy),
                (cx - 130, cy + 75),
                (cx - 65, cy + 75),
                (cx, cy + 75),
                (cx + 65, cy + 75),
                (cx + 130, cy + 75),
                (cx + 130, cy),
                (cx + 65, cy - 75)
            ]
        elif shape == "star":
            num_points = 10
            for i in range(num_points):
                angle = (i / num_points) * 2 * math.pi - math.pi / 2
                r = 150 if i % 2 == 0 else 75
                x = cx + int(r * math.cos(angle))
                y = cy + int(r * math.sin(angle))
                points.append((x, y))
        elif shape == "heart":
            # Simplified heart with key points
            points = [
                (cx, cy - 50),
                (cx - 40, cy - 80),
                (cx - 70, cy - 80),
                (cx - 90, cy - 60),
                (cx - 90, cy - 30),
                (cx - 70, cy - 10),
                (cx - 40, cy + 20),
                (cx, cy + 60),
                (cx + 40, cy + 20),
                (cx + 70, cy - 10),
                (cx + 90, cy - 30),
                (cx + 90, cy - 60),
                (cx + 70, cy - 80),
                (cx + 40, cy - 80)
            ]
        else:
            # Default to circular pattern for other shapes
            num_points = 12
            for i in range(num_points):
                angle = (i / num_points) * 2 * math.pi
                x = cx + int(150 * math.cos(angle))
                y = cy + int(150 * math.sin(angle))
                points.append((x, y))

        font = pygame.font.Font(None, 32)
        for i, (x, y) in enumerate(points):
            pygame.draw.circle(self.template, (0, 0, 0), (x, y), 8)
            text = font.render(str(i + 1), True, (255, 0, 0))
            text_rect = text.get_rect(center=(x, y - 20))
            self.template.blit(text, text_rect)

    def _draw_dotted_circle(self, surface: pygame.Surface, cx: int, cy: int, radius: int, color: Tuple[int, int, int]) -> None:
        """Draw a dotted circle."""
        num_dots = 60
        for i in range(num_dots):
            angle = (i / num_dots) * 2 * math.pi
            x = cx + int(radius * math.cos(angle))
            y = cy + int(radius * math.sin(angle))
            pygame.draw.circle(surface, color, (x, y), 3)

    def _draw_dotted_rect(self, surface: pygame.Surface, cx: int, cy: int, width: int, height: int, color: Tuple[int, int, int]) -> None:
        """Draw a dotted rectangle."""
        left = cx - width // 2
        top = cy - height // 2
        spacing = 10

        for x in range(left, left + width, spacing):
            pygame.draw.circle(surface, color, (x, top), 3)
            pygame.draw.circle(surface, color, (x, top + height), 3)

        for y in range(top, top + height, spacing):
            pygame.draw.circle(surface, color, (left, y), 3)
            pygame.draw.circle(surface, color, (left + width, y), 3)

    def _draw_dotted_polygon(self, surface: pygame.Surface, points: List[Tuple[int, int]], color: Tuple[int, int, int]) -> None:
        """Draw a dotted polygon."""
        for i in range(len(points) - 1):
            x1, y1 = points[i]
            x2, y2 = points[i + 1]
            dist = math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2)
            num_dots = max(int(dist / 10), 2)
            for j in range(num_dots):
                t = j / num_dots
                x = int(x1 + (x2 - x1) * t)
                y = int(y1 + (y2 - y1) * t)
                pygame.draw.circle(surface, color, (x, y), 3)

    def _draw_star_outline(self, surface: pygame.Surface, cx: int, cy: int, radius: int, points: int, color: Tuple[int, int, int], width: int) -> None:
        """Draw a star outline."""
        star_points = []
        for i in range(points * 2):
            angle = (i / (points * 2)) * 2 * math.pi - math.pi / 2
            r = radius if i % 2 == 0 else radius // 2
            x = cx + int(r * math.cos(angle))
            y = cy + int(r * math.sin(angle))
            star_points.append((x, y))

        if len(star_points) >= 3:
            pygame.draw.polygon(surface, color, star_points, width)

    def _draw_heart_outline(self, surface: pygame.Surface, cx: int, cy: int, size: int, color: Tuple[int, int, int], width: int) -> None:
        """Draw a heart outline."""
        points = []
        for i in range(100):
            t = (i / 100) * 2 * math.pi
            x = cx + int(size * (16 * math.sin(t) ** 3) / 16)
            y = cy - int(size * (13 * math.cos(t) - 5 * math.cos(2*t) - 2 * math.cos(3*t) - math.cos(4*t)) / 16)
            points.append((x, y))

        if len(points) >= 3:
            pygame.draw.polygon(surface, color, points, width)

    def _draw_flower_outline(self, surface: pygame.Surface, cx: int, cy: int, size: int, color: Tuple[int, int, int], width: int) -> None:
        """Draw a simple flower with 5 petals."""
        # Draw center circle
        pygame.draw.circle(surface, color, (cx, cy), size // 4, width)

        # Draw 5 petals
        for i in range(5):
            angle = (i / 5) * 2 * math.pi - math.pi / 2
            petal_x = cx + int(size * 0.6 * math.cos(angle))
            petal_y = cy + int(size * 0.6 * math.sin(angle))
            pygame.draw.circle(surface, color, (petal_x, petal_y), size // 3, width)

    def _draw_sun_outline(self, surface: pygame.Surface, cx: int, cy: int, size: int, color: Tuple[int, int, int], width: int) -> None:
        """Draw a sun with rays."""
        # Draw center circle
        pygame.draw.circle(surface, color, (cx, cy), size // 2, width)

        # Draw 8 rays
        for i in range(8):
            angle = (i / 8) * 2 * math.pi
            start_x = cx + int(size * 0.6 * math.cos(angle))
            start_y = cy + int(size * 0.6 * math.sin(angle))
            end_x = cx + int(size * 1.2 * math.cos(angle))
            end_y = cy + int(size * 1.2 * math.sin(angle))
            pygame.draw.line(surface, color, (start_x, start_y), (end_x, end_y), width)

    def _draw_moon_outline(self, surface: pygame.Surface, cx: int, cy: int, size: int, color: Tuple[int, int, int], width: int) -> None:
        """Draw a crescent moon."""
        points = []
        # Outer arc (right side of moon)
        for i in range(50):
            t = (i / 50) * math.pi - math.pi / 2
            x = cx + int(size * math.cos(t))
            y = cy + int(size * math.sin(t))
            points.append((x, y))

        # Inner arc (left side, creating crescent)
        for i in range(50, 0, -1):
            t = (i / 50) * math.pi - math.pi / 2
            x = cx + int(size * 0.6 * math.cos(t)) - size // 4
            y = cy + int(size * 0.6 * math.sin(t))
            points.append((x, y))

        if len(points) >= 3:
            pygame.draw.polygon(surface, color, points, width)

    def _draw_house_outline(self, surface: pygame.Surface, cx: int, cy: int, size: int, color: Tuple[int, int, int], width: int) -> None:
        """Draw a simple house."""
        # Draw house base (square)
        base_rect = pygame.Rect(0, 0, size, size)
        base_rect.center = (cx, cy + size // 4)
        pygame.draw.rect(surface, color, base_rect, width)

        # Draw roof (triangle)
        roof_points = [
            (cx, cy - size // 2),
            (cx - size // 2, cy + size // 4 - size // 2),
            (cx + size // 2, cy + size // 4 - size // 2)
        ]
        pygame.draw.polygon(surface, color, roof_points, width)

        # Draw door
        door_rect = pygame.Rect(0, 0, size // 3, size // 2)
        door_rect.center = (cx, cy + size // 2)
        pygame.draw.rect(surface, color, door_rect, width)

    def _draw_tree_outline(self, surface: pygame.Surface, cx: int, cy: int, size: int, color: Tuple[int, int, int], width: int) -> None:
        """Draw a simple tree."""
        # Draw trunk (rectangle)
        trunk_rect = pygame.Rect(0, 0, size // 4, size // 2)
        trunk_rect.center = (cx, cy + size // 3)
        pygame.draw.rect(surface, color, trunk_rect, width)

        # Draw foliage (circle)
        pygame.draw.circle(surface, color, (cx, cy - size // 4), size // 2, width)

    def _draw_car_outline(self, surface: pygame.Surface, cx: int, cy: int, size: int, color: Tuple[int, int, int], width: int) -> None:
        """Draw a simple car."""
        # Draw car body (rectangle)
        body_rect = pygame.Rect(0, 0, size, size // 2)
        body_rect.center = (cx, cy)
        pygame.draw.rect(surface, color, body_rect, width)

        # Draw cabin (smaller rectangle on top)
        cabin_rect = pygame.Rect(0, 0, size // 2, size // 3)
        cabin_rect.center = (cx, cy - size // 3)
        pygame.draw.rect(surface, color, cabin_rect, width)

        # Draw wheels (circles)
        wheel_radius = size // 6
        pygame.draw.circle(surface, color, (cx - size // 3, cy + size // 4), wheel_radius, width)
        pygame.draw.circle(surface, color, (cx + size // 3, cy + size // 4), wheel_radius, width)

    def _draw_fish_outline(self, surface: pygame.Surface, cx: int, cy: int, size: int, color: Tuple[int, int, int], width: int) -> None:
        """Draw a simple fish."""
        # Draw body (oval)
        body_rect = pygame.Rect(0, 0, size, size // 2)
        body_rect.center = (cx - size // 6, cy)
        pygame.draw.ellipse(surface, color, body_rect, width)

        # Draw tail (triangle)
        tail_points = [
            (cx + size // 3, cy),
            (cx + size // 2, cy - size // 3),
            (cx + size // 2, cy + size // 3)
        ]
        pygame.draw.polygon(surface, color, tail_points, width)

        # Draw eye (small circle)
        pygame.draw.circle(surface, color, (cx - size // 3, cy - size // 8), size // 12, width)

    def _draw_butterfly_outline(self, surface: pygame.Surface, cx: int, cy: int, size: int, color: Tuple[int, int, int], width: int) -> None:
        """Draw a simple butterfly."""
        # Draw body (vertical line)
        pygame.draw.line(surface, color, (cx, cy - size // 2), (cx, cy + size // 2), width)

        # Draw upper wings
        pygame.draw.circle(surface, color, (cx - size // 3, cy - size // 4), size // 3, width)
        pygame.draw.circle(surface, color, (cx + size // 3, cy - size // 4), size // 3, width)

        # Draw lower wings
        pygame.draw.circle(surface, color, (cx - size // 3, cy + size // 4), size // 4, width)
        pygame.draw.circle(surface, color, (cx + size // 3, cy + size // 4), size // 4, width)

    def _draw_balloon_outline(self, surface: pygame.Surface, cx: int, cy: int, size: int, color: Tuple[int, int, int], width: int) -> None:
        """Draw a balloon with string."""
        # Draw balloon (circle)
        pygame.draw.circle(surface, color, (cx, cy - size // 3), size, width)

        # Draw string (curved line)
        string_points = [
            (cx, cy + size * 2 // 3),
            (cx - size // 4, cy + size),
            (cx, cy + size * 4 // 3)
        ]
        for i in range(len(string_points) - 1):
            pygame.draw.line(surface, color, string_points[i], string_points[i + 1], width)

    def _draw_apple_outline(self, surface: pygame.Surface, cx: int, cy: int, size: int, color: Tuple[int, int, int], width: int) -> None:
        """Draw a simple apple."""
        # Draw apple body (circle)
        pygame.draw.circle(surface, color, (cx, cy + size // 6), size, width)

        # Draw stem (small line)
        pygame.draw.line(surface, color, (cx, cy - size * 5 // 6), (cx, cy - size // 2), width + 2)

        # Draw leaf (small oval)
        leaf_rect = pygame.Rect(0, 0, size // 3, size // 6)
        leaf_rect.center = (cx + size // 4, cy - size * 2 // 3)
        pygame.draw.ellipse(surface, color, leaf_rect, width)

    def _draw_cloud_outline(self, surface: pygame.Surface, cx: int, cy: int, size: int, color: Tuple[int, int, int], width: int) -> None:
        """Draw a simple cloud."""
        # Draw multiple overlapping circles to form a cloud
        pygame.draw.circle(surface, color, (cx - size // 2, cy), size // 2, width)
        pygame.draw.circle(surface, color, (cx, cy - size // 4), size // 2, width)
        pygame.draw.circle(surface, color, (cx + size // 2, cy), size // 2, width)
        pygame.draw.circle(surface, color, (cx - size // 4, cy + size // 4), size // 3, width)
        pygame.draw.circle(surface, color, (cx + size // 4, cy + size // 4), size // 3, width)

    def handle_event(self, event: pygame.event.Event) -> None:
        """Handle pygame events."""
        self.back_button.handle_event(event)
        self.coloring_button.handle_event(event)
        self.tracing_button.handle_event(event)
        self.dot_button.handle_event(event)
        self.prev_button.handle_event(event)
        self.next_button.handle_event(event)

        for button in self.color_buttons:
            button.handle_event(event)

        if self.voice_controls:
            self.voice_controls.handle_event(event)

        if event.type == pygame.MOUSEBUTTONDOWN:
            if event.button == 1:
                self.drawing = True
                self.last_pos = event.pos

        elif event.type == pygame.MOUSEBUTTONUP:
            if event.button == 1:
                self.drawing = False
                self.last_pos = None

        elif event.type == pygame.MOUSEMOTION:
            if self.drawing and self.last_pos:
                pygame.draw.line(
                    self.canvas,
                    self.current_color,
                    self.last_pos,
                    event.pos,
                    self.current_brush_size,
                )
                pygame.draw.circle(
                    self.canvas, self.current_color, event.pos, self.current_brush_size // 2
                )
                self.last_pos = event.pos

                # Award stars for drawing engagement
                self.stroke_count += 1
                if self.stroke_count % 50 == 0:  # Award star every 50 strokes
                    star_awarded, level_up = self.progress_manager.award_star("coloring")
                    if star_awarded:
                        target_x, target_y = self.star_display.get_position()
                        self.celebration.show_star_animation(target_x, target_y)
                        self.star_display.set_star_count(self.progress_manager.total_stars, animate=True)
                        if level_up:
                            self.celebration.show_level_up(self.progress_manager.current_level)

    def update(self) -> None:
        """Update activity state."""
        # Update gamification animations
        self.celebration.update()
        self.star_display.update()

    def draw(self) -> None:
        """Draw the activity."""
        if self.first_draw and self.voice_controls:
            self.voice_controls.speak("Welcome to coloring! Choose a mode and start creating")
            self.first_draw = False

        self.screen.fill((255, 255, 255))
        self.screen.blit(self.template, (0, 0))
        self.screen.blit(self.canvas, (0, 0))

        self.back_button.draw(self.screen)
        self.coloring_button.draw(self.screen)
        self.tracing_button.draw(self.screen)
        self.dot_button.draw(self.screen)
        self.prev_button.draw(self.screen)
        self.next_button.draw(self.screen)

        for button in self.color_buttons:
            button.draw(self.screen)

        if self.voice_controls:
            self.voice_controls.draw(self.screen)

        # Draw mode heading at top (y=100)
        heading_font = pygame.font.Font(None, 48)
        mode_text = f"Mode: {self.mode.value.replace('_', ' ').title()}"
        text_surface = heading_font.render(mode_text, True, self.settings.colors["text"])
        text_rect = text_surface.get_rect(center=(self.settings.screen_width // 2, 100))
        self.screen.blit(text_surface, text_rect)

        # Draw template counter below mode heading
        counter_font = pygame.font.Font(None, 36)
        counter_text = f"{self.current_template + 1} / {len(self.templates)}"
        counter_surface = counter_font.render(counter_text, True, (100, 100, 100))
        counter_rect = counter_surface.get_rect(center=(self.settings.screen_width // 2, 140))
        self.screen.blit(counter_surface, counter_rect)

        # Draw gamification elements
        self.star_display.draw(self.screen)
        self.celebration.draw(self.screen)
        # Draw tooltips on top
        self.back_button.draw_tooltip(self.screen)
        self.coloring_button.draw_tooltip(self.screen)
        self.tracing_button.draw_tooltip(self.screen)
        self.dot_button.draw_tooltip(self.screen)
        self.prev_button.draw_tooltip(self.screen)
        self.next_button.draw_tooltip(self.screen)
        for button in self.color_buttons:
            button.draw_tooltip(self.screen)
        if self.voice_controls:
            self.voice_controls.mute_button.draw_tooltip(self.screen)
            self.voice_controls.repeat_button.draw_tooltip(self.screen)
