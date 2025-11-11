"""
Letters and Numbers learning activity.

This module provides an interactive activity for learning letters and numbers.
"""

import pygame
import random
from typing import Callable, Optional

from ..config.settings import Settings
from ..ui.button import Button
from ..ui.voice_controls import VoiceControls
from ..audio.voice_manager import VoiceManager
from ..gamification import ProgressManager, Celebration, StarDisplay
from ..config.fonts import get_font_manager


class LettersNumbersActivity:
    """Interactive letters and numbers learning activity."""

    def __init__(
        self, screen: pygame.Surface, settings: Settings, switch_state: Callable, voice_manager: Optional[VoiceManager] = None
    ) -> None:
        """
        Initialize the letters and numbers activity.

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
        # Use font manager for crisp, anti-aliased text rendering
        self.font = get_font_manager().get_font(200, bold=True)
        self.instruction_font = get_font_manager().get_font(48)

        self.current_item: str = ""
        self.is_letter: bool = True
        self.success_flash = 0  # Frames to show success feedback
        self.first_draw = True  # Flag to speak on first draw

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

        self.next_item()

    def _go_back(self) -> None:
        """Return to main menu."""
        from ..main import AppState

        self.switch_state(AppState.MENU)

    def next_item(self) -> None:
        """Select a random letter or number to display."""
        # Randomly choose between letter or number
        self.is_letter = random.choice([True, False])

        if self.is_letter:
            self.current_item = random.choice("ABCDEFGHIJKLMNOPQRSTUVWXYZ")
        else:
            self.current_item = str(random.randint(0, 9))

        # Announce the new item (interrupt any previous speech)
        if self.voice_controls:
            if self.is_letter:
                self.voice_controls.speak(f"Press the letter {self.current_item} on the keyboard", interrupt=True)
            else:
                self.voice_controls.speak(f"Press the number {self.current_item} on the keyboard", interrupt=True)

    def handle_event(self, event: pygame.event.Event) -> None:
        """
        Handle pygame events.

        Args:
            event: The pygame event to handle.
        """
        self.back_button.handle_event(event)
        if self.voice_controls:
            self.voice_controls.handle_event(event)

        if event.type == pygame.KEYDOWN:
            if self.is_letter:
                if event.unicode.upper() == self.current_item:
                    # Correct key pressed!
                    self.success_flash = 30  # Flash for 30 frames
                    self.next_item()

                    # Award star and check for level up
                    star_awarded, level_up = self.progress_manager.award_star("letters_numbers")
                    if star_awarded:
                        target_x, target_y = self.star_display.get_position()
                        self.celebration.show_star_animation(target_x, target_y)
                        self.star_display.set_star_count(self.progress_manager.total_stars, animate=True)
                        if level_up:
                            self.celebration.show_level_up(self.progress_manager.current_level)
            else:
                if event.unicode == self.current_item:
                    # Correct key pressed!
                    self.success_flash = 30  # Flash for 30 frames
                    self.next_item()

                    # Award star and check for level up
                    star_awarded, level_up = self.progress_manager.award_star("letters_numbers")
                    if star_awarded:
                        target_x, target_y = self.star_display.get_position()
                        self.celebration.show_star_animation(target_x, target_y)
                        self.star_display.set_star_count(self.progress_manager.total_stars, animate=True)
                        if level_up:
                            self.celebration.show_level_up(self.progress_manager.current_level)

    def update(self) -> None:
        """Update activity state."""
        if self.success_flash > 0:
            self.success_flash -= 1

        # Update gamification components
        self.celebration.update()
        self.star_display.update()

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
        """Draw the letters and numbers activity."""
        # Background color changes briefly on success
        if self.success_flash > 0:
            self.screen.fill(self.settings.colors["success"])
        else:
            self._draw_gradient_background()

        # Draw instruction
        if self.is_letter:
            instruction = "Press the letter on the keyboard!"
        else:
            instruction = "Press the number on the keyboard!"

        instruction_surface = self.instruction_font.render(
            instruction, True, self.settings.colors["text"]
        )
        instruction_rect = instruction_surface.get_rect(
            center=(self.settings.screen_width // 2, 150)
        )
        self.screen.blit(instruction_surface, instruction_rect)

        # Draw current item (letter or number)
        item_color = (
            self.settings.colors["white"]
            if self.success_flash > 0
            else (self.settings.colors["primary"] if self.is_letter else self.settings.colors["secondary"])
        )
        item_surface = self.font.render(self.current_item, True, item_color)
        item_rect = item_surface.get_rect(
            center=(self.settings.screen_width // 2, self.settings.screen_height // 2)
        )
        self.screen.blit(item_surface, item_rect)

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
