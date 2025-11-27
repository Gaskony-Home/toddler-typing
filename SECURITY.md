# Security Policy

## Reporting Vulnerabilities

If you discover a security vulnerability:

1. **DO NOT** open a public GitHub issue
2. Email the maintainers directly (see repository contact info)
3. Include: description, steps to reproduce, potential impact

We will respond within 48 hours.

## Security Features

### What We Do

- **No Network Access**: App never connects to the internet
- **No Data Collection**: Zero telemetry or personal data
- **Minimal Dependencies**: Only essential libraries
- **Open Source**: All code is auditable
- **Input Validation**: All configuration values are validated

### Keyboard Lock (Windows Only)

The keyboard lock feature:
- Blocks Windows key, Alt+Tab, Alt+F4, and other system shortcuts
- **Cannot block Ctrl+Alt+Delete** - this is a Windows security feature by design
- Is a convenience feature, not a security boundary
- Requires parental supervision for young children

### Privacy

- No data collection from children
- No internet connectivity
- No accounts or registration
- No advertisements
- Compliant with COPPA and GDPR principles

## Best Practices

### For Parents

1. Test the app in development mode first
2. Learn the exit combination: **Ctrl+Shift+Esc**
3. Supervise young children during initial use
4. Use production config (`config.production.json`) for toddler use

### For Developers

1. Validate all user inputs
2. Never use `eval()` or `exec()`
3. Use parameterized paths (no string concatenation)
4. Review security implications of new features

## Known Limitations

- Keyboard lock only works on Windows
- Ctrl+Alt+Delete cannot be blocked (by design)
- PyInstaller executables may trigger antivirus false positives

## Dependencies

Core dependencies with pinned versions:
- pygame==2.5.2
- pynput==1.7.6
- pillow==10.1.0

Keep dependencies updated and review changelogs for security patches.
