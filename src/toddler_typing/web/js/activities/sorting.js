/**
 * Sorting Game Activity - Sort items into two categories
 * Categories: Colours, Animals, Size, Food
 */

class SortingActivity {
    constructor() {
        this.categories = {
            colours: {
                label: 'Colours',
                baskets: [
                    { name: 'Red Things', emoji: '\uD83D\uDD34', items: [
                        { emoji: '\uD83C\uDF4E', label: 'Apple' },
                        { emoji: '\uD83C\uDF53', label: 'Strawberry' },
                        { emoji: '\u2764\uFE0F', label: 'Heart' },
                        { emoji: '\uD83C\uDF39', label: 'Rose' },
                        { emoji: '\uD83E\uDD80', label: 'Crab' }
                    ]},
                    { name: 'Blue Things', emoji: '\uD83D\uDD35', items: [
                        { emoji: '\uD83C\uDF0A', label: 'Wave' },
                        { emoji: '\uD83D\uDC8E', label: 'Diamond' },
                        { emoji: '\uD83D\uDC33', label: 'Whale' },
                        { emoji: '\uD83E\uDDCA', label: 'Ice' },
                        { emoji: '\uD83D\uDC99', label: 'Blue Heart' }
                    ]}
                ]
            },
            animals: {
                label: 'Animals',
                baskets: [
                    { name: 'Farm Animals', emoji: '\uD83C\uDFE1', items: [
                        { emoji: '\uD83D\uDC04', label: 'Cow' },
                        { emoji: '\uD83D\uDC14', label: 'Chicken' },
                        { emoji: '\uD83D\uDC37', label: 'Pig' },
                        { emoji: '\uD83D\uDC11', label: 'Sheep' },
                        { emoji: '\uD83D\uDC34', label: 'Horse' }
                    ]},
                    { name: 'Wild Animals', emoji: '\uD83C\uDF33', items: [
                        { emoji: '\uD83E\uDD81', label: 'Lion' },
                        { emoji: '\uD83D\uDC18', label: 'Elephant' },
                        { emoji: '\uD83D\uDC12', label: 'Monkey' },
                        { emoji: '\uD83E\uDD92', label: 'Giraffe' },
                        { emoji: '\uD83D\uDC3B', label: 'Bear' }
                    ]}
                ]
            },
            size: {
                label: 'Size',
                baskets: [
                    { name: 'Big Things', emoji: '\u2B06\uFE0F', items: [
                        { emoji: '\uD83D\uDC18', label: 'Elephant' },
                        { emoji: '\uD83C\uDFE0', label: 'House' },
                        { emoji: '\uD83C\uDF33', label: 'Tree' },
                        { emoji: '\uD83D\uDE8C', label: 'Bus' },
                        { emoji: '\uD83C\uDF0D', label: 'Earth' }
                    ]},
                    { name: 'Small Things', emoji: '\u2B07\uFE0F', items: [
                        { emoji: '\uD83D\uDC1C', label: 'Ant' },
                        { emoji: '\uD83C\uDF53', label: 'Strawberry' },
                        { emoji: '\uD83D\uDD11', label: 'Key' },
                        { emoji: '\uD83D\uDC1B', label: 'Bug' },
                        { emoji: '\u2B50', label: 'Button' }
                    ]}
                ]
            },
            food: {
                label: 'Food',
                baskets: [
                    { name: 'Fruits', emoji: '\uD83C\uDF4E', items: [
                        { emoji: '\uD83C\uDF4C', label: 'Banana' },
                        { emoji: '\uD83C\uDF47', label: 'Grapes' },
                        { emoji: '\uD83C\uDF4A', label: 'Orange' },
                        { emoji: '\uD83C\uDF49', label: 'Watermelon' },
                        { emoji: '\uD83C\uDF51', label: 'Peach' }
                    ]},
                    { name: 'Vegetables', emoji: '\uD83E\uDD66', items: [
                        { emoji: '\uD83E\uDD55', label: 'Carrot' },
                        { emoji: '\uD83C\uDF3D', label: 'Corn' },
                        { emoji: '\uD83E\uDD52', label: 'Cucumber' },
                        { emoji: '\uD83C\uDF36\uFE0F', label: 'Pepper' },
                        { emoji: '\uD83E\uDD54', label: 'Potato' }
                    ]}
                ]
            }
        };

        this.currentCategory = 'colours';
        this.itemQueue = [];
        this.currentItem = null;
        this.currentBasketIndex = -1;
        this.score = 0;
        this.streak = 0;
        this.processing = false;
        this.rewards = null;
    }

    async start() {
        console.log('Starting Sorting Game activity');

        // Set up rewards
        if (typeof RewardsManager !== 'undefined') {
            this.rewards = new RewardsManager();
            await this.rewards.loadProgress();
            this.rewards.renderProgressPanel('sortingProgressDisplay', 'sorting');
        }

        // Set up category buttons
        this.setupCategoryButtons();

        // Character wave
        if (window.characterManager) {
            window.characterManager.playAnimation('wave', false);
        }

        this.startNewRound();
    }

