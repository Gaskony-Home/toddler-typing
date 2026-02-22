/**
 * CharacterManager - Handles 3D character rendering and animations
 * Uses Three.js for WebGL rendering of the dinosaur mascot
 */

class CharacterManager {
    constructor(containerElement) {
        this.container = containerElement;
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.model = null;
        this.mixer = null;
        this.animations = {};
        this.currentAnimation = null;
        this.clock = new THREE.Clock();
        this.isInitialized = false;
        this.animationFrame = null;

        // Animation state
        this.state = 'idle';
        this.isSpeaking = false;

        // Configuration
        this.config = {
            modelPath: 'assets/models/dino_character.glb',
            cameraDistance: 3.5,
            cameraHeight: 1.5,
            modelScale: 1.0,
            ambientLightIntensity: 0.6,
            directionalLightIntensity: 0.8
        };
    }

    /**
     * Initialize the 3D scene, camera, renderer, and load the character model
     */
    async init() {
        try {
            console.log('[CharacterManager] Initializing 3D character...');
            this.container.classList.add('loading');

            // Set up Three.js scene
            this.setupScene();
            this.setupCamera();
            this.setupRenderer();
            this.setupLights();

            // Load the character model
            await this.loadModel();

            // Start animation loop
            this.animate();

            // Set up auto-repositioning
            this.setupAutoRepositioning();

            this.isInitialized = true;
            this.container.classList.remove('loading');

            console.log('[CharacterManager] Character initialized successfully');

            // Play idle animation by default
            this.playAnimation('idle');

            return true;
        } catch (error) {
            console.error('[CharacterManager] Failed to initialize:', error);
            this.container.classList.remove('loading');
            // Fallback handled by CharacterManager2D.showFallback() via app.js
            throw error;
        }
    }

    /**
     * Setup automatic repositioning to avoid interfering with page content
     */
    setupAutoRepositioning() {
        // Possible positions (corners of the screen)
        this.positions = [
            { bottom: '20px', right: '20px', left: 'auto' },  // bottom-right
            { bottom: '20px', left: '20px', right: 'auto' },  // bottom-left
            { top: '80px', right: '20px', left: 'auto' },     // top-right
            { top: '80px', left: '20px', right: 'auto' }      // top-left
        ];

        this.currentPositionIndex = 0; // Start at bottom-right

        // Reposition every 30 seconds
        this.repositionInterval = setInterval(() => {
            this.moveToNextPosition();
        }, 30000);

        // Apply initial position
        this.applyPosition(this.positions[0]);
    }

    /**
     * Move character to next position
     */
    moveToNextPosition() {
        this.currentPositionIndex = (this.currentPositionIndex + 1) % this.positions.length;
        const newPosition = this.positions[this.currentPositionIndex];

        console.log('[CharacterManager] Moving to new position:', newPosition);

        // Add transition effect
        this.container.style.transition = 'all 1s ease-in-out';
        this.applyPosition(newPosition);

        // Play point animation to indicate movement
        this.playAnimation('wave', false);
    }

    /**
     * Apply position to container
     */
    applyPosition(position) {
        Object.keys(position).forEach(key => {
            this.container.style[key] = position[key];
        });
    }

    /**
     * Set up the Three.js scene
     */
    setupScene() {
        this.scene = new THREE.Scene();
        // Transparent background to blend with page
        this.scene.background = null;
    }

    /**
     * Set up the camera with optimal viewing angle for the character
     */
    setupCamera() {
        const aspect = this.container.clientWidth / this.container.clientHeight;
        this.camera = new THREE.PerspectiveCamera(45, aspect, 0.1, 1000);

        // Position camera to view the character nicely
        this.camera.position.set(
            0,
            this.config.cameraHeight,
            this.config.cameraDistance
        );
        this.camera.lookAt(0, this.config.cameraHeight / 2, 0);
    }

    /**
     * Set up the WebGL renderer
     */
    setupRenderer() {
        this.renderer = new THREE.WebGLRenderer({
            antialias: true,
            alpha: true, // Transparent background
            powerPreference: 'high-performance'
        });

        this.renderer.setSize(
            this.container.clientWidth,
            this.container.clientHeight
        );
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

        // Append canvas to container
        this.container.appendChild(this.renderer.domElement);

        // Handle window resize
        window.addEventListener('resize', () => this.onWindowResize());
    }

    /**
     * Set up lighting for the character
     */
    setupLights() {
        // Ambient light for overall illumination
        const ambientLight = new THREE.AmbientLight(
            0xffffff,
            this.config.ambientLightIntensity
        );
        this.scene.add(ambientLight);

        // Main directional light (from top-front)
        const mainLight = new THREE.DirectionalLight(
            0xffffff,
            this.config.directionalLightIntensity
        );
        mainLight.position.set(2, 3, 2);
        mainLight.castShadow = true;
        this.scene.add(mainLight);

        // Rim light (from back) to make character pop
        const rimLight = new THREE.DirectionalLight(0xffffff, 0.4);
        rimLight.position.set(-1, 2, -2);
        this.scene.add(rimLight);

        // Fill light (from side) for softer shadows
        const fillLight = new THREE.DirectionalLight(0xffffff, 0.3);
        fillLight.position.set(-2, 1, 1);
        this.scene.add(fillLight);
    }

