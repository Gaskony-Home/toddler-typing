/**
 * Jigsaw Puzzle Activity - Drag pieces to correct slots
 * Easy: 4 pcs (2x2), Medium: 6 pcs (2x3), Hard: 9 pcs (3x3)
 */

class JigsawActivity {
    constructor() {
        this.puzzles = [
            { name: 'Dinosaur', emoji: '\uD83E\uDD96', pieces: ['\uD83E\uDD96', '\uD83C\uDF3F', '\u2600\uFE0F', '\uD83C\uDF0B', '\uD83E\uDD95', '\uD83C\uDF34', '\uD83E\uDDB4', '\uD83E\uDD5A', '\u2B50'] },
            { name: 'Rainbow', emoji: '\uD83C\uDF08', pieces: ['\uD83C\uDF08', '\u2601\uFE0F', '\u2600\uFE0F', '\uD83C\uDF27\uFE0F', '\uD83C\uDF3B', '\uD83C\uDF3F', '\uD83E\uDD8B', '\uD83D\uDC26', '\u2B50'] },
            { name: 'Ocean', emoji: '\uD83C\uDF0A', pieces: ['\uD83C\uDF0A', '\uD83D\uDC1F', '\uD83D\uDC19', '\uD83D\uDC2C', '\uD83E\uDD80', '\uD83D\uDC1A', '\u2693', '\u26F5', '\uD83C\uDFDD\uFE0F'] },
            { name: 'Farm', emoji: '\uD83C\uDFE1', pieces: ['\uD83C\uDFE1', '\uD83D\uDC04', '\uD83D\uDC14', '\uD83D\uDC37', '\uD83C\uDF3E', '\uD83D\uDE9C', '\uD83C\uDF3B', '\uD83D\uDC34', '\uD83D\uDC11'] }
        ];

        this.difficulties = {
            easy: { count: 4, cols: 2, gridClass: 'grid-2x2' },
            medium: { count: 6, cols: 3, gridClass: 'grid-2x3' },
            hard: { count: 9, cols: 3, gridClass: 'grid-3x3' }
        };

        this.difficulty = 'easy';
        this.currentPuzzleIndex = 0;
        this.pieces = [];
        this.slots = [];
        this.placedCount = 0;
        this.processing = false;
        this.rewards = null;
        this.draggedPiece = null;
    }

