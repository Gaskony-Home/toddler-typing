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

        // Listen for update-downloaded
        if (window.electronAPI && window.electronAPI.onUpdateDownloaded) {
            window.electronAPI.onUpdateDownloaded(() => {
                this.onUpdateDownloaded();
            });
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

    onUpdateAvailable(info) {
        this.updateInfo = info;
        console.log('Update available:', info.version);

        // Show the update button
        if (this.updateBtn) {
            this.updateBtn.style.display = 'flex';
        }

        // Update modal message
        if (this.updateModalMessage) {
            this.updateModalMessage.textContent = `Version ${info.version} is available. Download and restart to install?`;
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
    static getCanvasControlsHTML() {
        return `
                    <!-- Color Palette -->
                    <div class="color-palette" id="colorPalette">
                        <div class="color-btn active" data-color="#FF0000" style="background: #FF0000;" title="Red"></div>
                        <div class="color-btn" data-color="#FF7F00" style="background: #FF7F00;" title="Orange"></div>
                        <div class="color-btn" data-color="#FFFF00" style="background: #FFFF00;" title="Yellow"></div>
                        <div class="color-btn" data-color="#00FF00" style="background: #00FF00;" title="Green"></div>
                        <div class="color-btn" data-color="#0000FF" style="background: #0000FF;" title="Blue"></div>
                        <div class="color-btn" data-color="#4B0082" style="background: #4B0082;" title="Indigo"></div>
                        <div class="color-btn" data-color="#9400D3" style="background: #9400D3;" title="Violet"></div>
                        <div class="color-btn" data-color="#000000" style="background: #000000;" title="Black"></div>
                        <div class="color-btn" data-color="#FFFFFF" style="background: #FFFFFF; border-color: #dee2e6;" title="White"></div>
                        <div class="color-btn" data-color="#8B4513" style="background: #8B4513;" title="Brown"></div>
                        <div class="color-btn" data-color="#FFC0CB" style="background: #FFC0CB;" title="Pink"></div>
                        <div class="color-btn" data-color="#A52A2A" style="background: #A52A2A;" title="Dark Brown"></div>
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
    }

    async startActivityLogic(activityName) {
        switch (activityName) {
            case 'letters_numbers':
                if (typeof LettersNumbersActivity !== 'undefined') {
                    this.currentActivityInstance = new LettersNumbersActivity();
                    await this.currentActivityInstance.start();
                }
                break;
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
            default:
                console.log('No logic implemented for this activity yet');
        }
    }

    loadActivityContent(activityName) {
        let content = '';

        switch (activityName) {
            case 'letters_numbers':
                content = this.getLettersNumbersContent();
                break;
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
            default:
                content = '<h2>Activity not found</h2>';
        }

        this.navigation.setActivityContent(content);
    }

    getLettersNumbersContent() {
        return `
            <div class="activity-container letters-numbers-activity">
                <!-- Progress Display -->
                <div id="progressDisplay" class="progress-display-top"></div>

                <!-- Instruction Text -->
                <p id="letterNumberInstruction" class="instruction-text">
                    Press the letter on the keyboard!
                </p>

                <!-- Main Character Display -->
                <div id="letterNumberDisplay" class="letter-number-display is-letter">
                    A
                </div>

                <!-- Star Animation Container -->
                <div id="starAnimation" class="star-animation-container"></div>

                <!-- Level Up Notification -->
                <div id="levelUpNotification" class="level-up-notification" style="display: none;"></div>
            </div>
        `;
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
                <!-- Instruction Text -->
                <p id="shapeInstruction" class="instruction-text">
                    Click the shape!
                </p>

                <!-- Shape Options Grid -->
                <div id="shapeOptions" class="shape-options-grid">
                    <!-- Options will be generated here -->
                </div>
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
                <!-- Title and Counter -->
                <h2 class="display-5 fw-bold mb-3">Letter Sounds</h2>
                <div class="progress-display-top">
                    <span id="soundCounter">1 / 8</span>
                </div>

                <!-- Instruction Text -->
                <p id="soundDescription" class="instruction-text">
                    Click the speaker to hear the sound!
                </p>

                <!-- Main Sound Display -->
                <div id="soundDisplay" class="letter-number-display is-letter" style="font-size: clamp(5rem, 12vw, 10rem);">
                    SH
                </div>

                <!-- Example Words -->
                <div id="soundExamples" class="shape-options-grid" style="grid-template-columns: repeat(3, 1fr); max-width: 600px; margin: 2rem auto;">
                    <!-- Example buttons will be generated here -->
                </div>

                <!-- Navigation Controls -->
                <div class="drawing-controls" style="justify-content: center; gap: 1rem;">
                    <button class="btn btn-secondary btn-lg" id="prevSound">
                        <i class="bi bi-arrow-left"></i> Previous
                    </button>
                    <button class="btn btn-success btn-lg" id="hearSound">
                        <i class="bi bi-volume-up-fill"></i> Hear Sound
                    </button>
                    <button class="btn btn-secondary btn-lg" id="nextSound">
                        <i class="bi bi-arrow-right"></i> Next
                    </button>
                </div>
            </div>
        `;
    }

    getColoringContent() {
        const controls = ActivityManager.getCanvasControlsHTML();
        return `
            <div class="activity-container drawing-activity">
                <!-- Title and Counter -->
                <h2 class="display-5 fw-bold mb-2" id="coloringTitle">Coloring</h2>
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
 * Initialize application
 */
async function initApp() {
    console.log('Initializing Toddler Typing application...');

    // Initialize DinoVoice TTS (Web Speech API)
    if (window.DinoVoice) {
        window.DinoVoice.init();
        console.log('DinoVoice TTS initialized');
    }

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
