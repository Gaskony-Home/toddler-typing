"""
Build script for creating a portable Windows executable.

This script uses PyInstaller to create a standalone executable
that can run on any Windows computer without Python installed.
"""

import os
import sys
import shutil
import subprocess
from pathlib import Path


def clean_build_artifacts():
    """Remove previous build artifacts."""
    print("Cleaning previous build artifacts...")

    dirs_to_remove = ["build", "dist"]
    for dir_name in dirs_to_remove:
        if os.path.exists(dir_name):
            shutil.rmtree(dir_name)
            print(f"  Removed {dir_name}/")

    # Remove spec files
    for spec_file in Path(".").glob("*.spec"):
        spec_file.unlink()
        print(f"  Removed {spec_file}")


def check_dependencies():
    """Check if required dependencies are installed."""
    print("Checking dependencies...")

    try:
        import PyInstaller
        print("  PyInstaller found")
    except ImportError:
        print("  ERROR: PyInstaller not found")
        print("  Install with: pip install pyinstaller")
        return False

    try:
        import pygame
        print("  Pygame found")
    except ImportError:
        print("  ERROR: Pygame not found")
        print("  Install with: pip install pygame")
        return False

    try:
        import pynput
        print("  Pynput found")
    except ImportError:
        print("  ERROR: Pynput not found")
        print("  Install with: pip install pynput")
        return False

    return True


def create_executable():
    """Create the executable using PyInstaller."""
    print("\nBuilding executable...")

    # Get the main script path
    main_script = "src/toddler_typing/main.py"

    # PyInstaller command
    cmd = [
        "pyinstaller",
        "--name=toddler-typing",
        "--onedir",  # Create a directory with dependencies
        "--windowed",  # No console window
        "--clean",
        f"--add-data=src/toddler_typing/assets{os.pathsep}assets",
        "--hidden-import=pygame",
        "--hidden-import=pynput",
        "--hidden-import=pynput.keyboard",
        "--hidden-import=pynput.keyboard._win32",
        "--collect-all=pygame",
        main_script,
    ]

    # Add icon if it exists
    icon_path = Path("src/toddler_typing/assets/images/icon.ico")
    if icon_path.exists():
        cmd.extend(["--icon", str(icon_path)])

    print(f"  Running: {' '.join(cmd)}")

    try:
        subprocess.run(cmd, check=True)
        print("\n✓ Build successful!")
        return True
    except subprocess.CalledProcessError as e:
        print(f"\n✗ Build failed with error: {e}")
        return False


def create_distribution_package():
    """Create a complete distribution package with documentation."""
    print("\nCreating distribution package...")

    dist_dir = Path("dist/toddler-typing")

    if not dist_dir.exists():
        print("  ERROR: dist/toddler-typing directory not found")
        return False

    # Copy README
    readme_src = Path("README.md")
    if readme_src.exists():
        shutil.copy(readme_src, dist_dir / "README.md")
        print("  Copied README.md")

    # Copy configuration example
    config_example = dist_dir / "config.example.json"
    with open(config_example, "w") as f:
        f.write("""{
  "fullscreen": true,
  "enable_keyboard_lock": true,
  "exit_combination": ["ctrl", "shift", "esc"],
  "enable_letters": true,
  "enable_numbers": true,
  "enable_colors": true,
  "enable_shapes": true,
  "enable_sounds": true
}
""")
    print("  Created config.example.json")

    # Create quick start guide
    quick_start = dist_dir / "QUICK_START.txt"
    with open(quick_start, "w") as f:
        f.write("""TODDLER TYPING - QUICK START GUIDE
====================================

RUNNING THE PROGRAM:
1. Double-click 'toddler-typing.exe'
2. The program will start in fullscreen mode

EXITING THE PROGRAM:
Press Ctrl + Shift + Esc together to exit

CUSTOMIZATION:
1. Copy 'config.example.json' to 'config.json'
2. Edit 'config.json' with your preferred settings
3. Restart the program

TROUBLESHOOTING:
- If the program doesn't start, ensure you're running Windows 7 or later
- For keyboard lock issues, try running as Administrator
- Check README.md for full documentation

SAFETY FEATURES:
- Blocks Windows key, Alt+Tab, and system shortcuts
- Fullscreen mode prevents window switching
- Only exits with Ctrl+Shift+Esc

Enjoy!
""")
    print("  Created QUICK_START.txt")

    print("\n✓ Distribution package created in dist/toddler-typing/")
    print("\nTo distribute:")
    print("  1. Zip the entire 'dist/toddler-typing' folder")
    print("  2. Share the zip file")
    print("  3. Recipients can extract and run toddler-typing.exe")

    return True


def main():
    """Main build process."""
    print("=" * 60)
    print("TODDLER TYPING - BUILD SCRIPT")
    print("=" * 60)
    print()

    # Check dependencies
    if not check_dependencies():
        print("\n✗ Missing dependencies. Please install required packages.")
        sys.exit(1)

    # Clean previous builds
    clean_build_artifacts()

    # Create executable
    if not create_executable():
        print("\n✗ Build failed.")
        sys.exit(1)

    # Create distribution package
    if not create_distribution_package():
        print("\n✗ Failed to create distribution package.")
        sys.exit(1)

    print("\n" + "=" * 60)
    print("BUILD COMPLETE!")
    print("=" * 60)


if __name__ == "__main__":
    main()
