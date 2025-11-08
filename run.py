#!/usr/bin/env python3
"""
Quick run script for Toddler Typing.

This script makes it easy to run the application directly
without installation.
"""

import sys
from pathlib import Path

# Add src to path so we can import toddler_typing
src_path = Path(__file__).parent / "src"
sys.path.insert(0, str(src_path))

from toddler_typing.main import main

if __name__ == "__main__":
    main()
