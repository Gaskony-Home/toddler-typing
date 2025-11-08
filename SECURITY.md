# Security Policy

## Overview

Toddler Typing is designed as a safe, child-friendly application for toddlers ages 2-5. Security is a priority to ensure both the safety of the children using it and the systems it runs on.

## Reporting Security Vulnerabilities

If you discover a security vulnerability, please report it by:

1. **DO NOT** open a public GitHub issue
2. Email the maintainers directly (see repository for contact)
3. Include:
   - Description of the vulnerability
   - Steps to reproduce
   - Potential impact
   - Suggested fix (if any)

We will respond within 48 hours and work to address confirmed vulnerabilities promptly.

## Known Security Considerations

### Current Security Status

A comprehensive security audit was completed on 2025-11-08. The following security considerations should be noted:

### Critical Findings (TO BE FIXED BEFORE PRODUCTION)

1. **Configuration Injection Vulnerability** - The configuration loading system currently accepts arbitrary attributes without validation. This will be fixed in the next release with whitelist-based validation.

2. **Path Traversal Risk** - Configuration file paths are not fully validated. This will be addressed with strict path validation in the next release.

### High Priority Findings (IN PROGRESS)

1. **Command Injection in Build Scripts** - Build scripts need improved input validation
2. **Error Message Information Disclosure** - Implementing proper logging framework
3. **Input Validation** - Adding comprehensive validation for all configuration values

### Medium Priority Findings (PLANNED)

1. **Keyboard Lock Bypass** - Some system key combinations cannot be blocked (by design)
2. **Race Conditions** - Adding thread safety to keyboard lock mechanism
3. **Asset Path Validation** - Making asset paths immutable and validated

### Low Priority Findings (FUTURE)

1. **Dependency Version Pinning** - Will implement exact version pinning
2. **Code Signing** - Planned for future releases
3. **Integrity Checks** - Adding checksum verification

## Security Features

### What We Do

- **No Network Access**: The application never connects to the internet
- **No Data Collection**: No personal information is collected or transmitted
- **Minimal Dependencies**: Only three core libraries to reduce attack surface
- **Open Source**: All code is auditable and transparent
- **Keyboard Locking**: Prevents accidental system access (Windows only)
- **Secure Exit**: Requires specific key combination to exit

### What We Don't Do

- We do NOT collect any user data
- We do NOT require internet connectivity
- We do NOT install system-level hooks or drivers
- We do NOT require administrator privileges (except for optional keyboard lock features)
- We do NOT modify system settings

## Keyboard Lock Limitations

### By Design Limitations

The keyboard lock feature has intentional limitations for safety:

1. **Ctrl+Alt+Delete Cannot Be Blocked**: This is a Windows security feature. The Secure Attention Sequence (SAS) cannot be blocked by user-space applications, and this is by design for system security.

2. **Not a Substitute for Supervision**: The keyboard lock is a convenience feature, not a security boundary. Parental supervision is still recommended.

3. **Windows Only**: Keyboard locking only works on Windows. On other platforms, the feature gracefully degrades.

### Recommended Usage

- Use fullscreen mode for best isolation
- Set a secure exit combination (default: Ctrl+Shift+Esc)
- Supervise young children during use
- Use production configuration for actual toddler use

## Configuration Security

### Best Practices

1. **Use Provided Config Templates**: Start with `config.example.json` or the provided dev/production configs
2. **Validate JSON Syntax**: Ensure your config file is valid JSON
3. **Limit Permissions**: Configuration files should not be world-writable
4. **Use Production Mode**: Enable keyboard lock and fullscreen for toddler use

### What NOT to Do

- Do not put configuration files in world-writable directories
- Do not use untrusted configuration files
- Do not disable security features without understanding the implications
- Do not run the application with elevated privileges unless necessary

## Build and Distribution Security

### For Developers Building From Source

1. **Verify Dependencies**: Always install from official package repositories
2. **Check Integrity**: Verify package signatures when possible
3. **Scan Builds**: Run antivirus scans on built executables
4. **Test in Sandbox**: Test builds in isolated environments first

### For End Users

1. **Download from Official Sources**: Only download releases from the official repository
2. **Verify Checksums**: Compare SHA256 checksums of downloaded files
3. **Scan Downloads**: Run antivirus scans before executing
4. **Read Documentation**: Review security considerations before first use