    async start() {
        console.log('Starting Jigsaw Puzzle activity');

        // Set up rewards
        if (typeof RewardsManager !== 'undefined') {
            this.rewards = new RewardsManager();
            await this.rewards.loadProgress();
            this.rewards.renderProgressPanel('jigsawProgressDisplay', 'jigsaw');
        }

        // Set up difficulty buttons
        this.setupDifficultyButtons();

        // Character wave
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

    startNewPuzzle() {
        const config = this.difficulties[this.difficulty];
        const puzzle = this.puzzles[this.currentPuzzleIndex % this.puzzles.length];

        this.placedCount = 0;
        this.processing = false;

        // Take the needed number of pieces
        const puzzlePieces = puzzle.pieces.slice(0, config.count);

        // Create slots (correct order) and scrambled pieces
        this.slots = puzzlePieces.map((emoji, i) => ({
            id: i,
            emoji,
            filled: false
        }));

        this.pieces = puzzlePieces
            .map((emoji, i) => ({ id: i, emoji, placed: false }))
            .sort(() => Math.random() - 0.5);

        // Update title
        const title = document.getElementById('jigsawTitle');
        if (title) {
            title.textContent = `Jigsaw: ${puzzle.name}`;
        }

        // Update reference image
        const refImg = document.getElementById('jigsawRefImg');
        if (refImg) {
            refImg.style.display = 'none'; // We use emoji-based puzzles, no actual image
        }
        const refContainer = document.getElementById('jigsawReference');
        if (refContainer) {
            refContainer.innerHTML = `<span style="font-size: 3rem;">${puzzle.emoji}</span>`;
        }

        this.renderBoard();
    }

    renderBoard() {
        const board = document.getElementById('jigsawBoard');
        if (!board) return;

        const config = this.difficulties[this.difficulty];
        board.className = `jigsaw-board ${config.gridClass}`;

        // Render slots
        board.innerHTML = this.slots.map(slot => `
            <div class="jigsaw-slot" data-slot-id="${slot.id}" data-emoji="${slot.emoji}">
                ${slot.filled ? `<div class="jigsaw-piece placed">${slot.emoji}</div>` : ''}
            </div>
        `).join('');

        // Render unplaced pieces below the board
        const unplacedPieces = this.pieces.filter(p => !p.placed);
        if (unplacedPieces.length > 0) {
            const piecesRow = document.createElement('div');
            piecesRow.className = 'jigsaw-pieces-row';
            piecesRow.style.cssText = 'display: flex; gap: 0.75rem; justify-content: center; flex-wrap: wrap; margin-top: 1rem;';

            unplacedPieces.forEach(piece => {
                const pieceEl = document.createElement('div');
                pieceEl.className = 'jigsaw-piece';
                pieceEl.dataset.pieceId = piece.id;
                pieceEl.dataset.emoji = piece.emoji;
                pieceEl.textContent = piece.emoji;
                pieceEl.style.cssText = 'width: 80px; height: 80px; font-size: 2.5rem;';

                // Click to select, then click slot to place
                pieceEl.addEventListener('click', () => this.selectPiece(pieceEl, piece));

                // Touch drag support
                pieceEl.addEventListener('touchstart', (e) => this.onTouchStart(e, piece), { passive: false });

                piecesRow.appendChild(pieceEl);
            });

            board.parentElement.appendChild(piecesRow);

            // Remove old pieces row if exists
            const oldRow = board.parentElement.querySelector('.jigsaw-pieces-row-old');
            if (oldRow) oldRow.remove();
        }

        // Add click handlers to slots
        board.querySelectorAll('.jigsaw-slot').forEach(slotEl => {
            slotEl.addEventListener('click', () => this.handleSlotClick(slotEl));
        });
    }

    selectPiece(pieceEl, piece) {
        if (this.processing) return;

        // Deselect others
        document.querySelectorAll('.jigsaw-piece').forEach(p => {
            p.style.borderColor = 'transparent';
            p.style.boxShadow = '0 4px 12px var(--shadow-color)';
        });

        // Select this piece
        this.draggedPiece = piece;
        pieceEl.style.borderColor = '#fbbf24';
        pieceEl.style.boxShadow = '0 0 20px rgba(251, 191, 36, 0.5)';
        pieceEl.style.border = '3px solid #fbbf24';
    }

    async handleSlotClick(slotEl) {
        if (this.processing || !this.draggedPiece) return;

        const slotId = parseInt(slotEl.dataset.slotId);
        const slot = this.slots[slotId];

        if (slot.filled) return;

        this.processing = true;

        if (this.draggedPiece.emoji === slot.emoji) {
            // Correct placement!
            slot.filled = true;
            this.draggedPiece.placed = true;
            this.placedCount++;
            this.draggedPiece = null;

            slotEl.classList.add('filled');
            slotEl.innerHTML = `<div class="jigsaw-piece placed">${slot.emoji}</div>`;

            if (window.characterManager) {
                window.characterManager.playAnimation('happy', false);
            }

            // Award star
            const starResult = await AppAPI.call('award_stars', 'jigsaw', 1);
            if (starResult && this.rewards) {
                this.rewards.playStarAnimation('jigsawStarAnimation');
                this.rewards.updateStarCount(starResult.total_stars);
                const milestones = await this.rewards.checkMilestones(starResult.total_stars);
                milestones.forEach(r => this.rewards.showRewardAnimation(r));
            }

            // Re-render pieces
            const oldRow = document.querySelector('.jigsaw-pieces-row');
            if (oldRow) oldRow.remove();

            // Check completion
            if (this.placedCount === this.slots.length) {
                setTimeout(() => this.onPuzzleComplete(), 500);
            } else {
                this.renderPiecesRow();
            }

            setTimeout(() => { this.processing = false; }, 300);

        } else {
            // Wrong slot
            slotEl.style.animation = 'wrongShake 0.4s ease';
            setTimeout(() => { slotEl.style.animation = ''; }, 400);

            if (window.characterManager) {
                window.characterManager.playAnimation('thinking', false);
            }

            setTimeout(() => { this.processing = false; }, 500);
        }
    }

    renderPiecesRow() {
        const board = document.getElementById('jigsawBoard');
        if (!board) return;

        const unplacedPieces = this.pieces.filter(p => !p.placed);
        if (unplacedPieces.length === 0) return;

        const piecesRow = document.createElement('div');
        piecesRow.className = 'jigsaw-pieces-row';
        piecesRow.style.cssText = 'display: flex; gap: 0.75rem; justify-content: center; flex-wrap: wrap; margin-top: 1rem;';

        unplacedPieces.forEach(piece => {
            const pieceEl = document.createElement('div');
            pieceEl.className = 'jigsaw-piece';
            pieceEl.dataset.pieceId = piece.id;
            pieceEl.dataset.emoji = piece.emoji;
            pieceEl.textContent = piece.emoji;
            pieceEl.style.cssText = 'width: 80px; height: 80px; font-size: 2.5rem;';

            pieceEl.addEventListener('click', () => this.selectPiece(pieceEl, piece));
            piecesRow.appendChild(pieceEl);
        });

        board.parentElement.appendChild(piecesRow);
    }

    onTouchStart(e, piece) {
        e.preventDefault();
        this.selectPiece(e.target, piece);
    }

    async onPuzzleComplete() {
        if (window.characterManager) {
            window.characterManager.playAnimation('dance', false);
        }

        // Bonus stars
        const bonus = this.difficulty === 'hard' ? 3 : this.difficulty === 'medium' ? 2 : 1;
        const starResult = await AppAPI.call('award_stars', 'jigsaw', bonus);
        if (starResult && this.rewards) {
            this.rewards.playStarAnimation('jigsawStarAnimation');
            this.rewards.updateStarCount(starResult.total_stars);
            const milestones = await this.rewards.checkMilestones(starResult.total_stars);
            milestones.forEach(r => this.rewards.showRewardAnimation(r));
        }

        const completeText = window.DinoPhrase ? window.DinoPhrase('word_complete') : 'Puzzle complete!';
        AppAPI.call('speak', completeText);

        // Next puzzle
        this.currentPuzzleIndex++;
        setTimeout(() => this.startNewPuzzle(), 3000);
    }

    stop() {
        console.log('Stopping Jigsaw Puzzle activity');
    }
}
