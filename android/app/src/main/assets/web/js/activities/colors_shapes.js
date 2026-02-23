/**
 * Colors & Shapes Activity - Interactive learning game with 6 options
 * Toddler must click the correct color/shape combination based on audio instruction
 */

class ColorsShapesActivity {
    constructor() {
        this.shapes = [
            { name: 'Circle', class: 'shape-circle' },
            { name: 'Square', class: 'shape-square' },
            { name: 'Triangle', class: 'shape-triangle' },
            { name: 'Star', class: 'shape-star' }
        ];

        this.colors = [
            { name: 'Red', hex: '#FF0000' },
            { name: 'Orange', hex: '#FF7F00' },
            { name: 'Yellow', hex: '#FFFF00' },
            { name: 'Green', hex: '#00FF00' },
            { name: 'Blue', hex: '#0000FF' },
            { name: 'Purple', hex: '#9400D3' }
        ];

        this.targetIndex = null;
        this.options = [];
        this.isWaiting = false;
        this.rewards = null;
    }

    async start() {
        console.log('Starting Colours & Shapes activity');

        // Set up rewards
        if (typeof RewardsManager !== 'undefined') {
            this.rewards = new RewardsManager();
            await this.rewards.loadProgress();
            this.rewards.renderProgressPanel('csProgressDisplay', 'colors_shapes');
        }

        await this.nextRound();
    }

    async nextRound() {
        // Generate 6 random shape/color combinations
        this.options = this.generateOptions();

        // Pick one as the target
        this.targetIndex = Math.floor(Math.random() * 6);

        // Render the options
        this.renderOptions();

        // Speak the instruction
        await this.speakInstruction();
    }

    generateOptions() {
        const options = [];
        const used = new Set();

        while (options.length < 6) {
            const shape = this.shapes[Math.floor(Math.random() * this.shapes.length)];
            const color = this.colors[Math.floor(Math.random() * this.colors.length)];
            const key = `${color.name}-${shape.name}`;

            // Ensure unique combinations
            if (!used.has(key)) {
                used.add(key);
                options.push({ shape, color });
            }
        }

        return options;
    }

    renderOptions() {
        const container = document.getElementById('shapeOptions');
        if (!container) {
            console.error('Shape options container not found');
            return;
        }

        container.innerHTML = '';

        this.options.forEach((option, index) => {
            const optionDiv = document.createElement('div');
            optionDiv.className = 'shape-option';
            optionDiv.dataset.index = index;

            // Create shape HTML
            let shapeHTML = '';
            if (option.shape.class === 'shape-triangle') {
                shapeHTML = `
                    <div class="shape-display">
                        <div class="shape ${option.shape.class}"
                             style="border-bottom-color: ${option.color.hex};"></div>
                    </div>
                `;
            } else {
                shapeHTML = `
                    <div class="shape-display">
                        <div class="shape ${option.shape.class}"
                             style="background: ${option.color.hex};"></div>
                    </div>
                `;
            }

            optionDiv.innerHTML = `
                ${shapeHTML}
                <div class="shape-label">${option.color.name} ${option.shape.name}</div>
            `;

            // Add click handler
            optionDiv.addEventListener('click', () => this.handleClick(index));

            container.appendChild(optionDiv);
        });
    }

    async speakInstruction() {
        const target = this.options[this.targetIndex];

        // Use DinoPhrases for instruction
        let text;
        if (window.DinoPhrase) {
            text = window.DinoPhrase('colors_shapes', 'instruction', {
                color: target.color.name,
                shape: target.shape.name
            });
        }
        if (!text) {
            text = `Tap the ${target.color.name} ${target.shape.name}`;
        }

        // Update instruction text
        const instructionEl = document.getElementById('shapeInstruction');
        if (instructionEl) {
            instructionEl.textContent = `Tap the ${target.color.name} ${target.shape.name}`;
        }

        await AppAPI.call('speak', text);
    }

    async handleClick(clickedIndex) {
        if (this.isWaiting) return;

        const clickedOption = document.querySelector(`.shape-option[data-index="${clickedIndex}"]`);

        if (clickedIndex === this.targetIndex) {
            // Correct!
            this.isWaiting = true;
            clickedOption.classList.add('correct');

            // Character celebration
            if (window.characterManager) {
                window.characterManager.playAnimation('happy', false);
            }

            // Award star
            const starResult = await AppAPI.call('award_stars', 'colors_shapes', 1);
            if (starResult && this.rewards) {
                this.rewards.playStarAnimation('csStarAnimation');
                this.rewards.updateStarCount(starResult.total_stars);
                const milestones = await this.rewards.checkMilestones(starResult.total_stars);
                milestones.forEach(r => this.rewards.showRewardAnimation(r));
            }

            // Play success sound/animation
            const correctText = window.DinoPhrase ? window.DinoPhrase('colors_shapes', 'correct') : 'Great job!';
            await AppAPI.call('speak', correctText);

            // Wait a bit, then next round
            setTimeout(() => {
                this.isWaiting = false;
                this.nextRound();
            }, 1500);

        } else {
            // Wrong — lock input briefly
            this.isWaiting = true;
            clickedOption.classList.add('wrong');

            // Character thinking/curious
            if (window.characterManager) {
                window.characterManager.playAnimation('thinking', false);
            }

            // Play error sound
            const wrongText = window.DinoPhrase ? window.DinoPhrase('colors_shapes', 'wrong') : 'Try again!';
            await AppAPI.call('speak', wrongText);

            // Remove wrong class after animation and unlock
            setTimeout(() => {
                clickedOption.classList.remove('wrong');
                this.isWaiting = false;
            }, 500);

            // Repeat the instruction
            setTimeout(() => {
                this.speakInstruction();
            }, 800);
        }
    }

    stop() {
        console.log('Stopping Colors & Shapes activity');
    }
}
