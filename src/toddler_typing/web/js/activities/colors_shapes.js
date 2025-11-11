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
    }

    async start() {
        console.log('Starting Colors & Shapes activity');
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
        const text = `Click the ${target.color.name} ${target.shape.name}`;

        // Update instruction text
        const instructionEl = document.getElementById('shapeInstruction');
        if (instructionEl) {
            instructionEl.textContent = text;
        }

        // Speak via Python API
        await PythonAPI.call('speak_text', text);
    }

    async handleClick(clickedIndex) {
        if (this.isWaiting) return;

        const clickedOption = document.querySelector(`.shape-option[data-index="${clickedIndex}"]`);

        if (clickedIndex === this.targetIndex) {
            // Correct!
            this.isWaiting = true;
            clickedOption.classList.add('correct');

            // Play success sound/animation
            await PythonAPI.call('speak_text', 'Great job!');

            // Wait a bit, then next round
            setTimeout(() => {
                this.isWaiting = false;
                this.nextRound();
            }, 1500);

        } else {
            // Wrong
            clickedOption.classList.add('wrong');

            // Play error sound
            await PythonAPI.call('speak_text', 'Try again!');

            // Remove wrong class after animation
            setTimeout(() => {
                clickedOption.classList.remove('wrong');
            }, 400);

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
