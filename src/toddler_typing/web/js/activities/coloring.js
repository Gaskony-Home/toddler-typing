/**
 * Coloring Activity - Display and navigate through coloring pages
 */

class ColoringActivity {
    constructor() {
        this.images = [
            'Dog',
            'Flower',
            'Icecream',
            'Rainbow',
            'Sun',
            'Tree'
        ];
        this.currentIndex = 0;
    }

    async start() {
        console.log('Starting Coloring activity');

        // Display first image
        this.showImage();

        // Set up navigation buttons
        this.setupNavigation();

        // Speak welcome message
        if (typeof PythonAPI !== 'undefined' && PythonAPI.call) {
            PythonAPI.call('speak', 'Choose a picture to color!');
        }

        // Character wave
        if (window.characterManager) {
            window.characterManager.playAnimation('wave', false);
        }
    }

    showImage() {
        const container = document.getElementById('coloringImageContainer');
        const title = document.getElementById('coloringTitle');

        if (!container || !title) return;

        const imageName = this.images[this.currentIndex];
        title.textContent = `${imageName}`;

        container.innerHTML = `
            <img src="assets/colouring/Colouring_${imageName}.png"
                 alt="${imageName} Coloring Page"
                 class="coloring-image"
                 id="coloringImage">
        `;

        // Update button states
        this.updateButtons();
    }

    setupNavigation() {
        const prevBtn = document.getElementById('prevColoring');
        const nextBtn = document.getElementById('nextColoring');
        const printBtn = document.getElementById('printColoring');

        if (prevBtn) {
            prevBtn.addEventListener('click', () => this.previousImage());
        }

        if (nextBtn) {
            nextBtn.addEventListener('click', () => this.nextImage());
        }

        if (printBtn) {
            printBtn.addEventListener('click', () => this.printImage());
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

    printImage() {
        const img = document.getElementById('coloringImage');
        if (!img) return;

        // Open print dialog for the image
        const printWindow = window.open('', '_blank');
        printWindow.document.write(`
            <html>
                <head>
                    <title>Print Coloring Page</title>
                    <style>
                        body { margin: 0; padding: 20px; text-align: center; }
                        img { max-width: 100%; height: auto; }
                    </style>
                </head>
                <body>
                    <img src="${img.src}" onload="window.print(); window.close();">
                </body>
            </html>
        `);
        printWindow.document.close();

        if (window.characterManager) {
            window.characterManager.playAnimation('happy', false);
        }
    }

    updateButtons() {
        const prevBtn = document.getElementById('prevColoring');
        const nextBtn = document.getElementById('nextColoring');

        if (prevBtn) {
            prevBtn.disabled = this.currentIndex === 0;
        }

        if (nextBtn) {
            nextBtn.disabled = this.currentIndex === this.images.length - 1;
        }

        // Update counter
        const counter = document.getElementById('coloringCounter');
        if (counter) {
            counter.textContent = `${this.currentIndex + 1} / ${this.images.length}`;
        }
    }

    stop() {
        console.log('Stopping Coloring activity');
        // Remove keyboard listener
        if (this.keyPressHandler) {
            document.removeEventListener('keydown', this.keyPressHandler);
        }
    }
}
