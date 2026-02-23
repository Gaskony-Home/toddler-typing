/**
 * Toddler Typing - Main JavaScript Application
 * Handles UI interactions, navigation, and App API communication
 */

// Global state management (exposed on window for api-bridge mute checks)
const AppState = window.AppState = {
    currentActivity: null,
    theme: 'dark',
    isFullscreen: false,
    isMuted: false,
    version: ''
};

// App API bridge (available via window.appBridge)
const AppAPI = {
    /**
     * Check if App API is available
     */
    isAvailable() {
        return typeof window.appBridge !== 'undefined' && window.appBridge;
    },

    /**
     * Call App API method safely
     */
    async call(method, ...args) {
        if (this.isAvailable()) {
            try {
                return await window.appBridge[method](...args);
            } catch (error) {
                console.error(`App API call failed: ${method}`, error);
                return null;
            }
        } else {
            console.warn('App API not available, running in browser mode');
            return null;
        }
    },

    /**
     * Start an activity
     */
    async startActivity(activityName) {
        return await this.call('start_activity', activityName);
    },

    /**
     * Stop current activity
     */
    async stopActivity() {
        return await this.call('stop_activity');
    },

    /**
     * Get app version
     */
    async getVersion() {
        return await this.call('get_version');
    },

    /**
     * Save settings
     */
    async saveSettings(settings) {
        return await this.call('save_settings', settings);
    },

    /**
     * Load settings
     */
    async loadSettings() {
        return await this.call('load_settings');
    }
};

/**
 * Theme Management
 */
class ThemeManager {
    constructor() {
        this.htmlElement = document.documentElement;
        this.themeToggleBtn = document.getElementById('themeToggle');
        this.themeIcon = this.themeToggleBtn?.querySelector('i');

        this.init();
    }

    init() {
        // Load saved theme (default to dark)
        const savedTheme = localStorage.getItem('theme') || 'dark';
        this.setTheme(savedTheme, false);

        // Bind toggle button
        if (this.themeToggleBtn) {
            this.themeToggleBtn.addEventListener('click', () => this.toggleTheme());
        }
    }

    setTheme(theme, save = true) {
        AppState.theme = theme;
        this.htmlElement.setAttribute('data-bs-theme', theme);

        // Update icon
        if (this.themeIcon) {
            if (theme === 'dark') {
                this.themeIcon.classList.remove('bi-sun-fill');
                this.themeIcon.classList.add('bi-moon-fill');
            } else {
                this.themeIcon.classList.remove('bi-moon-fill');
                this.themeIcon.classList.add('bi-sun-fill');
            }
        }

        // Save preference
        if (save) {
            localStorage.setItem('theme', theme);
        }
    }

    toggleTheme() {
        const newTheme = AppState.theme === 'light' ? 'dark' : 'light';
        this.setTheme(newTheme);
    }

    getTheme() {
        return AppState.theme;
    }
}

/**
 * Fullscreen Management
 */
class FullscreenManager {
    constructor() {
        this.fullscreenBtn = document.getElementById('fullscreenToggle');
        this.fullscreenIcon = this.fullscreenBtn?.querySelector('i');

        this.init();
    }

    init() {
        // Bind toggle button
        if (this.fullscreenBtn) {
            this.fullscreenBtn.addEventListener('click', () => this.toggleFullscreen());
        }

        // Listen for fullscreen changes
        document.addEventListener('fullscreenchange', () => this.onFullscreenChange());
        document.addEventListener('webkitfullscreenchange', () => this.onFullscreenChange());
        document.addEventListener('mozfullscreenchange', () => this.onFullscreenChange());
        document.addEventListener('MSFullscreenChange', () => this.onFullscreenChange());
    }

    async toggleFullscreen() {
        if (!document.fullscreenElement &&
            !document.webkitFullscreenElement &&
            !document.mozFullScreenElement &&
            !document.msFullscreenElement) {
            // Enter fullscreen
            await this.enterFullscreen();
        } else {
            // Exit fullscreen
            await this.exitFullscreen();
        }
    }

    async enterFullscreen() {
        const elem = document.documentElement;

        try {
            if (elem.requestFullscreen) {
                await elem.requestFullscreen();
            } else if (elem.webkitRequestFullscreen) {
                await elem.webkitRequestFullscreen();
            } else if (elem.mozRequestFullScreen) {
                await elem.mozRequestFullScreen();
            } else if (elem.msRequestFullscreen) {
                await elem.msRequestFullscreen();
            }
        } catch (error) {
            console.error('Failed to enter fullscreen:', error);
        }
    }

