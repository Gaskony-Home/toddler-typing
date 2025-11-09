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
            try:
                shutil.rmtree(dir_name)
                print(f"  Removed {dir_name}/")
            except PermissionError:
                print(f"  WARNING: Could not remove {dir_name}/ (files in use)")
                print(f"  Attempting to continue anyway...")

    # Remove spec files
    for spec_file in Path(".").glob("*.spec"):
        try:
            spec_file.unlink()
            print(f"  Removed {spec_file}")
        except PermissionError:
            print(f"  WARNING: Could not remove {spec_file} (file in use)")


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

    # Get absolute paths for security
    project_root = Path(__file__).parent.resolve()
    main_script = project_root / "launcher.py"
    assets_dir = project_root / "src" / "toddler_typing" / "assets"
    icon_path = assets_dir / "images" / "icon.ico"

    # Validate paths exist
    if not main_script.exists():
        print(f"  ERROR: Launcher script not found: {main_script}")
        return False

    if not assets_dir.exists():
        print(f"  ERROR: Assets directory not found: {assets_dir}")
        return False

    # Build command with validated absolute paths
    # Use python -m pyinstaller to avoid PATH issues
    cmd = [
        sys.executable,  # Use the same Python interpreter
        "-m",
        "PyInstaller",
        "--name=toddler-typing",
        "--onedir",  # Create a directory with dependencies
        "--windowed",  # No console window
        "--clean",
        "-y",  # Overwrite output directory without confirmation
        f"--add-data={assets_dir}{os.pathsep}assets",
        "--hidden-import=pygame",
        "--hidden-import=pynput",
        "--hidden-import=pynput.keyboard",
        "--hidden-import=pynput.keyboard._win32",
        "--hidden-import=pyttsx3",
        "--hidden-import=comtypes",
        "--hidden-import=toddler_typing",
        "--hidden-import=toddler_typing.main",
        "--hidden-import=toddler_typing.activities",
        "--hidden-import=toddler_typing.config",
        "--collect-all=pygame",
        f"--paths={project_root / 'src'}",  # Add src directory to Python path
        str(main_script),  # Use string of Path object for safety
    ]

    # Add icon if it exists
    if icon_path.exists():
        cmd.extend(["--icon", str(icon_path)])

    print(f"  Running PyInstaller with validated paths")

    try:
        # IMPORTANT: Never use shell=True
        result = subprocess.run(
            cmd,
            check=True,
            cwd=str(project_root),  # Explicit working directory
            capture_output=True,
            text=True
        )
        print("\n[SUCCESS] Build successful!")
        return True
    except subprocess.CalledProcessError as e:
        print(f"\n[FAILED] Build failed")
        if e.stdout:
            print(f"  Output: {e.stdout[-2000:]}")  # Show last 2000 chars
        if e.stderr:
            print(f"  Error: {e.stderr[-2000:]}")  # Show last 2000 chars
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

    # Copy USAGE guide
    usage_src = Path("USAGE.md")
    if usage_src.exists():
        shutil.copy(usage_src, dist_dir / "USAGE.md")
        print("  Copied USAGE.md")

    # Copy configuration files
    for config_file in ["config.dev.json", "config.production.json", "config.example.json"]:
        config_src = Path(config_file)
        if config_src.exists():
            shutil.copy(config_src, dist_dir / config_file)
            print(f"  Copied {config_file}")

    # Create default config.json (development mode for first run)
    default_config = dist_dir / "config.json"
    shutil.copy(Path("config.dev.json"), default_config)
    print("  Created config.json (development mode)")

    # Create Windows batch file for easy launching
    batch_file = dist_dir / "START_TODDLER_TYPING.bat"
    with open(batch_file, "w") as f:
        f.write("""@echo off
REM Toddler Typing Launcher
REM Double-click this file to start the application

echo Starting Toddler Typing...
start "" "toddler-typing.exe"
""")
    print("  Created START_TODDLER_TYPING.bat")

    # Create quick start guide
    quick_start = dist_dir / "QUICK_START.txt"
    with open(quick_start, "w", encoding="utf-8") as f:
        f.write("""============================================================
         TODDLER TYPING - QUICK START GUIDE
============================================================

RUNNING THE PROGRAM:
   Option 1: Double-click 'toddler-typing.exe'
   Option 2: Double-click 'START_TODDLER_TYPING.bat'

EXITING THE PROGRAM:
   Press Ctrl + Shift + Esc together (all three keys at once)

CONFIGURATION MODES:

   DEVELOPMENT MODE (Current Default):
   - Windowed mode (not fullscreen)
   - Easy exit with ESC key
   - No keyboard lock
   - Good for testing and parent use

   To switch: Copy 'config.dev.json' to 'config.json'

   PRODUCTION MODE (For Toddler Use):
   - Fullscreen mode
   - Keyboard lock enabled (blocks Windows key, Alt+Tab, etc.)
   - Only exits with Ctrl+Shift+Esc

   To switch: Copy 'config.production.json' to 'config.json'

CUSTOMIZATION:
   1. Edit 'config.json' with Notepad
   2. Adjust settings as needed
   3. Save and restart the program

ACTIVITIES:
   - Letters - Press the letter shown on screen
   - Numbers - Press the number shown on screen
   - Drawing - Click and drag to draw, click colors to change
   - Colors & Shapes - Click to see different colored shapes

TROUBLESHOOTING:
   - Won't start? Make sure Windows 7 or later
   - Keyboard lock issues? Try running as Administrator
   - See USAGE.md for detailed help

SAFETY FEATURES:
   - Blocks Windows key and system shortcuts (when enabled)
   - Fullscreen prevents window switching (when enabled)
   - Secure exit combination (Ctrl+Shift+Esc)

MORE INFO:
   - Full guide: See USAGE.md
   - Configuration: See config.example.json
   - General info: See README.md

Enjoy!
""")
    print("  Created QUICK_START.txt")

    # Create portable README
    portable_readme = dist_dir / "PORTABLE_README.txt"
    with open(portable_readme, "w", encoding="utf-8") as f:
        f.write("""TODDLER TYPING - PORTABLE VERSION
==================================

This is a FULLY PORTABLE version of Toddler Typing.

[+] NO PYTHON INSTALLATION REQUIRED
[+] NO DEPENDENCIES TO INSTALL
[+] RUNS ON ANY WINDOWS COMPUTER
[+] JUST EXTRACT AND RUN

WHAT'S IN THIS FOLDER:
  toddler-typing.exe      - The main application
  START_TODDLER_TYPING.bat - Easy launcher (double-click this!)
  config.json             - Current settings (dev mode by default)
  config.dev.json         - Development mode settings
  config.production.json  - Production mode settings
  config.example.json     - Configuration template
  QUICK_START.txt         - Quick start guide (READ THIS FIRST!)
  USAGE.md                - Detailed usage guide
  README.md               - Project information
  _internal/              - Required libraries (don't delete!)

QUICK START:
  1. Extract this entire folder anywhere on your computer
  2. Double-click 'START_TODDLER_TYPING.bat' or 'toddler-typing.exe'
  3. Press ESC to exit (in dev mode) or Ctrl+Shift+Esc (in production mode)

SHARING THIS:
  • Zip the ENTIRE folder
  • Share the zip file
  • Recipient extracts and runs - that's it!

SYSTEM REQUIREMENTS:
  • Windows 7 or later
  • No other requirements!

See QUICK_START.txt for more details.
""")
    print("  Created PORTABLE_README.txt")

    print("\n[SUCCESS] Distribution package created in dist/toddler-typing/")
    print("\n" + "=" * 60)
    print("PORTABLE DISTRIBUTION READY!")
    print("=" * 60)
    print("\nFolder location: dist/toddler-typing/")
    print("\nTo distribute:")
    print("  1. Zip the entire 'dist/toddler-typing' folder")
    print("  2. Share the zip file")
    print("  3. Recipients extract and double-click 'toddler-typing.exe'")
    print("\nTo test now:")
    print("  cd dist/toddler-typing")
    print("  toddler-typing.exe")

    return True


