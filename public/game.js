const Config = {
    BLOCK_SIZE: 20,
    CANVAS_WIDTH: 400, // Увеличено поле
    CANVAS_HEIGHT: 600, // Увеличено поле
    INITIAL_SPEED: 150,
    GOLDEN_SPEED_BOOST: 10,
    MAX_LEADERBOARD: 5,
    FOOD_LIFETIME: 5000
};

const Render = {
    gradients: {},
    init(ctx) {
        this.gradients.head = ctx.createLinearGradient(-Config.BLOCK_SIZE / 2, 0, Config.BLOCK_SIZE / 2, 0);
        this.gradients.head.addColorStop(0, '#f1c40f');
        this.gradients.head.addColorStop(1, '#e67e22');
        this.gradients.body = ctx.createLinearGradient(0, 0, Config.BLOCK_SIZE, Config.BLOCK_SIZE);
        this.gradients.body.addColorStop(0, '#27ae60');
        this.gradients.body.addColorStop(1, '#219653');
        this.gradients.foodNormal = ctx.createRadialGradient(0, 0, 0, 0, 0, Config.BLOCK_SIZE / 2);
        this.gradients.foodNormal.addColorStop(0, '#e74c3c');
        this.gradients.foodNormal.addColorStop(1, '#c0392b');
        this.gradients.foodGolden = ctx.createRadialGradient(0, 0, 0, 0, 0, Config.BLOCK_SIZE / 2);
        this.gradients.foodGolden.addColorStop(0, '#f1c40f');
        this.gradients.foodGolden.addColorStop(1, '#d4ac0d');
        this.gradients.foodPoison = ctx.createRadialGradient(0, 0, 0, 0, 0, Config.BLOCK_SIZE / 2);
        this.gradients.foodPoison.addColorStop(0, '#8e44ad');
        this.gradients.foodPoison.addColorStop(1, '#4a235a');
    },

    drawSnake(ctx, snake, direction) {
        snake.forEach((seg, i) => {
            const x = seg.x * Config.BLOCK_SIZE, y = seg.y * Config.BLOCK_SIZE;
            if (i === 0) {
                ctx.save();
                ctx.translate(x + Config.BLOCK_SIZE / 2, y + Config.BLOCK_SIZE / 2);
                ctx.rotate({ right: 0, left: Math.PI, up: -Math.PI / 2, down: Math.PI / 2 }[direction]);
                ctx.fillStyle = this.gradients.head;
                ctx.shadowBlur = 15; ctx.shadowColor = 'rgba(241, 196, 15, 0.5)';
                ctx.beginPath();
                ctx.moveTo(-Config.BLOCK_SIZE / 2 + 2, -Config.BLOCK_SIZE / 2 + 2);
                ctx.quadraticCurveTo(0, -Config.BLOCK_SIZE / 2 - 6, Config.BLOCK_SIZE / 2 - 2, -Config.BLOCK_SIZE / 2 + 2);
                ctx.lineTo(Config.BLOCK_SIZE / 2 - 2, Config.BLOCK_SIZE / 2 - 2);
                ctx.quadraticCurveTo(0, Config.BLOCK_SIZE / 2 + 4, -Config.BLOCK_SIZE / 2 + 2, Config.BLOCK_SIZE / 2 - 2);
                ctx.closePath();
                ctx.fill();
                ctx.fillStyle = '#ffffff';
                ctx.beginPath();
                ctx.arc(-Config.BLOCK_SIZE / 4, -Config.BLOCK_SIZE / 4, 3, 0, Math.PI * 2);
                ctx.arc(Config.BLOCK_SIZE / 4, -Config.BLOCK_SIZE / 4, 3, 0, Math.PI * 2);
                ctx.fill();
                ctx.fillStyle = '#000000';
                ctx.arc(-Config.BLOCK_SIZE / 4, -Config.BLOCK_SIZE / 4, 1.5, 0, Math.PI * 2);
                ctx.arc(Config.BLOCK_SIZE / 4, -Config.BLOCK_SIZE / 4, 1.5, 0, Math.PI * 2);
                ctx.fill();
                ctx.restore();
            } else {
                ctx.fillStyle = this.gradients.body;
                ctx.shadowBlur = 5; ctx.shadowColor = 'rgba(39, 174, 96, 0.3)';
                ctx.beginPath();
                ctx.roundRect(x + 2, y + 2, Config.BLOCK_SIZE - 4, Config.BLOCK_SIZE - 4, 5);
                ctx.fill();
                ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
                ctx.beginPath();
                ctx.arc(x + Config.BLOCK_SIZE / 2, y + Config.BLOCK_SIZE / 2, 3, 0, Math.PI * 2);
                ctx.fill();
            }
        });
    },

    drawFood(ctx, food) {
        const x = food.x * Config.BLOCK_SIZE, y = food.y * Config.BLOCK_SIZE;
        const timeSinceSpawn = performance.now() - food.spawnTime;
        const scale = food.type !== 'normal' ? (1 + Math.sin(timeSinceSpawn * 0.005) * 0.1) : 1;
        ctx.save();
        ctx.translate(x + Config.BLOCK_SIZE / 2, y + Config.BLOCK_SIZE / 2);
        ctx.scale(scale, scale);
        const type = food.type;
        ctx.fillStyle = this.gradients[`food${type.charAt(0).toUpperCase() + type.slice(1)}`];
        ctx.shadowBlur = type === 'golden' ? 20 : 15;
        ctx.shadowColor = { normal: 'rgba(231, 76, 60, 0.5)', golden: 'rgba(241, 196, 15, 0.7)', poison: 'rgba(142, 68, 173, 0.5)' }[type];
        ctx.beginPath();
        if (type === 'normal') {
            ctx.arc(0, 0, Config.BLOCK_SIZE / 2 - 2, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
            ctx.arc(-Config.BLOCK_SIZE / 4, -Config.BLOCK_SIZE / 4, Config.BLOCK_SIZE / 5, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#27ae60';
            ctx.beginPath();
            ctx.moveTo(0, -Config.BLOCK_SIZE / 2 + 2);
            ctx.quadraticCurveTo(2, -Config.BLOCK_SIZE / 2 - 2, 5, -Config.BLOCK_SIZE / 2);
            ctx.fill();
        } else if (type === 'golden') {
            for (let i = 0; i < 5; i++) {
                ctx.lineTo(Math.cos((18 + i * 72) * Math.PI / 180) * (Config.BLOCK_SIZE / 2 - 2), Math.sin((18 + i * 72) * Math.PI / 180) * (Config.BLOCK_SIZE / 2 - 2));
                ctx.lineTo(Math.cos((54 + i * 72) * Math.PI / 180) * (Config.BLOCK_SIZE / 4), Math.sin((54 + i * 72) * Math.PI / 180) * (Config.BLOCK_SIZE / 4));
            }
            ctx.closePath();
            ctx.fill();
        } else if (type === 'poison') {
            ctx.arc(0, 0, Config.BLOCK_SIZE / 2 - 2, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.arc(-Config.BLOCK_SIZE / 4, -Config.BLOCK_SIZE / 4, 3, 0, Math.PI * 2);
            ctx.arc(Config.BLOCK_SIZE / 4, -Config.BLOCK_SIZE / 4, 3, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#000000';
            ctx.rect(-Config.BLOCK_SIZE / 4, Config.BLOCK_SIZE / 4, Config.BLOCK_SIZE / 2, Config.BLOCK_SIZE / 4);
            ctx.fill();
        }
        ctx.restore();
    },

    drawObstacles(ctx, obstacles) {
        obstacles.forEach(obs => {
            const x = obs.x * Config.BLOCK_SIZE, y = obs.y * Config.BLOCK_SIZE;
            ctx.fillStyle = '#7f8c8d';
            ctx.shadowBlur = 10; ctx.shadowColor = 'rgba(127, 140, 141, 0.5)';
            ctx.beginPath();
            ctx.roundRect(x + 2, y + 2, Config.BLOCK_SIZE - 4, Config.BLOCK_SIZE - 4, 5);
            ctx.fill();
        });
    }
};

const Game = {
    state: {
        snake: [{ x: 10, y: 15 }], // Начальная позиция адаптирована под новое поле
        food: { x: 20, y: 20, type: 'normal', spawnTime: 0 },
        obstacles: [],
        direction: 'right',
        score: 0,
        gameActive: false,
        gameSpeed: Config.INITIAL_SPEED,
        lastUpdate: 0,
        foodTimer: null,
        blink: 0
    },
    canvas: null,
    ctx: null,
    ui: {},
    leaderboard: [],
    player: { id: 'guest', name: 'Player' },

    init() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.canvas.width = Config.CANVAS_WIDTH;
        this.canvas.height = Config.CANVAS_HEIGHT;
        this.ui.score = document.getElementById('score');
        this.ui.finalScore = document.getElementById('finalScore');
        this.ui.gameOverScreen = document.getElementById('gameOverScreen');
        this.ui.leaderboard = document.getElementById('leaderboard');
        this.ui.startBtn = document.getElementById('startBtn');
        this.ui.restartBtn = document.getElementById('restartBtn');
        this.ui.leaderboardBtn = document.getElementById('leaderboardBtn');
        this.ui.backBtn = document.getElementById('backBtn');
        Render.init(this.ctx);
        this.loadLeaderboard();
        this.loadLocalScore(); // Загружаем локальный счёт
        this.reset();
        this.bindEvents();
        this.setupTelegram();
    },

    setupTelegram() {
        const tg = window.Telegram.WebApp;
        tg.expand();
        tg.disableVerticalSwipes();
        document.body.style.background = tg.themeParams.bg_color || 'linear-gradient(135deg, #2a5298, #1e3c72)';
        document.body.style.color = tg.themeParams.text_color || '#ffffff';
        this.ui.startBtn.style.background = tg.themeParams.button_color || 'linear-gradient(45deg, #e74c3c, #c0392b)';
        this.ui.startBtn.style.color = tg.themeParams.button_text_color || '#ffffff';
        this.ui.restartBtn.style.background = tg.themeParams.button_color || 'linear-gradient(45deg, #e74c3c, #c0392b)';
        this.ui.restartBtn.style.color = tg.themeParams.button_text_color || '#ffffff';
        this.ui.leaderboardBtn.style.background = tg.themeParams.button_color || 'linear-gradient(45deg, #e74c3c, #c0392b)';
        this.ui.leaderboardBtn.style.color = tg.themeParams.button_text_color || '#ffffff';
        this.ui.backBtn.style.background = tg.themeParams.button_color || 'linear-gradient(45deg, #e74c3c, #c0392b)';
        this.ui.backBtn.style.color = tg.themeParams.button_text_color || '#ffffff';
        tg.MainButton.setText('Share Score');
        tg.MainButton.onClick(() => this.shareScore());
        tg.MainButton.hide();
    },

    shareScore() {
        const tg = window.Telegram.WebApp;
        const message = `${this.player.name} scored ${this.state.score} in Snake Game! Can you beat it?`;
        tg.sendData(JSON.stringify({ action: 'share', score: this.state.score, message }));
    },

    loadLocalScore() {
        const savedScore = localStorage.getItem(`snakeScore_${this.player.id}`);
        if (savedScore) this.state.score = parseInt(savedScore, 10);
        this.ui.score.textContent = this.state.score;
    },

    saveLocalScore() {
        localStorage.setItem(`snakeScore_${this.player.id}`, this.state.score);
    },

    reset() {
        this.state.snake = [{ x: 10, y: 15 }];
        this.state.direction = 'right';
        this.state.obstacles = this.generateObstacles(5); // Увеличим препятствия
        clearTimeout(this.state.foodTimer);
        this.createFood();
        this.state.gameActive = false;
        this.ui.score.textContent = this.state.score;
        this.ui.gameOverScreen.classList.add('hidden');
        this.ui.startBtn.classList.remove('hidden');
        this.ui.restartBtn.classList.add('hidden');
        this.ui.leaderboardBtn.classList.remove('hidden');
        this.ui.backBtn.classList.add('hidden');
        window.Telegram.WebApp.MainButton.hide();
        this.render();
    },

    generateObstacles(count) {
        const obs = [];
        while (obs.length < count) {
            const newObs = {
                x: Math.floor(Math.random() * (Config.CANVAS_WIDTH / Config.BLOCK_SIZE)),
                y: Math.floor(Math.random() * (Config.CANVAS_HEIGHT / Config.BLOCK_SIZE))
            };
            if (!this.state.snake.some(s => s.x === newObs.x && s.y === newObs.y) && !(newObs.x === this.state.food.x && newObs.y === this.state.food.y)) obs.push(newObs);
        }
        return obs;
    },

    createFood() {
        const rand = Math.random();
        this.state.food = {
            x: Math.floor(Math.random() * (Config.CANVAS_WIDTH / Config.BLOCK_SIZE)),
            y: Math.floor(Math.random() * (Config.CANVAS_HEIGHT / Config.BLOCK_SIZE)),
            type: rand < 0.1 ? 'golden' : (rand < 0.25 ? 'poison' : 'normal'),
            spawnTime: performance.now()
        };
        if (this.state.snake.some(s => s.x === this.state.food.x && s.y === this.state.food.y) || this.state.obstacles.some(o => o.x === this.state.food.x && o.y === this.state.food.y)) {
            this.createFood();
            return;
        }
        if (this.state.food.type !== 'normal') {
            clearTimeout(this.state.foodTimer);
            this.state.foodTimer = setTimeout(() => {
                if (this.state.food.type !== 'normal') {
                    this.state.food.type = 'normal';
                    this.state.food.spawnTime = performance.now();
                }
            }, Config.FOOD_LIFETIME);
        }
    },

    update(timestamp) {
        if (timestamp - this.state.lastUpdate < this.state.gameSpeed) return;
        this.state.lastUpdate = timestamp;

        const head = { x: this.state.snake[0].x, y: this.state.snake[0].y };
        switch (this.state.direction) {
            case 'right': head.x++; break;
            case 'left': head.x--; break;
            case 'up': head.y--; break;
            case 'down': head.y++; break;
        }

        if (head.x < 0 || head.x >= Config.CANVAS_WIDTH / Config.BLOCK_SIZE || head.y < 0 || head.y >= Config.CANVAS_HEIGHT / Config.BLOCK_SIZE || this.state.snake.some((s, i) => i > 0 && s.x === head.x && s.y === head.y) || this.state.obstacles.some(o => o.x === head.x && o.y === head.y)) {
            this.gameOver();
            return;
        }

        this.state.snake.unshift(head);
        if (head.x === this.state.food.x && head.y === this.state.food.y) {
            if (this.state.food.type === 'normal') this.state.score += 1;
            else if (this.state.food.type === 'golden') {
                this.state.score += 5;
                this.state.gameSpeed = Math.max(50, this.state.gameSpeed - Config.GOLDEN_SPEED_BOOST);
                this.state.blink = 10;
            } else if (this.state.food.type === 'poison') {
                this.state.score = Math.max(0, this.state.score - 2);
                if (this.state.snake.length > 1) this.state.snake.splice(-1, 1);
                if (this.state.snake.length === 1) {
                    this.gameOver();
                    return;
                }
            }
            this.ui.score.textContent = this.state.score;
            this.saveLocalScore(); // Сохраняем локально
            clearTimeout(this.state.foodTimer);
            this.createFood();
        } else {
            this.state.snake.pop();
        }
    },

    render() {
        this.ctx.clearRect(0, 0, Config.CANVAS_WIDTH, Config.CANVAS_HEIGHT);
        if (this.state.blink > 0 && this.state.blink % 2 === 0) {
            this.state.blink--;
        } else {
            Render.drawSnake(this.ctx, this.state.snake, this.state.direction);
            if (this.state.blink > 0) this.state.blink--;
        }
        Render.drawFood(this.ctx, this.state.food);
        Render.drawObstacles(this.ctx, this.state.obstacles);
    },

    gameLoop(timestamp) {
        if (this.state.gameActive) {
            this.update(timestamp);
            this.render();
            requestAnimationFrame((ts) => this.gameLoop(ts));
        }
    },

    start() {
        if (!this.state.gameActive) {
            this.state.gameActive = true;
            this.state.lastUpdate = performance.now();
            requestAnimationFrame((ts) => this.gameLoop(ts));
            this.ui.startBtn.classList.add('hidden');
            this.ui.restartBtn.classList.remove('hidden');
            this.ui.leaderboardBtn.classList.add('hidden');
            this.ui.backBtn.classList.add('hidden');
        }
    },

    gameOver() {
        this.state.gameActive = false;
        clearTimeout(this.state.foodTimer);
        this.saveScore(); // Сохраняем в MongoDB
        this.saveLocalScore(); // Сохраняем локально
        this.ui.finalScore.textContent = this.state.score;
        this.ui.gameOverScreen.classList.remove('hidden');
        this.ui.startBtn.classList.add('hidden');
        this.ui.restartBtn.classList.remove('hidden');
        this.ui.leaderboardBtn.classList.remove('hidden');
        this.ui.backBtn.classList.remove('hidden');
        const tg = window.Telegram.WebApp;
        tg.showAlert(`Game Over! Your score: ${this.state.score}`);
        tg.MainButton.show();
    },

    saveScore() {
        const playerScore = { id: this.player.id, name: this.player.name, score: this.state.score };
        fetch('/.netlify/functions/saveScore', {
            method: 'POST',
            body: JSON.stringify(playerScore),
            headers: { 'Content-Type': 'application/json' }
        })
        .then(response => response.json())
        .then(data => console.log('Score saved:', data))
        .catch(error => console.error('Error saving score:', error));
        this.loadLeaderboard();
    },

    loadLeaderboard() {
        fetch('/.netlify/functions/getLeaderboard')
            .then(response => response.json())
            .then(data => {
                this.leaderboard = data || [];
                this.updateLeaderboard();
            })
            .catch(error => console.error('Error loading leaderboard:', error));
    },

    updateLeaderboard() {
        this.ui.leaderboard.innerHTML = '<h3>Leaderboard</h3>' + this.leaderboard.map((e, i) => `<p>${i + 1}. ${e.name}: ${e.score}</p>`).join('');
    },

    showLeaderboard() {
        this.loadLeaderboard();
        this.ui.gameOverScreen.classList.remove('hidden');
        this.ui.startBtn.classList.add('hidden');
        this.ui.restartBtn.classList.add('hidden');
        this.ui.leaderboardBtn.classList.add('hidden');
        this.ui.backBtn.classList.remove('hidden');
    },

    bindEvents() {
        this.ui.startBtn.addEventListener('click', (e) => { e.preventDefault(); this.start(); });
        this.ui.restartBtn.addEventListener('click', (e) => { e.preventDefault(); this.reset(); this.start(); });
        this.ui.leaderboardBtn.addEventListener('click', (e) => { e.preventDefault(); this.showLeaderboard(); });
        this.ui.backBtn.addEventListener('click', (e) => {
            e.preventDefault();
            this.ui.gameOverScreen.classList.add('hidden');
            this.ui.startBtn.classList.remove('hidden');
            this.ui.leaderboardBtn.classList.remove('hidden');
            this.ui.backBtn.classList.add('hidden');
        });

        document.addEventListener('keydown', (e) => {
            if (!this.state.gameActive) return;
            const opposites = { up: 'down', down: 'up', left: 'right', right: 'left' };
            const newDir = { ArrowUp: 'up', ArrowDown: 'down', ArrowLeft: 'left', ArrowRight: 'right' }[e.key];
            if (newDir && opposites[newDir] !== this.state.direction) this.state.direction = newDir;
        });

        let touchStartX = 0, touchStartY = 0;
        this.canvas.addEventListener('touchstart', (e) => {
            touchStartX = e.touches[0].clientX;
            touchStartY = e.touches[0].clientY;
            e.preventDefault();
        }, { passive: false });

        this.canvas.addEventListener('touchmove', (e) => {
            if (!this.state.gameActive) return;
            const dx = e.touches[0].clientX - touchStartX, dy = e.touches[0].clientY - touchStartY;
            if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 20) this.state.direction = dx > 0 && this.state.direction !== 'left' ? 'right' : dx < 0 && this.state.direction !== 'right' ? 'left' : this.state.direction;
            else if (Math.abs(dy) > 20) this.state.direction = dy > 0 && this.state.direction !== 'up' ? 'down' : dy < 0 && this.state.direction !== 'down' ? 'up' : this.state.direction;
            touchStartX = e.touches[0].clientX; touchStartY = e.touches[0].clientY;
            e.preventDefault();
        }, { passive: false });
    }
};

document.addEventListener('DOMContentLoaded', () => {
    const tg = window.Telegram.WebApp;
    tg.ready();
    Game.player.id = tg.initDataUnsafe.user?.id || 'guest';
    Game.player.name = tg.initDataUnsafe.user?.first_name || 'Player';
    Game.init();
});