    async exitFullscreen() {
        try {
            if (document.exitFullscreen) {
                await document.exitFullscreen();
            } else if (document.webkitExitFullscreen) {
                await document.webkitExitFullscreen();
            } else if (document.mozCancelFullScreen) {
                await document.mozCancelFullScreen();
            } else if (document.msExitFullscreen) {
                await document.msExitFullscreen();
            }
        } catch (error) {
            console.error('Failed to exit fullscreen:', error);
        }
    }

    onFullscreenChange() {
        const isFullscreen = !!(document.fullscreenElement ||
                               document.webkitFullscreenElement ||
                               document.mozFullScreenElement ||
                               document.msFullscreenElement);

        AppState.isFullscreen = isFullscreen;

        // Update icon
        if (this.fullscreenIcon) {
            if (isFullscreen) {
                this.fullscreenIcon.classList.remove('bi-fullscreen');
                this.fullscreenIcon.classList.add('bi-fullscreen-exit');
            } else {
                this.fullscreenIcon.classList.remove('bi-fullscreen-exit');
                this.fullscreenIcon.classList.add('bi-fullscreen');
            }
        }
    }
}

/**
 * Mute Management
 */
class MuteManager {
    constructor() {
        this.muteBtn = document.getElementById('muteToggle');
        this.muteIcon = this.muteBtn?.querySelector('i');
        this._isMuted = false;

        this.init();
    }

    init() {
        // Load saved mute state
        const savedMuted = localStorage.getItem('isMuted') === 'true';
        this.setMuted(savedMuted, false);

        // Bind toggle button
        if (this.muteBtn) {
            this.muteBtn.addEventListener('click', () => this.toggleMute());
        }
    }

    setMuted(muted, save = true) {
        this._isMuted = muted;
        AppState.isMuted = muted;

        // Update icon
        if (this.muteIcon) {
            if (muted) {
                this.muteIcon.classList.remove('bi-volume-up-fill');
                this.muteIcon.classList.add('bi-volume-mute-fill');
            } else {
                this.muteIcon.classList.remove('bi-volume-mute-fill');
                this.muteIcon.classList.add('bi-volume-up-fill');
            }
        }

        // Stop any ongoing speech when muting
        if (muted && window.DinoVoice) {
            window.DinoVoice.stop();
        }

        // Save preference
        if (save) {
            localStorage.setItem('isMuted', muted);
        }
    }

    toggleMute() {
        this.setMuted(!this._isMuted);
    }
}

/**
 * Update Management
 */
class UpdateManager {
    constructor() {
        this.checkUpdateBtn = document.getElementById('checkUpdateBtn');
        this.updateBtn = document.getElementById('updateBtn');
        this.updateNowBtn = document.getElementById('updateNowBtn');
        this.updateModalMessage = document.getElementById('updateModalMessage');
        this.updateModal = null;
        this.updateInfo = null;

        this.init();
    }

    init() {
        // Initialize the Bootstrap modal
        const modalEl = document.getElementById('updateModal');
        if (modalEl && typeof bootstrap !== 'undefined') {
            this.updateModal = new bootstrap.Modal(modalEl);
        }

        // Listen for update-available from main process
        if (window.electronAPI && window.electronAPI.onUpdateAvailable) {
            window.electronAPI.onUpdateAvailable((info) => {
                this.onUpdateAvailable(info);
            });
        }

        // Listen for update-not-available
        if (window.electronAPI && window.electronAPI.onUpdateNotAvailable) {
            window.electronAPI.onUpdateNotAvailable(() => {
                this.onUpdateNotAvailable();
            });
        }

        // Listen for update-downloaded
        if (window.electronAPI && window.electronAPI.onUpdateDownloaded) {
            window.electronAPI.onUpdateDownloaded(() => {
                this.onUpdateDownloaded();
            });
        }

        // Check for Updates button click
        if (this.checkUpdateBtn) {
            this.checkUpdateBtn.addEventListener('click', () => this.manualCheckForUpdates());
        }

        // Update button click -> show modal
        if (this.updateBtn) {
            this.updateBtn.addEventListener('click', () => this.showUpdateModal());
        }

        // Update Now button click -> download and install
        if (this.updateNowBtn) {
            this.updateNowBtn.addEventListener('click', () => this.startUpdate());
        }
    }

    async manualCheckForUpdates() {
        if (!this.checkUpdateBtn) return;

        // Show checking state
        this.checkUpdateBtn.classList.add('checking');
        this.checkUpdateBtn.title = 'Checking...';

        if (window.electronAPI && window.electronAPI.checkForUpdates) {
            await window.electronAPI.checkForUpdates();
        }
    }

    onUpdateAvailable(info) {
        this.updateInfo = info;
        console.log('Update available:', info.version);

        // Reset check button
        if (this.checkUpdateBtn) {
            this.checkUpdateBtn.classList.remove('checking');
            this.checkUpdateBtn.style.display = 'none';
        }

        // Show the download update button
        if (this.updateBtn) {
            this.updateBtn.style.display = 'flex';
        }

        // Update modal message
        if (this.updateModalMessage) {
            this.updateModalMessage.textContent = `Version ${info.version} is available. Download and restart to install?`;
        }
    }

