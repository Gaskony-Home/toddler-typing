const { Conf } = require('electron-conf/main');

const settingsSchema = {
  type: 'object',
  properties: {
    theme: { type: 'string', default: 'dark', enum: ['light', 'dark'] },
    fullscreen: { type: 'boolean', default: false },
    voice_enabled: { type: 'boolean', default: true },
    dino_voice_enabled: { type: 'boolean', default: true },
    keyboard_lock_enabled: { type: 'boolean', default: true },
    volume: { type: 'number', default: 1.0, minimum: 0, maximum: 1 },
    exit_combination: {
      type: 'array',
      default: ['ctrl', 'shift', 'esc'],
      items: { type: 'string' }
    }
  }
};

class SettingsManager {
  constructor() {
    this.store = new Conf({
      name: 'settings',
      schema: settingsSchema
    });
  }

  get(key) {
    return this.store.get(key);
  }

  set(key, value) {
    this.store.set(key, value);
  }

  getAll() {
    return {
      theme: this.store.get('theme'),
      fullscreen: this.store.get('fullscreen'),
      voice_enabled: this.store.get('voice_enabled'),
      dino_voice_enabled: this.store.get('dino_voice_enabled'),
      keyboard_lock_enabled: this.store.get('keyboard_lock_enabled'),
      volume: this.store.get('volume'),
      exit_combination: this.store.get('exit_combination')
    };
  }
}

module.exports = { SettingsManager };
