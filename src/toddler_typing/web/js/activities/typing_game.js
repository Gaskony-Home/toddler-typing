/**
 * Typing Game Activity
 * Progressive difficulty: Letters → Numbers → Words
 * Features on-screen keyboard with highlighted target keys
 */

class TypingGameActivity {
    constructor() {
        this.currentStage = 1;
        this.currentTarget = '';
        this.currentType = '';
        this.currentWordIndex = 0;
        this.streak = 0;
        this.attempts = 0;
        this.totalStars = 0;
        this.currentLevel = 1;
        this.activityStars = 0;
        this.stage2Unlocked = false;
        this.stage3Unlocked = false;
        this.isActive = false;
        this.keydownHandler = null;
        this.idleTimer = null;
        this.processing = false;
    }

    async start() {
        console.log('Starting Typing Game activity');
        this.isActive = true;

        // Load progress
        const progress = await AppAPI.call('get_typing_game_progress');
        if (progress && progress.success) {
            this.activityStars = progress.activity_stars;
            this.totalStars = progress.total_stars;
            this.currentLevel = progress.current_level;
            this.stage2Unlocked = progress.stage2_unlocked;
            this.stage3Unlocked = progress.stage3_unlocked;
        }

        // Set up keyboard listener
        this.keydownHandler = (e) => this.handleKeyPress(e);
        document.addEventListener('keydown', this.keydownHandler);

        // Set up on-screen keyboard clicks
        this.setupOSK();

        // Set up stage tabs
        this.setupStageTabs();

        // Update progress display
        this.updateProgressDisplay();
        this.updateStageUI();

        // Greet
        if (window.DinoVoice && window.DinoVoice.speakPhrase) {
            window.DinoVoice.speakPhrase('greeting', null, null, true);
        }

        if (window.characterManager) {
            window.characterManager.playAnimation('wave', false);
        }

        // Load first challenge after a short delay for the greeting
        setTimeout(() => this.nextChallenge(), 1200);
    }

    stop() {
        console.log('Stopping Typing Game activity');
        this.isActive = false;

        if (this.keydownHandler) {
            document.removeEventListener('keydown', this.keydownHandler);
            this.keydownHandler = null;
        }

        this.clearIdleTimer();

        if (window.DinoVoice && window.DinoVoice.speakPhrase) {
            window.DinoVoice.speakPhrase('farewell');
        }
    }

    setupOSK() {
        // Delegate clicks on .osk-key buttons
        const kbd = document.getElementById('onscreenKeyboard');
        if (kbd) {
            kbd.addEventListener('click', (e) => {
                const key = e.target.closest('.osk-key');
                if (key && key.dataset.key) {
                    this.processKeyInput(key.dataset.key);
                    this.flashKey(key.dataset.key);
                }
            });
        }
    }

