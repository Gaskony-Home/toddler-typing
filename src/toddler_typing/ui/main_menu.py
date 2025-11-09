"""
Main menu interface.

This module provides the main menu where children can select
different activities.
"""

import pygame
from typing import List, Callable, Optional

from .button import Button
from ..config.settings import Settings
from ..audio.voice_manager import VoiceManager
from ..config.fonts import get_font_manager


class MainMenu:
    """Main menu screen with activity selection."""

    def __init__(
        self, screen: pygame.Surface, settings: Settings, switch_state: Callable, voice_manager: Optional[VoiceManager] = None
    ) -> None:
        """
        Initialize the main menu.

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
        self.buttons: List[Button] = []

        # Title font
        self.title_font = get_font_manager().get_font(120, bold=True)
        self.title_text = "Let's Play!"
        self.title_color = self.settings.colors["primary"]

        # Dark mode toggle button
        self.dark_mode_button: Optional[Button] = None

        # Create menu buttons
        self._create_buttons()
        self._create_dark_mode_button()

    def _create_buttons(self) -> None:
        """Create menu buttons for different activities."""
        button_width = 350
        button_height = 100
        button_spacing = 30

        # Calculate starting Y position below title with proper spacing
        title_height = 120  # Approximate height for title and spacing
        total_buttons = 4
        total_height = (button_height * total_buttons) + (button_spacing * (total_buttons - 1))
        
        # Start buttons below title, centered in remaining space
        remaining_height = self.settings.screen_height - title_height
        start_y = title_height + (remaining_height - total_height) // 2
        
        # Ensure minimum spacing from top (in case of small screens)
        start_y = max(start_y, title_height + 20)

        # Center X position
        center_x = self.settings.screen_width // 2 - button_width // 2

        # Define buttons with tooltips and icons
        button_configs = [
            ("Letters & Numbers", self.settings.colors["primary"], self._start_letters_numbers, "Learn letters and numbers by pressing keys", "letters"),
            ("Drawing", self.settings.colors["success"], self._start_drawing, "Free drawing with colors and brushes", "pencil"),
            ("Colors & Shapes", self.settings.colors["secondary"], self._start_colors_shapes, "Click the correct colored shape", "shapes"),
            ("Coloring & Tracing", self.settings.colors["primary"], self._start_coloring, "Color, trace, and connect dots", "palette"),
        ]

        for i, (text, color, callback, tooltip, icon) in enumerate(button_configs):
            y_pos = start_y + i * (button_height + button_spacing)
            button = Button(
                center_x,
                y_pos,
                button_width,
                button_height,
                text,
                color,
                on_click=callback,
                tooltip=tooltip,
                icon=icon,
            )
            self.buttons.append(button)

    def _create_dark_mode_button(self) -> None:
        """Create dark mode toggle button in top-right area."""
        button_width = 120
        button_height = 80
        # Position with 20px margin from right edge
        x_pos = self.settings.screen_width - button_width - 20
        y_pos = 20

        # Determine initial button text based on current mode
        button_text = "Dark" if not self.settings.dark_mode else "Light"
        # Determine initial icon based on current mode
        button_icon = "sun" if not self.settings.dark_mode else "moon"

        self.dark_mode_button = Button(
            x_pos,
            y_pos,
            button_width,
            button_height,
            button_text,
            self.settings.colors["secondary"],
            on_click=self._toggle_dark_mode,
            tooltip="Toggle between light and dark mode",
            font_size=36,
            icon=button_icon,
        )

    def _toggle_dark_mode(self) -> None:
        """Toggle dark mode and update button appearance."""
        self.settings.toggle_dark_mode()

        # Update button text
        button_text = "Dark" if not self.settings.dark_mode else "Light"
        self.dark_mode_button.text = button_text

        # Update button icon
        button_icon = "sun" if not self.settings.dark_mode else "moon"
        self.dark_mode_button.icon = button_icon

        # Update button color
        self.dark_mode_button.color = self.settings.colors["secondary"]

        # Update title color
        self.title_color = self.settings.colors["primary"]

        # Save the settings to persist dark mode preference
        self.settings.save_config()

    def _start_letters_numbers(self) -> None:
        """Start the letters and numbers learning activity."""
        from ..main import AppState

        self.switch_state(AppState.LETTERS_NUMBERS)

    def _start_drawing(self) -> None:
        """Start the drawing activity."""
        from ..main import AppState

        self.switch_state(AppState.DRAWING)

    def _start_colors_shapes(self) -> None:
        """Start the colors and shapes activity."""
        from ..main import AppState

        self.switch_state(AppState.COLORS_SHAPES)

    def _start_coloring(self) -> None:
        """Start the coloring activity."""
        from ..main import AppState

        self.switch_state(AppState.COLORING)

    def handle_event(self, event: pygame.event.Event) -> None:
        """
        Handle pygame events.

        Args:
            event: The pygame event to handle.
        """
        for button in self.buttons:
            button.handle_event(event)

        # Handle dark mode button events
        if self.dark_mode_button:
            self.dark_mode_button.handle_event(event)

    def update(self) -> None:
        """Update menu state (for animations, etc.)."""
        pass

    def draw(self) -> None:
        """Draw the main menu."""
        # Clear screen with background color
        self.screen.fill(self.settings.colors["background"])

        # Draw title
        title_y = 60  # Consistent title position
        title_surface = self.title_font.render(self.title_text, True, self.title_color)
        title_rect = title_surface.get_rect(center=(self.settings.screen_width // 2, title_y))

        # Add shadow effect to title
        shadow_surface = self.title_font.render(self.title_text, True, (0, 0, 0))
        shadow_rect = shadow_surface.get_rect(
            center=(self.settings.screen_width // 2 + 4, title_y + 4)
        )
        self.screen.blit(shadow_surface, shadow_rect)
        self.screen.blit(title_surface, title_rect)

        # Draw buttons
        for button in self.buttons:
            button.draw(self.screen)

        # Draw dark mode toggle button
        if self.dark_mode_button:
            self.dark_mode_button.draw(self.screen)

        # Draw tooltips on top of all buttons
        for button in self.buttons:
            button.draw_tooltip(self.screen)
        if self.dark_mode_button:
            self.dark_mode_button.draw_tooltip(self.screen)
