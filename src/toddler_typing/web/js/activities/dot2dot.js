/**
 * Dot to Dot Activity - Display and navigate through dot-to-dot images
 */

class Dot2DotActivity {
    constructor() {
        this.images = [
            'Apple',
            'Boat',
            'Car',
            'Cat',
            'House',
            'Stars'
        ];
        this.currentIndex = 0;
    }

    async start() {
        console.log('Starting Dot to Dot activity');

        // Display first image
        this.showImage();

        // Set up navigation buttons
        this.setupNavigation();

        // Speak welcome message
        if (typeof PythonAPI !== 'undefined' && PythonAPI.call) {
            PythonAPI.call('speak', 'Connect the dots to make a picture!');
        }

        // Character wave
        if (window.characterManager) {
            window.characterManager.playAnimation('wave', false);
        }
    }

    showImage() {
        const container = document.getElementById('dot2dotImageContainer');
        const title = document.getElementById('dot2dotTitle');

        if (!container || !title) return;

        const imageName = this.images[this.currentIndex];
        title.textContent = `${imageName}`;

        container.innerHTML = `
            <img src="assets/dot2dot/Dot2Dot_${imageName}.png"
                 alt="${imageName} Dot to Dot"
                 class="dot2dot-image"
                 id="dot2dotImage">
        `;

        // Update button states
        this.updateButtons();
    }

    setupNavigation() {
        const prevBtn = document.getElementById('prevDot2Dot');
        const nextBtn = document.getElementById('nextDot2Dot');

        if (prevBtn) {
            prevBtn.addEventListener('click', () => this.previousImage());
        }

        if (nextBtn) {
            nextBtn.addEventListener('click', () => this.nextImage());
        }

        // Keyboard navigation - store bound handler for later removal
        this.keyPressHandler = this.handleKeyPress.bind(this);
        document.addEventListener('keydown', this.keyPressHandler);
    }

    handleKeyPress(e) {
        if (e.key === 'ArrowLeft') {
            this.previousImage();
        } else if (e.key === 'ArrowRight') {
            this.nextImage();
        }
    }

    previousImage() {
        if (this.currentIndex > 0) {
            this.currentIndex--;
            this.showImage();

            if (window.characterManager) {
                window.characterManager.playAnimation('point', false);
            }
        }
    }

    nextImage() {
        if (this.currentIndex < this.images.length - 1) {
            this.currentIndex++;
            this.showImage();

            if (window.characterManager) {
                window.characterManager.playAnimation('point', false);
            }
        }
    }

    updateButtons() {
        const prevBtn = document.getElementById('prevDot2Dot');
        const nextBtn = document.getElementById('nextDot2Dot');

        if (prevBtn) {
            prevBtn.disabled = this.currentIndex === 0;
        }

        if (nextBtn) {
            nextBtn.disabled = this.currentIndex === this.images.length - 1;
        }

        // Update counter
        const counter = document.getElementById('dot2dotCounter');
        if (counter) {
            counter.textContent = `${this.currentIndex + 1} / ${this.images.length}`;
        }
    }

    stop() {
        console.log('Stopping Dot to Dot activity');
        // Remove keyboard listener
        if (this.keyPressHandler) {
            document.removeEventListener('keydown', this.keyPressHandler);
        }
    }
}
