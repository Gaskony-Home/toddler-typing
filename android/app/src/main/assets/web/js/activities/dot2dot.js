/**
 * Dot to Dot Activity - Connect the dots and draw on dot-to-dot images
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
        this.canvas = null;
        this.ctx = null;
        this.isDrawing = false;
        this.currentColor = '#FF0000'; // Red by default
        this.currentBrushSize = 15; // Medium by default
        this.lastX = 0;
        this.lastY = 0;
        this.backgroundImage = null;
        this._resizeHandler = () => this.resizeCanvas();
    }

    async start() {
        console.log('Starting Dot to Dot activity');

        // Get canvas element
        this.canvas = document.getElementById('dot2dotCanvas');
        if (!this.canvas) {
            console.error('Canvas element not found');
            return;
        }

        this.ctx = this.canvas.getContext('2d');

        // Set canvas size to be responsive
        this.resizeCanvas();
        window.addEventListener('resize', this._resizeHandler);

        // Load first image
        await this.loadImage();

        // Set up event listeners
        this.setupColorPalette();
        this.setupBrushSizes();
        this.setupButtons();
        this.setupDrawingEvents();

        // Speak welcome message
        AppAPI.call('speak', 'Connect the dots to make a picture!');

        // Character wave
        if (window.characterManager) {
            window.characterManager.playAnimation('wave', false);
        }
    }

    resizeCanvas() {
        // Store the current canvas content if available
        const imageData = this.canvas && this.ctx ? this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height) : null;

        // Maximize canvas size to fill available space
        const container = this.canvas.parentElement;
        const maxWidth = Math.min(container.clientWidth - 20, window.innerWidth - 40);
        const maxHeight = window.innerHeight - 320;

        this.canvas.width = maxWidth;
        this.canvas.height = maxHeight;

        // Restore content if it existed
        if (imageData) {
            this.ctx.putImageData(imageData, 0, 0);
        }

        // Redraw background image if loaded
        if (this.backgroundImage && this.backgroundImage.complete) {
            this.drawBackgroundImage();
        }
    }

    async loadImage() {
        const imageName = this.images[this.currentIndex];
        const imagePath = `assets/dot2dot/Dot2Dot_${imageName}.png`;

        // Update title
        const title = document.getElementById('dot2dotTitle');
        if (title) {
            title.textContent = `Dot to Dot: ${imageName}`;
        }

        // Load image
        await new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => {
                this.backgroundImage = img;
                this.drawBackgroundImage();
                this.updateCounter();
                resolve();
            };
            img.onerror = () => {
                console.error(`Failed to load image: ${imagePath}`);
                reject();
            };
            img.src = imagePath;
        });
    }

    drawBackgroundImage() {
        if (!this.backgroundImage || !this.ctx) return;

        // Clear canvas
        this.ctx.fillStyle = 'white';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Calculate scaling to fit image within canvas while maintaining aspect ratio
        const scale = Math.min(
            this.canvas.width / this.backgroundImage.width,
            this.canvas.height / this.backgroundImage.height
        );

        const x = (this.canvas.width - this.backgroundImage.width * scale) / 2;
        const y = (this.canvas.height - this.backgroundImage.height * scale) / 2;

        this.ctx.drawImage(
            this.backgroundImage,
            x, y,
            this.backgroundImage.width * scale,
            this.backgroundImage.height * scale
        );
    }

    setupColorPalette() {
        const colorButtons = document.querySelectorAll('.color-btn');
        colorButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                colorButtons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.currentColor = btn.dataset.color;
            });
        });
    }

    setupBrushSizes() {
        const sizeButtons = document.querySelectorAll('.brush-size-btn');
        sizeButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                sizeButtons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.currentBrushSize = parseInt(btn.dataset.size);
            });
        });
    }

    setupButtons() {
        const prevBtn = document.getElementById('prevDot2Dot');
        const nextBtn = document.getElementById('nextDot2Dot');
        const clearBtn = document.getElementById('clearDot2Dot');
        const saveBtn = document.getElementById('saveDot2Dot');

        if (prevBtn) {
            prevBtn.addEventListener('click', () => this.previousImage());
        }

        if (nextBtn) {
            nextBtn.addEventListener('click', () => this.nextImage());
        }

        if (clearBtn) {
            clearBtn.addEventListener('click', () => this.clearDrawing());
        }

        if (saveBtn) {
            saveBtn.addEventListener('click', () => this.saveDrawing());
        }

        // Keyboard navigation
        this.keyPressHandler = this.handleKeyPress.bind(this);
        document.addEventListener('keydown', this.keyPressHandler);

        this.updateButtons();
    }

    handleKeyPress(e) {
        if (e.key === 'ArrowLeft') {
            this.previousImage();
        } else if (e.key === 'ArrowRight') {
            this.nextImage();
        }
    }

    async previousImage() {
        if (this.currentIndex > 0) {
            this.currentIndex--;
            await this.loadImage();
            this.updateButtons();

            if (window.characterManager) {
                window.characterManager.playAnimation('point', false);
            }
        }
    }

    async nextImage() {
        if (this.currentIndex < this.images.length - 1) {
            this.currentIndex++;
            await this.loadImage();
            this.updateButtons();

            if (window.characterManager) {
                window.characterManager.playAnimation('point', false);
            }
        }
    }

    clearDrawing() {
        this.drawBackgroundImage();

        if (window.characterManager) {
            window.characterManager.playAnimation('wave', false);
        }
    }

    saveDrawing() {
        if (!this.canvas) return;

        const dataURL = this.canvas.toDataURL('image/png');

        const link = document.createElement('a');
        const imageName = this.images[this.currentIndex];
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
        link.download = `dot2dot-${imageName}-${timestamp}.png`;
        link.href = dataURL;

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        console.log('Dot to Dot saved successfully');

        if (window.characterManager) {
            window.characterManager.playAnimation('happy', false);
        }
        AppAPI.call('speak', 'Picture saved!');
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

        this.updateCounter();
    }

    updateCounter() {
        const counter = document.getElementById('dot2dotCounter');
        if (counter) {
            counter.textContent = `${this.currentIndex + 1} / ${this.images.length}`;
        }
    }

    setupDrawingEvents() {
        // Mouse events
        this.canvas.addEventListener('mousedown', (e) => this.startDrawing(e));
        this.canvas.addEventListener('mousemove', (e) => this.draw(e));
        this.canvas.addEventListener('mouseup', () => this.stopDrawing());
        this.canvas.addEventListener('mouseout', () => this.stopDrawing());

        // Touch events for mobile/tablets
        this.canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            const touch = e.touches[0];
            const mouseEvent = new MouseEvent('mousedown', {
                clientX: touch.clientX,
                clientY: touch.clientY
            });
            this.canvas.dispatchEvent(mouseEvent);
        });

        this.canvas.addEventListener('touchmove', (e) => {
            e.preventDefault();
            const touch = e.touches[0];
            const mouseEvent = new MouseEvent('mousemove', {
                clientX: touch.clientX,
                clientY: touch.clientY
            });
            this.canvas.dispatchEvent(mouseEvent);
        });

        this.canvas.addEventListener('touchend', (e) => {
            e.preventDefault();
            const mouseEvent = new MouseEvent('mouseup', {});
            this.canvas.dispatchEvent(mouseEvent);
        });
    }

    startDrawing(e) {
        this.isDrawing = true;
        const rect = this.canvas.getBoundingClientRect();
        this.lastX = e.clientX - rect.left;
        this.lastY = e.clientY - rect.top;
    }

    draw(e) {
        if (!this.isDrawing) return;

        const rect = this.canvas.getBoundingClientRect();
        const currentX = e.clientX - rect.left;
        const currentY = e.clientY - rect.top;

        this.ctx.beginPath();
        this.ctx.moveTo(this.lastX, this.lastY);
        this.ctx.lineTo(currentX, currentY);
        this.ctx.strokeStyle = this.currentColor;
        this.ctx.lineWidth = this.currentBrushSize;
        this.ctx.lineCap = 'round';
        this.ctx.lineJoin = 'round';
        this.ctx.stroke();

        this.lastX = currentX;
        this.lastY = currentY;
    }

    stopDrawing() {
        this.isDrawing = false;
    }

    stop() {
        console.log('Stopping Dot to Dot activity');
        if (this.keyPressHandler) {
            document.removeEventListener('keydown', this.keyPressHandler);
        }
        window.removeEventListener('resize', this._resizeHandler);
    }
}