### Antivirus False Positives

PyInstaller-built executables may trigger false positives in some antivirus software. This is a known issue with PyInstaller and not a sign of malware. The code is open source and auditable.

To verify authenticity:
1. Build from source yourself
2. Check SHA256 checksums (when provided)
3. Review the source code
4. Report false positives to your antivirus vendor

## Development Security

### For Contributors

1. **Follow Secure Coding Practices**:
   - Validate all inputs
   - Avoid string concatenation for system commands
   - Use parameterized paths
   - Implement proper error handling

2. **Security Testing**:
   - Test with malformed inputs
   - Verify path traversal protection
   - Check error message content
   - Review configuration handling

3. **Code Review**:
   - All changes should be reviewed
   - Security-sensitive changes require thorough review
   - Use static analysis tools

### Security Checklist for Pull Requests

- [ ] Input validation implemented for new features
- [ ] No hardcoded credentials or secrets
- [ ] Error messages don't leak sensitive information
- [ ] File paths are validated and sanitized
- [ ] No use of `eval()`, `exec()`, or similar dangerous functions
- [ ] Dependencies are from trusted sources
- [ ] New features don't bypass security controls
- [ ] Documentation updated with security considerations

## Vulnerability Disclosure Timeline

When a security vulnerability is reported:

1. **Day 0**: Vulnerability reported
2. **Day 1-2**: Initial assessment and response
3. **Day 3-7**: Develop and test fix
4. **Day 8-14**: Release patched version
5. **Day 15+**: Public disclosure (after users have time to update)

## Supported Versions

Currently in active development. Security updates will be provided for:

- Latest release version
- Current development branch

## Security Updates

Security updates will be:
- Released as soon as possible after discovery
- Clearly marked in release notes
- Announced through repository notifications

## Privacy

### What Data We Process

Toddler Typing processes:
- Configuration settings (stored locally)
- User interactions (not stored or transmitted)
- Display preferences (stored locally)

### What Data We Store

- Configuration in `config.json` (local only)
- No user activity logs
- No analytics or telemetry

### What Data We Transmit

- Nothing. The application never connects to the internet.

## Permissions Required

### Windows

- **Standard User**: Application runs fine for most features
- **Administrator** (Optional): May be needed for keyboard lock to work reliably
- **No Special Permissions**: Does not require driver installation or system modifications

### File System Access

- **Read**: Configuration files, asset files
- **Write**: Configuration file (only when saving settings)
- **No Access**: System directories, other user directories

## Compliance

### COPPA Compliance

Toddler Typing is designed with children's privacy in mind:
- No data collection from children
- No internet connectivity
- No account creation
- No advertisements
- No third-party tracking
- Completely offline operation

### GDPR Compliance

- No personal data processing
- No data transmission
- No cookies or tracking
- No data retention (nothing is stored)
- Full transparency (open source)

## Security Roadmap

### Version 1.0 (Before First Stable Release)

- [ ] Fix all CRITICAL security findings
- [ ] Fix all HIGH priority security findings
- [ ] Implement comprehensive input validation
- [ ] Add proper logging framework
- [ ] Security audit and penetration testing

### Version 1.1 (Post-Release)

- [ ] Address MEDIUM priority findings
- [ ] Implement dependency scanning in CI/CD
- [ ] Add automated security testing
- [ ] Code signing for executables

### Version 2.0 (Future)

- [ ] Address LOW priority findings
- [ ] Implement integrity checking
- [ ] Enhanced sandboxing
- [ ] Parent control panel with password protection

## Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [CWE Top 25](https://cwe.mitre.org/top25/)
- [Python Security Best Practices](https://python.readthedocs.io/en/stable/library/security_warnings.html)
- [PyInstaller Security](https://pyinstaller.org/en/stable/operating-mode.html#hiding-the-source-code)

## Contact

For security concerns, please contact the project maintainers through:
- GitHub Issues (for non-sensitive matters)
- Direct email (for vulnerabilities - see repository)

## Acknowledgments

We appreciate responsible disclosure of security vulnerabilities and thank the security research community for their contributions to open source security.

---

Last Updated: 2025-11-08
Next Review: Before v1.0 release
