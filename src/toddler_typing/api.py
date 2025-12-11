"""
PyWebView API Bridge for Toddler Typing

This module provides the API bridge between the JavaScript frontend
and Python backend, exposing methods for activity management, settings,
keyboard locking, and text-to-speech functionality.
"""

import logging
import re
import sys
from typing import Optional, Dict, Any
from pathlib import Path


# Security constants for input validation
MAX_TEXT_LENGTH = 500  # Max length for TTS text
MAX_KEY_LENGTH = 10    # Max length for key input
MAX_ACTIVITY_NAME_LENGTH = 50  # Max length for activity names
MAX_ANIMATION_NAME_LENGTH = 50  # Max length for animation names
VALID_ACTIVITIES = {'letters_numbers', 'drawing', 'colors_shapes', 'coloring', 'dot2dot', 'sounds'}
VALID_THEMES = {'light', 'dark'}
ALPHANUMERIC_PATTERN = re.compile(r'^[a-zA-Z0-9_]+$')

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

    def _validate_string(self, value: str, max_length: int, field_name: str) -> Optional[str]:
        """
        Validate a string input for security.

        Args:
            value: String to validate
            max_length: Maximum allowed length
            field_name: Name of the field for error messages

        Returns:
            Error message if invalid, None if valid
        """
        if not isinstance(value, str):
            return f"Invalid {field_name}: must be a string"
        if len(value) > max_length:
            return f"Invalid {field_name}: exceeds maximum length of {max_length}"
        return None

    def start_activity(self, activity_name: str) -> Dict[str, Any]:
        """
        Start an educational activity.

        Args:
            activity_name: Name of the activity to start

        Returns:
            Dictionary with status and activity info
        """
        # Input validation
        validation_error = self._validate_string(activity_name, MAX_ACTIVITY_NAME_LENGTH, "activity_name")
        if validation_error:
            logger.warning(f"Invalid activity name: {validation_error}")
            return {'success': False, 'error': validation_error}

        # Validate activity name is in allowed list
        if activity_name not in VALID_ACTIVITIES:
            logger.warning(f"Unknown activity requested: {activity_name}")
            return {'success': False, 'error': 'Unknown activity'}

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
        # Input validation
        validation_error = self._validate_string(text, MAX_TEXT_LENGTH, "text")
        if validation_error:
            logger.warning(f"Invalid TTS text: {validation_error}")
            return {'success': False, 'error': 'Invalid text input'}

        try:
            if self.settings.get('voice_enabled'):
                self.voice_manager.speak(text, interrupt=interrupt)
                return {'success': True}
            return {'success': False, 'message': 'Voice disabled'}
        except Exception as e:
            logger.error(f"Failed to speak text: {e}")
            return {'success': False, 'error': 'Speech synthesis failed'}

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
            # Input validation - only allow known settings keys
            allowed_keys = {'theme', 'fullscreen', 'voice_enabled', 'keyboard_lock_enabled', 'volume'}
            if not isinstance(settings, dict):
                return {'success': False, 'error': 'Invalid settings format'}

            # Filter to only allowed keys and validate values
            validated_settings = {}
            for key, value in settings.items():
                if key not in allowed_keys:
                    logger.warning(f"Ignoring unknown setting key: {key}")
                    continue

                # Validate specific settings
                if key == 'theme' and value not in VALID_THEMES:
                    logger.warning(f"Invalid theme value: {value}")
                    continue
                if key in ('fullscreen', 'voice_enabled', 'keyboard_lock_enabled') and not isinstance(value, bool):
                    logger.warning(f"Invalid boolean value for {key}: {value}")
                    continue
                if key == 'volume' and (not isinstance(value, (int, float)) or value < 0 or value > 1):
                    logger.warning(f"Invalid volume value: {value}")
                    continue

                validated_settings[key] = value

            # Update internal settings with validated values
            self.settings.update(validated_settings)

            # Apply settings that need immediate action
            if 'voice_enabled' in validated_settings:
                self.voice_manager.set_mute(not validated_settings['voice_enabled'])

            logger.info(f"Settings saved: {validated_settings}")

            return {
                'success': True,
                'message': 'Settings saved successfully'
            }

        except Exception as e:
            logger.error(f"Failed to save settings: {e}")
            return {
                'success': False,
                'error': 'Failed to save settings'
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
            # Input validation
            for key, name in [(pressed_key, "pressed_key"), (expected_key, "expected_key")]:
                validation_error = self._validate_string(key, MAX_KEY_LENGTH, name)
                if validation_error:
                    logger.warning(f"Invalid key input: {validation_error}")
                    return {'success': False, 'error': 'Invalid key input'}

                # Only allow alphanumeric characters
                if not re.match(r'^[a-zA-Z0-9]+$', key.strip()):
                    logger.warning(f"Invalid characters in {name}: {key}")
                    return {'success': False, 'error': 'Invalid key characters'}

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
            # Input validation
            if activity not in VALID_ACTIVITIES:
                logger.warning(f"Invalid activity for star award: {activity}")
                return {'success': False, 'error': 'Invalid activity'}

            # Validate count is reasonable (prevent abuse)
            if not isinstance(count, int) or count < 0 or count > 10:
                logger.warning(f"Invalid star count: {count}")
                return {'success': False, 'error': 'Invalid star count'}

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

    # === 3D Character Control ===

    def play_character_animation(self, animation_name: str, loop: bool = None) -> Dict[str, Any]:
        """
        Trigger a character animation.

        Args:
            animation_name: Name of the animation to play (idle, wave, talk, happy, etc.)
            loop: Whether to loop the animation (None = auto-determine)

        Returns:
            Dictionary with status
        """
        try:
            logger.info(f"Playing character animation: {animation_name}")
            return {
                'success': True,
                'animation': animation_name,
                'loop': loop,
                'message': f'Animation {animation_name} triggered'
            }
        except Exception as e:
            logger.error(f"Failed to play character animation: {e}")
            return {
                'success': False,
                'error': str(e)
            }

    def set_character_emotion(self, emotion: str) -> Dict[str, Any]:
        """
        Set the character's emotional state.

        Args:
            emotion: Emotion name (happy, excited, curious, thinking, idle, etc.)

        Returns:
            Dictionary with status
        """
        try:
            logger.info(f"Setting character emotion: {emotion}")
            return {
                'success': True,
                'emotion': emotion,
                'message': f'Character emotion set to {emotion}'
            }
        except Exception as e:
            logger.error(f"Failed to set character emotion: {e}")
            return {
                'success': False,
                'error': str(e)
            }

    def character_start_talking(self) -> Dict[str, Any]:
        """
        Start the character's talking animation (called when TTS begins).

        Returns:
            Dictionary with status
        """
        try:
            logger.debug("Character started talking")
            return {
                'success': True,
                'message': 'Character talking animation started'
            }
        except Exception as e:
            logger.error(f"Failed to start character talking: {e}")
            return {
                'success': False,
                'error': str(e)
            }

    def character_stop_talking(self) -> Dict[str, Any]:
        """
        Stop the character's talking animation (called when TTS ends).

        Returns:
            Dictionary with status
        """
        try:
            logger.debug("Character stopped talking")
            return {
                'success': True,
                'message': 'Character talking animation stopped'
            }
        except Exception as e:
            logger.error(f"Failed to stop character talking: {e}")
            return {
                'success': False,
                'error': str(e)
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
