/**
 * Jigsaw Puzzle Activity - Canvas-generated colorful scenes with shaped pieces
 * Easy: 2x2 (4 pcs), Medium: 2x3 (6 pcs), Hard: 3x3 (9 pcs)
 */

class JigsawActivity {
    constructor() {
        this.scenes = [
            { name: 'Sunny House', draw: (ctx, w, h) => this.drawSunnyHouse(ctx, w, h) },
            { name: 'Underwater', draw: (ctx, w, h) => this.drawUnderwater(ctx, w, h) },
            { name: 'Garden', draw: (ctx, w, h) => this.drawGarden(ctx, w, h) },
            { name: 'Farm', draw: (ctx, w, h) => this.drawFarm(ctx, w, h) },
            { name: 'Space', draw: (ctx, w, h) => this.drawSpace(ctx, w, h) },
            { name: 'Rainbow', draw: (ctx, w, h) => this.drawRainbow(ctx, w, h) }
        ];

        this.difficulties = {
            easy:    { cols: 2, rows: 2 },
            medium:  { cols: 3, rows: 2 },
            hard:    { cols: 3, rows: 3 },
            harder:  { cols: 4, rows: 3 },
            tough:   { cols: 4, rows: 4 },
            expert:  { cols: 5, rows: 4 },
            master:  { cols: 6, rows: 5 }
        };

        this.difficulty = 'easy';
        this.currentSceneIndex = 0;
        this.selectedPiece = null;
        this.placedCount = 0;
        this.totalPieces = 0;
        this.processing = false;
        this.rewards = null;

        // Scene canvas (full image)
        this.sceneCanvas = null;
        this.boardCanvas = null;
        this.boardCtx = null;
        this.pieceSize = 0;
        this.gridState = []; // which cells are filled
    }

    async start() {
        console.log('Starting Jigsaw Puzzle activity');

        if (typeof RewardsManager !== 'undefined') {
            this.rewards = new RewardsManager();
            await this.rewards.loadProgress();
            this.rewards.renderProgressPanel('jigsawProgressDisplay', 'jigsaw');
        }

        this.setupDifficultyButtons();
        this.setupSceneNavigation();

        if (window.characterManager) {
            window.characterManager.playAnimation('wave', false);
        }

        this.startNewPuzzle();
    }

