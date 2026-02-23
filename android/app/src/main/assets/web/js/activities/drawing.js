/**
 * Drawing Activity - Free-form drawing with colors and brush sizes
 */

class DrawingActivity {
    constructor() {
        this.canvas = null;
        this.ctx = null;
        this.isDrawing = false;
        this.currentColor = '#FF0000'; // Red by default
        this.currentBrushSize = 15; // Medium by default
        this.lastX = 0;
        this.lastY = 0;
        this._resizeHandler = () => this.resizeCanvas();
    }

    async start() {
        console.log('Starting Drawing activity');

        // Get canvas element
        this.canvas = document.getElementById('drawingCanvas');
        if (!this.canvas) {
            console.error('Canvas element not found');
            return;
        }

        this.ctx = this.canvas.getContext('2d');

        // Set canvas size to be responsive
        this.resizeCanvas();
        window.addEventListener('resize', this._resizeHandler);

        // Initialize canvas
        this.clearCanvas();

        // Set up event listeners
        this.setupColorPalette();
        this.setupBrushSizes();
        this.setupClearButton();
        this.setupSaveButton();
        this.setupDrawingEvents();
    }

    resizeCanvas() {
        // Store the current canvas content
        const imageData = this.canvas ? this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height) : null;

        // Calculate new canvas size (maintain aspect ratio)
        const container = this.canvas.parentElement;
        const maxWidth = Math.min(container.clientWidth - 40, 1000);
        const maxHeight = Math.min(window.innerHeight - 350, 600);

        this.canvas.width = maxWidth;
        this.canvas.height = maxHeight;

        // Restore canvas content if it existed
        if (imageData) {
            this.ctx.putImageData(imageData, 0, 0);
        }
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

    setupClearButton() {
        const clearBtn = document.getElementById('clearCanvas');
        if (clearBtn) {
            clearBtn.addEventListener('click', () => this.clearCanvas());
        }
    }

    setupSaveButton() {
        const saveBtn = document.getElementById('saveDrawing');
        if (saveBtn) {
            saveBtn.addEventListener('click', () => this.saveDrawing());
        }
    }

    clearCanvas() {
        if (this.ctx) {
            this.ctx.fillStyle = 'white';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        }
    }

    saveDrawing() {
        if (!this.canvas) return;

        const dataURL = this.canvas.toDataURL('image/png');

        const link = document.createElement('a');
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
        link.download = `toddler-drawing-${timestamp}.png`;
        link.href = dataURL;

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        console.log('Drawing saved successfully');

        if (window.characterManager) {
            window.characterManager.playAnimation('happy', false);
        }
        AppAPI.call('speak', 'Drawing saved!');
    }

    setupDrawingEvents() {
        // Mouse events
        this.canvas.addEventListener('mousedown', (e) => this.startDrawing(e));
        this.canvas.addEventListener('mousemove', (e) => this.draw(e));
        this.canvas.addEventListener('mouseup', () => this.stopDrawing());
        this.canvas.addEventListener('mouseout', () => this.stopDrawing());

        // Touch events for mobile
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
        console.log('Stopping Drawing activity');
        window.removeEventListener('resize', this._resizeHandler);
    }
}
