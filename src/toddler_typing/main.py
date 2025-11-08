"""
Main entry point for the Toddler Typing application.

This module initializes the application, sets up the main menu,
and handles the overall program flow.
"""

import sys
import pygame
from typing import Optional

from .config.settings import Settings
from .ui.main_menu import MainMenu
from .keyboard.locker import KeyboardLocker


class ToddlerTypingApp:
    """Main application class for Toddler Typing."""

    def __init__(self) -> None:
        """Initialize the application."""
        self.settings = Settings()
        self.keyboard_locker: Optional[KeyboardLocker] = None
        self.running = False
        self.screen: Optional[pygame.Surface] = None

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
            self.screen = pygame.display.set_mode(
                (self.settings.screen_width, self.settings.screen_height),
                pygame.FULLSCREEN if self.settings.fullscreen else 0,
            )
            pygame.display.set_caption("Toddler Typing")

            # Initialize keyboard locker if enabled
            if self.settings.enable_keyboard_lock:
                self.keyboard_locker = KeyboardLocker(
                    exit_combination=self.settings.exit_combination
                )
                self.keyboard_locker.start()

            return True

        except Exception as e:
            print(f"Error initializing application: {e}")
            return False

    def run(self) -> None:
        """Run the main application loop."""
        if not self.initialize():
            sys.exit(1)

        self.running = True
        main_menu = MainMenu(self.screen, self.settings)
        clock = pygame.time.Clock()

        try:
            while self.running:
                # Handle events
                for event in pygame.event.get():
                    if event.type == pygame.QUIT:
                        self.running = False

                    # Check for exit combination
                    if self.keyboard_locker and self.keyboard_locker.should_exit():
                        self.running = False

                    main_menu.handle_event(event)

                # Update
                main_menu.update()

                # Draw
                main_menu.draw()
                pygame.display.flip()

                # Maintain frame rate
                clock.tick(self.settings.fps)

        finally:
            self.cleanup()

    def cleanup(self) -> None:
        """Clean up resources before exiting."""
        if self.keyboard_locker:
            self.keyboard_locker.stop()

        pygame.quit()


def main() -> None:
    """Main entry point for the application."""
    app = ToddlerTypingApp()
    app.run()


if __name__ == "__main__":
    main()
