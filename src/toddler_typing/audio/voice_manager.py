"""
Voice manager for text-to-speech functionality.

This module provides voice explanations and announcements for activities.
"""

import threading
from typing import Optional
try:
    import pyttsx3
except ImportError:
    pyttsx3 = None


class VoiceManager:
    """Manages text-to-speech functionality."""

    def __init__(self) -> None:
        """Initialize the voice manager."""
        self.engine: Optional[any] = None
        self.muted = False
        self.current_thread: Optional[threading.Thread] = None
        self.last_message = ""

        # Initialize TTS engine if available
        if pyttsx3:
            try:
                self.engine = pyttsx3.init()
                
                # Try to select a friendly, child-appropriate voice
                voices = self.engine.getProperty('voices')
                
                # Prefer female voices or specific friendly voices (Zira, David, etc.)
                selected_voice = None
                for voice in voices:
                    # On Windows, Microsoft Zira is typically a pleasant female voice
                    if 'zira' in voice.name.lower():
                        selected_voice = voice
                        break
                    # Look for other female voices
                    elif 'female' in voice.name.lower() or voice.gender == 'female':
                        selected_voice = voice
                        break
                
                # If we found a preferred voice, use it
                if selected_voice:
                    self.engine.setProperty('voice', selected_voice.id)
                # Otherwise, try to use the second voice (often better than default)
                elif len(voices) > 1:
                    self.engine.setProperty('voice', voices[1].id)
                
                # Set properties for child-friendly, natural speech
                self.engine.setProperty('rate', 170)  # Moderate pace - not too slow, natural
                self.engine.setProperty('volume', 1.0)  # Full volume
                
            except Exception as e:
                print(f"Could not initialize TTS engine: {e}")
                self.engine = None

    def speak(self, text: str, interrupt: bool = False) -> None:
        """
        Speak the given text.

        Args:
            text: The text to speak.
            interrupt: If True, stop current speech and speak immediately.
        """
        if not self.engine or self.muted:
            return

        self.last_message = text

        if interrupt and self.current_thread and self.current_thread.is_alive():
            self.stop()

        # Speak in a separate thread to avoid blocking
        self.current_thread = threading.Thread(target=self._speak_worker, args=(text,))
        self.current_thread.daemon = True
        self.current_thread.start()

    def _speak_worker(self, text: str) -> None:
        """Worker thread for speaking text."""
        if self.engine:
            try:
                self.engine.say(text)
                self.engine.runAndWait()
            except Exception as e:
                print(f"Error speaking text: {e}")

    def repeat(self) -> None:
        """Repeat the last spoken message."""
        if self.last_message:
            self.speak(self.last_message, interrupt=True)

    def stop(self) -> None:
        """Stop current speech."""
        if self.engine:
            try:
                self.engine.stop()
            except Exception:
                pass

    def toggle_mute(self) -> bool:
        """
        Toggle mute state.

        Returns:
            bool: True if now muted, False if unmuted.
        """
        self.muted = not self.muted
        if self.muted:
            self.stop()
        return self.muted

    def set_mute(self, muted: bool) -> None:
        """
        Set mute state.

        Args:
            muted: True to mute, False to unmute.
        """
        self.muted = muted
        if self.muted:
            self.stop()

    def is_muted(self) -> bool:
        """
        Check if voice is muted.

        Returns:
            bool: True if muted, False otherwise.
        """
        return self.muted

    def cleanup(self) -> None:
        """Clean up resources."""
        self.stop()
        if self.engine:
            try:
                del self.engine
            except Exception:
                pass