    /**
     * Load the 3D character model (GLB format)
     */
    async loadModel() {
        return new Promise((resolve, reject) => {
            const loader = new THREE.GLTFLoader();

            loader.load(
                this.config.modelPath,
                (gltf) => {
                    console.log('[CharacterManager] Model loaded successfully');

                    this.model = gltf.scene;
                    this.model.scale.set(
                        this.config.modelScale,
                        this.config.modelScale,
                        this.config.modelScale
                    );

                    // Center the model
                    const box = new THREE.Box3().setFromObject(this.model);
                    const center = box.getCenter(new THREE.Vector3());
                    this.model.position.sub(center);
                    this.model.position.y = 0; // Place on ground

                    // Enable shadows
                    this.model.traverse((child) => {
                        if (child.isMesh) {
                            child.castShadow = true;
                            child.receiveShadow = true;
                        }
                    });

                    this.scene.add(this.model);

                    // Set up animation mixer
                    if (gltf.animations && gltf.animations.length > 0) {
                        this.mixer = new THREE.AnimationMixer(this.model);

                        // Store all animations by name
                        gltf.animations.forEach((clip) => {
                            this.animations[clip.name] = clip;
                            console.log(`[CharacterManager] Found animation: ${clip.name}`);
                        });
                    }

                    resolve();
                },
                (progress) => {
                    const percent = (progress.loaded / progress.total) * 100;
                    console.log(`[CharacterManager] Loading: ${percent.toFixed(0)}%`);
                },
                (error) => {
                    console.error('[CharacterManager] Error loading model:', error);
                    reject(error);
                }
            );
        });
    }

    /**
     * Main animation loop
     */
    animate() {
        this.animationFrame = requestAnimationFrame(() => this.animate());

        const delta = this.clock.getDelta();

        // Update animation mixer
        if (this.mixer) {
            this.mixer.update(delta);
        }

        // Optional: Add subtle idle movement when not playing animation
        if (!this.currentAnimation && this.model) {
            const time = this.clock.getElapsedTime();
            this.model.rotation.y = Math.sin(time * 0.3) * 0.1; // Subtle sway
        }

        // Render the scene
        if (this.renderer && this.scene && this.camera) {
            this.renderer.render(this.scene, this.camera);
        }
    }

    /**
     * Play a specific animation by name
     */
    playAnimation(animationName, loop = null, fadeTime = 0.3) {
        if (!this.mixer || !this.animations[animationName]) {
            console.warn(`[CharacterManager] Animation "${animationName}" not found`);
            return false;
        }

        console.log(`[CharacterManager] Playing animation: ${animationName}`);

        // Stop current animation with fade out
        if (this.currentAnimation) {
            this.currentAnimation.fadeOut(fadeTime);
        }

        // Play new animation with fade in
        const clip = this.animations[animationName];
        const action = this.mixer.clipAction(clip);

        // Determine loop behavior
        if (loop !== null) {
            action.setLoop(loop ? THREE.LoopRepeat : THREE.LoopOnce);
        } else {
            const loopingAnimations = ['idle', 'talk', 'walk'];
            const shouldLoop = loopingAnimations.includes(animationName);
            action.setLoop(shouldLoop ? THREE.LoopRepeat : THREE.LoopOnce);
        }

        // If not looping, reset to idle when done
        if (action.loop === THREE.LoopOnce) {
            action.clampWhenFinished = true;
            this.mixer.addEventListener('finished', (e) => {
                if (e.action === action) {
                    this.playAnimation('idle');
                }
            });
        }

        action.reset();
        action.fadeIn(fadeTime);
        action.play();

        this.currentAnimation = action;
        this.state = animationName;

        return true;
    }

    /**
     * Set the character's emotional state (triggers corresponding animation)
     */
    setEmotion(emotion) {
        const emotionMap = {
            'happy': 'happy',
            'excited': 'happy',
            'celebrate': 'celebrate',
            'dance': 'dance',
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

        this.isSpeaking = true;
        this.playAnimation('talk', true);
    }

    /**
     * Stop talking animation (return to idle)
     */
    stopTalking() {
        if (!this.isSpeaking) return;

        this.isSpeaking = false;
        this.playAnimation('idle');
    }

    /**
     * Handle window resize
     */
    onWindowResize() {
        if (!this.camera || !this.renderer) return;

        const width = this.container.clientWidth;
        const height = this.container.clientHeight;

        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();

        this.renderer.setSize(width, height);
    }

    /**
     * Clean up resources
     */
    destroy() {
        // Stop animation loop
        if (this.animationFrame) {
            cancelAnimationFrame(this.animationFrame);
        }

        // Stop repositioning
        if (this.repositionInterval) {
            clearInterval(this.repositionInterval);
        }

        // Dispose Three.js resources
        if (this.renderer) {
            this.renderer.dispose();
        }

        if (this.scene) {
            this.scene.traverse((object) => {
                if (object.geometry) object.geometry.dispose();
                if (object.material) {
                    if (Array.isArray(object.material)) {
                        object.material.forEach(material => material.dispose());
                    } else {
                        object.material.dispose();
                    }
                }
            });
        }

        // Clear container
        this.container.innerHTML = '';

        console.log('[CharacterManager] Destroyed');
    }
}

// Global instance (will be initialized in app.js)
window.characterManager = null;
window.voiceToAnimationBridge = null;
