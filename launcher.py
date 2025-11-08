#!/usr/bin/env python3
"""
Launcher script for Toddler Typing when building with PyInstaller.

This script serves as the entry point for the PyInstaller build,
allowing the package to be properly bundled and imported.
"""

import sys
from pathlib import Path

# Add src directory to path for development/source runs
src_dir = Path(__file__).parent / "src"
if src_dir.exists():
    sys.path.insert(0, str(src_dir))

# Import and run the main application
from toddler_typing.main import main

if __name__ == "__main__":
    main()
