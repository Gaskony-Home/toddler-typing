"""
Main entry point for the Toddler Typing application.

This module initializes the application, sets up the main menu,
and handles the overall program flow.
"""

import sys
import pygame
from typing import Optional, Any
from enum import Enum

from .config.settings import Settings
from .ui.main_menu import MainMenu
from .keyboard.locker import KeyboardLocker
from .audio.voice_manager import VoiceManager


class AppState(Enum):
    """Application states for different screens/activities."""

    MENU = "menu"
    LETTERS = "letters"
    NUMBERS = "numbers"
    LETTERS_NUMBERS = "letters_numbers"
    COLORING = "coloring"
    DRAWING = "drawing"
    COLORS_SHAPES = "colors_shapes"


class ToddlerTypingApp:
    """Main application class for Toddler Typing."""

    def __init__(self) -> None:
        """Initialize the application."""
        self.settings = Settings()
        self.keyboard_locker: Optional[KeyboardLocker] = None
        self.voice_manager: Optional[VoiceManager] = None
        self.running = False
        self.screen: Optional[pygame.Surface] = None
        self.current_state = AppState.MENU
        self.current_activity: Optional[Any] = None

    def initialize(self) -> bool:
        """
        Initialize Pygame and application components.

        Returns:
            bool: True if initialization successful, False otherwise.
        """
        try:
            pygame.init()
            pygame.mixer.init()

            # Set up display
            display_flags = pygame.FULLSCREEN if self.settings.fullscreen else pygame.RESIZABLE
            
            # Use auto-detect for screen dimensions if set to 0
            if self.settings.screen_width == 0 or self.settings.screen_height == 0:
                if self.settings.fullscreen:
                    # In fullscreen, use native resolution
                    self.screen = pygame.display.set_mode((0, 0), display_flags)
                else:
                    # In windowed mode, start with reasonable size then maximize
                    info = pygame.display.Info()
                    # Use 90% of screen to leave room for taskbar
                    width = int(info.current_w * 0.9)
                    height = int(info.current_h * 0.9)
                    self.screen = pygame.display.set_mode((width, height), display_flags)
            else:
                self.screen = pygame.display.set_mode(
                    (self.settings.screen_width, self.settings.screen_height),
                    display_flags,
                )
            
            pygame.display.set_caption("Toddler Typing")
            
            # Maximize window if not fullscreen
            if not self.settings.fullscreen:
                pygame.display.toggle_fullscreen()  # This maximizes on Windows
                pygame.display.toggle_fullscreen()  # Toggle back to keep decorations

            # Update settings with actual screen size
            actual_width, actual_height = self.screen.get_size()
            self.settings.screen_width = actual_width
            self.settings.screen_height = actual_height
            
            print(f"Screen resolution: {actual_width}x{actual_height}")

            # Initialize keyboard locker if enabled (Windows only)
            if self.settings.enable_keyboard_lock and sys.platform == "win32":
                try:
                    self.keyboard_locker = KeyboardLocker(
                        exit_combination=self.settings.exit_combination
                    )
                    self.keyboard_locker.start()
                except Exception as e:
                    print(f"Could not start keyboard locker: {e}")
                    print("Continuing without keyboard lock.")

            # Initialize voice manager
            try:
                self.voice_manager = VoiceManager()
            except Exception as e:
                print(f"Could not start voice manager: {e}")
                print("Continuing without voice support.")

            return True

        except Exception as e:
            print(f"Error initializing application: {e}")
            return False

    def switch_to_state(self, state: AppState) -> None:
        """
        Switch to a different application state.

        Args:
            state: The state to switch to.
        """
        self.current_state = state
        self.current_activity = None  # Will be created on next frame

    def get_current_screen(self) -> Any:
        """
        Get the current screen/activity object.

        Returns:
            The current screen object (MainMenu or activity).
        """
        if self.current_state == AppState.MENU:
            if not self.current_activity:
                self.current_activity = MainMenu(
                    self.screen, self.settings, self.switch_to_state, self.voice_manager
                )
            return self.current_activity

        elif self.current_state == AppState.LETTERS:
            if not self.current_activity:
                from .educational.letters import LettersActivity

                self.current_activity = LettersActivity(
                    self.screen, self.settings, self.switch_to_state, self.voice_manager
                )
            return self.current_activity

        elif self.current_state == AppState.NUMBERS:
            if not self.current_activity:
                from .educational.numbers import NumbersActivity

                self.current_activity = NumbersActivity(
                    self.screen, self.settings, self.switch_to_state, self.voice_manager
                )
            return self.current_activity

        elif self.current_state == AppState.LETTERS_NUMBERS:
            if not self.current_activity:
                from .educational.letters_numbers import LettersNumbersActivity

                self.current_activity = LettersNumbersActivity(
                    self.screen, self.settings, self.switch_to_state, self.voice_manager
                )
            return self.current_activity

        elif self.current_state == AppState.DRAWING:
            if not self.current_activity:
                from .drawing.canvas import DrawingCanvas

                self.current_activity = DrawingCanvas(
                    self.screen, self.settings, self.switch_to_state, self.voice_manager
                )
            return self.current_activity

        elif self.current_state == AppState.COLORING:
            if not self.current_activity:
                from .educational.coloring import ColoringActivity

                self.current_activity = ColoringActivity(
                    self.screen, self.settings, self.switch_to_state, self.voice_manager
                )
            return self.current_activity

        elif self.current_state == AppState.COLORS_SHAPES:
            if not self.current_activity:
                from .educational.colors_shapes import ColorsShapesActivity

                self.current_activity = ColorsShapesActivity(
                    self.screen, self.settings, self.switch_to_state, self.voice_manager
                )
            return self.current_activity

    def run(self) -> None:
        """Run the main application loop."""
        if not self.initialize():
            sys.exit(1)

        self.running = True
        clock = pygame.time.Clock()

        try:
            while self.running:
                # Get current screen
                current_screen = self.get_current_screen()

                # Handle events
                for event in pygame.event.get():
                    if event.type == pygame.QUIT:
                        self.running = False

                    # Handle window resize
                    if event.type == pygame.VIDEORESIZE:
                        self.screen = pygame.display.set_mode(
                            (event.w, event.h),
                            pygame.RESIZABLE
                        )
                        self.settings.screen_width = event.w
                        self.settings.screen_height = event.h

                    # Check for exit combination
                    if self.keyboard_locker and self.keyboard_locker.should_exit():
                        self.running = False

                    # Allow ESC key to exit if keyboard lock is disabled
                    if (
                        not self.settings.enable_keyboard_lock
                        and event.type == pygame.KEYDOWN
                        and event.key == pygame.K_ESCAPE
                    ):
                        # If in an activity, go back to menu; if in menu, exit
                        if self.current_state == AppState.MENU:
                            self.running = False
                        else:
                            self.switch_to_state(AppState.MENU)

                    current_screen.handle_event(event)

                # Update
                current_screen.update()

                # Draw
                current_screen.draw()
                pygame.display.flip()

                # Maintain frame rate
                clock.tick(self.settings.fps)

        finally:
            self.cleanup()

    def cleanup(self) -> None:
        """Clean up resources before exiting."""
        if self.voice_manager:
            self.voice_manager.cleanup()
        if self.keyboard_locker:
            self.keyboard_locker.stop()

        pygame.quit()


def main() -> None:
    """Main entry point for the application."""
    app = ToddlerTypingApp()
    app.run()


if __name__ == "__main__":
    main()
