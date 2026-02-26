/**
 * Coloring Activity - Draw and color on coloring page images
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
        this.canvas = null;
        this.ctx = null;
        this.isDrawing = false;
        this.currentColor = '#FF0000'; // Red by default
        this.currentBrushSize = 15; // Medium by default
        this.lastX = 0;
        this.lastY = 0;
        this.backgroundImage = null;
        this._resizeHandler = () => this.resizeCanvas();
        this._firstLoad = true;
    }

    async start() {
        console.log('Starting Coloring activity');

        // Get canvas element
        this.canvas = document.getElementById('coloringCanvas');
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

        // Character wave (welcome voice handled by ActivityManager)
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
        const imagePath = `assets/colouring/Colouring_${imageName}.png`;

        // Update title
        const title = document.getElementById('coloringTitle');
        if (title) {
            title.textContent = `Colouring: ${imageName}`;
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

        // Speak image change (skip first load — welcome handles it)
        if (!this._firstLoad) {
            const text = window.DinoPhrase ? window.DinoPhrase('coloring', 'image_change', { target: imageName }) : '';
            if (text) AppAPI.call('speak', text);
        }
        this._firstLoad = false;
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
        this.palettePage = 0;
        this.totalPalettePages = Math.ceil(ActivityManager.PALETTE_COLORS.length / ActivityManager.PALETTE_PAGE_SIZE);
        this.renderPalettePage();

        const prevBtn = document.getElementById('palettePrev');
        const nextBtn = document.getElementById('paletteNext');
        if (prevBtn) prevBtn.addEventListener('click', () => {
            this.palettePage = (this.palettePage - 1 + this.totalPalettePages) % this.totalPalettePages;
            this.renderPalettePage();
        });
        if (nextBtn) nextBtn.addEventListener('click', () => {
            this.palettePage = (this.palettePage + 1) % this.totalPalettePages;
            this.renderPalettePage();
        });
    }

    renderPalettePage() {
        const palette = document.getElementById('colorPalette');
        if (!palette) return;

        const start = this.palettePage * ActivityManager.PALETTE_PAGE_SIZE;
        const colors = ActivityManager.PALETTE_COLORS.slice(start, start + ActivityManager.PALETTE_PAGE_SIZE);

        palette.innerHTML = colors.map(c => {
            const border = c.border ? ' border-color: #dee2e6;' : '';
            const active = c.hex === this.currentColor ? ' active' : '';
            return `<div class="color-btn${active}" data-color="${c.hex}" style="background: ${c.hex};${border}" title="${c.name}"></div>`;
        }).join('');

        palette.querySelectorAll('.color-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.color-btn').forEach(b => b.classList.remove('active'));
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
        const prevBtn = document.getElementById('prevColoring');
        const nextBtn = document.getElementById('nextColoring');
        const clearBtn = document.getElementById('clearColoring');
        const saveBtn = document.getElementById('saveColoring');

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
        this.currentIndex = (this.currentIndex - 1 + this.images.length) % this.images.length;
        await this.loadImage();

        if (window.characterManager) {
            window.characterManager.playAnimation('point', false);
        }
    }

    async nextImage() {
        this.currentIndex = (this.currentIndex + 1) % this.images.length;
        await this.loadImage();

        if (window.characterManager) {
            window.characterManager.playAnimation('point', false);
        }
    }

    clearDrawing() {
        this.drawBackgroundImage();

        if (window.characterManager) {
            window.characterManager.playAnimation('wave', false);
        }
        const clearText = window.DinoPhrase ? window.DinoPhrase('coloring', 'clear') : '';
        if (clearText) AppAPI.call('speak', clearText);
    }

    saveDrawing() {
        if (!this.canvas) return;

        const dataURL = this.canvas.toDataURL('image/png');

        const link = document.createElement('a');
        const imageName = this.images[this.currentIndex];
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
        link.download = `coloring-${imageName}-${timestamp}.png`;
        link.href = dataURL;

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        console.log('Coloring page saved successfully');

        if (window.characterManager) {
            window.characterManager.playAnimation('happy', false);
        }
        const savedText = window.DinoPhrase ? window.DinoPhrase('coloring', 'saved') : 'Picture saved!';
        AppAPI.call('speak', savedText);
    }

    updateButtons() {
        this.updateCounter();
    }

    updateCounter() {
        const counter = document.getElementById('coloringCounter');
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
        console.log('Stopping Coloring activity');
        if (this.keyPressHandler) {
            document.removeEventListener('keydown', this.keyPressHandler);
        }
        window.removeEventListener('resize', this._resizeHandler);
    }
}
