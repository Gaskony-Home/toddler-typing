"""
Keyboard locking functionality.

This module provides keyboard locking capabilities to prevent
unwanted key presses and system combinations while allowing
a secure exit method.
"""

import sys
from typing import List, Set
from threading import Thread, Event

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
        self.current_keys.add(normalized)

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
        self.current_keys.discard(normalized)
        return True

    def _check_exit_combination(self) -> bool:
        """
        Check if the exit combination is currently pressed.

        Returns:
            True if exit combination is pressed, False otherwise.
        """
        return all(key in self.current_keys for key in self.exit_combination)

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
        self.listener = keyboard.Listener(
            on_press=self._on_press, on_release=self._on_release, suppress=False
        )
        self.listener.start()

    def stop(self) -> None:
        """Stop the keyboard listener."""
        self.running = False
        if self.listener:
            self.listener.stop()

    def should_exit(self) -> bool:
        """
        Check if the exit flag has been set.

        Returns:
            True if the application should exit, False otherwise.
        """
        return self.should_exit_flag.is_set()