    setupCategoryButtons() {
        const container = document.getElementById('sortingCategory');
        if (!container) return;

        container.querySelectorAll('.difficulty-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                container.querySelectorAll('.difficulty-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.currentCategory = btn.dataset.category;
                this.score = 0;
                this.streak = 0;
                this.startNewRound();
            });
        });
    }

    startNewRound() {
        const category = this.categories[this.currentCategory];
        if (!category) return;

        // Build item queue: all items from both baskets, shuffled
        this.itemQueue = [];
        category.baskets.forEach((basket, basketIdx) => {
            basket.items.forEach(item => {
                this.itemQueue.push({ ...item, correctBasket: basketIdx });
            });
        });
        this.itemQueue.sort(() => Math.random() - 0.5);

        // Render baskets
        this.renderBaskets(category);

        // Show first item
        this.showNextItem();
    }

    renderBaskets(category) {
        const basketsContainer = document.getElementById('sortingBaskets');
        if (!basketsContainer) return;

        basketsContainer.innerHTML = category.baskets.map((basket, i) => `
            <div class="sorting-basket" data-basket="${i}">
                <span class="sorting-basket-emoji">${basket.emoji}</span>
                <span class="sorting-basket-label">${basket.name}</span>
            </div>
        `).join('');

        basketsContainer.querySelectorAll('.sorting-basket').forEach(basketEl => {
            basketEl.addEventListener('click', () => this.handleBasketClick(basketEl));
        });

        // Update score display
        this.updateScore();
    }

    showNextItem() {
        const itemContainer = document.getElementById('sortingItem');
        if (!itemContainer) return;

        if (this.itemQueue.length === 0) {
            // Round complete, restart with fresh items
            this.startNewRound();
            return;
        }

        this.currentItem = this.itemQueue.shift();

        itemContainer.innerHTML = `
            <div class="sorting-item-card" data-basket="${this.currentItem.correctBasket}">
                ${this.currentItem.emoji}
                <div class="item-label">${this.currentItem.label}</div>
            </div>
        `;

        // Speak item name for non-readers
        const itemText = window.DinoPhrase ? window.DinoPhrase('sorting', 'item_appear', { target: this.currentItem.label }) : this.currentItem.label;
        AppAPI.call('speak', itemText);
    }

    async handleBasketClick(basketEl) {
        if (this.processing || !this.currentItem) return;
        this.processing = true;

        const basketIndex = parseInt(basketEl.dataset.basket);

        if (basketIndex === this.currentItem.correctBasket) {
            // Correct!
            basketEl.classList.add('correct-flash');
            this.score++;
            this.streak++;

            if (window.characterManager) {
                window.characterManager.playAnimation('happy', false);
            }

            // Award star
            const starResult = await AppAPI.call('award_stars', 'sorting', 1);
            if (starResult && this.rewards) {
                this.rewards.playStarAnimation('sortingStarAnimation');
                this.rewards.updateStarCount(starResult.total_stars);
                const milestones = await this.rewards.checkMilestones(starResult.total_stars);
                milestones.forEach(r => this.rewards.showRewardAnimation(r));
            }

            // Streak bonus
            if (this.streak > 0 && this.streak % 5 === 0) {
                const bonusResult = await AppAPI.call('award_stars', 'sorting', 1);
                if (bonusResult && this.rewards) {
                    this.rewards.updateStarCount(bonusResult.total_stars);
                }
            }

            const correctText = window.DinoPhrase ? window.DinoPhrase('sorting', 'correct') : 'Right!';
            AppAPI.call('speak', correctText);

            this.updateScore();

            setTimeout(() => {
                basketEl.classList.remove('correct-flash');
                this.processing = false;
                this.showNextItem();
            }, 800);

        } else {
            // Wrong basket
            basketEl.classList.add('wrong-flash');
            this.streak = 0;

            if (window.characterManager) {
                window.characterManager.playAnimation('thinking', false);
            }

            const wrongText = window.DinoPhrase ? window.DinoPhrase('sorting', 'wrong') : 'Try the other one!';
            AppAPI.call('speak', wrongText);

            this.updateScore();

            setTimeout(() => {
                basketEl.classList.remove('wrong-flash');
                this.processing = false;
            }, 500);
        }
    }

    updateScore() {
        const scoreEl = document.getElementById('sortingScore');
        if (scoreEl) {
            const streakText = this.streak >= 3 ? ` \uD83D\uDD25 ${this.streak} streak!` : '';
            scoreEl.textContent = `Score: ${this.score}${streakText}`;
        }
    }

    stop() {
        console.log('Stopping Sorting Game activity');
    }
}
