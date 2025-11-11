"""
Version increment utility for Toddler Typing.

This script automatically increments the version number.
Usage:
    python increment_version.py [major|minor|patch]

    If no argument is provided, defaults to patch increment.
"""

import sys
from pathlib import Path


def read_version():
    """Read current version from __version__.py"""
    version_file = Path("src/toddler_typing/__version__.py")

    if not version_file.exists():
        print("Error: __version__.py not found")
        return None

    content = version_file.read_text()

    # Extract version string
    for line in content.split('\n'):
        if line.startswith('__version__'):
            # Extract version from string like: __version__ = "1.0.0"
            version_str = line.split('=')[1].strip().strip('"').strip("'")
            return version_str

    return None


def parse_version(version_str):
    """Parse version string into (major, minor, patch) tuple"""
    try:
        parts = version_str.split('.')
        return int(parts[0]), int(parts[1]), int(parts[2])
    except (ValueError, IndexError):
        print(f"Error: Invalid version format: {version_str}")
        return None


def increment_version(version_str, bump_type='patch'):
    """Increment version based on bump type"""
    parsed = parse_version(version_str)
    if not parsed:
        return None

    major, minor, patch = parsed

    if bump_type == 'major':
        major += 1
        minor = 0
        patch = 0
    elif bump_type == 'minor':
        minor += 1
        patch = 0
    elif bump_type == 'patch':
        patch += 1
    else:
        print(f"Error: Invalid bump type: {bump_type}")
        return None

    return f"{major}.{minor}.{patch}"


def write_version(new_version):
    """Write new version to __version__.py"""
    version_file = Path("src/toddler_typing/__version__.py")

    content = f'''"""Version information for Toddler Typing."""

__version__ = "{new_version}"
'''

    version_file.write_text(content)
    print(f"[OK] Updated __version__.py to {new_version}")


def update_version_file(new_version):
    """Update VERSION file for reference"""
    version_file = Path("VERSION")
    version_file.write_text(new_version)
    print(f"[OK] Updated VERSION file to {new_version}")


def main():
    """Main version increment process"""
    bump_type = sys.argv[1] if len(sys.argv) > 1 else 'patch'

    if bump_type not in ['major', 'minor', 'patch']:
        print(f"Usage: python increment_version.py [major|minor|patch]")
        print(f"  Default: patch")
        sys.exit(1)

    print(f"Incrementing version ({bump_type})...")

    # Read current version
    current_version = read_version()
    if not current_version:
        sys.exit(1)

    print(f"  Current version: {current_version}")

    # Increment version
    new_version = increment_version(current_version, bump_type)
    if not new_version:
        sys.exit(1)

    print(f"  New version: {new_version}")

    # Write new version
    write_version(new_version)
    update_version_file(new_version)

    print("\n[OK] Version increment complete!")
    print(f"\nNext steps:")
    print(f"  1. Commit the version change")
    print(f"  2. Run build.py to create new executable")
    print(f"  3. Desktop shortcut will be automatically updated")


if __name__ == "__main__":
    main()
