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
- **Input Validation**: All IPC inputs are validated and sanitized
- **Content Security Policy**: Strict CSP prevents script injection
- **Context Isolation**: Electron renderer is sandboxed

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

1. Test the app before handing it to your child
2. Supervise young children during initial use
3. Settings persist automatically via electron-conf

### For Developers

1. Validate all IPC inputs (see `ipc-handlers.js`)
2. Never disable `contextIsolation` or `sandbox`
3. Keep CSP strict - no `unsafe-eval`
4. Review security implications of new features

## Known Limitations

- Keyboard lock only works on Windows
- Ctrl+Alt+Delete cannot be blocked (by design)

## Dependencies

Core dependencies:
- electron ^40.x
- electron-conf ^1.3.x
- electron-updater ^6.x

Keep dependencies updated and review changelogs for security patches.