    onUpdateNotAvailable() {
        console.log('App is up to date');

        if (this.checkUpdateBtn) {
            this.checkUpdateBtn.classList.remove('checking');
            this.checkUpdateBtn.classList.add('up-to-date');
            this.checkUpdateBtn.title = 'Up to date!';

            // Reset after 3 seconds
            setTimeout(() => {
                this.checkUpdateBtn.classList.remove('up-to-date');
                this.checkUpdateBtn.title = 'Check for Updates';
            }, 3000);
        }
    }

    onUpdateDownloaded() {
        console.log('Update downloaded, restarting...');
        if (window.electronAPI && window.electronAPI.quitAndInstall) {
            window.electronAPI.quitAndInstall();
        }
    }

    showUpdateModal() {
        if (this.updateModal) {
            this.updateModal.show();
        }
    }

    async startUpdate() {
        // Update button text to show downloading
        if (this.updateNowBtn) {
            this.updateNowBtn.disabled = true;
            this.updateNowBtn.innerHTML = '<i class="bi bi-arrow-repeat spin"></i> Downloading...';
        }

        if (window.electronAPI && window.electronAPI.downloadUpdate) {
            await window.electronAPI.downloadUpdate();
        }
    }
}

/**
 * Navigation Management
 */
class NavigationManager {
    constructor() {
        this.mainMenu = document.getElementById('mainMenu');
        this.activityScreen = document.getElementById('activityScreen');
        this.activityContent = document.getElementById('activityContent');
    }

    showMainMenu() {
        if (this.mainMenu && this.activityScreen) {
            this.mainMenu.classList.remove('hidden');
            this.activityScreen.classList.remove('active');
            AppState.currentActivity = null;
        }
    }

    showActivityScreen(activityName) {
        if (this.mainMenu && this.activityScreen) {
            this.mainMenu.classList.add('hidden');
            this.activityScreen.classList.add('active');
            AppState.currentActivity = activityName;
        }
    }

    setActivityContent(html) {
        if (this.activityContent) {
            this.activityContent.innerHTML = html;
        }
    }
}

/**
 * Activity Manager
 */
class ActivityManager {
    constructor(navigation) {
        this.navigation = navigation;
        this.currentActivityInstance = null;
    }

    /**
     * Returns the shared color palette HTML used by drawing, dot2dot, and coloring activities
     */
    static PALETTE_COLORS = [
        { hex: '#FF0000', name: 'Red' },
        { hex: '#FF7F00', name: 'Orange' },
        { hex: '#FFFF00', name: 'Yellow' },
        { hex: '#00FF00', name: 'Green' },
        { hex: '#0000FF', name: 'Blue' },
        { hex: '#4B0082', name: 'Indigo' },
        { hex: '#9400D3', name: 'Violet' },
        { hex: '#000000', name: 'Black' },
        { hex: '#FFFFFF', name: 'White', border: true },
        { hex: '#8B4513', name: 'Brown' },
        { hex: '#FFC0CB', name: 'Pink' },
        { hex: '#A52A2A', name: 'Dark Brown' },
        { hex: '#00FFFF', name: 'Cyan' },
        { hex: '#FF69B4', name: 'Hot Pink' },
        { hex: '#FFD700', name: 'Gold' },
        { hex: '#808080', name: 'Grey' },
        { hex: '#006400', name: 'Dark Green' },
        { hex: '#DC143C', name: 'Crimson' },
        { hex: '#4169E1', name: 'Royal Blue' },
        { hex: '#FF4500', name: 'Orange Red' },
        { hex: '#2E8B57', name: 'Sea Green' },
        { hex: '#DA70D6', name: 'Orchid' },
        { hex: '#87CEEB', name: 'Sky Blue' },
        { hex: '#F0E68C', name: 'Khaki' }
    ];

    static PALETTE_PAGE_SIZE = 12;