def update_desktop_shortcut():
    """Update desktop shortcut to point to latest build."""
    print("\nUpdating desktop shortcut...")

    try:
        # Run PowerShell script to create/update shortcut
        script_path = Path(__file__).parent / "create_shortcut.ps1"

        if not script_path.exists():
            print("  WARNING: create_shortcut.ps1 not found, skipping shortcut update")
            return True

        result = subprocess.run(
            ["powershell", "-ExecutionPolicy", "Bypass", "-File", str(script_path)],
            capture_output=True,
            text=True,
            cwd=str(Path(__file__).parent)
        )

        if result.returncode == 0:
            print("  Desktop shortcut updated successfully!")
            return True
        else:
            print(f"  WARNING: Could not update desktop shortcut")
            if result.stderr:
                print(f"  Error: {result.stderr[:200]}")
            return True  # Don't fail the build for shortcut issues

    except Exception as e:
        print(f"  WARNING: Could not update desktop shortcut: {e}")
        return True  # Don't fail the build for shortcut issues


def main():
    """Main build process."""
    print("=" * 60)
    print("TODDLER TYPING - BUILD SCRIPT")
    print("=" * 60)
    print()

    # Check dependencies
    if not check_dependencies():
        print("\n[FAILED] Missing dependencies. Please install required packages.")
        sys.exit(1)

    # Clean previous builds
    clean_build_artifacts()

    # Create executable
    if not create_executable():
        print("\n[FAILED] Build failed.")
        sys.exit(1)

    # Create distribution package
    if not create_distribution_package():
        print("\n[FAILED] Failed to create distribution package.")
        sys.exit(1)

    print("\n" + "=" * 60)
    print("BUILD COMPLETE!")
    print("=" * 60)

    # Update desktop shortcut
    update_desktop_shortcut()


if __name__ == "__main__":
    main()
