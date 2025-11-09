"""Fix coloring.py by rebuilding it properly"""

# Read the original version if we have backup, otherwise read current and clean it
try:
    with open('src/toddler_typing/educational/coloring.py', 'r', encoding='utf-8') as f:
        lines = f.readlines()

    # Remove lines with just "n " at the start (from bad sed commands)
    cleaned_lines = []
    skip_next = 0
    for i, line in enumerate(lines):
        if skip_next > 0:
            skip_next -= 1
            continue

        # Skip lines that start with just "n "
        if line.startswith('n '):
            continue

        # Skip duplicate gamification sections
        if '# Gamification system' in line and cleaned_lines:
            # Check if we already have this section
            already_has = any('# Gamification system' in l for l in cleaned_lines[-20:] if l.strip())
            if already_has:
                # Skip this and next 5 lines (the duplicate section)
                skip_next = 5
                continue

        cleaned_lines.append(line)

    # Write cleaned version
    with open('src/toddler_typing/educational/coloring.py', 'w', encoding='utf-8') as f:
        f.writelines(cleaned_lines)

    print("Cleaned coloring.py - removed duplicate sections and bad characters")

    # Now check if gamification import exists
    has_import = any('from ..gamification import' in line for line in cleaned_lines)
    has_init = any('self.progress_manager = ProgressManager()' in line for line in cleaned_lines)
    has_stroke_count = any('self.stroke_count' in line for line in cleaned_lines)
    has_update = any('self.celebration.update()' in line for line in cleaned_lines)
    has_draw = any('self.star_display.draw(self.screen)' in line for line in cleaned_lines)

    print(f"Has import: {has_import}")
    print(f"Has init: {has_init}")
    print(f"Has stroke_count: {has_stroke_count}")
    print(f"Has update: {has_update}")
    print(f"Has draw: {has_draw}")

except Exception as e:
    print(f"Error: {e}")
    import traceback
    traceback.print_exc()
