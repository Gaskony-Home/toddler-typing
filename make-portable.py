#!/usr/bin/env python3
"""
Create a portable distribution package.

This script builds the executable and creates a ready-to-distribute zip file.
"""

import os
import sys
import shutil
import subprocess
from pathlib import Path
from datetime import datetime
import hashlib


def calculate_checksum(file_path):
    """Calculate SHA256 checksum of a file."""
    sha256_hash = hashlib.sha256()
    with open(file_path, "rb") as f:
        for byte_block in iter(lambda: f.read(4096), b""):
            sha256_hash.update(byte_block)
    return sha256_hash.hexdigest()


def get_version():
    """Get version from __init__.py."""
    init_file = Path("src/toddler_typing/__init__.py")
    if init_file.exists():
        with open(init_file, "r") as f:
            for line in f:
                if line.startswith("__version__"):
                    version = line.split("=")[1].strip().strip('"').strip("'")
                    return version
    return "0.1.0"


def build_executable():
    """Build the executable using build.py."""
    print("=" * 70)
    print("STEP 1: Building executable...")
    print("=" * 70)

    result = subprocess.run([sys.executable, "build.py"])
    if result.returncode != 0:
        print("\n❌ Build failed!")
        return False

    print("\n✅ Build successful!")
    return True


def create_zip_package():
    """Create a zip file of the distribution."""
    print("\n" + "=" * 70)
    print("STEP 2: Creating distribution ZIP...")
    print("=" * 70)

    version = get_version()
    timestamp = datetime.now().strftime("%Y%m%d")

    dist_folder = Path("dist/toddler-typing")
    if not dist_folder.exists():
        print(f"\n❌ Distribution folder not found: {dist_folder}")
        return False

    # Create releases folder
    releases_folder = Path("releases")
    releases_folder.mkdir(exist_ok=True)

    # Zip filename with version and date
    zip_name = f"toddler-typing-v{version}-{timestamp}-portable"
    zip_path = releases_folder / zip_name

    print(f"\nCreating {zip_name}.zip...")

    # Create the zip file
    shutil.make_archive(str(zip_path), 'zip', 'dist', 'toddler-typing')

    final_zip = f"{zip_path}.zip"

    if Path(final_zip).exists():
        # Calculate size
        size_mb = os.path.getsize(final_zip) / (1024 * 1024)

        # Calculate checksum
        print("Calculating checksum...")
        checksum = calculate_checksum(final_zip)

        # Create checksum file
        checksum_file = f"{zip_path}.sha256"
        with open(checksum_file, "w") as f:
            f.write(f"{checksum}  {zip_name}.zip\n")

        print(f"\n✅ ZIP created: {final_zip}")
        print(f"   Size: {size_mb:.2f} MB")
        print(f"   SHA256: {checksum}")
        print(f"   Checksum file: {checksum_file}")

        return True
    else:
        print(f"\n❌ Failed to create ZIP file")
        return False


def create_release_notes():
    """Create release notes file."""
    print("\n" + "=" * 70)
    print("STEP 3: Creating release notes...")
    print("=" * 70)

    version = get_version()
    timestamp = datetime.now().strftime("%Y-%m-%d")

    releases_folder = Path("releases")
    notes_file = releases_folder / f"RELEASE_NOTES_v{version}.txt"

    with open(notes_file, "w") as f:
        f.write(f"""TODDLER TYPING - VERSION {version}
Release Date: {timestamp}

WHAT'S INCLUDED:
================
This is a fully portable version of Toddler Typing.
No Python installation required!

SYSTEM REQUIREMENTS:
===================
• Windows 7 or later (64-bit recommended)
• ~50 MB free disk space
• No other requirements!

INSTALLATION:
============
1. Extract the ZIP file anywhere on your computer
2. Open the extracted 'toddler-typing' folder
3. Double-click 'START_TODDLER_TYPING.bat' or 'toddler-typing.exe'
4. That's it!

QUICK START:
===========
• To run: Double-click the EXE or BAT file
• To exit: Press ESC (dev mode) or Ctrl+Shift+Esc (production mode)
• To configure: Edit config.json with Notepad
• For help: See QUICK_START.txt in the folder

FEATURES:
=========
✅ Keyboard locking (blocks Windows key, Alt+Tab, etc.)
✅ Educational activities (Letters, Numbers, Colors & Shapes)
✅ Drawing canvas with colors and brush sizes
✅ Child-friendly interface with large buttons
✅ Customizable settings
✅ Safe exit mechanism

CONFIGURATION MODES:
===================
Development Mode (default):
  - Windowed, easy exit with ESC
  - Good for testing

Production Mode:
  - Fullscreen, keyboard lock enabled
  - For actual toddler use
  - Switch by copying config.production.json to config.json

DOCUMENTATION:
=============
All documentation is included in the ZIP:
• PORTABLE_README.txt - Start here!
• QUICK_START.txt - Quick reference
• USAGE.md - Comprehensive guide
• README.md - Project information

SUPPORT:
========
• Issues: https://github.com/[your-repo]/toddler-typing/issues
• Documentation: See included files
• Configuration help: See config.example.json

SECURITY:
=========
• Open source code - fully auditable
• No network access
• No data collection
• Safe for children

Enjoy! 🎨🔤🔢
""")

    print(f"✅ Release notes created: {notes_file}")
    return True


def print_summary():
    """Print final summary."""
    print("\n" + "=" * 70)
    print("🎉 PORTABLE DISTRIBUTION COMPLETE!")
    print("=" * 70)

    version = get_version()
    releases_folder = Path("releases")

    print(f"\n📦 Distribution package ready in: {releases_folder}/")
    print("\nFiles created:")

    for file in releases_folder.glob("*"):
        if file.is_file():
            size_mb = os.path.getsize(file) / (1024 * 1024)
            print(f"  • {file.name} ({size_mb:.2f} MB)")

    print("\n📋 NEXT STEPS:")
    print("  1. Test the ZIP on a clean Windows machine")
    print("  2. Verify all features work correctly")
    print("  3. Share the ZIP file with users")
    print("  4. Include the release notes when distributing")

    print("\n💡 TIP: Users just extract and run - no installation needed!")


def main():
    """Main execution."""
    print("╔════════════════════════════════════════════════════════════════╗")
    print("║     TODDLER TYPING - PORTABLE DISTRIBUTION BUILDER            ║")
    print("╚════════════════════════════════════════════════════════════════╝")

    # Step 1: Build executable
    if not build_executable():
        sys.exit(1)

    # Step 2: Create ZIP package
    if not create_zip_package():
        sys.exit(1)

    # Step 3: Create release notes
    create_release_notes()

    # Final summary
    print_summary()


if __name__ == "__main__":
    main()
