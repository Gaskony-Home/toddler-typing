"""
Keyboard locking functionality.

This module provides keyboard locking capabilities to prevent
unwanted key presses and system combinations while allowing
a secure exit method.
"""

import sys
import time
import logging
from typing import List, Set, Dict
from threading import Thread, Event, Lock
from collections import defaultdict

# Configure logging
logger = logging.getLogger(__name__)

# Only import pynput on Windows
if sys.platform == "win32":
    from pynput import keyboard
    from pynput.keyboard import Key, KeyCode


class KeyboardLocker:
    """
    Manages keyboard locking and exit combination detection.

    This class runs a background thread that monitors keyboard input
    and blocks certain key combinations while watching for the exit sequence.
    """

    def __init__(self, exit_combination: List[str] = None) -> None:
        """
        Initialize the keyboard locker.

        Args:
            exit_combination: List of keys that trigger exit (e.g., ['ctrl', 'shift', 'esc']).
        """
        if sys.platform != "win32":
            raise OSError("KeyboardLocker only works on Windows")

        self.exit_combination = exit_combination or ["ctrl", "shift", "esc"]
        self.current_keys: Set[str] = set()
        self.key_lock = Lock()  # Thread safety for key tracking
        self.key_timestamps: Dict[str, float] = defaultdict(float)  # Track when keys were pressed
        self.exit_combo_timeout = 2.0  # seconds - all keys must be within this window
        self.should_exit_flag = Event()
        self.listener: keyboard.Listener = None
        self.running = False

        # Map string names to pynput Key objects
        self.key_map = {
            "ctrl": {Key.ctrl_l, Key.ctrl_r},
            "shift": {Key.shift_l, Key.shift_r},
            "alt": {Key.alt_l, Key.alt_r},
            "esc": {Key.esc},
            "windows": {Key.cmd_l, Key.cmd_r},
            "tab": {Key.tab},
            "f4": {Key.f4},
        }

    def _normalize_key(self, key) -> str:
        """
        Convert a pynput key to a normalized string representation.

        Args:
            key: The pynput key object.

        Returns:
            Normalized string representation of the key.
        """
        if isinstance(key, KeyCode):
            if key.char:
                return key.char.lower()
            return str(key)

        # Check against known keys
        for name, keys in self.key_map.items():
            if key in keys:
                return name

        # Return the key name if available
        if hasattr(key, "name"):
            return key.name.lower()

        return str(key)

    def _on_press(self, key) -> bool:
        """
        Handle key press events.

        Args:
            key: The pressed key.

        Returns:
            False to suppress the key, True to allow it.
        """
        normalized = self._normalize_key(key)

        with self.key_lock:
            current_time = time.time()
            self.current_keys.add(normalized)
            self.key_timestamps[normalized] = current_time

            # Clean up old timestamps (keys held too long)
            self._clean_old_keys(current_time)

        # Check if exit combination is pressed
        if self._check_exit_combination():
            self.should_exit_flag.set()
            return False

        # Block certain system keys
        if self._should_block_key(key):
            return False

        return True

    def _on_release(self, key) -> bool:
        """
        Handle key release events.

        Args:
            key: The released key.

        Returns:
            True to continue listening.
        """
        normalized = self._normalize_key(key)

        with self.key_lock:
            self.current_keys.discard(normalized)
            if normalized in self.key_timestamps:
                del self.key_timestamps[normalized]

        return True

    def _clean_old_keys(self, current_time: float) -> None:
        """
        Remove keys that have been held too long (stuck keys).

        Args:
            current_time: Current timestamp

        Note: Must be called within key_lock context
        """
        max_age = 10.0  # seconds
        keys_to_remove = [
            key for key, timestamp in self.key_timestamps.items()
            if current_time - timestamp > max_age
        ]
        for key in keys_to_remove:
            self.current_keys.discard(key)
            del self.key_timestamps[key]

    def _check_exit_combination(self) -> bool:
        """
        Check if the exit combination is currently pressed within timeout.

        Returns:
            True if exit combination is pressed, False otherwise.
        """
        with self.key_lock:
            # Check all required keys are present
            if not all(key in self.current_keys for key in self.exit_combination):
                return False

            # Check all keys were pressed within the timeout window
            current_time = time.time()
            combo_timestamps = [
                self.key_timestamps.get(key, 0)
                for key in self.exit_combination
            ]

            if not combo_timestamps:
                return False

            # All keys must be pressed within timeout window of each other
            time_spread = max(combo_timestamps) - min(combo_timestamps)

            return time_spread <= self.exit_combo_timeout

    def _should_block_key(self, key) -> bool:
        """
        Determine if a key should be blocked.

        Args:
            key: The key to check.

        Returns:
            True if the key should be blocked, False otherwise.
        """
        # Block Windows key
        if key in {Key.cmd_l, Key.cmd_r}:
            return True

        # Block Alt+Tab
        if Key.tab == key and (Key.alt_l in self.current_keys or Key.alt_r in self.current_keys):
            return True

        # Block Alt+F4
        if Key.f4 == key and (Key.alt_l in self.current_keys or Key.alt_r in self.current_keys):
            return True

        return False

    def start(self) -> None:
        """Start the keyboard listener."""
        if sys.platform != "win32":
            return

        self.running = True
        # Use suppress=True to actually block keys at the OS level
        self.listener = keyboard.Listener(
            on_press=self._on_press, on_release=self._on_release, suppress=True
        )
        self.listener.start()
        logger.info("Keyboard lock started")
        logger.info("Note: Some system key combinations (Ctrl+Alt+Delete) cannot be blocked.")

    def stop(self) -> None:
        """Stop the keyboard listener."""
        self.running = False
        if self.listener:
            self.listener.stop()
            logger.info("Keyboard lock stopped")

    def should_exit(self) -> bool:
        """
        Check if the exit flag has been set.

        Returns:
            True if the application should exit, False otherwise.
        """
        return self.should_exit_flag.is_set()
