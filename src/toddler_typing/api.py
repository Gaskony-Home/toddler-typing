"""
PyWebView API Bridge for Toddler Typing

This module provides the API bridge between the JavaScript frontend
and Python backend, exposing methods for activity management, settings,
keyboard locking, and text-to-speech functionality.
"""

import logging
import sys
from typing import Optional, Dict, Any
from pathlib import Path

# Import existing modules
from toddler_typing.__version__ import __version__
from toddler_typing.audio.voice_manager import VoiceManager
from toddler_typing.gamification.progress_manager import ProgressManager

# Only import keyboard locker on Windows
if sys.platform == "win32":
    from toddler_typing.keyboard.locker import KeyboardLocker

# Configure logging
logger = logging.getLogger(__name__)


class ToddlerTypingAPI:
    """
    API class that exposes methods to the JavaScript frontend via PyWebView.

    This class serves as the bridge between the web UI and Python backend,
    managing activities, keyboard locking, voice output, and settings.
    """

    def __init__(self):
        """Initialize the API bridge."""
        self.current_activity: Optional[str] = None
        self.voice_manager = VoiceManager()
        self.progress_manager = ProgressManager()
        self.keyboard_locker: Optional['KeyboardLocker'] = None
        self.settings: Dict[str, Any] = self._load_default_settings()

        logger.info("ToddlerTypingAPI initialized")

    def _load_default_settings(self) -> Dict[str, Any]:
        """
        Load default settings.

        Returns:
            Dictionary of default settings
        """
        return {
            'theme': 'light',
            'fullscreen': False,
            'voice_enabled': True,
            'keyboard_lock_enabled': True,
            'exit_combination': ['ctrl', 'shift', 'esc'],
            'volume': 1.0
        }

    # === Activity Management ===

    def start_activity(self, activity_name: str) -> Dict[str, Any]:
        """
        Start an educational activity.

        Args:
            activity_name: Name of the activity to start

        Returns:
            Dictionary with status and activity info
        """
        logger.info(f"Starting activity: {activity_name}")

        try:
            # Stop current activity if running
            if self.current_activity:
                self.stop_activity()

            # Set current activity
            self.current_activity = activity_name

            # Enable keyboard locking if enabled in settings
            if self.settings.get('keyboard_lock_enabled') and sys.platform == "win32":
                self._enable_keyboard_lock()

            # Speak activity welcome message
            if self.settings.get('voice_enabled'):
                welcome_message = self._get_activity_welcome(activity_name)
                self.voice_manager.speak(welcome_message)

            return {
                'success': True,
                'activity': activity_name,
                'message': f'Activity {activity_name} started successfully'
            }

        except Exception as e:
            logger.error(f"Failed to start activity {activity_name}: {e}")
            return {
                'success': False,
                'error': str(e)
            }

    def stop_activity(self) -> Dict[str, Any]:
        """
        Stop the current activity.

        Returns:
            Dictionary with status
        """
        logger.info("Stopping activity")

        try:
            activity_name = self.current_activity

            # Disable keyboard locking
            if self.keyboard_locker:
                self._disable_keyboard_lock()

            # Clear current activity
            self.current_activity = None

            return {
                'success': True,
                'message': 'Activity stopped successfully'
            }

        except Exception as e:
            logger.error(f"Failed to stop activity: {e}")
            return {
                'success': False,
                'error': str(e)
            }

    def _get_activity_welcome(self, activity_name: str) -> str:
        """
        Get welcome message for an activity.

        Args:
            activity_name: Name of the activity

        Returns:
            Welcome message string
        """
        messages = {
            'letters_numbers': "Let's learn letters and numbers! Press any key to start.",
            'drawing': "Time to draw! Press keys to make colorful art.",
            'colors_shapes': "Let's explore colors and shapes!",
            'coloring': "Let's color some pictures! Choose your favorite colors."
        }
        return messages.get(activity_name, f"Let's play {activity_name}!")

    # === Keyboard Locking ===

    def _enable_keyboard_lock(self) -> None:
        """Enable keyboard locking to prevent system key combinations."""
        if sys.platform != "win32":
            logger.warning("Keyboard locking only supported on Windows")
            return

        try:
            if not self.keyboard_locker:
                exit_combo = self.settings.get('exit_combination', ['ctrl', 'shift', 'esc'])
                self.keyboard_locker = KeyboardLocker(exit_combination=exit_combo)

            self.keyboard_locker.start()
            logger.info("Keyboard lock enabled")

        except Exception as e:
            logger.error(f"Failed to enable keyboard lock: {e}")

    def _disable_keyboard_lock(self) -> None:
        """Disable keyboard locking."""
        if self.keyboard_locker:
            try:
                self.keyboard_locker.stop()
                logger.info("Keyboard lock disabled")
            except Exception as e:
                logger.error(f"Failed to disable keyboard lock: {e}")

    def check_exit_combination(self) -> bool:
        """
        Check if the exit combination has been pressed.

        Returns:
            True if exit combination detected, False otherwise
        """
        if self.keyboard_locker:
            return self.keyboard_locker.should_exit()
        return False

    # === Voice/Audio Management ===

    def speak(self, text: str, interrupt: bool = False) -> Dict[str, Any]:
        """
        Speak text using text-to-speech.

        Args:
            text: Text to speak
            interrupt: Whether to interrupt current speech

        Returns:
            Dictionary with status
        """
        try:
            if self.settings.get('voice_enabled'):
                self.voice_manager.speak(text, interrupt=interrupt)
                return {'success': True}
            return {'success': False, 'message': 'Voice disabled'}
        except Exception as e:
            logger.error(f"Failed to speak text: {e}")
            return {'success': False, 'error': str(e)}

    def speak_text(self, text: str) -> Dict[str, Any]:
        """
        Speak text using text-to-speech (alias for speak method).
        Used by Colors & Shapes activity.

        Args:
            text: Text to speak

        Returns:
            Dictionary with status
        """
        return self.speak(text, interrupt=True)

    def toggle_voice(self) -> Dict[str, Any]:
        """
        Toggle voice on/off.

        Returns:
            Dictionary with new mute state
        """
        muted = self.voice_manager.toggle_mute()
        self.settings['voice_enabled'] = not muted
        return {
            'success': True,
            'voice_enabled': not muted,
            'muted': muted
        }

    def set_voice_enabled(self, enabled: bool) -> Dict[str, Any]:
        """
        Enable or disable voice.

        Args:
            enabled: True to enable, False to disable

        Returns:
            Dictionary with status
        """
        self.voice_manager.set_mute(not enabled)
        self.settings['voice_enabled'] = enabled
        return {
            'success': True,
            'voice_enabled': enabled
        }

    # === Settings Management ===

    def save_settings(self, settings: Dict[str, Any]) -> Dict[str, Any]:
        """
        Save application settings.

        Args:
            settings: Dictionary of settings to save

        Returns:
            Dictionary with status
        """
        try:
            # Update internal settings
            self.settings.update(settings)

            # Apply settings that need immediate action
            if 'voice_enabled' in settings:
                self.voice_manager.set_mute(not settings['voice_enabled'])

            logger.info(f"Settings saved: {settings}")

            return {
                'success': True,
                'message': 'Settings saved successfully'
            }

        except Exception as e:
            logger.error(f"Failed to save settings: {e}")
            return {
                'success': False,
                'error': str(e)
            }

    def load_settings(self) -> Dict[str, Any]:
        """
        Load application settings.

        Returns:
            Dictionary of settings
        """
        try:
            return {
                'success': True,
                'settings': self.settings
            }
        except Exception as e:
            logger.error(f"Failed to load settings: {e}")
            return {
                'success': False,
                'error': str(e),
                'settings': self._load_default_settings()
            }

    # === Letters & Numbers Activity ===

    def get_random_letter_or_number(self) -> Dict[str, Any]:
        """
        Get a random letter or number for the activity.

        Returns:
            Dictionary with character, type, and voice text
        """
        import random

        is_letter = random.choice([True, False])

        if is_letter:
            char = random.choice('ABCDEFGHIJKLMNOPQRSTUVWXYZ')
            voice_text = f"Press the letter {char} on the keyboard"
            char_type = 'letter'
        else:
            char = str(random.randint(0, 9))
            voice_text = f"Press the number {char} on the keyboard"
            char_type = 'number'

        # Speak the instruction
        if self.settings.get('voice_enabled'):
            self.voice_manager.speak(voice_text, interrupt=True)

        return {
            'success': True,
            'character': char,
            'type': char_type,
            'voice_text': voice_text
        }

    def check_letter_number_answer(self, pressed_key: str, expected_key: str) -> Dict[str, Any]:
        """
        Check if the pressed key matches the expected key.

        Args:
            pressed_key: The key that was pressed
            expected_key: The expected key

        Returns:
            Dictionary with result and star info
        """
        try:
            # Normalize keys for comparison
            pressed = pressed_key.upper().strip()
            expected = expected_key.upper().strip()

            is_correct = pressed == expected

            result = {
                'success': True,
                'correct': is_correct,
                'pressed_key': pressed_key,
                'expected_key': expected_key
            }

            # Award star if correct
            if is_correct:
                star_awarded, level_up = self.progress_manager.award_star('letters_numbers')

                if star_awarded:
                    result['star_awarded'] = True
                    result['total_stars'] = self.progress_manager.total_stars
                    result['level'] = self.progress_manager.current_level
                    result['level_up'] = level_up

                    # Speak encouragement
                    if self.settings.get('voice_enabled'):
                        encouragements = [
                            "Great job!",
                            "Excellent!",
                            "Well done!",
                            "Amazing!",
                            "Fantastic!",
                            "You're doing great!"
                        ]
                        import random
                        message = random.choice(encouragements)
                        if level_up:
                            message = f"{message} Level up! You're now level {result['level']}!"
                        self.voice_manager.speak(message)

            return result

        except Exception as e:
            logger.error(f"Error checking answer: {e}")
            return {
                'success': False,
                'error': str(e)
            }

    # === Progress/Gamification ===

    def get_progress(self) -> Dict[str, Any]:
        """
        Get user progress data.

        Returns:
            Dictionary with progress information
        """
        try:
            return {
                'success': True,
                'progress': self.progress_manager.get_progress()
            }
        except Exception as e:
            logger.error(f"Failed to get progress: {e}")
            return {
                'success': False,
                'error': str(e)
            }

    def award_stars(self, activity: str, count: int = 1) -> Dict[str, Any]:
        """
        Award stars for completing an activity.

        Args:
            activity: Name of the activity
            count: Number of stars to award

        Returns:
            Dictionary with status and total stars
        """
        try:
            self.progress_manager.award_stars(activity, count)
            total = self.progress_manager.get_total_stars()

            # Speak encouragement
            if self.settings.get('voice_enabled') and count > 0:
                message = f"Great job! You earned {count} star{'s' if count > 1 else ''}!"
                self.voice_manager.speak(message)

            return {
                'success': True,
                'stars_awarded': count,
                'total_stars': total
            }
        except Exception as e:
            logger.error(f"Failed to award stars: {e}")
            return {
                'success': False,
                'error': str(e)
            }

    # === System/Info ===

    def get_version(self) -> str:
        """
        Get application version.

        Returns:
            Version string
        """
        return __version__

    def get_system_info(self) -> Dict[str, Any]:
        """
        Get system information.

        Returns:
            Dictionary with system info
        """
        return {
            'success': True,
            'version': __version__,
            'platform': sys.platform,
            'python_version': sys.version,
            'current_activity': self.current_activity,
            'keyboard_lock_available': sys.platform == "win32",
            'keyboard_lock_active': self.keyboard_locker is not None and self.keyboard_locker.running
        }

    # === Cleanup ===

    def cleanup(self) -> None:
        """Clean up resources on application exit."""
        logger.info("Cleaning up API resources")

        # Stop current activity
        if self.current_activity:
            self.stop_activity()

        # Clean up voice manager
        if self.voice_manager:
            self.voice_manager.cleanup()

        # Disable keyboard lock
        if self.keyboard_locker:
            self._disable_keyboard_lock()

        logger.info("API cleanup complete")
