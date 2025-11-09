"""
Colors and shapes learning activity.

This module provides an interactive activity for learning colors and shapes.
"""

import pygame
import random
from typing import Tuple, List, Callable, Optional

from ..config.settings import Settings
from ..ui.button import Button
from ..ui.voice_controls import VoiceControls
from ..audio.voice_manager import VoiceManager
from ..gamification import ProgressManager, Celebration, StarDisplay
from ..config.fonts import get_font_manager


class ShapeOption:
    """Represents a clickable shape option with color, shape type, and position."""

    def __init__(self, color_name: str, color_rgb: Tuple[int, int, int], shape: str, rect: pygame.Rect):
        """
        Initialize a shape option.

        Args:
            color_name: Name of the color (e.g., "red", "blue").
            color_rgb: RGB tuple for the color.
            shape: Type of shape (e.g., "circle", "square").
            rect: Rectangle defining the shape's bounding box.
        """
        self.color_name = color_name
        self.color_rgb = color_rgb
        self.shape = shape
        self.rect = rect


class ColorsShapesActivity:
    """Interactive colors and shapes learning activity."""

    def __init__(
        self, screen: pygame.Surface, settings: Settings, switch_state: Callable, voice_manager: Optional[VoiceManager] = None
    ) -> None:
        """
        Initialize the colors and shapes activity.

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
        self.font = pygame.font.Font(None, 72)

        # Define available shapes and colors
        self.all_shapes = ["circle", "square", "triangle", "star"]
        self.all_colors = {
            "red": (255, 0, 0),
            "blue": (0, 0, 255),
            "green": (0, 255, 0),
            "yellow": (255, 255, 0),
            "purple": (128, 0, 128),
            "orange": (255, 165, 0),
        }

        # Grid configuration (2 rows x 3 columns)
        self.grid_rows = 2
        self.grid_cols = 3
        self.shape_size = 120  # Size for drawing shapes

        # Game state
        self.shape_options: List[ShapeOption] = []
        self.target_index: int = 0
        self.success_flash: int = 0  # Frame counter for green flash effect

        # Back button
        self.back_button = Button(
            20, 20, 150, 60, "Back", (100, 100, 100), on_click=self._go_back,
            tooltip="Return to main menu"
        )

        # Voice controls
        self.voice_controls: Optional[VoiceControls] = None
        if self.voice_manager:
            self.voice_controls = VoiceControls(
                settings.screen_width,
                settings.screen_height,
                voice_manager
            )

        # Gamification components
        self.progress_manager = ProgressManager()
        self.celebration = Celebration(settings.screen_width, settings.screen_height)
        self.star_display = StarDisplay(settings.screen_width, settings.screen_height)
        self.star_display.set_star_count(self.progress_manager.total_stars)

        # Generate initial set of shapes
        self.generate_new_shapes()

    def _go_back(self) -> None:
        """Return to main menu."""
        from ..main import AppState

        self.switch_state(AppState.MENU)

    def generate_new_shapes(self) -> None:
        """Generate 6 unique colored shapes in a 2x3 grid and select a random target."""
        # Create all possible combinations
        combinations = []
        for color_name, color_rgb in self.all_colors.items():
            for shape in self.all_shapes:
                combinations.append((color_name, color_rgb, shape))

        # Randomly select 6 unique combinations
        selected = random.sample(combinations, 6)

        # Calculate grid positioning (centered on screen)
        spacing_x = 250  # Horizontal spacing between shapes
        spacing_y = 300  # Vertical spacing between shapes

        # Calculate starting position to center the grid
        grid_width = self.grid_cols * spacing_x
        grid_height = self.grid_rows * spacing_y
        start_x = (self.settings.screen_width - grid_width) // 2 + spacing_x // 2
        start_y = (self.settings.screen_height - grid_height) // 2 + spacing_y // 2 + 60  # Offset for instruction text

        # Create ShapeOption objects for each grid position
        self.shape_options = []
        for i, (color_name, color_rgb, shape) in enumerate(selected):
            row = i // self.grid_cols
            col = i % self.grid_cols

            x = start_x + col * spacing_x
            y = start_y + row * spacing_y

            # Create a rect for click detection (centered on the shape)
            rect = pygame.Rect(x - self.shape_size, y - self.shape_size,
                             self.shape_size * 2, self.shape_size * 2)

            self.shape_options.append(ShapeOption(color_name, color_rgb, shape, rect))

        # Select random target
        self.target_index = random.randint(0, 5)

        # Announce the target (interrupt any previous message)
        if self.voice_controls:
            target = self.shape_options[self.target_index]
            self.voice_controls.speak(f"Click on the {target.color_name} {target.shape}!", interrupt=True)

    def draw_shape(self, surface: pygame.Surface, shape_type: str, color: Tuple[int, int, int],
                   center_x: int, center_y: int, size: int) -> None:
        """
        Draw a shape at the specified position.

        Args:
            surface: Surface to draw on.
            shape_type: Type of shape ("circle", "square", "triangle", "star").
            color: RGB color tuple.
            center_x: X coordinate of shape center.
            center_y: Y coordinate of shape center.
            size: Size of the shape.
        """
        if shape_type == "circle":
            pygame.draw.circle(surface, color, (center_x, center_y), size)
        elif shape_type == "square":
            rect = pygame.Rect(0, 0, size * 2, size * 2)
            rect.center = (center_x, center_y)
            pygame.draw.rect(surface, color, rect)
        elif shape_type == "triangle":
            points = [
                (center_x, center_y - size),
                (center_x - size, center_y + size),
                (center_x + size, center_y + size),
            ]
            pygame.draw.polygon(surface, color, points)
        elif shape_type == "star":
            # Draw a 5-pointed star
            points = []
            for i in range(10):
                angle = i * 36 - 90  # Start from top, 36 degrees per step
                radius = size if i % 2 == 0 else size * 0.4
                x = center_x + radius * pygame.math.Vector2(1, 0).rotate(angle).x
                y = center_y + radius * pygame.math.Vector2(1, 0).rotate(angle).y
                points.append((x, y))
            pygame.draw.polygon(surface, color, points)

    def handle_event(self, event: pygame.event.Event) -> None:
        """
        Handle pygame events.

        Args:
            event: The pygame event to handle.
        """
        self.back_button.handle_event(event)
        if self.voice_controls:
            self.voice_controls.handle_event(event)

        if event.type == pygame.MOUSEBUTTONDOWN and event.button == 1:
            # Check if any shape was clicked
            for i, shape_option in enumerate(self.shape_options):
                if shape_option.rect.collidepoint(event.pos):
                    if i == self.target_index:
                        # Correct answer
                        self.success_flash = 30  # Flash for 30 frames
                        if self.voice_controls:
                            self.voice_controls.speak("Correct! Great job!")
                        
                        # Award star and check for level up
                        star_awarded, level_up = self.progress_manager.award_star("colors_shapes")
                        if star_awarded:
                            target_x, target_y = self.star_display.get_position()
                            self.celebration.show_star_animation(target_x, target_y)
                            self.star_display.set_star_count(self.progress_manager.total_stars, animate=True)
                            if level_up:
                                self.celebration.show_level_up(self.progress_manager.current_level)
                    else:
                        # Wrong answer
                        if self.voice_controls:
                            self.voice_controls.speak(
                                f"That's a {shape_option.color_name} {shape_option.shape}. Try again!"
                            )
                    break

    def update(self) -> None:
        """Update activity state."""
        # Handle success flash countdown
        if self.success_flash > 0:
            self.success_flash -= 1
            if self.success_flash == 0:
                # Flash complete, generate new shapes
                self.generate_new_shapes()
        
        # Update gamification components
        self.celebration.update()
        self.star_display.update()

    def draw(self) -> None:
        """Draw the colors and shapes activity."""
        # Apply success flash effect (green background)
        if self.success_flash > 0:
            self.screen.fill((0, 200, 0))  # Green flash
        else:
            self.screen.fill(self.settings.colors["background"])

        # Draw instruction text
        if self.target_index < len(self.shape_options):
            target = self.shape_options[self.target_index]
            instruction_text = f"Click on the {target.color_name} {target.shape}!"
            text_surface = self.font.render(instruction_text, True, self.settings.colors["text"])
            text_rect = text_surface.get_rect(center=(self.settings.screen_width // 2, 80))
            self.screen.blit(text_surface, text_rect)

        # Draw all shapes
        for shape_option in self.shape_options:
            center_x = shape_option.rect.centerx
            center_y = shape_option.rect.centery
            self.draw_shape(
                self.screen,
                shape_option.shape,
                shape_option.color_rgb,
                center_x,
                center_y,
                self.shape_size
            )

        # Draw back button
        self.back_button.draw(self.screen)

        # Draw voice controls
        if self.voice_controls:
            self.voice_controls.draw(self.screen)

        # Draw gamification elements
        self.star_display.draw(self.screen)
        self.celebration.draw(self.screen)

        # Draw tooltips on top
        self.back_button.draw_tooltip(self.screen)
        if self.voice_controls:
            self.voice_controls.mute_button.draw_tooltip(self.screen)
            self.voice_controls.repeat_button.draw_tooltip(self.screen)
