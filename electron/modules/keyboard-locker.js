const { BrowserWindow, globalShortcut } = require('electron');

class KeyboardLocker {
  constructor() {
    this.enabled = false;
    this.registeredShortcuts = [];
  }

  enable() {
    if (this.enabled || process.platform !== 'win32') return;

    this.enabled = true;

    // Enter kiosk mode on the focused window
    const win = BrowserWindow.getFocusedWindow();
    if (win) {
      win.setKiosk(true);
    }

    // Register exit combo: Ctrl+Shift+Esc
    try {
      const exitRegistered = globalShortcut.register('Ctrl+Shift+Escape', () => {
        this.disable();
        const win = BrowserWindow.getFocusedWindow();
        if (win) {
          win.setKiosk(false);
        }
      });
      if (exitRegistered) {
        this.registeredShortcuts.push('Ctrl+Shift+Escape');
      }
    } catch (_e) {
      // Shortcut may already be registered
    }

    // Block common escape shortcuts by registering them as no-ops
    const blockedShortcuts = [
      'Alt+Tab',
      'Alt+F4',
      'Alt+Escape',
      'Super+D',
      'Super+E',
      'Super+R',
      'Super+L'
    ];

    for (const shortcut of blockedShortcuts) {
      try {
        const registered = globalShortcut.register(shortcut, () => {
          // Intentionally empty - block the shortcut
        });
        if (registered) {
          this.registeredShortcuts.push(shortcut);
        }
      } catch (_e) {
        // Some shortcuts can't be registered
      }
    }
  }

  disable() {
    if (!this.enabled) return;

    this.enabled = false;

    // Exit kiosk mode
    const win = BrowserWindow.getFocusedWindow();
    if (win) {
      win.setKiosk(false);
    }

    // Unregister all shortcuts
    for (const shortcut of this.registeredShortcuts) {
      try {
        globalShortcut.unregister(shortcut);
      } catch (_e) {
        // Ignore errors during cleanup
      }
    }
    this.registeredShortcuts = [];
  }

  cleanup() {
    this.disable();
  }
}

module.exports = { KeyboardLocker };
