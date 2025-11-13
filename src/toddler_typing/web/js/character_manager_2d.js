/**
 * CharacterManager2D - 2D Sprite-based Character with CSS Animations
 * Temporary solution until 3D GLB model is ready
 * Uses same API as 3D version for easy swapping
 */

class CharacterManager2D {
    constructor(containerElement) {
        this.container = containerElement;
        this.characterElement = null;
        this.isInitialized = false;
        this.currentAnimation = 'idle';
        this.isSpeaking = false;
        this.animationTimeout = null;

        // Animation state
        this.state = 'idle';
    }

    /**
     * Initialize the 2D character
     */
    async init() {
        try {
            console.log('[CharacterManager2D] Initializing 2D character...');
            this.container.classList.add('loading');

            // Create character image element
            await this.createCharacter();

            // Start idle animation
            this.startIdleAnimation();

            this.isInitialized = true;
            this.container.classList.remove('loading');

            console.log('[CharacterManager2D] Character initialized successfully');

            return true;
        } catch (error) {
            console.error('[CharacterManager2D] Failed to initialize:', error);
            this.container.classList.remove('loading');
            this.showFallback();
            return false;
        }
    }

    /**
     * Create the character DOM element
     */
    async createCharacter() {
        return new Promise((resolve, reject) => {
            // Create wrapper for animations
            const wrapper = document.createElement('div');
            wrapper.className = 'character-2d-wrapper';
            wrapper.id = 'character-2d-wrapper';

            // Create character image
            const img = document.createElement('img');
            img.src = 'assets/dino_character.svg';
            img.alt = 'Dinosaur Character';
            img.className = 'character-2d-image';
            img.id = 'character-2d-image';

            // Handle load success
            img.onload = () => {
                console.log('[CharacterManager2D] Image loaded successfully');
                wrapper.appendChild(img);
                this.container.appendChild(wrapper);
                this.characterElement = wrapper;
                resolve();
            };

            // Handle load error
            img.onerror = () => {
                console.error('[CharacterManager2D] Failed to load character image');
                reject(new Error('Failed to load character image'));
            };
        });
    }

    /**
     * Start continuous idle animation
     */
    startIdleAnimation() {
        if (!this.characterElement) return;

        // Add idle class for breathing effect
        this.characterElement.classList.add('state-idle');
    }

    /**
     * Play a specific animation by name
     * @param {string} animationName - Name of the animation to play
     * @param {boolean} loop - Whether to loop (ignored for 2D, kept for API compatibility)
     * @param {number} fadeTime - Fade time (ignored for 2D, kept for API compatibility)
     */
    playAnimation(animationName, loop = null, fadeTime = 0.3) {
        if (!this.characterElement) {
            console.warn('[CharacterManager2D] Character not initialized');
            return false;
        }

        console.log(`[CharacterManager2D] Playing animation: ${animationName}`);

        // Clear any existing animation timeout
        if (this.animationTimeout) {
            clearTimeout(this.animationTimeout);
        }

        // Remove all state classes
        this.characterElement.classList.remove(
            'state-idle',
            'state-wave',
            'state-talk',
            'state-happy',
            'state-point',
            'state-thinking',
            'state-clap',
            'state-dance'
        );

        // Add new state class
        const stateClass = `state-${animationName}`;
        this.characterElement.classList.add(stateClass);
        this.currentAnimation = animationName;
        this.state = animationName;

        // For non-looping animations, return to idle after duration
        const nonLoopingAnimations = ['wave', 'happy', 'point', 'thinking', 'clap', 'dance'];
        if (nonLoopingAnimations.includes(animationName)) {
            // Duration based on animation type
            const durations = {
                'wave': 1500,
                'happy': 1200,
                'point': 1500,
                'thinking': 2000,
                'clap': 1000,
                'dance': 2500
            };

            const duration = durations[animationName] || 1500;

            this.animationTimeout = setTimeout(() => {
                if (this.currentAnimation === animationName && !this.isSpeaking) {
                    this.playAnimation('idle');
                }
            }, duration);
        }

        return true;
    }

