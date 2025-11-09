"""Test script to verify all improvements work correctly."""

import pygame
import sys

# Initialize pygame
pygame.init()

# Test 1: Font Manager
print("=" * 50)
print("Test 1: Font Manager")
print("=" * 50)
try:
    from src.toddler_typing.config.fonts import get_font_manager
    font_mgr = get_font_manager()
    print(f"[OK] Font manager initialized")
    print(f"[OK] Custom fonts available: {font_mgr.has_custom_fonts}")

    # Test loading fonts
    font1 = font_mgr.get_font(48)
    font2 = font_mgr.get_font(72, bold=True)
    print(f"[OK] Loaded regular font (48px)")
    print(f"[OK] Loaded bold font (72px)")
except Exception as e:
    print(f"[FAIL] Font manager error: {e}")
    sys.exit(1)

# Test 2: Progress Manager
print("\n" + "=" * 50)
print("Test 2: Gamification - Progress Manager")
print("=" * 50)
try:
    from src.toddler_typing.gamification import ProgressManager
    progress = ProgressManager()
    print(f"[OK] Progress manager initialized")
    print(f"[OK] Current level: {progress.current_level}")
    print(f"[OK] Total stars: {progress.total_stars}")

    # Award some stars
    for i in range(5):
        star_awarded, level_up = progress.award_star("test")
        if level_up:
            print(f"[OK] Level up occurred at star {i+1}!")

    print(f"[OK] Stars after test: {progress.total_stars}")
except Exception as e:
    print(f"[FAIL] Progress manager error: {e}")
    import traceback
    traceback.print_exc()
    sys.exit(1)

# Test 3: Celebration
print("\n" + "=" * 50)
print("Test 3: Gamification - Celebration")
print("=" * 50)
try:
    from src.toddler_typing.gamification import Celebration
    celebration = Celebration(1920, 1080)
    print(f"[OK] Celebration system initialized")

    # Test star animation
    celebration.show_star_animation(100, 100)
    print(f"[OK] Star animation started")
    print(f"[OK] Active star animations: {len(celebration.star_animations)}")

    # Test level up
    celebration.show_level_up(2)
    print(f"[OK] Level up animation started")
    print(f"[OK] Level up active: {celebration.level_up_animation}")
except Exception as e:
    print(f"[FAIL] Celebration error: {e}")
    import traceback
    traceback.print_exc()
    sys.exit(1)

# Test 4: Star Display
print("\n" + "=" * 50)
print("Test 4: Gamification - Star Display")
print("=" * 50)
try:
    from src.toddler_typing.gamification import StarDisplay
    star_display = StarDisplay(1920, 1080)
    print(f"[OK] Star display initialized")

    star_display.set_star_count(10, animate=True)
    print(f"[OK] Star count set to 10 with animation")
except Exception as e:
    print(f"[FAIL] Star display error: {e}")
    import traceback
    traceback.print_exc()
    sys.exit(1)

# Test 5: Settings with new colors
print("\n" + "=" * 50)
print("Test 5: Settings - Modern Color Palette")
print("=" * 50)
try:
    from src.toddler_typing.config.settings import Settings
    settings = Settings()
    print(f"[OK] Settings initialized")
    print(f"[OK] Primary color (light): {settings.light_colors['primary']}")
    print(f"[OK] Secondary color (light): {settings.light_colors['secondary']}")
except Exception as e:
    print(f"[FAIL] Settings error: {e}")
    import traceback
    traceback.print_exc()
    sys.exit(1)

# All tests passed
print("\n" + "=" * 50)
print("[OK][OK][OK] ALL TESTS PASSED [OK][OK][OK]")
print("=" * 50)
print("\nAll improvements are working correctly!")
print("Ready to rebuild the application.")
