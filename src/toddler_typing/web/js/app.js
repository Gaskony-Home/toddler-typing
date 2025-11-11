/**
 * Toddler Typing - Main JavaScript Application
 * Handles UI interactions, navigation, and Python API communication
 */

// Global state management
const AppState = {
    currentActivity: null,
    theme: 'light',
    isFullscreen: false,
    version: '1.0.0'
};

// Python API bridge (will be available via pywebview.api)
const PythonAPI = {
    /**
     * Check if Python API is available
     */
    isAvailable() {
        return typeof pywebview !== 'undefined' && pywebview.api;
    },

    /**
     * Call Python API method safely
     */
    async call(method, ...args) {
        if (this.isAvailable()) {
            try {
                return await pywebview.api[method](...args);
            } catch (error) {
                console.error(`Python API call failed: ${method}`, error);
                return null;
            }
        } else {
            console.warn('Python API not available, running in browser mode');
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

    async start(activityName) {
        console.log(`Starting activity: ${activityName}`);

        // Stop any existing activity
        if (this.currentActivityInstance) {
            await this.stop();
        }

        // Notify Python backend
        await PythonAPI.startActivity(activityName);

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

        // Notify Python backend
        await PythonAPI.stopActivity();

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
        return `
            <div class="activity-container drawing-activity">
                <canvas id="drawingCanvas" width="1000" height="600"></canvas>

                <div class="drawing-controls">
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
                    </div>

                    <!-- Brush Sizes -->
                    <div class="brush-sizes" id="brushSizes">
                        <div class="brush-size-btn brush-size-small" data-size="5" title="Small">
                            <div class="brush-preview brush-preview-small"></div>
                        </div>
                        <div class="brush-size-btn brush-size-medium active" data-size="15" title="Medium">
                            <div class="brush-preview brush-preview-medium"></div>
                        </div>
                        <div class="brush-size-btn brush-size-large" data-size="30" title="Large">
                            <div class="brush-preview brush-preview-large"></div>
                        </div>
                    </div>

                    <!-- Clear Button -->
                    <button class="btn btn-danger btn-clear-canvas" id="clearCanvas">
                        <i class="bi bi-trash"></i> Clear
                    </button>
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

    getColoringContent() {
        return `
            <div class="activity-container">
                <h2 class="display-5 fw-bold mb-4">Coloring</h2>
                <div class="alert alert-info">
                    <i class="bi bi-info-circle"></i>
                    Activity coming soon! Color beautiful pictures.
                </div>
            </div>
        `;
    }
}

// Global instances
let themeManager;
let fullscreenManager;
let navigationManager;
let activityManager;

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

    // Initialize managers
    themeManager = new ThemeManager();
    fullscreenManager = new FullscreenManager();
    navigationManager = new NavigationManager();
    activityManager = new ActivityManager(navigationManager);

    // Load version
    const versionLabel = document.getElementById('versionLabel');
    if (versionLabel) {
        const version = await PythonAPI.getVersion() || AppState.version;
        versionLabel.textContent = `v${version}`;
    }

    // Load settings
    const settings = await PythonAPI.loadSettings();
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
 * Export for testing (if running in browser)
 */
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        AppState,
        PythonAPI,
        ThemeManager,
        FullscreenManager,
        NavigationManager,
        ActivityManager
    };
}