    static getCanvasControlsHTML() {
        const colors = ActivityManager.PALETTE_COLORS.slice(0, ActivityManager.PALETTE_PAGE_SIZE);
        const colorsHTML = colors.map((c, i) => {
            const border = c.border ? ' border-color: #dee2e6;' : '';
            const active = i === 0 ? ' active' : '';
            return `<div class="color-btn${active}" data-color="${c.hex}" style="background: ${c.hex};${border}" title="${c.name}"></div>`;
        }).join('\n                        ');

        return `
                    <!-- Colour Palette with Pagination -->
                    <div class="color-palette-wrapper">
                        <button class="palette-arrow palette-prev" id="palettePrev" title="Previous colours">
                            <i class="bi bi-chevron-left"></i>
                        </button>
                        <div class="color-palette" id="colorPalette">
                            ${colorsHTML}
                        </div>
                        <button class="palette-arrow palette-next" id="paletteNext" title="Next colours">
                            <i class="bi bi-chevron-right"></i>
                        </button>
                    </div>

                    <!-- Brush Sizes -->
                    <div class="brush-sizes" id="brushSizes">
                        <div class="brush-size-btn brush-size-tiny" data-size="3" title="Tiny">
                            <div class="brush-preview brush-preview-tiny"></div>
                        </div>
                        <div class="brush-size-btn brush-size-small" data-size="8" title="Small">
                            <div class="brush-preview brush-preview-small"></div>
                        </div>
                        <div class="brush-size-btn brush-size-medium active" data-size="15" title="Medium">
                            <div class="brush-preview brush-preview-medium"></div>
                        </div>
                        <div class="brush-size-btn brush-size-large" data-size="25" title="Large">
                            <div class="brush-preview brush-preview-large"></div>
                        </div>
                        <div class="brush-size-btn brush-size-xlarge" data-size="40" title="Extra Large">
                            <div class="brush-preview brush-preview-xlarge"></div>
                        </div>
                    </div>`;
    }

    async start(activityName) {
        console.log(`Starting activity: ${activityName}`);

        // Stop any existing activity
        if (this.currentActivityInstance) {
            await this.stop();
        }

        await AppAPI.startActivity(activityName);

        // Show activity screen
        this.navigation.showActivityScreen(activityName);

        // Load activity content
        this.loadActivityContent(activityName);

        // Start the activity-specific logic
        await this.startActivityLogic(activityName);

        // Dino welcomes the user and explains what to do
        if (window.DinoVoice && !AppState.isMuted) {
            window.DinoVoice.speakPhrase('activity_welcome', activityName, null, true);
        }
    }

    async stop() {
        console.log('Stopping current activity');

        // Stop activity-specific logic
        if (this.currentActivityInstance && this.currentActivityInstance.stop) {
            this.currentActivityInstance.stop();
            this.currentActivityInstance = null;
        }

        await AppAPI.stopActivity();

        // Return to main menu
        this.navigation.showMainMenu();

        // Refresh rewards display on home screen
        if (window.rewardsManager) {
            await window.rewardsManager.loadProgress();
            window.rewardsManager.renderHomeStarDisplay();
        }

        // Dino welcomes back to the menu
        if (window.DinoVoice && !AppState.isMuted) {
            window.DinoVoice.speakPhrase('menu_welcome', null, null, true);
        }
    }

    async startActivityLogic(activityName) {
        switch (activityName) {
            case 'drawing':
                if (typeof DrawingActivity !== 'undefined') {
                    this.currentActivityInstance = new DrawingActivity();
                    await this.currentActivityInstance.start();
                }
                break;
            case 'colors_shapes':
                if (typeof ColorsShapesActivity !== 'undefined') {
                    this.currentActivityInstance = new ColorsShapesActivity();
                    await this.currentActivityInstance.start();
                }
                break;
            case 'dot2dot':
                if (typeof Dot2DotActivity !== 'undefined') {
                    this.currentActivityInstance = new Dot2DotActivity();
                    await this.currentActivityInstance.start();
                }
                break;
            case 'sounds':
                if (typeof SoundsActivity !== 'undefined') {
                    this.currentActivityInstance = new SoundsActivity();
                    await this.currentActivityInstance.start();
                }
                break;
            case 'coloring':
                if (typeof ColoringActivity !== 'undefined') {
                    this.currentActivityInstance = new ColoringActivity();
                    await this.currentActivityInstance.start();
                }
                break;
            case 'typing_game':
                if (typeof TypingGameActivity !== 'undefined') {
                    this.currentActivityInstance = new TypingGameActivity();
                    await this.currentActivityInstance.start();
                }
                break;
            case 'memory_game':
                if (typeof MemoryGameActivity !== 'undefined') {
                    this.currentActivityInstance = new MemoryGameActivity();
                    await this.currentActivityInstance.start();
                }
                break;
            case 'jigsaw':
                if (typeof JigsawActivity !== 'undefined') {
                    this.currentActivityInstance = new JigsawActivity();
                    await this.currentActivityInstance.start();
                }
                break;
            case 'sorting':
                if (typeof SortingActivity !== 'undefined') {
                    this.currentActivityInstance = new SortingActivity();
                    await this.currentActivityInstance.start();
                }
                break;
            default:
                console.log('No logic implemented for this activity yet');
        }
    }

