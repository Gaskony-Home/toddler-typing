"""
Main entry point for the Toddler Typing application.

This module initializes the PyWebView-based application with HTML/CSS/JS frontend
and Python backend for educational activities.
"""

import sys
import logging
import time
from pathlib import Path
from threading import Thread

import webview

from toddler_typing.api import ToddlerTypingAPI
from toddler_typing.__version__ import __version__

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


class ToddlerTypingApp:
    """Main application class for Toddler Typing (PyWebView version)."""

    def __init__(self):
        """Initialize the application."""
        self.api = ToddlerTypingAPI()
        self.window = None
        self.running = False
        self.exit_check_thread = None

        # Determine web directory path (handle both dev and PyInstaller)
        if getattr(sys, 'frozen', False):
            # Running as PyInstaller bundle
            application_path = Path(sys._MEIPASS)
            self.web_dir = application_path / "web"
        else:
            # Running in development
            self.web_dir = Path(__file__).parent / "web"

        self.index_html = self.web_dir / "index.html"

        logger.info(f"Toddler Typing v{__version__} initializing...")
        logger.info(f"Web directory: {self.web_dir}")

    def _monitor_exit_combination(self):
        """
        Background thread to monitor exit combination.

        This thread checks if the exit key combination (Ctrl+Shift+Esc)
        has been pressed and closes the application if detected.
        """
        logger.info("Exit combination monitor started")

        while self.running:
            time.sleep(0.1)  # Check every 100ms

            if self.api.check_exit_combination():
                logger.info("Exit combination detected, closing application")
                try:
                    if self.window:
                        self.window.destroy()
                except Exception as e:
                    logger.error(f"Error destroying window: {e}")
                break

    def on_loaded(self):
        """
        Callback when the web view has finished loading.

        This is called after the HTML/CSS/JS is fully loaded and the
        JavaScript API bridge is ready.
        """
        logger.info("Web view loaded successfully")

        # Start exit combination monitoring thread if on Windows
        if sys.platform == "win32":
            self.running = True
            self.exit_check_thread = Thread(target=self._monitor_exit_combination, daemon=True)
            self.exit_check_thread.start()
            logger.info("Exit monitoring thread started (Ctrl+Shift+Esc to exit)")

    def on_closing(self):
        """
        Callback when the window is being closed.

        This ensures proper cleanup of resources before exit.
        """
        logger.info("Application closing, cleaning up...")
        self.running = False

        # Clean up API resources
        self.api.cleanup()

        logger.info("Cleanup complete")
        return True  # Allow window to close

    def run(self):
        """Run the main application."""
        try:
            # Verify HTML file exists
            if not self.index_html.exists():
                logger.error(f"HTML file not found: {self.index_html}")
                print(f"ERROR: HTML file not found at {self.index_html}")
                print("Please ensure the web directory and index.html are in the correct location.")
                sys.exit(1)

            logger.info(f"Loading HTML from: {self.index_html}")

            # Create the PyWebView window
            self.window = webview.create_window(
                title="Toddler Typing",
                url=str(self.index_html),
                js_api=self.api,
                width=1280,
                height=800,
                resizable=True,
                fullscreen=False,
                min_size=(800, 600),
                background_color='#f8f9fa'
            )

            # Register event callbacks
            self.window.events.loaded += self.on_loaded
            self.window.events.closing += self.on_closing

            logger.info("Starting PyWebView...")

            # Start the webview (blocking call)
            webview.start(debug=False)

        except Exception as e:
            logger.error(f"Error running application: {e}", exc_info=True)
            print(f"ERROR: Failed to start application: {e}")
            sys.exit(1)

        finally:
            logger.info("Application terminated")


def main():
    """Main entry point for the application."""
    try:
        logger.info(f"Starting Toddler Typing v{__version__}")
        app = ToddlerTypingApp()
        app.run()
    except KeyboardInterrupt:
        logger.info("Application interrupted by user")
        sys.exit(0)
    except Exception as e:
        logger.error(f"Fatal error: {e}", exc_info=True)
        print(f"FATAL ERROR: {e}")
        sys.exit(1)


if __name__ == "__main__":
    main()
