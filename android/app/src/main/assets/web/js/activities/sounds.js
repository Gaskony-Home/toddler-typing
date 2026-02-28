/**
 * Sounds Activity - Interactive phonics quiz
 * Child hears a sound, then picks the word that contains it from 3 options
 */

class SoundsActivity {
    constructor() {
        this.sounds = [
            { sound: 'sh', phonetic: 'shh', examples: ['ship', 'fish', 'wash'] },
            { sound: 'ch', phonetic: 'chh', examples: ['chip', 'much', 'chair'] },
            { sound: 'th', phonetic: 'thh', examples: ['this', 'that', 'with'] },
            { sound: 'ph', phonetic: 'ff', examples: ['phone', 'graph', 'photo'] },
            { sound: 'wh', phonetic: 'wh', examples: ['what', 'when', 'why'] },
            { sound: 'ck', phonetic: 'ck', examples: ['duck', 'sock', 'back'] },
            { sound: 'ng', phonetic: 'ng', examples: ['sing', 'ring', 'long'] },
            { sound: 'qu', phonetic: 'kw', examples: ['queen', 'quick', 'quiet'] }
        ];

        // Distractor words that don't contain any of the digraph sounds
        this.distractors = [
            'cat', 'dog', 'big', 'run', 'hop', 'red', 'cup', 'map',
            'bat', 'sun', 'hat', 'pig', 'bed', 'pot', 'leg', 'bus',
            'jam', 'van', 'mop', 'rug', 'pin', 'log', 'web', 'fox'
        ];

        this.currentIndex = 0;
        this.correctWord = null;
        this.processing = false;
        this.rewards = null;
        this.roundCount = 0;
        this.attempts = 0;
    }

    async start() {
        console.log('Starting Sounds quiz activity');

        // Set up rewards
        if (typeof RewardsManager !== 'undefined') {
            this.rewards = new RewardsManager();
            await this.rewards.loadProgress();
            this.rewards.renderProgressPanel('soundsProgressDisplay', 'sounds');
        }

        // Set up keyboard handler and hear again button
        this.keyPressHandler = this.handleKeyPress.bind(this);
        document.addEventListener('keydown', this.keyPressHandler);

        const hearBtn = document.getElementById('hearSound');
        if (hearBtn) {
            hearBtn.addEventListener('click', () => this.speakSound());
        }

        // Character wave (welcome voice handled by ActivityManager)
        if (window.characterManager) {
            window.characterManager.playAnimation('wave', false);
        }

        // Start first round
        this.nextRound();
    }

    nextRound() {
        this.attempts = 0;
        // Pick a random sound
        this.currentIndex = Math.floor(Math.random() * this.sounds.length);
        this.generateQuizRound();
    }

    generateQuizRound() {
        const currentSound = this.sounds[this.currentIndex];

        // Pick one correct example
        this.correctWord = currentSound.examples[Math.floor(Math.random() * currentSound.examples.length)];

        // Pick 2 distractors that don't contain the target sound
        const validDistractors = this.distractors.filter(w =>
            !currentSound.examples.includes(w) &&
            !w.includes(currentSound.sound)
        );
        const shuffled = validDistractors.sort(() => Math.random() - 0.5);
        const chosen = shuffled.slice(0, 2);

        // Build options array and shuffle
        this.options = [this.correctWord, ...chosen].sort(() => Math.random() - 0.5);

        this.renderQuiz();
        this.speakSound();
    }

    renderQuiz() {
        const currentSound = this.sounds[this.currentIndex];

        // Update sound display
        const soundDisplay = document.getElementById('soundDisplay');
        if (soundDisplay) {
            soundDisplay.textContent = currentSound.sound.toUpperCase();
            soundDisplay.className = 'letter-number-display is-letter';
            soundDisplay.style.fontSize = 'clamp(5rem, 12vw, 10rem)';
            soundDisplay.style.animation = 'bounceIn 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55)';
        }

        // Update description
        const description = document.getElementById('soundDescription');
        if (description) {
            description.textContent = `Which word has the "${currentSound.sound.toUpperCase()}" sound?`;
        }

        // Update counter
        const counter = document.getElementById('soundCounter');
        if (counter) {
            this.roundCount++;
            counter.textContent = `Round ${this.roundCount}`;
        }

        // Render word options
        const optionsContainer = document.getElementById('soundQuizOptions');
        if (optionsContainer) {
            optionsContainer.innerHTML = this.options.map((word, i) =>
                `<button class="quiz-word-btn" data-index="${i}" data-word="${word}">${word}</button>`
            ).join('');

            optionsContainer.querySelectorAll('.quiz-word-btn').forEach(btn => {
                btn.addEventListener('click', () => this.handleAnswer(btn));
            });
        }
    }

    handleKeyPress(e) {
        if (e.key === ' ' || e.key === 'Enter') {
            e.preventDefault();
            this.speakSound();
        }
    }

    speakSound() {
        const currentSound = this.sounds[this.currentIndex];
        const example = currentSound.examples[0];
        // Speak phonetically: the sound itself, then the example word
        const text = `${currentSound.phonetic}.. ${currentSound.phonetic}.. like in ${example}`;
        AppAPI.call('speak', text);

        if (window.characterManager) {
            window.characterManager.playAnimation('talk', true);
            setTimeout(() => {
                if (window.characterManager) {
                    window.characterManager.playAnimation('idle');
                }
            }, 2000);
        }
    }

    async handleAnswer(btn) {
        if (this.processing) return;
        this.processing = true;

        const word = btn.dataset.word;

        if (word === this.correctWord) {
            // Correct!
            btn.classList.add('correct');

            if (window.characterManager) {
                window.characterManager.playAnimation('happy', false);
            }

            // Award star
            const starResult = await AppAPI.call('award_stars', 'sounds', 1);
            if (starResult && this.rewards) {
                this.rewards.playStarAnimation('soundsStarAnimation');
                this.rewards.updateStarCount(starResult.total_stars);
                const milestones = await this.rewards.checkMilestones(starResult.total_stars);
                milestones.forEach(r => this.rewards.showRewardAnimation(r));
            }

            const phraseCategory = this.attempts === 0 ? 'correct_first_try' : 'correct_after_hints';
            const correctText = window.DinoPhrase ? window.DinoPhrase(phraseCategory) : 'Great job!';
            await AppAPI.call('speak', correctText);

            // Next round after delay
            setTimeout(() => {
                this.processing = false;
                this.nextRound();
            }, 1500);

        } else {
            // Wrong
            btn.classList.add('wrong');
            this.attempts++;

            if (window.characterManager) {
                window.characterManager.playAnimation('thinking', false);
            }

            const wrongText = window.DinoPhrase ? window.DinoPhrase('wrong_key') : 'Try again!';
            await AppAPI.call('speak', wrongText);

            // Remove wrong class and unlock
            setTimeout(() => {
                btn.classList.remove('wrong');
                this.processing = false;
            }, 500);
        }
    }

    stop() {
        console.log('Stopping Sounds quiz activity');
        if (this.keyPressHandler) {
            document.removeEventListener('keydown', this.keyPressHandler);
        }
    }
}