    /**
     * Set the character's emotional state
     * @param {string} emotion - Emotion name
     */
    setEmotion(emotion) {
        const emotionMap = {
            'happy': 'happy',
            'excited': 'happy',
            'celebrate': 'dance',
            'curious': 'thinking',
            'thinking': 'thinking',
            'idle': 'idle',
            'greeting': 'wave',
            'wave': 'wave',
            'point': 'point',
            'clap': 'clap'
        };

        const animationName = emotionMap[emotion.toLowerCase()] || 'idle';
        this.playAnimation(animationName);
    }

    /**
     * Start talking animation (synced with voice)
     */
    startTalking() {
        if (this.isSpeaking) return;

        console.log('[CharacterManager2D] Started talking');
        this.isSpeaking = true;
        this.playAnimation('talk', true);
    }

    /**
     * Stop talking animation (return to idle)
     */
    stopTalking() {
        if (!this.isSpeaking) return;

        console.log('[CharacterManager2D] Stopped talking');
        this.isSpeaking = false;
        this.playAnimation('idle');
    }

    /**
     * Handle window resize (no-op for 2D, kept for API compatibility)
     */
    onWindowResize() {
        // No action needed for 2D
    }

    /**
     * Show fallback (emoji) if image fails to load
     */
    showFallback() {
        this.container.innerHTML = `
            <div style="
                width: 100%;
                height: 100%;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 8rem;
                animation: bounce 2s ease-in-out infinite;
            ">
                🦕
            </div>
        `;

        // Add bounce animation if not exists
        if (!document.getElementById('fallback-animation')) {
            const style = document.createElement('style');
            style.id = 'fallback-animation';
            style.textContent = `
                @keyframes bounce {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-20px); }
                }
            `;
            document.head.appendChild(style);
        }
    }

    /**
     * Clean up resources
     */
    destroy() {
        // Clear any timeouts
        if (this.animationTimeout) {
            clearTimeout(this.animationTimeout);
        }

        // Clear container
        this.container.innerHTML = '';

        console.log('[CharacterManager2D] Destroyed');
    }
}

/**
 * VoiceToAnimationBridge - Monitors voice output and syncs character animations
 */
class VoiceToAnimationBridge {
    constructor(characterManager) {
        this.characterManager = characterManager;
        this.isSpeaking = false;
        this.speechTimeout = null;

        // Override pywebview.api.speak to monitor when voice starts/stops
        if (typeof pywebview !== 'undefined' && pywebview.api) {
            this.interceptVoiceCalls();
        }
    }

    /**
     * Intercept voice API calls to sync with character
     */
    interceptVoiceCalls() {
        // Store original speak function
        const originalSpeak = pywebview.api.speak;
        const self = this;

        // Wrap the speak function
        pywebview.api.speak = async function(text, interrupt = false) {
            // Start talking animation
            self.onSpeechStart(text);

            // Call original function
            const result = await originalSpeak.call(pywebview.api, text, interrupt);

            // Estimate speech duration (rough approximation)
            const words = text.split(' ').length;
            const estimatedDuration = words * 500; // ~500ms per word

            // Stop talking after estimated duration
            self.scheduleSpeechEnd(estimatedDuration);

            return result;
        };
    }

    /**
     * Called when speech starts
     */
    onSpeechStart(text) {
        console.log('[VoiceToAnimationBridge] Speech started:', text);

        if (this.characterManager && !this.isSpeaking) {
            this.isSpeaking = true;
            this.characterManager.startTalking();
        }
    }

    /**
     * Schedule speech end
     */
    scheduleSpeechEnd(duration) {
        // Clear any existing timeout
        if (this.speechTimeout) {
            clearTimeout(this.speechTimeout);
        }

        // Schedule stop
        this.speechTimeout = setTimeout(() => {
            this.onSpeechEnd();
        }, duration);
    }

    /**
     * Called when speech ends
     */
    onSpeechEnd() {
        console.log('[VoiceToAnimationBridge] Speech ended');

        if (this.characterManager && this.isSpeaking) {
            this.isSpeaking = false;
            this.characterManager.stopTalking();
        }
    }
}

// Use 2D character manager as default
window.CharacterManager = CharacterManager2D;
window.characterManager = null;
window.voiceToAnimationBridge = null;
