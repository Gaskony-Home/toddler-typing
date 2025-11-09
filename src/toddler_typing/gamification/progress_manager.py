"""
Progress Manager for tracking stars, levels, and player progress.

This module handles saving and loading progress data, awarding stars,
and calculating level progression.
"""

import json
import logging
import os
from datetime import datetime
from pathlib import Path
from typing import Dict, Optional, Tuple

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


class ProgressManager:
    """Manages player progress including stars, levels, and activity tracking."""

    # Level thresholds (inclusive lower bound)
    LEVEL_THRESHOLDS = {
        1: 0,      # Level 1: 0-50 stars
        2: 51,     # Level 2: 51-150 stars
        3: 151,    # Level 3: 151-300 stars
        4: 301,    # Level 4: 301+ stars (future expansion)
    }

    def __init__(self) -> None:
        """Initialize the progress manager and load existing progress."""
        self.total_stars: int = 0
        self.current_level: int = 1
        self.stars_by_activity: Dict[str, int] = {
            "letters_numbers": 0,
            "drawing": 0,
            "colors_shapes": 0,
        }
        self.last_updated: str = ""

        # Determine progress file path based on platform
        self.progress_file: Path = self._get_progress_file_path()

        # Load existing progress
        self.load_progress()

    def _get_progress_file_path(self) -> Path:
        """
        Get the appropriate path for the progress.json file based on platform.

        Returns:
            Path to the progress.json file.
        """
        try:
            if os.name == 'nt':  # Windows
                app_data = os.getenv('APPDATA')
                if app_data:
                    progress_dir = Path(app_data) / 'ToddlerTyping'
                else:
                    # Fallback to local directory
                    progress_dir = Path.home() / '.toddler_typing'
            else:  # Linux, macOS, etc.
                progress_dir = Path.home() / '.toddler_typing'

            # Create directory if it doesn't exist
            progress_dir.mkdir(parents=True, exist_ok=True)

            progress_file = progress_dir / 'progress.json'
            logger.info(f"Progress file path: {progress_file}")
            return progress_file

        except Exception as e:
            logger.error(f"Error determining progress file path: {e}")
            # Fallback to current directory
            fallback_path = Path('.') / 'progress.json'
            logger.warning(f"Using fallback path: {fallback_path}")
            return fallback_path

    def load_progress(self) -> bool:
        """
        Load progress from the JSON file.

        Returns:
            True if progress was loaded successfully, False otherwise.
        """
        if not self.progress_file.exists():
            logger.info("No existing progress file found. Starting fresh.")
            return False

        try:
            with open(self.progress_file, 'r', encoding='utf-8') as f:
                data = json.load(f)

            # Validate and load data
            self.total_stars = int(data.get('total_stars', 0))
            self.current_level = int(data.get('current_level', 1))
            self.stars_by_activity = data.get('stars_by_activity', {
                "letters_numbers": 0,
                "drawing": 0,
                "colors_shapes": 0,
            })
            self.last_updated = data.get('last_updated', '')

            # Ensure all activity types exist
            for activity in ["letters_numbers", "drawing", "colors_shapes"]:
                if activity not in self.stars_by_activity:
                    self.stars_by_activity[activity] = 0

            # Recalculate level based on total stars (in case of corruption)
            calculated_level = self._calculate_level(self.total_stars)
            if calculated_level != self.current_level:
                logger.warning(f"Level mismatch detected. Correcting from {self.current_level} to {calculated_level}")
                self.current_level = calculated_level

            logger.info(f"Progress loaded: {self.total_stars} stars, Level {self.current_level}")
            return True

        except json.JSONDecodeError as e:
            logger.error(f"Invalid JSON in progress file: {e}")
            return False
        except (ValueError, TypeError) as e:
            logger.error(f"Invalid data format in progress file: {e}")
            return False
        except Exception as e:
            logger.error(f"Error loading progress: {e}")
            return False

    def save_progress(self) -> bool:
        """
        Save current progress to the JSON file.

        Returns:
            True if progress was saved successfully, False otherwise.
        """
        try:
            # Update timestamp
            self.last_updated = datetime.now().isoformat()

            # Prepare data
            data = {
                "total_stars": self.total_stars,
                "current_level": self.current_level,
                "stars_by_activity": self.stars_by_activity,
                "last_updated": self.last_updated,
            }

            # Write to file
            with open(self.progress_file, 'w', encoding='utf-8') as f:
                json.dump(data, f, indent=2)

            logger.info(f"Progress saved: {self.total_stars} stars, Level {self.current_level}")
            return True

        except PermissionError:
            logger.error(f"Permission denied writing to progress file: {self.progress_file}")
            return False
        except Exception as e:
            logger.error(f"Error saving progress: {e}")
            return False

    def _calculate_level(self, stars: int) -> int:
        """
        Calculate the current level based on total stars.

        Args:
            stars: Total number of stars earned.

        Returns:
            The current level.
        """
        level = 1
        for lvl, threshold in sorted(self.LEVEL_THRESHOLDS.items(), reverse=True):
            if stars >= threshold:
                level = lvl
                break
        return level

    def award_star(self, activity: str) -> Tuple[bool, bool]:
        """
        Award a star for completing an activity.

        Args:
            activity: The activity name (e.g., "letters_numbers", "drawing", "colors_shapes").

        Returns:
            Tuple of (star_awarded, level_up_occurred).
        """
        if activity not in self.stars_by_activity:
            logger.warning(f"Unknown activity: {activity}")
            return False, False

        # Store previous level
        previous_level = self.current_level

        # Award star
        self.total_stars += 1
        self.stars_by_activity[activity] += 1

        # Recalculate level
        self.current_level = self._calculate_level(self.total_stars)

        # Check if level up occurred
        level_up = self.current_level > previous_level

        # Save progress
        self.save_progress()

        logger.info(f"Star awarded for {activity}. Total: {self.total_stars}, Level: {self.current_level}")
        if level_up:
            logger.info(f"LEVEL UP! Now at level {self.current_level}")

        return True, level_up

    def get_stars_for_activity(self, activity: str) -> int:
        """
        Get the number of stars earned for a specific activity.

        Args:
            activity: The activity name.

        Returns:
            Number of stars earned for the activity.
        """
        return self.stars_by_activity.get(activity, 0)

    def get_level_progress(self) -> Tuple[int, int, int]:
        """
        Get the current level progress information.

        Returns:
            Tuple of (current_level, stars_in_level, stars_needed_for_next_level).
            If at max level, stars_needed_for_next_level will be 0.
        """
        current_threshold = self.LEVEL_THRESHOLDS.get(self.current_level, 0)

        # Find next level threshold
        next_level = self.current_level + 1
        next_threshold = self.LEVEL_THRESHOLDS.get(next_level)

        if next_threshold is None:
            # At max level
            stars_in_level = self.total_stars - current_threshold
            stars_needed = 0
        else:
            stars_in_level = self.total_stars - current_threshold
            stars_needed = next_threshold - self.total_stars

        return self.current_level, stars_in_level, stars_needed

    def get_progress_summary(self) -> Dict[str, any]:
        """
        Get a complete summary of current progress.

        Returns:
            Dictionary containing all progress information.
        """
        current_level, stars_in_level, stars_needed = self.get_level_progress()

        return {
            "total_stars": self.total_stars,
            "current_level": current_level,
            "stars_in_level": stars_in_level,
            "stars_needed_for_next": stars_needed,
            "stars_by_activity": self.stars_by_activity.copy(),
            "last_updated": self.last_updated,
        }

    def reset_progress(self) -> bool:
        """
        Reset all progress to zero. Use with caution!

        Returns:
            True if reset was successful, False otherwise.
        """
        try:
            self.total_stars = 0
            self.current_level = 1
            self.stars_by_activity = {
                "letters_numbers": 0,
                "drawing": 0,
                "colors_shapes": 0,
            }
            self.last_updated = datetime.now().isoformat()

            # Save the reset progress
            success = self.save_progress()

            if success:
                logger.info("Progress has been reset")

            return success

        except Exception as e:
            logger.error(f"Error resetting progress: {e}")
            return False