    setupDifficultyButtons() {
        const container = document.getElementById('jigsawDifficulty');
        if (!container) return;

        container.querySelectorAll('.difficulty-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                container.querySelectorAll('.difficulty-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.difficulty = btn.dataset.difficulty;
                this.startNewPuzzle();
            });
        });
    }

    setupSceneNavigation() {
        const prevBtn = document.getElementById('prevScene');
        const nextBtn = document.getElementById('nextScene');

        if (prevBtn) {
            prevBtn.addEventListener('click', () => {
                this.currentSceneIndex = (this.currentSceneIndex - 1 + this.scenes.length) % this.scenes.length;
                this.startNewPuzzle();
            });
        }
        if (nextBtn) {
            nextBtn.addEventListener('click', () => {
                this.currentSceneIndex = (this.currentSceneIndex + 1) % this.scenes.length;
                this.startNewPuzzle();
            });
        }
    }

    startNewPuzzle() {
        const config = this.difficulties[this.difficulty];
        const scene = this.scenes[this.currentSceneIndex % this.scenes.length];

        this.placedCount = 0;
        this.totalPieces = config.cols * config.rows;
        this.processing = false;
        this.selectedPiece = null;
        this.gridState = new Array(this.totalPieces).fill(false);

        // Update title
        const title = document.getElementById('jigsawTitle');
        if (title) {
            title.textContent = `Jigsaw: ${scene.name}`;
        }

        // Generate scene image on an offscreen canvas
        const boardSize = 400;
        this.sceneCanvas = document.createElement('canvas');
        this.sceneCanvas.width = boardSize;
        this.sceneCanvas.height = boardSize;
        const sceneCtx = this.sceneCanvas.getContext('2d');
        scene.draw(sceneCtx, boardSize, boardSize);

        this.pieceSize = boardSize / Math.max(config.cols, config.rows);

        // Set up board canvas
        this.boardCanvas = document.getElementById('jigsawBoardCanvas');
        if (!this.boardCanvas) return;

        this.boardCanvas.width = boardSize;
        this.boardCanvas.height = boardSize;
        this.boardCtx = this.boardCanvas.getContext('2d');

        this.drawBoard();
        this.renderPieces(config);

        // Board click handler
        this.boardCanvas.onclick = (e) => this.handleBoardClick(e);

        // Speak instructions for non-readers
        const startText = window.DinoPhrase ? window.DinoPhrase('jigsaw', 'start') : 'Put the pieces in the right spots!';
        AppAPI.call('speak', startText);
    }

    drawBoard() {
        const ctx = this.boardCtx;
        const config = this.difficulties[this.difficulty];
        const w = this.boardCanvas.width;
        const h = this.boardCanvas.height;

        ctx.clearRect(0, 0, w, h);

        // Ghost image at low opacity
        ctx.globalAlpha = 0.15;
        ctx.drawImage(this.sceneCanvas, 0, 0, w, h);
        ctx.globalAlpha = 1.0;

        // Draw placed pieces at full opacity
        for (let i = 0; i < this.totalPieces; i++) {
            if (this.gridState[i]) {
                const col = i % config.cols;
                const row = Math.floor(i / config.cols);
                const pw = w / config.cols;
                const ph = h / config.rows;
                ctx.drawImage(
                    this.sceneCanvas,
                    col * pw, row * ph, pw, ph,
                    col * pw, row * ph, pw, ph
                );
            }
        }

        // Dashed grid lines
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.lineWidth = 2;
        ctx.setLineDash([6, 4]);

        const pw = w / config.cols;
        const ph = h / config.rows;

        for (let c = 1; c < config.cols; c++) {
            ctx.beginPath();
            ctx.moveTo(c * pw, 0);
            ctx.lineTo(c * pw, h);
            ctx.stroke();
        }
        for (let r = 1; r < config.rows; r++) {
            ctx.beginPath();
            ctx.moveTo(0, r * ph);
            ctx.lineTo(w, r * ph);
            ctx.stroke();
        }

        ctx.setLineDash([]);

        // Border
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.lineWidth = 3;
        ctx.strokeRect(1, 1, w - 2, h - 2);
    }

    renderPieces(config) {
        const tray = document.getElementById('jigsawPiecesTray');
        if (!tray) return;
        tray.innerHTML = '';

        const w = this.boardCanvas.width;
        const h = this.boardCanvas.height;
        const pw = w / config.cols;
        const ph = h / config.rows;

        // Create piece indices and shuffle
        const indices = [];
        for (let i = 0; i < this.totalPieces; i++) indices.push(i);
        indices.sort(() => Math.random() - 0.5);

        indices.forEach(i => {
            const col = i % config.cols;
            const row = Math.floor(i / config.cols);

            // Create mini canvas for this piece — scale down for higher piece counts
            const pieceCanvas = document.createElement('canvas');
            const maxDisplay = this.totalPieces <= 9 ? 80 : this.totalPieces <= 16 ? 60 : 50;
            const displaySize = Math.min(maxDisplay, pw);
            pieceCanvas.width = displaySize;
            pieceCanvas.height = displaySize;
            const pCtx = pieceCanvas.getContext('2d');

            // Draw the piece from the scene
            pCtx.drawImage(
                this.sceneCanvas,
                col * pw, row * ph, pw, ph,
                0, 0, displaySize, displaySize
            );

            // Add subtle border
            pCtx.strokeStyle = 'rgba(255,255,255,0.4)';
            pCtx.lineWidth = 2;
            pCtx.strokeRect(1, 1, displaySize - 2, displaySize - 2);

            const wrapper = document.createElement('div');
            wrapper.className = 'jigsaw-piece-wrapper';
            wrapper.dataset.pieceIndex = i;
            wrapper.appendChild(pieceCanvas);

            wrapper.addEventListener('click', () => this.selectPiece(wrapper, i));

            tray.appendChild(wrapper);
        });
    }

    selectPiece(wrapper, pieceIndex) {
        if (this.processing) return;
        if (this.gridState[pieceIndex]) return;

        // Deselect previous
        document.querySelectorAll('.jigsaw-piece-wrapper.selected').forEach(el => {
            el.classList.remove('selected');
        });

        this.selectedPiece = pieceIndex;
        wrapper.classList.add('selected');
    }

    handleBoardClick(e) {
        if (this.processing || this.selectedPiece === null) return;

        const config = this.difficulties[this.difficulty];
        const rect = this.boardCanvas.getBoundingClientRect();
        const scaleX = this.boardCanvas.width / rect.width;
        const scaleY = this.boardCanvas.height / rect.height;
        const x = (e.clientX - rect.left) * scaleX;
        const y = (e.clientY - rect.top) * scaleY;

        const pw = this.boardCanvas.width / config.cols;
        const ph = this.boardCanvas.height / config.rows;
        const col = Math.floor(x / pw);
        const row = Math.floor(y / ph);

        if (col < 0 || col >= config.cols || row < 0 || row >= config.rows) return;

        const targetIndex = row * config.cols + col;

        if (this.gridState[targetIndex]) return;

        this.processing = true;

        if (this.selectedPiece === targetIndex) {
            // Correct placement!
            this.gridState[targetIndex] = true;
            this.placedCount++;

            // Hide the piece in tray
            const wrapper = document.querySelector(`.jigsaw-piece-wrapper[data-piece-index="${this.selectedPiece}"]`);
            if (wrapper) wrapper.classList.add('placed');

            this.selectedPiece = null;
            this.drawBoard();

            if (window.characterManager) {
                window.characterManager.playAnimation('happy', false);
            }

            const placeText = window.DinoPhrase ? window.DinoPhrase('jigsaw', 'piece_placed') : 'Nice!';
            AppAPI.call('speak', placeText);

            // Award star
            this.awardStar();

            if (this.placedCount === this.totalPieces) {
                setTimeout(() => this.onPuzzleComplete(), 800);
            }

            setTimeout(() => { this.processing = false; }, 300);

        } else {
            // Wrong spot
            if (window.characterManager) {
                window.characterManager.playAnimation('thinking', false);
            }

            const wrongText = window.DinoPhrase ? window.DinoPhrase('jigsaw', 'wrong_spot') : 'Try another spot!';
            AppAPI.call('speak', wrongText);

            // Flash the board cell red briefly
            const ctx = this.boardCtx;
            const pw2 = this.boardCanvas.width / config.cols;
            const ph2 = this.boardCanvas.height / config.rows;
            ctx.fillStyle = 'rgba(239, 68, 68, 0.3)';
            ctx.fillRect(col * pw2, row * ph2, pw2, ph2);
            setTimeout(() => this.drawBoard(), 400);

            setTimeout(() => { this.processing = false; }, 500);
        }
    }

    async awardStar() {
        const starResult = await AppAPI.call('award_stars', 'jigsaw', 1);
        if (starResult && this.rewards) {
            this.rewards.playStarAnimation('jigsawStarAnimation');
            this.rewards.updateStarCount(starResult.total_stars);
            const milestones = await this.rewards.checkMilestones(starResult.total_stars);
            milestones.forEach(r => this.rewards.showRewardAnimation(r));
        }
    }

    async onPuzzleComplete() {
        if (window.characterManager) {
            window.characterManager.playAnimation('dance', false);
        }

        const bonus = this.difficulty === 'hard' ? 3 : this.difficulty === 'medium' ? 2 : 1;
        const starResult = await AppAPI.call('award_stars', 'jigsaw', bonus);
        if (starResult && this.rewards) {
            this.rewards.playStarAnimation('jigsawStarAnimation');
            this.rewards.updateStarCount(starResult.total_stars);
            const milestones = await this.rewards.checkMilestones(starResult.total_stars);
            milestones.forEach(r => this.rewards.showRewardAnimation(r));
        }

        const completeText = window.DinoPhrase ? window.DinoPhrase('jigsaw', 'complete') : 'Puzzle complete!';
        AppAPI.call('speak', completeText);

        // Don't auto-advance — let the child pick their next puzzle with nav buttons
    }

    // =============================================
    // Scene Drawing Functions
    // =============================================

    drawSunnyHouse(ctx, w, h) {
        // Sky gradient
        const skyGrad = ctx.createLinearGradient(0, 0, 0, h * 0.6);
        skyGrad.addColorStop(0, '#87CEEB');
        skyGrad.addColorStop(1, '#E0F0FF');
        ctx.fillStyle = skyGrad;
        ctx.fillRect(0, 0, w, h * 0.6);

        // Ground
        const groundGrad = ctx.createLinearGradient(0, h * 0.6, 0, h);
        groundGrad.addColorStop(0, '#4CAF50');
        groundGrad.addColorStop(1, '#2E7D32');
        ctx.fillStyle = groundGrad;
        ctx.fillRect(0, h * 0.6, w, h * 0.4);

        // Sun
        ctx.fillStyle = '#FFD700';
        ctx.beginPath();
        ctx.arc(w * 0.85, h * 0.15, 40, 0, Math.PI * 2);
        ctx.fill();

        // Sun rays
        ctx.strokeStyle = '#FFA000';
        ctx.lineWidth = 3;
        for (let i = 0; i < 8; i++) {
            const angle = (i / 8) * Math.PI * 2;
            ctx.beginPath();
            ctx.moveTo(w * 0.85 + Math.cos(angle) * 45, h * 0.15 + Math.sin(angle) * 45);
            ctx.lineTo(w * 0.85 + Math.cos(angle) * 60, h * 0.15 + Math.sin(angle) * 60);
            ctx.stroke();
        }

        // House body
        ctx.fillStyle = '#E53935';
        ctx.fillRect(w * 0.25, h * 0.35, w * 0.35, h * 0.25);

        // Roof
        ctx.fillStyle = '#5D4037';
        ctx.beginPath();
        ctx.moveTo(w * 0.2, h * 0.35);
        ctx.lineTo(w * 0.425, h * 0.15);
        ctx.lineTo(w * 0.65, h * 0.35);
        ctx.closePath();
        ctx.fill();

        // Door
        ctx.fillStyle = '#795548';
        ctx.fillRect(w * 0.37, h * 0.45, w * 0.1, h * 0.15);
        ctx.fillStyle = '#FFD700';
        ctx.beginPath();
        ctx.arc(w * 0.45, h * 0.52, 3, 0, Math.PI * 2);
        ctx.fill();

        // Windows
        ctx.fillStyle = '#FFF9C4';
        ctx.fillRect(w * 0.28, h * 0.38, w * 0.07, h * 0.07);
        ctx.fillRect(w * 0.5, h * 0.38, w * 0.07, h * 0.07);

        // Flowers
        const flowerColors = ['#FF4081', '#FF9800', '#9C27B0', '#E91E63', '#FFEB3B'];
        for (let i = 0; i < 6; i++) {
            const fx = w * 0.1 + i * w * 0.15;
            const fy = h * 0.62 + Math.random() * h * 0.05;
            ctx.fillStyle = '#4CAF50';
            ctx.fillRect(fx, fy, 3, 20);
            ctx.fillStyle = flowerColors[i % flowerColors.length];
            ctx.beginPath();
            ctx.arc(fx + 1.5, fy, 8, 0, Math.PI * 2);
            ctx.fill();
        }

        // Clouds
        this.drawCloud(ctx, w * 0.15, h * 0.1, 30);
        this.drawCloud(ctx, w * 0.5, h * 0.08, 25);
    }

    drawUnderwater(ctx, w, h) {
        // Water gradient
        const waterGrad = ctx.createLinearGradient(0, 0, 0, h);
        waterGrad.addColorStop(0, '#1565C0');
        waterGrad.addColorStop(0.5, '#0D47A1');
        waterGrad.addColorStop(1, '#0A1628');
        ctx.fillStyle = waterGrad;
        ctx.fillRect(0, 0, w, h);

        // Sandy bottom
        ctx.fillStyle = '#F5DEB3';
        ctx.beginPath();
        ctx.moveTo(0, h * 0.85);
        for (let x = 0; x <= w; x += 20) {
            ctx.lineTo(x, h * 0.85 + Math.sin(x / 30) * 10);
        }
        ctx.lineTo(w, h);
        ctx.lineTo(0, h);
        ctx.closePath();
        ctx.fill();

        // Seaweed
        const seaweedColors = ['#1B5E20', '#2E7D32', '#388E3C'];
        for (let i = 0; i < 5; i++) {
            const sx = w * 0.1 + i * w * 0.2;
            ctx.strokeStyle = seaweedColors[i % 3];
            ctx.lineWidth = 4;
            ctx.beginPath();
            ctx.moveTo(sx, h * 0.88);
            for (let y = h * 0.88; y > h * 0.55; y -= 10) {
                ctx.lineTo(sx + Math.sin((h * 0.88 - y) / 15) * 15, y);
            }
            ctx.stroke();
        }

        // Fish
        this.drawFish(ctx, w * 0.3, h * 0.3, '#FF9800', 25);
        this.drawFish(ctx, w * 0.65, h * 0.45, '#E91E63', 20);
        this.drawFish(ctx, w * 0.5, h * 0.2, '#FFEB3B', 18);
        this.drawFish(ctx, w * 0.2, h * 0.55, '#4CAF50', 22);

        // Bubbles
        ctx.strokeStyle = 'rgba(255,255,255,0.4)';
        ctx.lineWidth = 1.5;
        [{ x: 0.35, y: 0.25 }, { x: 0.6, y: 0.35 }, { x: 0.45, y: 0.15 },
         { x: 0.7, y: 0.2 }, { x: 0.25, y: 0.4 }].forEach(b => {
            ctx.beginPath();
            ctx.arc(w * b.x, h * b.y, 5 + Math.random() * 8, 0, Math.PI * 2);
            ctx.stroke();
        });

        // Starfish on bottom
        ctx.fillStyle = '#FF7043';
        this.drawStar5(ctx, w * 0.75, h * 0.88, 15);
    }

    drawGarden(ctx, w, h) {
        // Sky
        const skyGrad = ctx.createLinearGradient(0, 0, 0, h * 0.5);
        skyGrad.addColorStop(0, '#81D4FA');
        skyGrad.addColorStop(1, '#B3E5FC');
        ctx.fillStyle = skyGrad;
        ctx.fillRect(0, 0, w, h * 0.5);

        // Grass
        const grassGrad = ctx.createLinearGradient(0, h * 0.5, 0, h);
        grassGrad.addColorStop(0, '#66BB6A');
        grassGrad.addColorStop(1, '#2E7D32');
        ctx.fillStyle = grassGrad;
        ctx.fillRect(0, h * 0.5, w, h * 0.5);

        // Path
        ctx.fillStyle = '#D7CCC8';
        ctx.beginPath();
        ctx.moveTo(w * 0.4, h);
        ctx.quadraticCurveTo(w * 0.45, h * 0.7, w * 0.5, h * 0.55);
        ctx.quadraticCurveTo(w * 0.55, h * 0.7, w * 0.6, h);
        ctx.closePath();
        ctx.fill();

        // Trees
        this.drawTree(ctx, w * 0.15, h * 0.35, 30, 50);
        this.drawTree(ctx, w * 0.8, h * 0.3, 35, 55);

        // Large flowers
        const colors = ['#E91E63', '#FF9800', '#9C27B0', '#F44336', '#FFEB3B', '#2196F3'];
        for (let i = 0; i < 8; i++) {
            const fx = w * 0.05 + (i % 4) * w * 0.25 + Math.random() * w * 0.1;
            const fy = h * 0.55 + Math.floor(i / 4) * h * 0.15 + Math.random() * h * 0.1;
            this.drawFlower(ctx, fx, fy, colors[i % colors.length], 12);
        }

        // Butterfly
        ctx.fillStyle = '#FF4081';
        ctx.beginPath();
        ctx.ellipse(w * 0.6, h * 0.25, 12, 8, -0.3, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(w * 0.63, h * 0.28, 12, 8, 0.3, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#333';
        ctx.fillRect(w * 0.61, h * 0.23, 2, 15);

        // Sun
        ctx.fillStyle = '#FFD700';
        ctx.beginPath();
        ctx.arc(w * 0.88, h * 0.12, 30, 0, Math.PI * 2);
        ctx.fill();
    }

    drawFarm(ctx, w, h) {
        // Sky
        ctx.fillStyle = '#87CEEB';
        ctx.fillRect(0, 0, w, h * 0.5);

        // Hills
        ctx.fillStyle = '#81C784';
        ctx.beginPath();
        ctx.moveTo(0, h * 0.55);
        ctx.quadraticCurveTo(w * 0.25, h * 0.4, w * 0.5, h * 0.5);
        ctx.quadraticCurveTo(w * 0.75, h * 0.6, w, h * 0.5);
        ctx.lineTo(w, h);
        ctx.lineTo(0, h);
        ctx.closePath();
        ctx.fill();

        // Field rows
        ctx.fillStyle = '#A5D6A7';
        for (let r = 0; r < 4; r++) {
            ctx.fillRect(0, h * 0.6 + r * h * 0.1, w, 3);
        }

        // Barn
        ctx.fillStyle = '#C62828';
        ctx.fillRect(w * 0.55, h * 0.3, w * 0.25, h * 0.2);
        ctx.fillStyle = '#5D4037';
        ctx.beginPath();
        ctx.moveTo(w * 0.52, h * 0.3);
        ctx.lineTo(w * 0.675, h * 0.15);
        ctx.lineTo(w * 0.83, h * 0.3);
        ctx.closePath();
        ctx.fill();
        // Barn door
        ctx.fillStyle = '#4E342E';
        ctx.fillRect(w * 0.63, h * 0.38, w * 0.09, h * 0.12);

        // Fence
        ctx.strokeStyle = '#8D6E63';
        ctx.lineWidth = 3;
        for (let i = 0; i < 6; i++) {
            const fx = w * 0.05 + i * w * 0.08;
            ctx.beginPath();
            ctx.moveTo(fx, h * 0.52);
            ctx.lineTo(fx, h * 0.58);
            ctx.stroke();
        }
        ctx.beginPath();
        ctx.moveTo(w * 0.05, h * 0.54);
        ctx.lineTo(w * 0.45, h * 0.54);
        ctx.stroke();

        // Sun
        ctx.fillStyle = '#FFD700';
        ctx.beginPath();
        ctx.arc(w * 0.15, h * 0.12, 30, 0, Math.PI * 2);
        ctx.fill();

        // Tractor (simple)
        ctx.fillStyle = '#F57F17';
        ctx.fillRect(w * 0.2, h * 0.62, w * 0.12, h * 0.08);
        ctx.fillStyle = '#333';
        ctx.beginPath();
        ctx.arc(w * 0.23, h * 0.72, 10, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(w * 0.3, h * 0.72, 14, 0, Math.PI * 2);
        ctx.fill();

        this.drawCloud(ctx, w * 0.4, h * 0.08, 20);
        this.drawCloud(ctx, w * 0.7, h * 0.05, 25);
    }

    drawSpace(ctx, w, h) {
        // Dark space
        const spaceGrad = ctx.createLinearGradient(0, 0, w, h);
        spaceGrad.addColorStop(0, '#0D1B2A');
        spaceGrad.addColorStop(0.5, '#1B2838');
        spaceGrad.addColorStop(1, '#0D1B2A');
        ctx.fillStyle = spaceGrad;
        ctx.fillRect(0, 0, w, h);

        // Stars
        for (let i = 0; i < 60; i++) {
            const sx = Math.random() * w;
            const sy = Math.random() * h;
            const size = Math.random() * 3 + 1;
            ctx.fillStyle = `rgba(255, 255, 255, ${0.5 + Math.random() * 0.5})`;
            ctx.beginPath();
            ctx.arc(sx, sy, size, 0, Math.PI * 2);
            ctx.fill();
        }

        // Planet (large, colorful)
        const planetGrad = ctx.createRadialGradient(w * 0.6, h * 0.4, 10, w * 0.6, h * 0.4, 60);
        planetGrad.addColorStop(0, '#FF7043');
        planetGrad.addColorStop(0.5, '#E64A19');
        planetGrad.addColorStop(1, '#BF360C');
        ctx.fillStyle = planetGrad;
        ctx.beginPath();
        ctx.arc(w * 0.6, h * 0.4, 55, 0, Math.PI * 2);
        ctx.fill();

        // Planet ring
        ctx.strokeStyle = '#FFAB91';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.ellipse(w * 0.6, h * 0.4, 75, 15, -0.2, 0, Math.PI * 2);
        ctx.stroke();

        // Moon
        ctx.fillStyle = '#CFD8DC';
        ctx.beginPath();
        ctx.arc(w * 0.2, h * 0.25, 25, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#B0BEC5';
        ctx.beginPath();
        ctx.arc(w * 0.18, h * 0.22, 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(w * 0.24, h * 0.28, 4, 0, Math.PI * 2);
        ctx.fill();

        // Rocket
        ctx.fillStyle = '#F5F5F5';
        ctx.beginPath();
        ctx.moveTo(w * 0.35, h * 0.55);
        ctx.lineTo(w * 0.38, h * 0.45);
        ctx.lineTo(w * 0.4, h * 0.4);
        ctx.lineTo(w * 0.42, h * 0.45);
        ctx.lineTo(w * 0.45, h * 0.55);
        ctx.closePath();
        ctx.fill();
        // Rocket window
        ctx.fillStyle = '#42A5F5';
        ctx.beginPath();
        ctx.arc(w * 0.4, h * 0.47, 4, 0, Math.PI * 2);
        ctx.fill();
        // Flame
        ctx.fillStyle = '#FF6F00';
        ctx.beginPath();
        ctx.moveTo(w * 0.37, h * 0.55);
        ctx.lineTo(w * 0.4, h * 0.65);
        ctx.lineTo(w * 0.43, h * 0.55);
        ctx.closePath();
        ctx.fill();

        // Small planet
        ctx.fillStyle = '#7E57C2';
        ctx.beginPath();
        ctx.arc(w * 0.85, h * 0.75, 20, 0, Math.PI * 2);
        ctx.fill();
    }

    drawRainbow(ctx, w, h) {
        // Sky
        const skyGrad = ctx.createLinearGradient(0, 0, 0, h * 0.65);
        skyGrad.addColorStop(0, '#64B5F6');
        skyGrad.addColorStop(1, '#E3F2FD');
        ctx.fillStyle = skyGrad;
        ctx.fillRect(0, 0, w, h * 0.65);

        // Grass
        ctx.fillStyle = '#66BB6A';
        ctx.fillRect(0, h * 0.65, w, h * 0.35);

        // Rainbow arcs
        const rainbowColors = ['#F44336', '#FF9800', '#FFEB3B', '#4CAF50', '#2196F3', '#3F51B5', '#9C27B0'];
        const cx = w * 0.5;
        const cy = h * 0.65;
        let radius = 160;
        rainbowColors.forEach(color => {
            ctx.strokeStyle = color;
            ctx.lineWidth = 12;
            ctx.beginPath();
            ctx.arc(cx, cy, radius, Math.PI, 0);
            ctx.stroke();
            radius -= 14;
        });

        // Clouds at rainbow ends
        this.drawCloud(ctx, w * 0.1, h * 0.5, 30);
        this.drawCloud(ctx, w * 0.8, h * 0.5, 30);
        this.drawCloud(ctx, w * 0.45, h * 0.08, 25);

        // Sun
        ctx.fillStyle = '#FFD700';
        ctx.beginPath();
        ctx.arc(w * 0.88, h * 0.1, 30, 0, Math.PI * 2);
        ctx.fill();

        // Little flowers on grass
        const flowerColors = ['#E91E63', '#FF9800', '#FFEB3B', '#9C27B0'];
        for (let i = 0; i < 6; i++) {
            const fx = w * 0.08 + i * w * 0.16;
            this.drawFlower(ctx, fx, h * 0.72, flowerColors[i % flowerColors.length], 8);
        }
    }

    // =============================================
    // Helper Drawing Functions
    // =============================================

    drawCloud(ctx, x, y, size) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.arc(x + size * 0.8, y - size * 0.2, size * 0.7, 0, Math.PI * 2);
        ctx.arc(x + size * 1.4, y, size * 0.6, 0, Math.PI * 2);
        ctx.arc(x - size * 0.5, y + size * 0.1, size * 0.5, 0, Math.PI * 2);
        ctx.fill();
    }

    drawFish(ctx, x, y, color, size) {
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.ellipse(x, y, size, size * 0.5, 0, 0, Math.PI * 2);
        ctx.fill();
        // Tail
        ctx.beginPath();
        ctx.moveTo(x + size * 0.8, y);
        ctx.lineTo(x + size * 1.3, y - size * 0.4);
        ctx.lineTo(x + size * 1.3, y + size * 0.4);
        ctx.closePath();
        ctx.fill();
        // Eye
        ctx.fillStyle = '#FFF';
        ctx.beginPath();
        ctx.arc(x - size * 0.4, y - size * 0.1, size * 0.15, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#333';
        ctx.beginPath();
        ctx.arc(x - size * 0.4, y - size * 0.1, size * 0.08, 0, Math.PI * 2);
        ctx.fill();
    }

    drawTree(ctx, x, y, trunkW, canopyR) {
        // Trunk
        ctx.fillStyle = '#5D4037';
        ctx.fillRect(x - trunkW / 4, y, trunkW / 2, canopyR * 1.2);
        // Canopy
        ctx.fillStyle = '#2E7D32';
        ctx.beginPath();
        ctx.arc(x, y, canopyR, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#388E3C';
        ctx.beginPath();
        ctx.arc(x - canopyR * 0.3, y + canopyR * 0.2, canopyR * 0.7, 0, Math.PI * 2);
        ctx.fill();
    }

    drawFlower(ctx, x, y, color, size) {
        // Stem
        ctx.fillStyle = '#388E3C';
        ctx.fillRect(x - 1.5, y, 3, size * 2);
        // Petals
        ctx.fillStyle = color;
        for (let i = 0; i < 5; i++) {
            const angle = (i / 5) * Math.PI * 2;
            ctx.beginPath();
            ctx.arc(x + Math.cos(angle) * size * 0.5, y + Math.sin(angle) * size * 0.5, size * 0.4, 0, Math.PI * 2);
            ctx.fill();
        }
        // Center
        ctx.fillStyle = '#FFEB3B';
        ctx.beginPath();
        ctx.arc(x, y, size * 0.3, 0, Math.PI * 2);
        ctx.fill();
    }

    drawStar5(ctx, x, y, r) {
        ctx.beginPath();
        for (let i = 0; i < 5; i++) {
            const angle = (i * 4 * Math.PI) / 5 - Math.PI / 2;
            const method = i === 0 ? 'moveTo' : 'lineTo';
            ctx[method](x + Math.cos(angle) * r, y + Math.sin(angle) * r);
        }
        ctx.closePath();
        ctx.fill();
    }

    stop() {
        console.log('Stopping Jigsaw Puzzle activity');
        if (this.boardCanvas) {
            this.boardCanvas.onclick = null;
        }
    }
}