    setupStageTabs() {
        const tabs = document.querySelectorAll('.stage-tab');
        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                const stage = parseInt(tab.dataset.stage, 10);
                if (stage === 1 ||
                    (stage === 2 && this.stage2Unlocked) ||
                    (stage === 3 && this.stage3Unlocked)) {
                    this.currentStage = stage;
                    this.updateStageUI();
                    this.nextChallenge();
                }
            });
        });
    }

    handleKeyPress(event) {
        if (!this.isActive || this.processing) return;

        let key = event.key;
        if (key.length === 1) {
            key = key.toUpperCase();
            event.preventDefault();
            this.processKeyInput(key);
            this.flashKey(key);
        }
    }

    async processKeyInput(key) {
        if (!this.isActive || this.processing) return;

        this.resetIdleTimer();

        if (this.currentType === 'word') {
            // Word mode: check letter by letter
            const expectedChar = this.currentTarget[this.currentWordIndex];
            if (key === expectedChar) {
                this.currentWordIndex++;
                this.highlightCurrentLetterInWord();

                if (this.currentWordIndex >= this.currentTarget.length) {
                    // Whole word complete
                    await this.handleCorrect(true);
                }
            } else {
                await this.handleWrong();
            }
        } else {
            // Single char mode
            if (key === this.currentTarget) {
                await this.handleCorrect(false);
            } else {
                await this.handleWrong();
            }
        }
    }

    async handleCorrect(isWordComplete) {
        this.processing = true;
        this.streak++;
        this.attempts = 0;

        // Award star via API
        const result = await AppAPI.call('check_typing_answer', this.currentTarget[0] || this.currentTarget, this.currentTarget[0] || this.currentTarget, this.currentStage);

        if (result && result.star_awarded) {
            this.totalStars = result.total_stars;
            this.currentLevel = result.level;
            this.activityStars++;

            this.showStarAnimation();
            this.updateProgressDisplay();

            if (result.level_up) {
                this.showLevelUpAnimation();
                if (window.DinoVoice && window.DinoVoice.speakPhrase) {
                    window.DinoVoice.speakPhrase('level_up');
                }
            }
        }

        // Speak encouragement
        if (window.DinoVoice && window.DinoVoice.speakPhrase) {
            if (isWordComplete) {
                window.DinoVoice.speakPhrase('word_complete');
            } else if (this.attempts === 0) {
                window.DinoVoice.speakPhrase('correct_first_try');
            } else {
                window.DinoVoice.speakPhrase('correct_after_hints');
            }
        }

        // Character animation
        if (window.characterManager) {
            window.characterManager.playAnimation('happy', false);
        }

        // Check streak milestones
        this.checkStreakMilestone();

        // Check stage unlocks
        this.checkStageUnlocks();

        // Update streak display
        this.updateStreakDisplay();

        // Success flash on target
        const targetEl = document.getElementById('typingTargetDisplay');
        if (targetEl) {
            targetEl.classList.add('correct-flash');
            setTimeout(() => targetEl.classList.remove('correct-flash'), 600);
        }

        // Next challenge after delay
        setTimeout(() => {
            this.processing = false;
            this.nextChallenge();
        }, 1200);
    }

    async handleWrong() {
        this.streak = 0;
        this.attempts++;

        this.updateStreakDisplay();

        // Shake the target
        this.shakeTarget();

        // Speak
        if (window.DinoVoice && window.DinoVoice.speakPhrase) {
            if (this.attempts >= 3) {
                window.DinoVoice.speakPhrase('hint');
            } else {
                window.DinoVoice.speakPhrase('wrong_key');
            }
        }

        if (window.characterManager) {
            window.characterManager.playAnimation('thinking', false);
        }

        // Re-highlight target key
        this.highlightTargetKey();
    }

    async nextChallenge() {
        this.attempts = 0;
        this.currentWordIndex = 0;

        const result = await AppAPI.call('get_typing_challenge', this.currentStage);
        if (result && result.success) {
            this.currentTarget = result.target;
            this.currentType = result.type;

            this.updateTargetDisplay();
            this.highlightTargetKey();
            this.resetIdleTimer();

            // Speak instruction
            if (window.DinoVoice && window.DinoVoice.speakPhrase) {
                if (this.currentType === 'word') {
                    window.DinoVoice.speakPhrase('instruction', 'word', { target: this.currentTarget }, true);
                } else if (this.currentType === 'number') {
                    window.DinoVoice.speakPhrase('instruction', 'number', { target: this.currentTarget }, true);
                } else {
                    window.DinoVoice.speakPhrase('instruction', 'letter', { target: this.currentTarget }, true);
                }
            }
        }
    }

    updateTargetDisplay() {
        const targetEl = document.getElementById('typingTargetDisplay');
        if (!targetEl) return;

        if (this.currentType === 'word') {
            // Show word as individual letter spans
            targetEl.innerHTML = this.currentTarget.split('').map((ch, i) =>
                `<span class="word-letter ${i === 0 ? 'current-letter' : ''}" data-index="${i}">${ch}</span>`
            ).join('');
            targetEl.className = 'typing-target-display is-word';
        } else {
            targetEl.textContent = this.currentTarget;
            targetEl.className = 'typing-target-display ' + (this.currentType === 'number' ? 'is-number' : 'is-letter');
        }

        // Show/hide number row based on stage
        const numberRow = document.getElementById('oskNumberRow');
        if (numberRow) {
            numberRow.style.display = (this.currentStage >= 2) ? 'flex' : 'none';
        }
    }

    highlightTargetKey() {
        // Remove all existing highlights
        document.querySelectorAll('.osk-key.target-key').forEach(k => k.classList.remove('target-key'));

        if (this.currentType === 'word') {
            const ch = this.currentTarget[this.currentWordIndex];
            if (ch) {
                const key = document.querySelector(`.osk-key[data-key="${ch}"]`);
                if (key) key.classList.add('target-key');
            }
        } else {
            const key = document.querySelector(`.osk-key[data-key="${this.currentTarget}"]`);
            if (key) key.classList.add('target-key');
        }
    }

    highlightCurrentLetterInWord() {
        document.querySelectorAll('.word-letter').forEach((el, i) => {
            el.classList.remove('current-letter');
            if (i < this.currentWordIndex) {
                el.classList.add('completed-letter');
            } else if (i === this.currentWordIndex) {
                el.classList.add('current-letter');
            }
        });

        // Update highlighted key on OSK
        this.highlightTargetKey();
    }

    flashKey(key) {
        const keyEl = document.querySelector(`.osk-key[data-key="${key}"]`);
        if (keyEl) {
            keyEl.classList.add('key-pressed');
            setTimeout(() => keyEl.classList.remove('key-pressed'), 200);
        }
    }

    shakeTarget() {
        const targetEl = document.getElementById('typingTargetDisplay');
        if (targetEl) {
            targetEl.classList.add('shake');
            setTimeout(() => targetEl.classList.remove('shake'), 500);
        }
    }

    updateStageUI() {
        document.querySelectorAll('.stage-tab').forEach(tab => {
            const stage = parseInt(tab.dataset.stage, 10);
            tab.classList.toggle('active', stage === this.currentStage);

            if (stage === 2) {
                tab.classList.toggle('locked', !this.stage2Unlocked);
            } else if (stage === 3) {
                tab.classList.toggle('locked', !this.stage3Unlocked);
            }
        });
    }

    updateProgressDisplay() {
        const el = document.getElementById('typingProgressDisplay');
        if (el) {
            el.innerHTML = `
                <div class="progress-info">
                    <div class="stars-display">
                        <i class="bi bi-star-fill text-warning"></i>
                        <span class="ms-2 fw-bold">${this.activityStars}</span>
                    </div>
                    <div class="level-display">
                        <i class="bi bi-trophy-fill text-success"></i>
                        <span class="ms-2 fw-bold">Level ${this.currentLevel}</span>
                    </div>
                </div>
            `;
        }
    }

    updateStreakDisplay() {
        const el = document.getElementById('streakDisplay');
        if (el) {
            if (this.streak > 0) {
                el.innerHTML = `<i class="bi bi-fire"></i> ${this.streak}`;
                el.classList.add('streak-active');
            } else {
                el.innerHTML = '';
                el.classList.remove('streak-active');
            }
        }
    }

    checkStreakMilestone() {
        if (window.DinoVoice && window.DinoVoice.speakPhrase) {
            if (this.streak === 10) {
                window.DinoVoice.speakPhrase('streak', '10');
            } else if (this.streak === 5) {
                window.DinoVoice.speakPhrase('streak', '5');
            } else if (this.streak === 3) {
                window.DinoVoice.speakPhrase('streak', '3');
            }
        }
    }

    checkStageUnlocks() {
        if (!this.stage2Unlocked && this.activityStars >= 20) {
            this.stage2Unlocked = true;
            this.updateStageUI();
            if (window.DinoVoice && window.DinoVoice.speakPhrase) {
                setTimeout(() => window.DinoVoice.speakPhrase('new_stage', 'numbers'), 1500);
            }
        }
        if (!this.stage3Unlocked && this.activityStars >= 50) {
            this.stage3Unlocked = true;
            this.updateStageUI();
            if (window.DinoVoice && window.DinoVoice.speakPhrase) {
                setTimeout(() => window.DinoVoice.speakPhrase('new_stage', 'words'), 1500);
            }
        }
    }

    showStarAnimation() {
        const container = document.getElementById('typingStarAnimation');
        if (container) {
            const star = document.createElement('div');
            star.className = 'animated-star';
            star.innerHTML = '<i class="bi bi-star-fill"></i>';
            container.appendChild(star);
            setTimeout(() => star.remove(), 2000);
        }
    }

    showLevelUpAnimation() {
        const container = document.getElementById('typingLevelUp');
        if (container) {
            container.innerHTML = `
                <div class="level-up-message">
                    <h2 class="display-4 fw-bold text-gradient">Level Up!</h2>
                    <p class="fs-3">You're now Level ${this.currentLevel}!</p>
                </div>
            `;
            container.style.display = 'block';
            setTimeout(() => { container.style.display = 'none'; }, 3000);
        }
    }

    resetIdleTimer() {
        this.clearIdleTimer();
        this.idleTimer = setTimeout(() => {
            if (this.isActive && window.DinoVoice && window.DinoVoice.speakPhrase) {
                window.DinoVoice.speakPhrase('idle_nudge');
            }
        }, 15000);
    }

    clearIdleTimer() {
        if (this.idleTimer) {
            clearTimeout(this.idleTimer);
            this.idleTimer = null;
        }
    }
}

window.TypingGameActivity = TypingGameActivity;
