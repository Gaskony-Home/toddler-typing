"""Update all files to use custom fonts via FontManager"""

import re

def update_button_py():
    """Update button.py to use custom fonts."""
    with open('src/toddler_typing/ui/button.py', 'r', encoding='utf-8') as f:
        content = f.read()

    # Remove the bad import line if it exists
    content = re.sub(r'nfrom \.\.config\.fonts.*?\n', '', content)

    # Add import after the other imports
    if 'from ..config.fonts import get_font_manager' not in content:
        content = content.replace(
            'from typing import Tuple, Callable, Optional',
            'from typing import Tuple, Callable, Optional\n\nfrom ..config.fonts import get_font_manager'
        )

    # Replace font initializations
    content = content.replace(
        'self.font = pygame.font.Font(None, self.font_size)',
        'self.font = get_font_manager().get_font(self.font_size)'
    )
    content = content.replace(
        'self.tooltip_font = pygame.font.Font(None, 36)',
        'self.tooltip_font = get_font_manager().get_font(36)'
    )

    with open('src/toddler_typing/ui/button.py', 'w', encoding='utf-8') as f:
        f.write(content)
    print("Updated button.py")


def update_main_menu_py():
    """Update main_menu.py to use custom fonts."""
    with open('src/toddler_typing/ui/main_menu.py', 'r', encoding='utf-8') as f:
        content = f.read()

    # Add import after the other imports
    if 'from ..config.fonts import get_font_manager' not in content:
        content = content.replace(
            'from ..audio.voice_manager import VoiceManager',
            'from ..audio.voice_manager import VoiceManager\nfrom ..config.fonts import get_font_manager'
        )

    # Replace font initialization
    content = content.replace(
        'self.title_font = pygame.font.Font(None, 120)',
        'self.title_font = get_font_manager().get_font(120, bold=True)'
    )

    with open('src/toddler_typing/ui/main_menu.py', 'w', encoding='utf-8') as f:
        f.write(content)
    print("Updated main_menu.py")


def update_canvas_py():
    """Update canvas.py to use custom fonts."""
    with open('src/toddler_typing/drawing/canvas.py', 'r', encoding='utf-8') as f:
        content = f.read()

    # Add import
    if 'from ..config.fonts import get_font_manager' not in content:
        content = content.replace(
            'from ..gamification import ProgressManager, Celebration, StarDisplay',
            'from ..gamification import ProgressManager, Celebration, StarDisplay\nfrom ..config.fonts import get_font_manager'
        )

    # Replace font initialization
    content = content.replace(
        'self.title_font = pygame.font.Font(None, 72)',
        'self.title_font = get_font_manager().get_font(72, bold=True)'
    )

    with open('src/toddler_typing/drawing/canvas.py', 'w', encoding='utf-8') as f:
        f.write(content)
    print("Updated canvas.py")


def update_letters_numbers_py():
    """Update letters_numbers.py to use custom fonts."""
    with open('src/toddler_typing/educational/letters_numbers.py', 'r', encoding='utf-8') as f:
        content = f.read()

    # Add import
    if 'from ..config.fonts import get_font_manager' not in content:
        content = content.replace(
            'from ..gamification import ProgressManager, Celebration, StarDisplay',
            'from ..gamification import ProgressManager, Celebration, StarDisplay\nfrom ..config.fonts import get_font_manager'
        )

    # Replace font initializations
    content = re.sub(
        r'self\.large_font = pygame\.font\.Font\(None, \d+\)',
        'self.large_font = get_font_manager().get_font(250, bold=True)',
        content
    )
    content = re.sub(
        r'self\.instruction_font = pygame\.font\.Font\(None, \d+\)',
        'self.instruction_font = get_font_manager().get_font(48)',
        content
    )

    with open('src/toddler_typing/educational/letters_numbers.py', 'w', encoding='utf-8') as f:
        f.write(content)
    print("Updated letters_numbers.py")


def update_colors_shapes_py():
    """Update colors_shapes.py to use custom fonts."""
    with open('src/toddler_typing/educational/colors_shapes.py', 'r', encoding='utf-8') as f:
        content = f.read()

    # Add import
    if 'from ..config.fonts import get_font_manager' not in content:
        content = content.replace(
            'from ..gamification import ProgressManager, Celebration, StarDisplay',
            'from ..gamification import ProgressManager, Celebration, StarDisplay\nfrom ..config.fonts import get_font_manager'
        )

    # Replace font initializations
    content = re.sub(
        r'self\.instruction_font = pygame\.font\.Font\(None, \d+\)',
        'self.instruction_font = get_font_manager().get_font(72)',
        content
    )
    content = re.sub(
        r'self\.label_font = pygame\.font\.Font\(None, \d+\)',
        'self.label_font = get_font_manager().get_font(48)',
        content
    )

    with open('src/toddler_typing/educational/colors_shapes.py', 'w', encoding='utf-8') as f:
        f.write(content)
    print("Updated colors_shapes.py")


def update_coloring_py():
    """Update coloring.py to use custom fonts."""
    with open('src/toddler_typing/educational/coloring.py', 'r', encoding='utf-8') as f:
        content = f.read()

    # Add import
    if 'from ..config.fonts import get_font_manager' not in content:
        content = content.replace(
            'from ..gamification import ProgressManager, Celebration, StarDisplay',
            'from ..gamification import ProgressManager, Celebration, StarDisplay\nfrom ..config.fonts import get_font_manager'
        )

    # Replace font initializations
    content = re.sub(
        r'self\.title_font = pygame\.font\.Font\(None, \d+\)',
        'self.title_font = get_font_manager().get_font(72, bold=True)',
        content
    )
    content = re.sub(
        r'self\.template_font = pygame\.font\.Font\(None, \d+\)',
        'self.template_font = get_font_manager().get_font(48)',
        content
    )

    with open('src/toddler_typing/educational/coloring.py', 'w', encoding='utf-8') as f:
        f.write(content)
    print("Updated coloring.py")


if __name__ == '__main__':
    update_button_py()
    update_main_menu_py()
    update_canvas_py()
    update_letters_numbers_py()
    update_colors_shapes_py()
    update_coloring_py()
    print("\nAll files updated to use custom fonts!")
