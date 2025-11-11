"""
Main menu interface.

This module provides the main menu where children can select
different activities.
"""

import pygame
from typing import List, Callable, Optional

from .button import Button
from .activity_card import ActivityCard
from ..config.settings import Settings
from ..audio.voice_manager import VoiceManager
from ..config.fonts import get_font_manager

# Import version
try:
    from ..__version__ import __version__
except ImportError:
    __version__ = "dev"


class MainMenu:
    """Main menu screen with activity selection."""

    def __init__(
        self, screen: pygame.Surface, settings: Settings, switch_state: Callable, voice_manager: Optional[VoiceManager] = None, toggle_fullscreen: Optional[Callable] = None
    ) -> None:
        """
        Initialize the main menu.

        Args:
            screen: The pygame surface to draw on.
            settings: Application settings.
            switch_state: Callback function to switch application state.
            voice_manager: Optional voice manager for text-to-speech.
            toggle_fullscreen: Optional callback to toggle fullscreen mode.
        """
        self.screen = screen
        self.settings = settings
        self.switch_state = switch_state
        self.voice_manager = voice_manager
        self.toggle_fullscreen_callback = toggle_fullscreen
        self.cards: List[ActivityCard] = []

        # Title font - larger and more playful
        self.title_font = get_font_manager().get_font(140, bold=True)
        self.title_text = "Let's Play!"
        self.title_color = self.settings.colors["primary"]

        # Version display font - smaller and more subtle
        self.version_font = get_font_manager().get_font(18)
        self.version_text = f"v{__version__}"

        # Dark mode toggle button
        self.dark_mode_button: Optional[Button] = None

        # Fullscreen toggle button
        self.fullscreen_button: Optional[Button] = None

        # Create menu cards
        self._create_cards()
        self._create_dark_mode_button()
        self._create_fullscreen_button()

    def _create_cards(self) -> None:
        """Create visual activity cards in a grid layout."""
        # Calculate card dimensions for a 2x2 grid
        title_height = 180  # Space for title at top
        bottom_margin = 50  # Space at bottom

        # Available space for cards
        available_height = self.settings.screen_height - title_height - bottom_margin
        available_width = self.settings.screen_width - 100  # 50px margin on each side

        # Grid configuration
        cols = 2
        rows = 2
        card_spacing = 50  # More comfortable spacing

        # Calculate card size
        card_width = (available_width - (card_spacing * (cols - 1))) // cols
        card_height = (available_height - (card_spacing * (rows - 1))) // rows

        # Make cards square-ish (use the smaller dimension)
        card_size = min(card_width, card_height)
        card_width = card_size
        card_height = card_size

        # Calculate starting position to center the grid
        total_grid_width = (card_width * cols) + (card_spacing * (cols - 1))
        total_grid_height = (card_height * rows) + (card_spacing * (rows - 1))

        start_x = (self.settings.screen_width - total_grid_width) // 2
        start_y = title_height + (available_height - total_grid_height) // 2

        # Define activity cards
        card_configs = [
            ("Letters & Numbers", self.settings.colors["primary"], self._start_letters_numbers, "letters"),
            ("Drawing", self.settings.colors["success"], self._start_drawing, "pencil"),
            ("Colors & Shapes", self.settings.colors["secondary"], self._start_colors_shapes, "shapes"),
            ("Coloring", self.settings.colors["info"], self._start_coloring, "palette"),
        ]

        # Create cards in grid
        for i, (title, color, callback, icon) in enumerate(card_configs):
            row = i // cols
            col = i % cols

            x_pos = start_x + col * (card_width + card_spacing)
            y_pos = start_y + row * (card_height + card_spacing)

            card = ActivityCard(
                x_pos,
                y_pos,
                card_width,
                card_height,
                title,
                color,
                icon,
                on_click=callback,
                base_color=self.settings.colors["surface"],
            )
            self.cards.append(card)

    def _create_dark_mode_button(self) -> None:
        """Create modern circular dark mode toggle."""
        button_size = 60
        x_pos = self.settings.screen_width - button_size - 20
        y_pos = 20

        button_icon = "sun" if not self.settings.dark_mode else "moon"

        self.dark_mode_button = Button(
            x_pos,
            y_pos,
            button_size,
            button_size,
            "",  # No text - icon only
            self.settings.colors["surface"],  # White/surface background
            on_click=self._toggle_dark_mode,
            tooltip="Toggle between light and dark mode",
            font_size=32,
            icon=button_icon,
            text_color=self.settings.colors["primary"]  # Icon color
        )

    def _create_fullscreen_button(self) -> None:
        """Create modern circular fullscreen toggle."""
        if not self.toggle_fullscreen_callback:
            return

        button_size = 60
        x_pos = 20
        y_pos = 20

        button_icon = "minimize" if self.settings.fullscreen else "fullscreen"

        self.fullscreen_button = Button(
            x_pos,
            y_pos,
            button_size,
            button_size,
            "",  # No text - icon only
            self.settings.colors["surface"],  # White/surface background
            on_click=self._toggle_fullscreen,
            tooltip="Toggle fullscreen mode",
            font_size=32,
            icon=button_icon,
            text_color=self.settings.colors["primary"]  # Icon color
        )

    def _toggle_dark_mode(self) -> None:
        """Toggle dark mode and update button appearance."""
        self.settings.toggle_dark_mode()

        # Update button icon
        button_icon = "sun" if not self.settings.dark_mode else "moon"
        self.dark_mode_button.icon = button_icon

        # Update button colors to maintain surface background
        self.dark_mode_button.color = self.settings.colors["surface"]
        self.dark_mode_button.text_color = self.settings.colors["primary"]

        # Update fullscreen button colors if it exists
        if self.fullscreen_button:
            self.fullscreen_button.color = self.settings.colors["surface"]
            self.fullscreen_button.text_color = self.settings.colors["primary"]

        # Update title color
        self.title_color = self.settings.colors["primary"]

        # Update all cards with new base color
        for card in self.cards:
            card.base_color = self.settings.colors["surface"]

        # Save the settings to persist dark mode preference
        self.settings.save_config()

    def _toggle_fullscreen(self) -> None:
        """Toggle fullscreen mode and update button appearance."""
        if not self.toggle_fullscreen_callback:
            return

        # Call the toggle fullscreen callback
        self.toggle_fullscreen_callback()

        # Update button icon based on new fullscreen state
        button_icon = "minimize" if self.settings.fullscreen else "fullscreen"
        self.fullscreen_button.icon = button_icon

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
        for card in self.cards:
            card.handle_event(event)

        # Handle dark mode button events
        if self.dark_mode_button:
            self.dark_mode_button.handle_event(event)

        # Handle fullscreen button events
        if self.fullscreen_button:
            self.fullscreen_button.handle_event(event)

    def update(self) -> None:
        """Update menu state (for animations, etc.)."""
        # Update all cards for smooth animations
        for card in self.cards:
            card.update()

    def _draw_gradient_background(self) -> None:
        """Draw smooth gradient background."""
        start_color = self.settings.colors.get("bg_gradient_start", self.settings.colors["background"])
        end_color = self.settings.colors.get("bg_gradient_end", self.settings.colors["background"])

        # Create vertical gradient
        for y in range(self.settings.screen_height):
            # Calculate blend ratio
            ratio = y / self.settings.screen_height
            color = tuple(int(start_color[i] * (1 - ratio) + end_color[i] * ratio) for i in range(3))
            pygame.draw.line(self.screen, color, (0, y), (self.settings.screen_width, y))

    def draw(self) -> None:
        """Draw the main menu."""
        # Draw gradient background
        self._draw_gradient_background()

        # Draw title with more top padding and improved shadow
        title_y = 90  # More top padding for breathing room
        title_surface = self.title_font.render(self.title_text, True, self.title_color)
        title_rect = title_surface.get_rect(center=(self.settings.screen_width // 2, title_y))

        # Add softer, colored shadow effect to title
        shadow_color = self.settings.colors.get("shadow", (100, 100, 100, 128))
        if len(shadow_color) == 3:  # Ensure we have RGB, add some transparency
            shadow_color = shadow_color + (128,)
        shadow_surface = self.title_font.render(self.title_text, True, shadow_color[:3])
        shadow_rect = shadow_surface.get_rect(
            center=(self.settings.screen_width // 2 + 3, title_y + 3)
        )
        self.screen.blit(shadow_surface, shadow_rect)
        self.screen.blit(title_surface, title_rect)

        # Draw activity cards
        for card in self.cards:
            card.draw(self.screen)

        # Draw dark mode toggle button
        if self.dark_mode_button:
            self.dark_mode_button.draw(self.screen)

        # Draw fullscreen toggle button
        if self.fullscreen_button:
            self.fullscreen_button.draw(self.screen)

        # Draw version number in bottom-right corner (subtle and professional)
        version_surface = self.version_font.render(
            self.version_text,
            True,
            self.settings.colors.get("text_light", self.settings.colors["text_secondary"])
        )
        version_rect = version_surface.get_rect(
            bottomright=(self.settings.screen_width - 10, self.settings.screen_height - 10)
        )
        self.screen.blit(version_surface, version_rect)

        # Draw button tooltips
        if self.dark_mode_button:
            self.dark_mode_button.draw_tooltip(self.screen)

        if self.fullscreen_button:
            self.fullscreen_button.draw_tooltip(self.screen)
