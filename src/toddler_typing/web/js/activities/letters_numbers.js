/**
 * Letters & Numbers Activity
 * Interactive learning activity for letters and numbers
 */

class LettersNumbersActivity {
    constructor() {
        this.currentCharacter = '';
        this.currentType = '';
        this.isActive = false;
        this.successFlash = 0;
        this.keydownHandler = null;
        this.totalStars = 0;
        this.currentLevel = 1;
    }

    /**
     * Initialize and start the activity
     */
    async start() {
        console.log('Starting Letters & Numbers activity');
        this.isActive = true;

        // Get initial progress
        const progressData = await AppAPI.call('get_progress');
        if (progressData && progressData.success && progressData.progress) {
            this.totalStars = progressData.progress.total_stars || 0;
            this.currentLevel = progressData.progress.current_level || 1;
        }

        // Set up keyboard event listener
        this.keydownHandler = (e) => this.handleKeyPress(e);
        document.addEventListener('keydown', this.keydownHandler);

        // Get first character
        await this.nextCharacter();

        // Update UI with current progress
        this.updateProgressDisplay();
    }

    /**
     * Stop the activity and clean up
     */
    stop() {
        console.log('Stopping Letters & Numbers activity');
        this.isActive = false;

        // Speak farewell
        if (window.DinoVoice && window.DinoVoice.speakPhrase) {
            window.DinoVoice.speakPhrase('farewell');
        }

        // Remove keyboard event listener
        if (this.keydownHandler) {
            document.removeEventListener('keydown', this.keydownHandler);
            this.keydownHandler = null;
        }

        // Clear animation interval if any
        if (this.animationInterval) {
            clearInterval(this.animationInterval);
            this.animationInterval = null;
        }
    }

    /**
     * Get next random letter or number
     */
    async nextCharacter() {
        try {
            const result = await AppAPI.call('get_random_letter_or_number');

            if (result && result.success) {
                this.currentCharacter = result.character;
                this.currentType = result.type;

                // Update display
                this.updateDisplay();

                // Speak instruction via DinoPhrases
                if (window.DinoVoice && window.DinoVoice.speakPhrase) {
                    const sub = this.currentType === 'letter' ? 'instruction_letter' : 'instruction_number';
                    window.DinoVoice.speakPhrase('letters_numbers', sub, { target: this.currentCharacter }, true);
                }
            } else {
                console.error('Failed to get random character');
            }
        } catch (error) {
            console.error('Error getting next character:', error);
        }
    }

    /**
     * Handle keyboard key press
     */
    async handleKeyPress(event) {
        if (!this.isActive || this.successFlash > 0) {
            return;
        }

        // Get the key that was pressed
        let pressedKey = event.key;

        // For letters, normalize to uppercase
        if (pressedKey.length === 1) {
            pressedKey = pressedKey.toUpperCase();
        }

        console.log(`Key pressed: ${pressedKey}, Expected: ${this.currentCharacter}`);

        const result = await AppAPI.call('check_letter_number_answer', pressedKey, this.currentCharacter);

        if (result && result.success && result.correct) {
            // Correct answer!
            await this.handleCorrectAnswer(result);
        } else if (result && result.success && !result.correct) {
            // Wrong answer — give feedback
            if (window.DinoVoice && window.DinoVoice.speakPhrase) {
                window.DinoVoice.speakPhrase('wrong_key');
            }
            if (window.characterManager) {
                window.characterManager.playAnimation('thinking', false);
            }
        }
    }

    /**
     * Handle correct answer
     */
    async handleCorrectAnswer(result) {
        console.log('Correct answer!', result);

        // Speak encouragement via DinoPhrases
        if (window.DinoVoice && window.DinoVoice.speakPhrase) {
            if (result.level_up) {
                window.DinoVoice.speakPhrase('level_up');
            } else {
                window.DinoVoice.speakPhrase('correct_first_try');
            }
        }

        // Trigger character celebration
        if (window.characterManager) {
            if (result.level_up) {
                window.characterManager.playAnimation('dance', false);
            } else if (result.star_awarded) {
                window.characterManager.playAnimation('happy', false);
            } else {
                window.characterManager.playAnimation('clap', false);
            }
        }

        // Show success flash
        this.successFlash = 30;  // frames
        this.showSuccessFlash();

        // Update progress if star was awarded
        if (result.star_awarded) {
            this.totalStars = result.total_stars;
            this.currentLevel = result.level;

            // Show star animation
            this.showStarAnimation();

            // Show level up if applicable
            if (result.level_up) {
                this.showLevelUpAnimation();
            }

            // Update progress display
            this.updateProgressDisplay();
        }

        // Wait for flash animation, then get next character
        setTimeout(async () => {
            this.successFlash = 0;
            await this.nextCharacter();
        }, 1000);
    }

    /**
     * Update the main display with current character
     */
    updateDisplay() {
        const displayElement = document.getElementById('letterNumberDisplay');
        const instructionElement = document.getElementById('letterNumberInstruction');

        if (displayElement) {
            displayElement.textContent = this.currentCharacter;

            // Update color based on type
            displayElement.className = 'letter-number-display';
            if (this.currentType === 'letter') {
                displayElement.classList.add('is-letter');
            } else {
                displayElement.classList.add('is-number');
            }
        }

        if (instructionElement) {
            if (this.currentType === 'letter') {
                instructionElement.textContent = 'Press the letter on the keyboard!';
            } else {
                instructionElement.textContent = 'Press the number on the keyboard!';
            }
        }
    }

    /**
     * Show success flash animation
     */
    showSuccessFlash() {
        const container = document.getElementById('activityContent');
        if (container) {
            container.classList.add('success-flash');
            setTimeout(() => {
                container.classList.remove('success-flash');
            }, 1000);
        }
    }

    /**
     * Show star animation
     */
    showStarAnimation() {
        const starContainer = document.getElementById('starAnimation');
        if (starContainer) {
            // Create star element
            const star = document.createElement('div');
            star.className = 'animated-star';
            star.innerHTML = '<i class="bi bi-star-fill"></i>';

            starContainer.appendChild(star);

            // Remove after animation
            setTimeout(() => {
                star.remove();
            }, 2000);
        }
    }

    /**
     * Show level up animation
     */
    showLevelUpAnimation() {
        const levelUpContainer = document.getElementById('levelUpNotification');
        if (levelUpContainer) {
            levelUpContainer.innerHTML = `
                <div class="level-up-message">
                    <h2 class="display-4 fw-bold text-gradient">Level Up!</h2>
                    <p class="fs-3">You're now Level ${this.currentLevel}!</p>
                </div>
            `;
            levelUpContainer.style.display = 'block';

            // Hide after 3 seconds
            setTimeout(() => {
                levelUpContainer.style.display = 'none';
            }, 3000);
        }
    }

    /**
     * Update progress display (stars and level)
     */
    updateProgressDisplay() {
        const progressElement = document.getElementById('progressDisplay');
        if (progressElement) {
            progressElement.innerHTML = `
                <div class="progress-info">
                    <div class="stars-display">
                        <i class="bi bi-star-fill text-warning"></i>
                        <span class="ms-2 fw-bold">${this.totalStars}</span>
                    </div>
                    <div class="level-display">
                        <i class="bi bi-trophy-fill text-success"></i>
                        <span class="ms-2 fw-bold">Level ${this.currentLevel}</span>
                    </div>
                </div>
            `;
        }
    }
}

// Export for use in main app
window.LettersNumbersActivity = LettersNumbersActivity;
