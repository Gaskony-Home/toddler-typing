const { autoUpdater } = require('electron-updater');

class AutoUpdater {
  constructor(mainWindow) {
    this.mainWindow = mainWindow;

    autoUpdater.autoDownload = false;
    autoUpdater.autoInstallOnAppQuit = false;

    autoUpdater.on('update-available', (info) => {
      console.log('Update available:', info.version);
      if (this.mainWindow && !this.mainWindow.isDestroyed()) {
        this.mainWindow.webContents.send('update-available', {
          version: info.version,
          releaseDate: info.releaseDate
        });
      }
    });

    autoUpdater.on('update-downloaded', () => {
      console.log('Update downloaded, ready to install');
      if (this.mainWindow && !this.mainWindow.isDestroyed()) {
        this.mainWindow.webContents.send('update-downloaded');
      }
    });

    autoUpdater.on('error', (err) => {
      console.error('Auto-updater error:', err.message);
    });
  }

  checkForUpdates() {
    autoUpdater.checkForUpdates().catch((err) => {
      console.error('Failed to check for updates:', err.message);
    });
  }

  downloadUpdate() {
    autoUpdater.downloadUpdate().catch((err) => {
      console.error('Failed to download update:', err.message);
    });
  }

  quitAndInstall() {
    autoUpdater.quitAndInstall();
  }
}

module.exports = { AutoUpdater };
