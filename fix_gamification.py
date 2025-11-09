"""Fix gamification integration in drawing/canvas.py and educational/coloring.py"""

# Fix canvas.py
with open('src/toddler_typing/drawing/canvas.py.backup', 'r', encoding='utf-8') as f:
    canvas_lines = f.readlines()

# Add import after line 16
canvas_lines.insert(16, 'from ..gamification import ProgressManager, Celebration, StarDisplay\n')

# Find the line with "White canvas" and add gamification init after it
for i, line in enumerate(canvas_lines):
    if '# White canvas' in line:
        canvas_lines.insert(i+1, '\n')
        canvas_lines.insert(i+2, '        # Gamification system\n')
        canvas_lines.insert(i+3, '        self.progress_manager = ProgressManager()\n')
        canvas_lines.insert(i+4, '        self.celebration = Celebration(settings.screen_width, settings.screen_height)\n')
        canvas_lines.insert(i+5, '        self.star_display = StarDisplay(settings.screen_width, settings.screen_height)\n')
        canvas_lines.insert(i+6, '        self.star_display.set_star_count(self.progress_manager.total_stars)\n')
        break

# Find pygame.image.save and add star awarding after it
for i, line in enumerate(canvas_lines):
    if 'pygame.image.save(self.canvas, filepath)' in line:
        canvas_lines.insert(i+1, '\n')
        canvas_lines.insert(i+2, '            # Award star for saving drawing\n')
        canvas_lines.insert(i+3, '            star_awarded, level_up = self.progress_manager.award_star("drawing")\n')
        canvas_lines.insert(i+4, '            if star_awarded:\n')
        canvas_lines.insert(i+5, '                target_x, target_y = self.star_display.get_position()\n')
        canvas_lines.insert(i+6, '                self.celebration.show_star_animation(target_x, target_y)\n')
        canvas_lines.insert(i+7, '                self.star_display.set_star_count(self.progress_manager.total_stars, animate=True)\n')
        canvas_lines.insert(i+8, '\n')
        canvas_lines.insert(i+9, '                if level_up:\n')
        canvas_lines.insert(i+10, '                    self.celebration.show_level_up(self.progress_manager.current_level)\n')
        break

# Find update method and replace pass
for i, line in enumerate(canvas_lines):
    if line.strip() == 'pass' and 'def update' in ''.join(canvas_lines[max(0,i-5):i]):
        canvas_lines[i] = '        # Update gamification animations\n'
        canvas_lines.insert(i+1, '        self.celebration.update()\n')
        canvas_lines.insert(i+2, '        self.star_display.update()\n')
        break

# Find voice controls drawing and add gamification after it
for i, line in enumerate(canvas_lines):
    if '# Draw voice controls' in line and i + 3 < len(canvas_lines):
        # Insert after "if self.voice_controls:" block
        j = i + 3  # Skip the comment and if/draw lines
        canvas_lines.insert(j, '\n')
        canvas_lines.insert(j+1, '        # Draw gamification elements\n')
        canvas_lines.insert(j+2, '        self.star_display.draw(self.screen)\n')
        canvas_lines.insert(j+3, '        self.celebration.draw(self.screen)\n')
        break

# Write fixed canvas.py
with open('src/toddler_typing/drawing/canvas.py', 'w', encoding='utf-8') as f:
    f.writelines(canvas_lines)

print("Fixed canvas.py")

# Now fix coloring.py - read the original from a clean state
import subprocess
subprocess.run(['git', 'checkout', 'HEAD', 'src/toddler_typing/educational/coloring.py'],
               cwd='.', check=False, capture_output=True)

with open('src/toddler_typing/educational/coloring.py', 'r', encoding='utf-8') as f:
    coloring_lines = f.readlines()

# Add import after the VoiceManager import
for i, line in enumerate(coloring_lines):
    if 'from ..audio.voice_manager import VoiceManager' in line:
        coloring_lines.insert(i+1, 'from ..gamification import ProgressManager, Celebration, StarDisplay\n')
        break

# Find self.template and add gamification init before the template library comment
for i, line in enumerate(coloring_lines):
    if '# Template library' in line:
        coloring_lines.insert(i, '\n')
        coloring_lines.insert(i+1, '        # Gamification system\n')
        coloring_lines.insert(i+2, '        self.progress_manager = ProgressManager()\n')
        coloring_lines.insert(i+3, '        self.celebration = Celebration(settings.screen_width, settings.screen_height)\n')
        coloring_lines.insert(i+4, '        self.star_display = StarDisplay(settings.screen_width, settings.screen_height)\n')
        coloring_lines.insert(i+5, '        self.star_display.set_star_count(self.progress_manager.total_stars)\n')
        break

# Add stroke counter after self.drawing = False
for i, line in enumerate(coloring_lines):
    if line.strip() == 'self.drawing = False' and 'self.mode' in ''.join(coloring_lines[i:i+5]):
        coloring_lines.insert(i+1, '        self.stroke_count = 0  # Count drawing strokes for star rewards\n')
        break

# Find MOUSEMOTION drawing and add stroke counting
for i, line in enumerate(coloring_lines):
    if 'elif event.type == pygame.MOUSEMOTION:' in line:
        # Find the last_pos = event.pos line within this block
        for j in range(i, min(i+20, len(coloring_lines))):
            if 'self.last_pos = event.pos' in coloring_lines[j] and coloring_lines[j].strip().startswith('self.last_pos'):
                coloring_lines.insert(j+1, '\n')
                coloring_lines.insert(j+2, '                # Award stars for drawing engagement\n')
                coloring_lines.insert(j+3, '                self.stroke_count += 1\n')
                coloring_lines.insert(j+4, '                if self.stroke_count % 50 == 0:  # Award star every 50 strokes\n')
                coloring_lines.insert(j+5, '                    star_awarded, level_up = self.progress_manager.award_star("coloring")\n')
                coloring_lines.insert(j+6, '                    if star_awarded:\n')
                coloring_lines.insert(j+7, '                        target_x, target_y = self.star_display.get_position()\n')
                coloring_lines.insert(j+8, '                        self.celebration.show_star_animation(target_x, target_y)\n')
                coloring_lines.insert(j+9, '                        self.star_display.set_star_count(self.progress_manager.total_stars, animate=True)\n')
                coloring_lines.insert(j+10, '                        if level_up:\n')
                coloring_lines.insert(j+11, '                            self.celebration.show_level_up(self.progress_manager.current_level)\n')
                break
        break

# Find update method and replace pass
found_update = False
for i, line in enumerate(coloring_lines):
    if 'def update(self)' in line:
        # Find the pass statement
        for j in range(i, min(i+5, len(coloring_lines))):
            if coloring_lines[j].strip() == 'pass':
                coloring_lines[j] = '        # Update gamification animations\n'
                coloring_lines.insert(j+1, '        self.celebration.update()\n')
                coloring_lines.insert(j+2, '        self.star_display.update()\n')
                found_update = True
                break
        if found_update:
            break

# Find draw method and add gamification drawing before tooltips
for i, line in enumerate(coloring_lines):
    if '# Draw tooltips on top' in line:
        coloring_lines.insert(i, '\n')
        coloring_lines.insert(i+1, '        # Draw gamification elements\n')
        coloring_lines.insert(i+2, '        self.star_display.draw(self.screen)\n')
        coloring_lines.insert(i+3, '        self.celebration.draw(self.screen)\n')
        break

# Write fixed coloring.py
with open('src/toddler_typing/educational/coloring.py', 'w', encoding='utf-8') as f:
    f.writelines(coloring_lines)

print("Fixed coloring.py")
