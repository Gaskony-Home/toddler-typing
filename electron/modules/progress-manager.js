const { Conf } = require('electron-conf/main');

// Level thresholds (inclusive lower bound)
const LEVEL_THRESHOLDS = {
  1: 0,     // Level 1: 0-50 stars
  2: 51,    // Level 2: 51-150 stars
  3: 151,   // Level 3: 151-300 stars
  4: 301    // Level 4: 301+ stars
};

const progressSchema = {
  type: 'object',
  properties: {
    total_stars: { type: 'number', default: 0 },
    current_level: { type: 'number', default: 1 },
    stars_by_activity: {
      type: 'object',
      default: {
        letters_numbers: 0,
        drawing: 0,
        colors_shapes: 0,
        coloring: 0,
        dot2dot: 0,
        sounds: 0,
        typing_game: 0
      }
    },
    last_updated: { type: 'string', default: '' }
  }
};

class ProgressManager {
  constructor() {
    this.store = new Conf({
      name: 'progress',
      schema: progressSchema
    });

    // Load into instance properties for quick access
    this.totalStars = this.store.get('total_stars');
    this.currentLevel = this.store.get('current_level');
    this.starsByActivity = this.store.get('stars_by_activity');

    // Ensure all activity keys exist
    const defaultActivities = ['letters_numbers', 'drawing', 'colors_shapes', 'coloring', 'dot2dot', 'sounds', 'typing_game'];
    for (const activity of defaultActivities) {
      if (!(activity in this.starsByActivity)) {
        this.starsByActivity[activity] = 0;
      }
    }

    // Recalculate level in case of data corruption
    const calculatedLevel = this._calculateLevel(this.totalStars);
    if (calculatedLevel !== this.currentLevel) {
      this.currentLevel = calculatedLevel;
      this._save();
    }
  }

  _calculateLevel(stars) {
    let level = 1;
    const levels = Object.entries(LEVEL_THRESHOLDS).sort((a, b) => Number(b[0]) - Number(a[0]));
    for (const [lvl, threshold] of levels) {
      if (stars >= threshold) {
        level = Number(lvl);
        break;
      }
    }
    return level;
  }

  _save() {
    this.store.set('total_stars', this.totalStars);
    this.store.set('current_level', this.currentLevel);
    this.store.set('stars_by_activity', this.starsByActivity);
    this.store.set('last_updated', new Date().toISOString());
  }

  awardStar(activity) {
    if (!(activity in this.starsByActivity)) {
      return { starAwarded: false, levelUp: false };
    }

    const previousLevel = this.currentLevel;

    this.totalStars += 1;
    this.starsByActivity[activity] += 1;
    this.currentLevel = this._calculateLevel(this.totalStars);

    const levelUp = this.currentLevel > previousLevel;
    this._save();

    return { starAwarded: true, levelUp };
  }

  awardStars(activity, count) {
    if (!(activity in this.starsByActivity)) return;

    const previousLevel = this.currentLevel;

    this.totalStars += count;
    this.starsByActivity[activity] += count;
    this.currentLevel = this._calculateLevel(this.totalStars);

    this._save();

    return { levelUp: this.currentLevel > previousLevel };
  }

  getProgressSummary() {
    const currentThreshold = LEVEL_THRESHOLDS[this.currentLevel] || 0;
    const nextLevel = this.currentLevel + 1;
    const nextThreshold = LEVEL_THRESHOLDS[nextLevel];

    let starsInLevel, starsNeeded;
    if (nextThreshold === undefined) {
      starsInLevel = this.totalStars - currentThreshold;
      starsNeeded = 0;
    } else {
      starsInLevel = this.totalStars - currentThreshold;
      starsNeeded = nextThreshold - this.totalStars;
    }

    return {
      total_stars: this.totalStars,
      current_level: this.currentLevel,
      stars_in_level: starsInLevel,
      stars_needed_for_next: starsNeeded,
      stars_by_activity: { ...this.starsByActivity },
      last_updated: this.store.get('last_updated')
    };
  }
}

module.exports = { ProgressManager };