    loadActivityContent(activityName) {
        let content = '';

        switch (activityName) {
            case 'drawing':
                content = this.getDrawingContent();
                break;
            case 'colors_shapes':
                content = this.getColorsShapesContent();
                break;
            case 'dot2dot':
                content = this.getDot2DotContent();
                break;
            case 'sounds':
                content = this.getSoundsContent();
                break;
            case 'coloring':
                content = this.getColoringContent();
                break;
            case 'typing_game':
                content = this.getTypingGameContent();
                break;
            case 'memory_game':
                content = this.getMemoryGameContent();
                break;
            case 'jigsaw':
                content = this.getJigsawContent();
                break;
            case 'sorting':
                content = this.getSortingContent();
                break;
            default:
                content = '<h2>Activity not found</h2>';
        }

        this.navigation.setActivityContent(content);
    }

    getDrawingContent() {
        const controls = ActivityManager.getCanvasControlsHTML();
        return `
            <div class="activity-container drawing-activity">
                <!-- Title -->
                <h2 class="display-5 fw-bold mb-2">Free Drawing</h2>

                <canvas id="drawingCanvas" width="1400" height="800"></canvas>

                <div class="drawing-controls">
                    ${controls}

                    <!-- Action Buttons -->
                    <div class="drawing-action-buttons">
                        <button class="btn btn-danger btn-clear-canvas" id="clearCanvas">
                            <i class="bi bi-trash"></i> Clear
                        </button>
                        <button class="btn btn-success btn-clear-canvas" id="saveDrawing">
                            <i class="bi bi-download"></i> Save
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    getColorsShapesContent() {
        return `
            <div class="activity-container colors-shapes-activity">
                <!-- Progress Display -->
                <div id="csProgressDisplay" class="progress-display-top"></div>

                <!-- Instruction Text -->
                <p id="shapeInstruction" class="instruction-text">
                    Tap the shape!
                </p>

                <!-- Shape Options Grid -->
                <div id="shapeOptions" class="shape-options-grid">
                    <!-- Options will be generated here -->
                </div>

                <!-- Star Animation Container -->
                <div id="csStarAnimation" class="star-animation-container"></div>
            </div>
        `;
    }

    getDot2DotContent() {
        const controls = ActivityManager.getCanvasControlsHTML();
        return `
            <div class="activity-container drawing-activity">
                <!-- Title and Counter -->
                <h2 class="display-5 fw-bold mb-2" id="dot2dotTitle">Dot to Dot</h2>
                <div class="progress-display-top mb-2">
                    <span id="dot2dotCounter">1 / 6</span>
                </div>

                <!-- Canvas Container -->
                <div id="dot2dotImageContainer" class="coloring-image-container">
                    <canvas id="dot2dotCanvas" width="1000" height="700"></canvas>
                </div>

                <div class="drawing-controls">
                    ${controls}

                    <!-- Navigation and Action Buttons -->
                    <div class="drawing-action-buttons">
                        <button class="btn btn-primary btn-clear-canvas" id="prevDot2Dot">
                            <i class="bi bi-arrow-left"></i> Previous
                        </button>
                        <button class="btn btn-danger btn-clear-canvas" id="clearDot2Dot">
                            <i class="bi bi-trash"></i> Clear
                        </button>
                        <button class="btn btn-success btn-clear-canvas" id="saveDot2Dot">
                            <i class="bi bi-download"></i> Save
                        </button>
                        <button class="btn btn-primary btn-clear-canvas" id="nextDot2Dot">
                            <i class="bi bi-arrow-right"></i> Next
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    getSoundsContent() {
        return `
            <div class="activity-container colors-shapes-activity">
                <!-- Progress Display -->
                <div id="soundsProgressDisplay" class="progress-display-top"></div>

                <!-- Title and Counter -->
                <h2 class="display-5 fw-bold mb-2">Sound Quiz</h2>
                <div class="mb-2">
                    <span id="soundCounter" style="font-weight: 700; color: var(--text-secondary);">Round 1</span>
                </div>

                <!-- Instruction Text -->
                <p id="soundDescription" class="instruction-text">
                    Which word has this sound?
                </p>

                <!-- Main Sound Display -->
                <div id="soundDisplay" class="letter-number-display is-letter" style="font-size: clamp(5rem, 12vw, 10rem);">
                    SH
                </div>

                <!-- Quiz Word Options -->
                <div id="soundQuizOptions" class="sounds-quiz-options">
                    <!-- Word buttons generated by JS -->
                </div>

                <!-- Hear Again Button -->
                <div style="text-align: center; margin-top: 0.5rem;">
                    <button class="btn btn-success btn-lg" id="hearSound">
                        <i class="bi bi-volume-up-fill"></i> Hear Again
                    </button>
                </div>

                <!-- Star Animation Container -->
                <div id="soundsStarAnimation" class="star-animation-container"></div>
            </div>
        `;
    }

    getColoringContent() {
        const controls = ActivityManager.getCanvasControlsHTML();
        return `
            <div class="activity-container drawing-activity">
                <!-- Title and Counter -->
                <h2 class="display-5 fw-bold mb-2" id="coloringTitle">Colouring</h2>
                <div class="progress-display-top mb-2">
                    <span id="coloringCounter">1 / 6</span>
                </div>

                <!-- Canvas Container -->
                <div id="coloringImageContainer" class="coloring-image-container">
                    <canvas id="coloringCanvas" width="1000" height="700"></canvas>
                </div>

                <div class="drawing-controls">
                    ${controls}

                    <!-- Navigation and Action Buttons -->
                    <div class="drawing-action-buttons">
                        <button class="btn btn-primary btn-clear-canvas" id="prevColoring">
                            <i class="bi bi-arrow-left"></i> Previous
                        </button>
                        <button class="btn btn-danger btn-clear-canvas" id="clearColoring">
                            <i class="bi bi-trash"></i> Clear
                        </button>
                        <button class="btn btn-success btn-clear-canvas" id="saveColoring">
                            <i class="bi bi-download"></i> Save
                        </button>
                        <button class="btn btn-primary btn-clear-canvas" id="nextColoring">
                            <i class="bi bi-arrow-right"></i> Next
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    getTypingGameContent() {
        return `
            <div class="activity-container typing-game-activity">
                <!-- Progress Display -->
                <div id="typingProgressDisplay" class="progress-display-top"></div>

                <!-- Stage Tabs -->
                <div class="stage-tabs">
                    <button class="stage-tab active" data-stage="1">
                        <i class="bi bi-alphabet"></i> Letters
                    </button>
                    <button class="stage-tab locked" data-stage="2">
                        <i class="bi bi-123"></i> Numbers
                        <span class="lock-overlay"><i class="bi bi-lock-fill"></i></span>
                    </button>
                    <button class="stage-tab locked" data-stage="3">
                        <i class="bi bi-fonts"></i> Words
                        <span class="lock-overlay"><i class="bi bi-lock-fill"></i></span>
                    </button>
                </div>

                <!-- Instruction Text -->
                <p id="typingInstruction" class="instruction-text">
                    Press the key on the keyboard!
                </p>

                <!-- Target Display -->
                <div id="typingTargetDisplay" class="typing-target-display is-letter">
                    A
                </div>

                <!-- Streak Counter -->
                <div id="streakDisplay" class="streak-display"></div>

                <!-- On-Screen Keyboard -->
                <div id="onscreenKeyboard" class="onscreen-keyboard">
                    <div id="oskNumberRow" class="osk-row osk-number-row" style="display: none;">
                        <button class="osk-key" data-key="1">1</button>
                        <button class="osk-key" data-key="2">2</button>
                        <button class="osk-key" data-key="3">3</button>
                        <button class="osk-key" data-key="4">4</button>
                        <button class="osk-key" data-key="5">5</button>
                        <button class="osk-key" data-key="6">6</button>
                        <button class="osk-key" data-key="7">7</button>
                        <button class="osk-key" data-key="8">8</button>
                        <button class="osk-key" data-key="9">9</button>
                        <button class="osk-key" data-key="0">0</button>
                    </div>
                    <div class="osk-row">
                        <button class="osk-key" data-key="Q">Q</button>
                        <button class="osk-key" data-key="W">W</button>
                        <button class="osk-key" data-key="E">E</button>
                        <button class="osk-key" data-key="R">R</button>
                        <button class="osk-key" data-key="T">T</button>
                        <button class="osk-key" data-key="Y">Y</button>
                        <button class="osk-key" data-key="U">U</button>
                        <button class="osk-key" data-key="I">I</button>
                        <button class="osk-key" data-key="O">O</button>
                        <button class="osk-key" data-key="P">P</button>
                    </div>
                    <div class="osk-row osk-row-offset-1">
                        <button class="osk-key" data-key="A">A</button>
                        <button class="osk-key" data-key="S">S</button>
                        <button class="osk-key" data-key="D">D</button>
                        <button class="osk-key" data-key="F">F</button>
                        <button class="osk-key" data-key="G">G</button>
                        <button class="osk-key" data-key="H">H</button>
                        <button class="osk-key" data-key="J">J</button>
                        <button class="osk-key" data-key="K">K</button>
                        <button class="osk-key" data-key="L">L</button>
                    </div>
                    <div class="osk-row osk-row-offset-2">
                        <button class="osk-key" data-key="Z">Z</button>
                        <button class="osk-key" data-key="X">X</button>
                        <button class="osk-key" data-key="C">C</button>
                        <button class="osk-key" data-key="V">V</button>
                        <button class="osk-key" data-key="B">B</button>
                        <button class="osk-key" data-key="N">N</button>
                        <button class="osk-key" data-key="M">M</button>
                    </div>
                </div>

                <!-- Star Animation Container -->
                <div id="typingStarAnimation" class="star-animation-container"></div>

                <!-- Level Up Notification -->
                <div id="typingLevelUp" class="level-up-notification" style="display: none;"></div>
            </div>
        `;
    }

    getMemoryGameContent() {
        return `
            <div class="activity-container memory-game-activity">
                <!-- Progress Display -->
                <div id="memoryProgressDisplay" class="progress-display-top"></div>

                <!-- Title -->
                <h2 class="display-5 fw-bold mb-2">Memory Game</h2>

                <!-- Difficulty Selector -->
                <div class="difficulty-selector" id="memoryDifficulty">
                    <button class="difficulty-btn active" data-difficulty="easy">Easy</button>
                    <button class="difficulty-btn" data-difficulty="medium">Medium</button>
                    <button class="difficulty-btn" data-difficulty="hard">Hard</button>
                </div>

                <!-- Card Grid -->
                <div id="memoryGrid" class="memory-grid">
                    <!-- Cards generated by JS -->
                </div>

                <!-- Star Animation Container -->
                <div id="memoryStarAnimation" class="star-animation-container"></div>

                <!-- Level Up Notification -->
                <div id="memoryLevelUp" class="level-up-notification" style="display: none;"></div>
            </div>
        `;
    }

    getJigsawContent() {
        return `
            <div class="activity-container jigsaw-activity">
                <!-- Progress Display -->
                <div id="jigsawProgressDisplay" class="progress-display-top"></div>

                <!-- Title -->
                <h2 class="display-5 fw-bold mb-2" id="jigsawTitle">Jigsaw Puzzle</h2>

                <!-- Difficulty Selector -->
                <div class="difficulty-selector" id="jigsawDifficulty">
                    <button class="difficulty-btn active" data-difficulty="easy">Easy (4 pcs)</button>
                    <button class="difficulty-btn" data-difficulty="medium">Medium (6 pcs)</button>
                    <button class="difficulty-btn" data-difficulty="hard">Hard (9 pcs)</button>
                </div>

                <!-- Reference Image -->
                <div id="jigsawReference" class="jigsaw-reference">
                    <img id="jigsawRefImg" src="" alt="Reference">
                </div>

                <!-- Puzzle Area -->
                <div id="jigsawBoard" class="jigsaw-board">
                    <!-- Pieces generated by JS -->
                </div>

                <!-- Star Animation Container -->
                <div id="jigsawStarAnimation" class="star-animation-container"></div>

                <!-- Level Up Notification -->
                <div id="jigsawLevelUp" class="level-up-notification" style="display: none;"></div>
            </div>
        `;
    }

    getSortingContent() {
        return `
            <div class="activity-container sorting-activity">
                <!-- Progress Display -->
                <div id="sortingProgressDisplay" class="progress-display-top"></div>

                <!-- Title -->
                <h2 class="display-5 fw-bold mb-2">Sorting Game</h2>

                <!-- Category Selector -->
                <div class="difficulty-selector" id="sortingCategory">
                    <button class="difficulty-btn active" data-category="colours">Colours</button>
                    <button class="difficulty-btn" data-category="animals">Animals</button>
                    <button class="difficulty-btn" data-category="size">Size</button>
                    <button class="difficulty-btn" data-category="food">Food</button>
                </div>

                <!-- Item to Sort -->
                <div id="sortingItem" class="sorting-item">
                    <!-- Current item appears here -->
                </div>

                <!-- Sorting Baskets -->
                <div id="sortingBaskets" class="sorting-baskets">
                    <!-- Two baskets generated by JS -->
                </div>

                <!-- Score Display -->
                <div id="sortingScore" class="sorting-score"></div>

                <!-- Star Animation Container -->
                <div id="sortingStarAnimation" class="star-animation-container"></div>

                <!-- Level Up Notification -->
                <div id="sortingLevelUp" class="level-up-notification" style="display: none;"></div>
            </div>
        `;
    }
}

// Global instances
let themeManager;
let fullscreenManager;
let muteManager;
let updateManager;
let navigationManager;
let activityManager;
let characterManager;

/**
 * Global functions (called from HTML onclick)
 */
window.startActivity = function(activityName) {
    if (activityManager) {
        activityManager.start(activityName);
    }
};

window.returnToMenu = function() {
    if (activityManager) {
        activityManager.stop();
    }
};

/**
 * Wire up click handlers via addEventListener (CSP blocks inline onclick)
 */
function bindClickHandlers() {
    // Activity cards
    document.querySelectorAll('.activity-card[data-activity]').forEach(card => {
        card.addEventListener('click', () => {
            window.startActivity(card.dataset.activity);
        });
    });

    // Back button
    const backBtn = document.getElementById('btnBack');
    if (backBtn) {
        backBtn.addEventListener('click', () => window.returnToMenu());
    }
}

/**
 * Initialize application
 */
async function initApp() {
    console.log('Initializing Toddler Typing application...');

    // Initialize DinoVoice TTS (Web Speech API)
    if (window.DinoVoice) {
        window.DinoVoice.init();
        console.log('DinoVoice TTS initialized');
    }

    // Bind click handlers (CSP blocks inline onclick attributes)
    bindClickHandlers();

    // Initialize managers
    themeManager = new ThemeManager();
    fullscreenManager = new FullscreenManager();
    muteManager = new MuteManager();
    updateManager = new UpdateManager();
    navigationManager = new NavigationManager();
    activityManager = new ActivityManager(navigationManager);

    // Initialize character (3D if Three.js available, fallback to 2D)
    const characterContainer = document.getElementById('character-container');

    // Check if Three.js is available
    console.log('=== CHARACTER INITIALIZATION DEBUG ===');
    console.log('Three.js available:', typeof THREE !== 'undefined');
    console.log('CharacterManager defined:', typeof CharacterManager !== 'undefined');

    if (characterContainer && typeof THREE !== 'undefined' && typeof CharacterManager !== 'undefined') {
        console.log('Attempting to load 3D character...');
        characterManager = new CharacterManager(characterContainer);

        // Try to initialize 3D character
        try {
            await characterManager.init();
            console.log('3D Character loaded successfully!');

            // Wave hello to the user after a brief delay
            setTimeout(() => {
                if (characterManager) characterManager.playAnimation('wave', false);
            }, 1500);

            // Set up voice-to-animation bridge
            if (typeof VoiceToAnimationBridge !== 'undefined') {
                window.voiceToAnimationBridge = new VoiceToAnimationBridge(characterManager);
                console.log('Voice-to-animation bridge initialized');
            }
        } catch (error) {
            console.error('3D Character initialization failed:', error);
            console.log('Falling back to 2D character...');
            // Clear any leftover 3D elements (canvas, etc.) before 2D fallback
            characterContainer.innerHTML = '';
            // Try 2D fallback
            if (typeof CharacterManager2D !== 'undefined') {
                characterManager = new CharacterManager2D(characterContainer);
                await characterManager.init();
                console.log('2D Character fallback loaded');
            }
        }
    } else {
        console.warn('Three.js not available, using 2D character fallback');
        // Load 2D character as fallback
        if (characterContainer && typeof CharacterManager2D !== 'undefined') {
            characterManager = new CharacterManager2D(characterContainer);
            await characterManager.init();
            console.log('2D Character loaded (fallback)');
        } else {
            console.error('No character manager available!');
        }
    }

    // Make character manager globally accessible
    if (characterManager) {
        window.characterManager = characterManager;
    }

    // Click on dinosaur to hear a random phrase
    if (characterContainer) {
        characterContainer.style.cursor = 'pointer';
        characterContainer.addEventListener('click', () => {
            if (window.DinoVoice && !AppState.isMuted) {
                window.DinoVoice.speakPhrase('dino_click', null, null, true);
                if (characterManager && characterManager.playAnimation) {
                    characterManager.playAnimation('happy');
                }
            }
        });
    }

    // Load rewards and display on home screen
    if (typeof RewardsManager !== 'undefined') {
        window.rewardsManager = new RewardsManager();
        await window.rewardsManager.loadProgress();
        window.rewardsManager.renderHomeStarDisplay();
    }

    // Load version from backend
    const versionLabel = document.getElementById('versionLabel');
    if (versionLabel) {
        const version = await AppAPI.getVersion() || AppState.version;
        if (version) {
            versionLabel.textContent = `v${version}`;
        }
    }

    // Load settings
    const settings = await AppAPI.loadSettings();
    if (settings) {
        if (settings.theme) {
            themeManager.setTheme(settings.theme);
        }
    }

    // Dino greets the user on startup
    if (window.DinoVoice && !AppState.isMuted) {
        setTimeout(() => {
            window.DinoVoice.speakPhrase('greeting', null, null, true);
        }, 2000);
    }

    console.log('Application initialized successfully');
}

/**
 * Wait for DOM to be ready
 */
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
} else {
    initApp();
}

/**
 * Export for testing (if running in Node.js)
 */
try {
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = {
            AppState,
            AppAPI,
            ThemeManager,
            FullscreenManager,
            NavigationManager,
            ActivityManager
        };
    }
} catch (_e) {
    // Silently ignore in Electron renderer (contextIsolation)
}
