/**
 * Sounds Activity - Learn phonics and letter sounds
 * Teaches digraphs and common letter combinations
 */

class SoundsActivity {
    constructor() {
        this.sounds = [
            { sound: 'sh', examples: ['ship', 'fish', 'wash'], description: 'SH like in Ship' },
            { sound: 'ch', examples: ['chip', 'much', 'chair'], description: 'CH like in Chip' },
            { sound: 'th', examples: ['this', 'that', 'with'], description: 'TH like in This' },
            { sound: 'ph', examples: ['phone', 'graph', 'photo'], description: 'PH like in Phone' },
            { sound: 'wh', examples: ['what', 'when', 'why'], description: 'WH like in What' },
            { sound: 'ck', examples: ['duck', 'sock', 'back'], description: 'CK like in Duck' },
            { sound: 'ng', examples: ['sing', 'ring', 'long'], description: 'NG like in Sing' },
            { sound: 'qu', examples: ['queen', 'quick', 'quiet'], description: 'QU like in Queen' }
        ];
        this.currentIndex = 0;
        this.currentExampleIndex = 0;
    }

    async start() {
        console.log('Starting Sounds activity');

        // Display first sound
        this.showSound();

        // Set up navigation buttons
        this.setupNavigation();

        // Speak welcome message
        const welcomeText = window.DinoPhrase ? window.DinoPhrase('sounds', 'welcome') : "Let's learn letter sounds!";
        AppAPI.call('speak', welcomeText);

        // Character wave
        if (window.characterManager) {
            window.characterManager.playAnimation('wave', false);
        }
    }

    showSound() {
        const soundDisplay = document.getElementById('soundDisplay');
        const description = document.getElementById('soundDescription');
        const examples = document.getElementById('soundExamples');
        const counter = document.getElementById('soundCounter');

        if (!soundDisplay || !description || !examples) return;

        const currentSound = this.sounds[this.currentIndex];

        // Display the sound
        soundDisplay.textContent = currentSound.sound.toUpperCase();
        description.textContent = currentSound.description;

        // Display examples as clickable buttons
        examples.innerHTML = currentSound.examples.map((example, index) => `
            <button class="sound-example-btn ${index === this.currentExampleIndex ? 'active' : ''}"
                    data-index="${index}"
                    onclick="window.currentSoundsActivity.speakExample(${index})">
                ${example}
            </button>
        `).join('');

        if (counter) {
            counter.textContent = `${this.currentIndex + 1} / ${this.sounds.length}`;
        }

        // Automatically speak the sound when shown
        this.speakSound();

        // Update button states
        this.updateButtons();
    }

    setupNavigation() {
        const prevBtn = document.getElementById('prevSound');
        const nextBtn = document.getElementById('nextSound');
        const hearBtn = document.getElementById('hearSound');

        if (prevBtn) {
            prevBtn.addEventListener('click', () => this.previousSound());
        }

        if (nextBtn) {
            nextBtn.addEventListener('click', () => this.nextSound());
        }

        if (hearBtn) {
            hearBtn.addEventListener('click', () => this.speakSound());
        }

        // Keyboard navigation - store bound handler for later removal
        this.keyPressHandler = this.handleKeyPress.bind(this);
        document.addEventListener('keydown', this.keyPressHandler);

        // Store reference to this instance
        window.currentSoundsActivity = this;
    }

    handleKeyPress(e) {
        if (e.key === 'ArrowLeft') {
            this.previousSound();
        } else if (e.key === 'ArrowRight') {
            this.nextSound();
        } else if (e.key === ' ' || e.key === 'Enter') {
            e.preventDefault();
            this.speakSound();
        }
    }

    previousSound() {
        if (this.currentIndex > 0) {
            this.currentIndex--;
            this.currentExampleIndex = 0;
            this.showSound();

            if (window.characterManager) {
                window.characterManager.playAnimation('point', false);
            }
        }
    }

    nextSound() {
        if (this.currentIndex < this.sounds.length - 1) {
            this.currentIndex++;
            this.currentExampleIndex = 0;
            this.showSound();

            if (window.characterManager) {
                window.characterManager.playAnimation('point', false);
            }
        }
    }

    speakSound() {
        const currentSound = this.sounds[this.currentIndex];
        AppAPI.call('speak', currentSound.description);

        if (window.characterManager) {
            window.characterManager.playAnimation('talk', true);
            setTimeout(() => {
                if (window.characterManager) {
                    window.characterManager.playAnimation('idle');
                }
            }, 2000);
        }
    }

    speakExample(index) {
        this.currentExampleIndex = index;
        const currentSound = this.sounds[this.currentIndex];
        const example = currentSound.examples[index];

        AppAPI.call('speak', example);

        // Update active state
        document.querySelectorAll('.sound-example-btn').forEach((btn, i) => {
            if (i === index) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });

        if (window.characterManager) {
            window.characterManager.playAnimation('happy', false);
        }
    }

    updateButtons() {
        const prevBtn = document.getElementById('prevSound');
        const nextBtn = document.getElementById('nextSound');

        if (prevBtn) {
            prevBtn.disabled = this.currentIndex === 0;
        }

        if (nextBtn) {
            nextBtn.disabled = this.currentIndex === this.sounds.length - 1;
        }
    }

    stop() {
        console.log('Stopping Sounds activity');
        if (this.keyPressHandler) {
            document.removeEventListener('keydown', this.keyPressHandler);
        }
        window.currentSoundsActivity = null;
    }
}
