/**
 * Rewards System - Stickers, Accessories, Milestones
 * Manages sticker registry, accessory registry, milestone checks, and award animations
 */

(function () {
  'use strict';

  const STICKER_REGISTRY = [
    // Animals (8)
    { id: 'sticker_dog', name: 'Puppy', category: 'Animals', emoji: '\uD83D\uDC36' },
    { id: 'sticker_cat', name: 'Kitten', category: 'Animals', emoji: '\uD83D\uDC31' },
    { id: 'sticker_rabbit', name: 'Bunny', category: 'Animals', emoji: '\uD83D\uDC30' },
    { id: 'sticker_bear', name: 'Bear', category: 'Animals', emoji: '\uD83D\uDC3B' },
    { id: 'sticker_frog', name: 'Frog', category: 'Animals', emoji: '\uD83D\uDC38' },
    { id: 'sticker_butterfly', name: 'Butterfly', category: 'Animals', emoji: '\uD83E\uDD8B' },
    { id: 'sticker_penguin', name: 'Penguin', category: 'Animals', emoji: '\uD83D\uDC27' },
    { id: 'sticker_koala', name: 'Koala', category: 'Animals', emoji: '\uD83D\uDC28' },
    // Nature (8)
    { id: 'sticker_sun', name: 'Sunshine', category: 'Nature', emoji: '\u2600\uFE0F' },
    { id: 'sticker_rainbow', name: 'Rainbow', category: 'Nature', emoji: '\uD83C\uDF08' },
    { id: 'sticker_flower', name: 'Flower', category: 'Nature', emoji: '\uD83C\uDF3B' },
    { id: 'sticker_tree', name: 'Tree', category: 'Nature', emoji: '\uD83C\uDF33' },
    { id: 'sticker_star', name: 'Star', category: 'Nature', emoji: '\u2B50' },
    { id: 'sticker_moon', name: 'Moon', category: 'Nature', emoji: '\uD83C\uDF19' },
    { id: 'sticker_cloud', name: 'Cloud', category: 'Nature', emoji: '\u2601\uFE0F' },
    { id: 'sticker_leaf', name: 'Leaf', category: 'Nature', emoji: '\uD83C\uDF3F' },
    // Space (8)
    { id: 'sticker_rocket', name: 'Rocket', category: 'Space', emoji: '\uD83D\uDE80' },
    { id: 'sticker_alien', name: 'Alien', category: 'Space', emoji: '\uD83D\uDC7D' },
    { id: 'sticker_planet', name: 'Planet', category: 'Space', emoji: '\uD83E\uDE90' },
    { id: 'sticker_ufo', name: 'UFO', category: 'Space', emoji: '\uD83D\uDEF8' },
    { id: 'sticker_comet', name: 'Comet', category: 'Space', emoji: '\u2604\uFE0F' },
    { id: 'sticker_satellite', name: 'Satellite', category: 'Space', emoji: '\uD83D\uDEF0\uFE0F' },
    { id: 'sticker_telescope', name: 'Telescope', category: 'Space', emoji: '\uD83D\uDD2D' },
    { id: 'sticker_globe', name: 'Earth', category: 'Space', emoji: '\uD83C\uDF0D' },
    // Food (8)
    { id: 'sticker_apple', name: 'Apple', category: 'Food', emoji: '\uD83C\uDF4E' },
    { id: 'sticker_banana', name: 'Banana', category: 'Food', emoji: '\uD83C\uDF4C' },
    { id: 'sticker_pizza', name: 'Pizza', category: 'Food', emoji: '\uD83C\uDF55' },
    { id: 'sticker_icecream', name: 'Ice Cream', category: 'Food', emoji: '\uD83C\uDF66' },
    { id: 'sticker_cake', name: 'Cake', category: 'Food', emoji: '\uD83C\uDF82' },
    { id: 'sticker_cookie', name: 'Cookie', category: 'Food', emoji: '\uD83C\uDF6A' },
    { id: 'sticker_watermelon', name: 'Watermelon', category: 'Food', emoji: '\uD83C\uDF49' },
    { id: 'sticker_grape', name: 'Grapes', category: 'Food', emoji: '\uD83C\uDF47' },
    // Dinos (8)
    { id: 'sticker_trex', name: 'T-Rex', category: 'Dinos', emoji: '\uD83E\uDD96' },
    { id: 'sticker_sauropod', name: 'Brontosaurus', category: 'Dinos', emoji: '\uD83E\uDD95' },
    { id: 'sticker_egg', name: 'Dino Egg', category: 'Dinos', emoji: '\uD83E\uDD5A' },
    { id: 'sticker_footprint', name: 'Footprint', category: 'Dinos', emoji: '\uD83E\uDDB6' },
    { id: 'sticker_bone', name: 'Dino Bone', category: 'Dinos', emoji: '\uD83E\uDDB4' },
    { id: 'sticker_volcano', name: 'Volcano', category: 'Dinos', emoji: '\uD83C\uDF0B' },
    { id: 'sticker_fossil', name: 'Fossil', category: 'Dinos', emoji: '\uD83D\uDC1A' },
    { id: 'sticker_palm', name: 'Palm Tree', category: 'Dinos', emoji: '\uD83C\uDF34' }
  ];

  const ACCESSORY_REGISTRY = [
    { id: 'acc_party_hat', name: 'Party Hat', slot: 'hat', emoji: '\uD83E\uDE85' },
    { id: 'acc_crown', name: 'Crown', slot: 'hat', emoji: '\uD83D\uDC51' },
    { id: 'acc_top_hat', name: 'Top Hat', slot: 'hat', emoji: '\uD83C\uDFA9' },
    { id: 'acc_wizard_hat', name: 'Wizard Hat', slot: 'hat', emoji: '\uD83E\uDDD9' },
    { id: 'acc_cowboy_hat', name: 'Cowboy Hat', slot: 'hat', emoji: '\uD83E\uDD20' },
    { id: 'acc_helmet', name: 'Helmet', slot: 'hat', emoji: '\uD83E\uDE96' },
    { id: 'acc_bow_tie', name: 'Bow Tie', slot: 'accessory', emoji: '\uD83C\uDF80' },
    { id: 'acc_sunglasses', name: 'Sunglasses', slot: 'accessory', emoji: '\uD83D\uDE0E' },
    { id: 'acc_cape', name: 'Cape', slot: 'accessory', emoji: '\uD83E\uDDB8' },
    { id: 'acc_scarf', name: 'Scarf', slot: 'accessory', emoji: '\uD83E\uDDE3' },
    { id: 'acc_medal', name: 'Medal', slot: 'accessory', emoji: '\uD83C\uDFC5' },
    { id: 'acc_trophy', name: 'Trophy', slot: 'accessory', emoji: '\uD83C\uDFC6' }
  ];

  // Every 5 stars = sticker, every 25 stars = accessory
  const STICKER_INTERVAL = 5;
  const ACCESSORY_INTERVAL = 25;

  const LEVEL_NAMES = {
    1: 'Star Spotter',
    2: 'Star Collector',
    3: 'Star Champion',
    4: 'Superstar'
  };

  const STICKER_CATEGORIES = ['Animals', 'Nature', 'Space', 'Food', 'Dinos'];

  class RewardsManager {
    constructor() {
      this.collectedStickers = [];
      this.unlockedAccessories = [];
      this.currentOutfit = { hat: null, accessory: null };
      this.totalStars = 0;
      this.currentLevel = 1;
    }

    async loadProgress() {
      const result = await AppAPI.call('get_progress');
      if (result && result.success) {
        const p = result.progress;
        this.totalStars = p.total_stars || 0;
        this.currentLevel = p.current_level || 1;
        this.collectedStickers = p.stickers_collected || [];
        this.unlockedAccessories = p.dino_accessories_unlocked || [];
        this.currentOutfit = p.dino_current_outfit || { hat: null, accessory: null };
      }
    }

    getLevelName(level) {
      return LEVEL_NAMES[level] || LEVEL_NAMES[4];
    }

    async checkMilestones(newTotalStars) {
      const rewards = [];

      // Check sticker milestones
      const stickerCount = Math.floor(newTotalStars / STICKER_INTERVAL);
      const currentStickerCount = this.collectedStickers.length;

      if (stickerCount > currentStickerCount) {
        // Award next uncollected sticker
        const availableStickers = STICKER_REGISTRY.filter(s => !this.collectedStickers.includes(s.id));
        if (availableStickers.length > 0) {
          const sticker = availableStickers[Math.floor(Math.random() * availableStickers.length)];
          const result = await AppAPI.call('award_sticker', sticker.id);
          if (result && result.awarded) {
            this.collectedStickers.push(sticker.id);
            rewards.push({ type: 'sticker', item: sticker });
          }
        }
      }

      // Check accessory milestones
      const accessoryCount = Math.floor(newTotalStars / ACCESSORY_INTERVAL);
      const currentAccessoryCount = this.unlockedAccessories.length;

      if (accessoryCount > currentAccessoryCount) {
        const availableAccessories = ACCESSORY_REGISTRY.filter(a => !this.unlockedAccessories.includes(a.id));
        if (availableAccessories.length > 0) {
          const accessory = availableAccessories[Math.floor(Math.random() * availableAccessories.length)];
          const result = await AppAPI.call('unlock_accessory', accessory.id);
          if (result && result.unlocked) {
            this.unlockedAccessories.push(accessory.id);
            rewards.push({ type: 'accessory', item: accessory });
          }
        }
      }

      this.totalStars = newTotalStars;
      return rewards;
    }

    showRewardAnimation(reward) {
      // Speak star_earned phrase
      const starText = window.DinoPhrase ? window.DinoPhrase('star_earned') : '';
      if (starText) AppAPI.call('speak', starText);

      const overlay = document.createElement('div');
      overlay.className = 'reward-overlay';

      if (reward.type === 'sticker') {
        overlay.innerHTML = `
          <div class="reward-popup reward-sticker-popup">
            <h2>New Sticker!</h2>
            <div class="reward-emoji">${reward.item.emoji}</div>
            <p class="reward-name">${reward.item.name}</p>
          </div>
        `;
      } else {
        overlay.innerHTML = `
          <div class="reward-popup reward-accessory-popup">
            <h2>New Outfit!</h2>
            <div class="reward-emoji">${reward.item.emoji}</div>
            <p class="reward-name">${reward.item.name}</p>
          </div>
        `;
      }

      document.body.appendChild(overlay);

      // Auto-remove after animation
      setTimeout(() => {
        overlay.classList.add('reward-fade-out');
        setTimeout(() => overlay.remove(), 500);
      }, 2500);
    }

    renderHomeStarDisplay() {
      const titleEl = document.querySelector('.menu-title');
      if (!titleEl) return;

      const levelName = this.getLevelName(this.currentLevel);
      const stickerTotal = STICKER_REGISTRY.length;
      const stickerCount = this.collectedStickers.length;

      titleEl.innerHTML = `
        <div class="home-rewards-display">
          <div class="home-star-counter">
            <i class="bi bi-star-fill" style="color: #fbbf24;"></i>
            <span>${this.totalStars}</span>
          </div>
          <div class="home-level-badge">${levelName}</div>
          <button class="home-sticker-count" id="openStickerAlbum">
            <i class="bi bi-book"></i> ${stickerCount}/${stickerTotal} stickers
          </button>
        </div>
      `;

      const albumBtn = document.getElementById('openStickerAlbum');
      if (albumBtn) {
        albumBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          this.showStickerAlbum();
        });
      }
    }

    showStickerAlbum() {
      // Use the activity screen pattern — hide menu, show album
      const mainMenu = document.getElementById('mainMenu');
      const activityScreen = document.getElementById('activityScreen');
      const activityContent = document.getElementById('activityContent');

      if (!mainMenu || !activityScreen || !activityContent) return;

      mainMenu.classList.add('hidden');
      activityScreen.classList.add('active');

      const categories = STICKER_CATEGORIES.map(cat => {
        const stickers = STICKER_REGISTRY.filter(s => s.category === cat);
        const stickerHTML = stickers.map(s => {
          const collected = this.collectedStickers.includes(s.id);
          return `
            <div class="album-sticker ${collected ? 'collected' : 'locked'}" data-sticker-id="${s.id}">
              <span class="album-sticker-emoji">${collected ? s.emoji : '?'}</span>
              <span class="album-sticker-name">${collected ? s.name : '???'}</span>
            </div>
          `;
        }).join('');

        return `
          <div class="album-category">
            <h3 class="album-category-title">${cat}</h3>
            <div class="album-sticker-grid">${stickerHTML}</div>
          </div>
        `;
      }).join('');

      const totalCollected = this.collectedStickers.length;
      const totalAvailable = STICKER_REGISTRY.length;
      const pct = Math.round((totalCollected / totalAvailable) * 100);

      activityContent.innerHTML = `
        <div class="activity-container sticker-album-container">
          <h2 class="display-5 fw-bold mb-3">Sticker Album</h2>
          <div class="album-progress-bar">
            <div class="album-progress-fill" style="width: ${pct}%"></div>
            <span class="album-progress-text">${totalCollected} / ${totalAvailable}</span>
          </div>
          <div class="album-categories-scroll">
            ${categories}
          </div>
        </div>
      `;

      // Click collected stickers to hear dino say the name
      activityContent.querySelectorAll('.album-sticker.collected').forEach(el => {
        el.addEventListener('click', () => {
          el.classList.add('sticker-bounce');
          const sticker = STICKER_REGISTRY.find(s => s.id === el.dataset.stickerId);
          if (sticker) {
            AppAPI.call('speak', sticker.name);
          }
          setTimeout(() => el.classList.remove('sticker-bounce'), 600);
        });
      });
    }

    renderProgressPanel(containerId, activityName) {
      const container = document.getElementById(containerId);
      if (!container) return;

      const levelName = this.getLevelName(this.currentLevel);
      container.innerHTML = `
        <div class="progress-info">
          <div class="stars-display">
            <i class="bi bi-star-fill" style="color: #fbbf24;"></i>
            <span id="activityStarCount">${this.totalStars}</span>
          </div>
          <div class="level-display">
            <i class="bi bi-trophy-fill" style="color: #a855f7;"></i>
            <span>${levelName}</span>
          </div>
        </div>
      `;
    }

    playStarAnimation(containerId) {
      const container = document.getElementById(containerId);
      if (!container) return;

      const star = document.createElement('div');
      star.className = 'animated-star';
      star.innerHTML = '<i class="bi bi-star-fill"></i>';
      container.appendChild(star);

      setTimeout(() => star.remove(), 2000);
    }

    updateStarCount(newTotal) {
      this.totalStars = newTotal;
      const el = document.getElementById('activityStarCount');
      if (el) el.textContent = newTotal;
    }
  }

  // Expose globally
  window.STICKER_REGISTRY = STICKER_REGISTRY;
  window.ACCESSORY_REGISTRY = ACCESSORY_REGISTRY;
  window.STICKER_CATEGORIES = STICKER_CATEGORIES;
  window.LEVEL_NAMES = LEVEL_NAMES;
  window.RewardsManager = RewardsManager;
})();
