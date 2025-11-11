"""
Celebration animations for gamification events.

This module provides visual feedback for earning stars and leveling up,
including particle effects and animations.
"""

import math
import pygame
import random
from typing import List, Tuple, Optional


class Particle:
    """A simple particle for visual effects."""

    def __init__(
        self,
        x: float,
        y: float,
        vx: float,
        vy: float,
        color: Tuple[int, int, int],
        size: int,
        lifetime: int
    ) -> None:
        """
        Initialize a particle.

        Args:
            x: Initial x position.
            y: Initial y position.
            vx: Velocity in x direction.
            vy: Velocity in y direction.
            color: RGB color tuple.
            size: Particle size in pixels.
            lifetime: How many frames the particle should live.
        """
        self.x = x
        self.y = y
        self.vx = vx
        self.vy = vy
        self.color = color
        self.size = size
        self.lifetime = lifetime
        self.max_lifetime = lifetime
        self.gravity = 0.3

    def update(self) -> bool:
        """
        Update particle position and lifetime.

        Returns:
            True if particle is still alive, False if it should be removed.
        """
        self.x += self.vx
        self.y += self.vy
        self.vy += self.gravity  # Apply gravity
        self.lifetime -= 1
        return self.lifetime > 0

    def draw(self, screen: pygame.Surface) -> None:
        """
        Draw the particle on screen.

        Args:
            screen: The pygame surface to draw on.
        """
        # Calculate alpha based on lifetime
        alpha = int(255 * (self.lifetime / self.max_lifetime))
        alpha = max(0, min(255, alpha))

        # Create a surface with per-pixel alpha
        particle_surface = pygame.Surface((self.size * 2, self.size * 2), pygame.SRCALPHA)
        pygame.draw.circle(
            particle_surface,
            (*self.color, alpha),
            (self.size, self.size),
            self.size
        )

        # Blit to screen
        screen.blit(particle_surface, (int(self.x - self.size), int(self.y - self.size)))


class StarAnimation:
    """Animated star that flies from center to top-right corner."""

    def __init__(
        self,
        start_x: float,
        start_y: float,
        end_x: float,
        end_y: float,
        duration: int = 60
    ) -> None:
        """
        Initialize star animation.

        Args:
            start_x: Starting x position.
            start_y: Starting y position.
            end_x: Ending x position (top-right corner).
            end_y: Ending y position (top-right corner).
            duration: Animation duration in frames.
        """
        self.start_x = start_x
        self.start_y = start_y
        self.end_x = end_x
        self.end_y = end_y
        self.duration = duration
        self.current_frame = 0
        self.active = True

        # Calculate bezier curve control points for smooth arc
        mid_x = (start_x + end_x) / 2
        mid_y = min(start_y, end_y) - 100  # Arc upward
        self.control_x = mid_x
        self.control_y = mid_y

    def update(self) -> bool:
        """
        Update animation state.

        Returns:
            True if animation is still active, False if completed.
        """
        if not self.active:
            return False

        self.current_frame += 1
        if self.current_frame >= self.duration:
            self.active = False
            return False

        return True

    def get_position(self) -> Tuple[float, float]:
        """
        Get current position along the animation curve.

        Returns:
            Tuple of (x, y) position.
        """
        # Calculate progress (0.0 to 1.0)
        t = self.current_frame / self.duration

        # Ease-in-out function for smooth motion
        t = self._ease_in_out(t)

        # Quadratic bezier curve
        x = (1 - t) ** 2 * self.start_x + 2 * (1 - t) * t * self.control_x + t ** 2 * self.end_x
        y = (1 - t) ** 2 * self.start_y + 2 * (1 - t) * t * self.control_y + t ** 2 * self.end_y

        return x, y

    def _ease_in_out(self, t: float) -> float:
        """
        Apply ease-in-out easing to animation progress.

        Args:
            t: Progress from 0.0 to 1.0.

        Returns:
            Eased progress value.
        """
        if t < 0.5:
            return 2 * t * t
        else:
            return 1 - 2 * (1 - t) ** 2

    def draw(self, screen: pygame.Surface) -> None:
        """
        Draw the animated star.

        Args:
            screen: The pygame surface to draw on.
        """
        if not self.active:
            return

        x, y = self.get_position()

        # Calculate size (shrinks as it reaches destination)
        progress = self.current_frame / self.duration
        base_size = 40
        size = int(base_size * (1 - progress * 0.5))  # Shrink to half size

        # Calculate rotation for spinning effect
        rotation = progress * 360 * 2  # Two full rotations

        # Draw star with rotation
        self._draw_star(screen, int(x), int(y), size, (255, 215, 0), rotation)

    def _draw_star(
        self,
        screen: pygame.Surface,
        x: int,
        y: int,
        size: int,
        color: Tuple[int, int, int],
        rotation: float = 0
    ) -> None:
        """
        Draw a star shape.

        Args:
            screen: The pygame surface to draw on.
            x: Center x position.
            y: Center y position.
            size: Size of the star.
            color: RGB color tuple.
            rotation: Rotation angle in degrees.
        """
        # Create star points
        points = []
        num_points = 5
        outer_radius = size
        inner_radius = size * 0.4

        for i in range(num_points * 2):
            angle = math.radians(rotation + i * 180 / num_points - 90)
            radius = outer_radius if i % 2 == 0 else inner_radius
            px = x + radius * math.cos(angle)
            py = y + radius * math.sin(angle)
            points.append((px, py))

        # Draw the star
        if len(points) > 2:
            pygame.draw.polygon(screen, color, points)
            pygame.draw.polygon(screen, (255, 255, 200), points, 2)  # Outline


