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

        # Title font
        self.title_font = get_font_manager().get_font(120, bold=True)
        self.title_text = "Let's Play!"
        self.title_color = self.settings.colors["primary"]

        # Version display font
        self.version_font = get_font_manager().get_font(24)
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
        card_spacing = 40

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
            )
            self.cards.append(card)

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

    def _create_fullscreen_button(self) -> None:
        """Create fullscreen toggle button in top-left area."""
        if not self.toggle_fullscreen_callback:
            return

        button_width = 120
        button_height = 80
        # Position with 20px margin from left edge
        x_pos = 20
        y_pos = 20

        # Determine initial icon based on current fullscreen state
        button_icon = "minimize" if self.settings.fullscreen else "fullscreen"

        self.fullscreen_button = Button(
            x_pos,
            y_pos,
            button_width,
            button_height,
            "",  # No text, just icon
            self.settings.colors["primary"],
            on_click=self._toggle_fullscreen,
            tooltip="Toggle fullscreen mode",
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

        # Update fullscreen button color if it exists
        if self.fullscreen_button:
            self.fullscreen_button.color = self.settings.colors["primary"]

        # Update title color
        self.title_color = self.settings.colors["primary"]

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
        pass

    def draw(self) -> None:
        """Draw the main menu."""
        # Clear screen with background color
        self.screen.fill(self.settings.colors["background"])

        # Draw title
        title_y = 80  # Title position
        title_surface = self.title_font.render(self.title_text, True, self.title_color)
        title_rect = title_surface.get_rect(center=(self.settings.screen_width // 2, title_y))

        # Add shadow effect to title
        shadow_surface = self.title_font.render(self.title_text, True, (0, 0, 0))
        shadow_rect = shadow_surface.get_rect(
            center=(self.settings.screen_width // 2 + 4, title_y + 4)
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

        # Draw version number in bottom left
        version_surface = self.version_font.render(
            self.version_text,
            True,
            self.settings.colors["text_secondary"]
        )
        version_rect = version_surface.get_rect(
            bottomleft=(20, self.settings.screen_height - 20)
        )
        self.screen.blit(version_surface, version_rect)

        # Draw button tooltips
        if self.dark_mode_button:
            self.dark_mode_button.draw_tooltip(self.screen)

        if self.fullscreen_button:
            self.fullscreen_button.draw_tooltip(self.screen)
