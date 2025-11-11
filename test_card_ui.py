"""
Quick test script to verify the new card-based UI can be initialized.
"""

import sys
sys.path.insert(0, 'src')

# Test imports
print("Testing imports...")
try:
    from toddler_typing.ui import ActivityCard, MainMenu
    print("[OK] ActivityCard and MainMenu imported successfully")
except Exception as e:
    print(f"[FAIL] Import failed: {e}")
    sys.exit(1)

# Test pygame initialization
print("\nTesting pygame initialization...")
try:
    import pygame
    pygame.init()
    print("[OK] Pygame initialized successfully")
except Exception as e:
    print(f"[FAIL] Pygame initialization failed: {e}")
    sys.exit(1)

# Test card creation
print("\nTesting ActivityCard creation...")
try:
    screen = pygame.display.set_mode((800, 600))
    test_card = ActivityCard(
        x=100,
        y=100,
        width=200,
        height=200,
        title="Test",
        color=(100, 150, 200),
        icon="letters",
        on_click=None
    )
    print(f"[OK] ActivityCard created: {test_card.title}")
except Exception as e:
    print(f"[FAIL] ActivityCard creation failed: {e}")
    import traceback
    traceback.print_exc()
    sys.exit(1)

# Test MainMenu creation
print("\nTesting MainMenu creation...")
try:
    from toddler_typing.config.settings import Settings
    settings = Settings()

    def dummy_switch(state):
        pass

    menu = MainMenu(screen, settings, dummy_switch, None)
    print(f"[OK] MainMenu created with {len(menu.cards)} cards")
except Exception as e:
    print(f"[FAIL] MainMenu creation failed: {e}")
    import traceback
    traceback.print_exc()
    sys.exit(1)

pygame.quit()
print("\n[OK] All tests passed!")
