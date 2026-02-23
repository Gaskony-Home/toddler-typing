/**
 * Memory Game Activity - Card matching game
 * Easy: 6 cards (3 pairs, 3x2), Medium: 12 cards (6 pairs, 4x3), Hard: 18 cards (9 pairs, 6x3)
 */

class MemoryGameActivity {
    constructor() {
        this.cardEmojis = [
            '\uD83D\uDC36', '\uD83D\uDC31', '\uD83D\uDC30', '\uD83D\uDC3B',
            '\uD83D\uDC38', '\uD83E\uDD8B', '\uD83D\uDC27', '\uD83D\uDC28',
            '\uD83C\uDF4E', '\uD83C\uDF4C', '\uD83C\uDF55', '\uD83C\uDF66',
            '\uD83D\uDE80', '\u2B50', '\uD83C\uDF08', '\u2600\uFE0F',
            '\uD83C\uDF3B', '\uD83E\uDD96'
        ];

        this.difficulties = {
            easy: { pairs: 3, gridClass: 'grid-3x2' },
            medium: { pairs: 6, gridClass: 'grid-4x3' },
            hard: { pairs: 9, gridClass: 'grid-6x3' }
        };

        this.difficulty = 'easy';
        this.cards = [];
        this.flippedCards = [];
        this.matchedPairs = 0;
        this.totalPairs = 0;
        this.processing = false;
        this.rewards = null;
    }

    async start() {
        console.log('Starting Memory Game activity');

        // Set up rewards
        if (typeof RewardsManager !== 'undefined') {
            this.rewards = new RewardsManager();
            await this.rewards.loadProgress();
            this.rewards.renderProgressPanel('memoryProgressDisplay', 'memory_game');
        }

        // Set up difficulty buttons
        this.setupDifficultyButtons();

        // Character wave
        if (window.characterManager) {
            window.characterManager.playAnimation('wave', false);
        }

        // Start game
        this.startNewGame();
    }

    setupDifficultyButtons() {
        const container = document.getElementById('memoryDifficulty');
        if (!container) return;

        container.querySelectorAll('.difficulty-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                container.querySelectorAll('.difficulty-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.difficulty = btn.dataset.difficulty;
                this.startNewGame();
            });
        });
    }

    startNewGame() {
        const config = this.difficulties[this.difficulty];
        this.totalPairs = config.pairs;
        this.matchedPairs = 0;
        this.flippedCards = [];
        this.processing = false;

        // Select random emojis for pairs
        const shuffledEmojis = [...this.cardEmojis].sort(() => Math.random() - 0.5);
        const selectedEmojis = shuffledEmojis.slice(0, config.pairs);

        // Create card pairs and shuffle
        this.cards = [...selectedEmojis, ...selectedEmojis]
            .sort(() => Math.random() - 0.5)
            .map((emoji, index) => ({
                id: index,
                emoji,
                flipped: false,
                matched: false
            }));

        this.renderGrid();
    }

    renderGrid() {
        const grid = document.getElementById('memoryGrid');
        if (!grid) return;

        const config = this.difficulties[this.difficulty];
        grid.className = `memory-grid ${config.gridClass}`;

        grid.innerHTML = this.cards.map(card => `
            <div class="memory-card" data-id="${card.id}">
                <div class="memory-card-back">
                    <i class="bi bi-question-lg"></i>
                </div>
                <div class="memory-card-front">
                    ${card.emoji}
                </div>
            </div>
        `).join('');

        grid.querySelectorAll('.memory-card').forEach(cardEl => {
            cardEl.addEventListener('click', () => this.handleCardClick(cardEl));
        });
    }

    async handleCardClick(cardEl) {
        if (this.processing) return;

        const id = parseInt(cardEl.dataset.id);
        const card = this.cards[id];

        // Ignore already flipped or matched cards
        if (card.flipped || card.matched) return;

        // Flip the card
        card.flipped = true;
        cardEl.classList.add('flipped');
        this.flippedCards.push({ card, element: cardEl });

        // Check if two cards are flipped
        if (this.flippedCards.length === 2) {
            this.processing = true;
            const [first, second] = this.flippedCards;

            if (first.card.emoji === second.card.emoji) {
                // Match found!
                first.card.matched = true;
                second.card.matched = true;
                first.element.classList.add('matched');
                second.element.classList.add('matched');
                this.matchedPairs++;

                if (window.characterManager) {
                    window.characterManager.playAnimation('happy', false);
                }

                // Award star per match
                const starResult = await AppAPI.call('award_stars', 'memory_game', 1);
                if (starResult && this.rewards) {
                    this.rewards.playStarAnimation('memoryStarAnimation');
                    this.rewards.updateStarCount(starResult.total_stars);
                    const milestones = await this.rewards.checkMilestones(starResult.total_stars);
                    milestones.forEach(r => this.rewards.showRewardAnimation(r));
                }

                const matchText = window.DinoPhrase ? window.DinoPhrase('correct_first_try') : 'Great match!';
                AppAPI.call('speak', matchText);

                this.flippedCards = [];

                // Check for game completion
                if (this.matchedPairs === this.totalPairs) {
                    setTimeout(() => this.onGameComplete(), 1000);
                }

                setTimeout(() => { this.processing = false; }, 500);

            } else {
                // No match
                if (window.characterManager) {
                    window.characterManager.playAnimation('thinking', false);
                }

                const wrongText = window.DinoPhrase ? window.DinoPhrase('wrong_key') : 'Try again!';
                AppAPI.call('speak', wrongText);

                // Flip cards back after a delay
                setTimeout(() => {
                    first.card.flipped = false;
                    second.card.flipped = false;
                    first.element.classList.remove('flipped');
                    second.element.classList.remove('flipped');
                    this.flippedCards = [];
                    this.processing = false;
                }, 1000);
            }
        }
    }

    async onGameComplete() {
        if (window.characterManager) {
            window.characterManager.playAnimation('dance', false);
        }

        // Bonus stars for completion
        const bonus = this.difficulty === 'hard' ? 3 : this.difficulty === 'medium' ? 2 : 1;
        const starResult = await AppAPI.call('award_stars', 'memory_game', bonus);
        if (starResult && this.rewards) {
            this.rewards.playStarAnimation('memoryStarAnimation');
            this.rewards.updateStarCount(starResult.total_stars);
            const milestones = await this.rewards.checkMilestones(starResult.total_stars);
            milestones.forEach(r => this.rewards.showRewardAnimation(r));
        }

        const completeText = window.DinoPhrase ? window.DinoPhrase('word_complete') : 'You found all the pairs!';
        AppAPI.call('speak', completeText);

        // Auto-restart after celebration
        setTimeout(() => this.startNewGame(), 3000);
    }

    stop() {
        console.log('Stopping Memory Game activity');
    }
}