class Celebration:
    """Manages celebration animations for stars and level-ups."""

    def __init__(self, screen_width: int, screen_height: int) -> None:
        """
        Initialize the celebration manager.

        Args:
            screen_width: Width of the screen.
            screen_height: Height of the screen.
        """
        self.screen_width = screen_width
        self.screen_height = screen_height
        self.particles: List[Particle] = []
        self.star_animations: List[StarAnimation] = []
        self.level_up_animation: Optional[dict] = None
        self.font_large = pygame.font.Font(None, 120)
        self.font_medium = pygame.font.Font(None, 80)

    def show_star_animation(self, target_x: Optional[int] = None, target_y: Optional[int] = None) -> None:
        """
        Start a star animation from center to top-right corner.

        Args:
            target_x: Target x position (defaults to top-right corner).
            target_y: Target y position (defaults to top-right corner).
        """
        # Start position (center of screen)
        start_x = self.screen_width / 2
        start_y = self.screen_height / 2

        # End position (top-right corner by default)
        if target_x is None:
            target_x = self.screen_width - 100
        if target_y is None:
            target_y = 50

        # Create star animation
        star_anim = StarAnimation(start_x, start_y, target_x, target_y, duration=45)
        self.star_animations.append(star_anim)

        # Create particle burst at start position
        self._create_particle_burst(start_x, start_y, count=20, color=(255, 215, 0))

    def show_level_up(self, new_level: int) -> None:
        """
        Show level-up celebration animation.

        Args:
            new_level: The new level achieved.
        """
        self.level_up_animation = {
            "level": new_level,
            "frame": 0,
            "duration": 120,  # 2 seconds at 60 fps
        }

        # Create large particle burst in center
        center_x = self.screen_width / 2
        center_y = self.screen_height / 2
        self._create_particle_burst(center_x, center_y, count=50, color=(147, 51, 234))
        self._create_particle_burst(center_x, center_y, count=50, color=(249, 115, 22))

    def _create_particle_burst(
        self,
        x: float,
        y: float,
        count: int,
        color: Tuple[int, int, int]
    ) -> None:
        """
        Create a burst of particles at a position.

        Args:
            x: X position.
            y: Y position.
            count: Number of particles to create.
            color: Base color for particles.
        """
        for _ in range(count):
            # Random velocity in all directions
            angle = random.uniform(0, 2 * math.pi)
            speed = random.uniform(2, 8)
            vx = math.cos(angle) * speed
            vy = math.sin(angle) * speed

            # Slight color variation
            color_variation = tuple(
                max(0, min(255, c + random.randint(-30, 30))) for c in color
            )

            size = random.randint(3, 8)
            lifetime = random.randint(30, 60)

            particle = Particle(x, y, vx, vy, color_variation, size, lifetime)
            self.particles.append(particle)

    def update(self) -> None:
        """Update all active animations."""
        # Update particles
        self.particles = [p for p in self.particles if p.update()]

        # Update star animations
        self.star_animations = [s for s in self.star_animations if s.update()]

        # Update level-up animation
        if self.level_up_animation:
            self.level_up_animation["frame"] += 1
            if self.level_up_animation["frame"] >= self.level_up_animation["duration"]:
                self.level_up_animation = None

    def draw(self, screen: pygame.Surface) -> None:
        """
        Draw all active animations.

        Args:
            screen: The pygame surface to draw on.
        """
        # Draw particles
        for particle in self.particles:
            particle.draw(screen)

        # Draw star animations
        for star_anim in self.star_animations:
            star_anim.draw(screen)

        # Draw level-up message
        if self.level_up_animation:
            self._draw_level_up(screen)

    def _draw_level_up(self, screen: pygame.Surface) -> None:
        """
        Draw the level-up celebration message.

        Args:
            screen: The pygame surface to draw on.
        """
        if not self.level_up_animation:
            return

        frame = self.level_up_animation["frame"]
        duration = self.level_up_animation["duration"]
        level = self.level_up_animation["level"]

        # Calculate scale and alpha based on animation progress
        progress = frame / duration

        # Bounce in for first 30%, hold, then fade out for last 30%
        if progress < 0.3:
            # Bounce in
            scale = self._ease_out_bounce(progress / 0.3)
            alpha = 255
        elif progress > 0.7:
            # Fade out
            fade_progress = (progress - 0.7) / 0.3
            scale = 1.0
            alpha = int(255 * (1 - fade_progress))
        else:
            # Hold
            scale = 1.0
            alpha = 255

        # Draw "LEVEL UP!" text
        text = "LEVEL UP!"
        text_surface = self.font_large.render(text, True, (255, 255, 255))

        # Scale the text with smoothscale for anti-aliased quality
        if scale != 1.0:
            new_width = int(text_surface.get_width() * scale)
            new_height = int(text_surface.get_height() * scale)
            text_surface = pygame.transform.smoothscale(text_surface, (new_width, new_height))

        # Apply alpha
        text_surface.set_alpha(alpha)

        # Position in center
        text_rect = text_surface.get_rect(center=(self.screen_width / 2, self.screen_height / 2 - 50))

        # Draw shadow
        shadow_surface = text_surface.copy()
        shadow_surface.set_alpha(alpha // 2)
        shadow_rect = text_rect.copy()
        shadow_rect.x += 5
        shadow_rect.y += 5
        screen.blit(shadow_surface, shadow_rect)

        # Draw main text
        screen.blit(text_surface, text_rect)

        # Draw level number
        level_text = f"Level {level}!"
        level_surface = self.font_medium.render(level_text, True, (255, 215, 0))

        if scale != 1.0:
            new_width = int(level_surface.get_width() * scale)
            new_height = int(level_surface.get_height() * scale)
            level_surface = pygame.transform.smoothscale(level_surface, (new_width, new_height))

        level_surface.set_alpha(alpha)
        level_rect = level_surface.get_rect(center=(self.screen_width / 2, self.screen_height / 2 + 50))
        screen.blit(level_surface, level_rect)

    def _ease_out_bounce(self, t: float) -> float:
        """
        Bounce easing function.

        Args:
            t: Progress from 0.0 to 1.0.

        Returns:
            Eased value.
        """
        if t < 0.5:
            return 2 * t * t
        else:
            return 1 - 2 * (1 - t) ** 2

    def is_animating(self) -> bool:
        """
        Check if any animations are currently active.

        Returns:
            True if animations are active, False otherwise.
        """
        return (
            len(self.particles) > 0
            or len(self.star_animations) > 0
            or self.level_up_animation is not None
        )
