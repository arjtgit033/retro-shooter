const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const STATE = {
    MENU: 'MENU',
    PLAYING: 'PLAYING',
    LEVEL_COMPLETE: 'LEVEL_COMPLETE',
    GAME_OVER: 'GAME_OVER',
    WIN: 'WIN',
};

class Game {
    constructor() {
        this.state = STATE.MENU;
        this.currentLevel = 0;
        this.currentWave = 0;
        this.score = 0;
        this.player = null;
        this.enemies = [];
        this.bullets = [];
        this.particles = [];
        this.input = {
            up: false,
            down: false,
            left: false,
            right: false,
            shooting: false,
        };
        this.mouseWorldPos = { x: 0, y: 0 };
        this.lastTime = Date.now();
        this.shakeAmount = 0;

        this.setupInput();
    }

    setupInput() {
        document.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowUp') this.input.up = true;
            if (e.key === 'ArrowDown') this.input.down = true;
            if (e.key === 'ArrowLeft') this.input.left = true;
            if (e.key === 'ArrowRight') this.input.right = true;
            if (e.key === 'Enter') this.handleEnter();
        });

        document.addEventListener('keyup', (e) => {
            if (e.key === 'ArrowUp') this.input.up = false;
            if (e.key === 'ArrowDown') this.input.down = false;
            if (e.key === 'ArrowLeft') this.input.left = false;
            if (e.key === 'ArrowRight') this.input.right = false;
        });

        document.addEventListener('mousemove', (e) => {
            const rect = canvas.getBoundingClientRect();
            this.mouseWorldPos.x = e.clientX - rect.left;
            this.mouseWorldPos.y = e.clientY - rect.top;
        });

        document.addEventListener('mousedown', () => {
            this.input.shooting = true;
        });

        document.addEventListener('mouseup', () => {
            this.input.shooting = false;
        });
    }

    handleEnter() {
        if (this.state === STATE.MENU) {
            this.startLevel(0);
        } else if (this.state === STATE.LEVEL_COMPLETE) {
            this.currentLevel++;
            if (this.currentLevel >= LEVELS.length) {
                this.state = STATE.WIN;
            } else {
                this.startLevel(this.currentLevel);
            }
        } else if (this.state === STATE.GAME_OVER) {
            this.state = STATE.MENU;
        } else if (this.state === STATE.WIN) {
            this.state = STATE.MENU;
        }
    }

    startLevel(levelIdx) {
        this.currentLevel = levelIdx;
        this.currentWave = 0;
        this.player = new Player(canvas.width / 2, canvas.height - 100);
        this.enemies = [];
        this.bullets = [];
        this.particles = [];
        this.state = STATE.PLAYING;
        this.spawnWave();
    }

    spawnWave() {
        const level = LEVELS[this.currentLevel];
        const waveData = level.waves[this.currentWave];
        this.enemies = [];

        waveData.forEach((enemyData) => {
            const enemy = new Enemy(enemyData.x, enemyData.y, enemyData.type);
            this.enemies.push(enemy);
        });
    }

    update(dt) {
        if (this.state !== STATE.PLAYING) return;

        // Update player
        this.player.update(dt, this.input, this.mouseWorldPos, canvas);

        // Player shooting
        if (this.input.shooting) {
            if (this.player.shoot()) {
                const bullet = new Bullet(
                    this.player.x,
                    this.player.y,
                    this.player.angle,
                    300,
                    true
                );
                this.bullets.push(bullet);
            }
        }

        // Update enemies
        this.enemies.forEach((enemy) => {
            enemy.update(dt, this.player);

            // Enemy shooting
            if (enemy.canShoot()) {
                const angle = Math.atan2(this.player.y - enemy.y, this.player.x - enemy.x);
                const bullet = new Bullet(enemy.x, enemy.y, angle, enemy.bulletSpeed, false);
                this.bullets.push(bullet);
            }
        });

        // Update bullets
        this.bullets = this.bullets.filter((bullet) => bullet.update(dt, canvas));

        // Update particles
        this.particles.forEach((p) => p.update(dt));
        this.particles = this.particles.filter((p) => p.isAlive());

        // Collision detection: bullets with enemies
        for (let i = this.bullets.length - 1; i >= 0; i--) {
            const bullet = this.bullets[i];
            if (!bullet.isPlayerBullet) continue;

            for (let j = this.enemies.length - 1; j >= 0; j--) {
                const enemy = this.enemies[j];
                const dist = Math.hypot(enemy.x - bullet.x, enemy.y - bullet.y);
                if (dist < enemy.radius + bullet.radius) {
                    enemy.takeDamage(bullet.damage);
                    this.bullets.splice(i, 1);

                    if (!enemy.isAlive()) {
                        createExplosion(enemy.x, enemy.y, this.particles);
                        this.enemies.splice(j, 1);
                        this.score += 100;
                    }
                    break;
                }
            }
        }

        // Collision detection: enemy bullets with player
        for (let i = this.bullets.length - 1; i >= 0; i--) {
            const bullet = this.bullets[i];
            if (bullet.isPlayerBullet) continue;

            const dist = Math.hypot(this.player.x - bullet.x, this.player.y - bullet.y);
            if (dist < this.player.radius + bullet.radius) {
                this.player.takeDamage(1);
                this.bullets.splice(i, 1);
                createExplosion(this.player.x, this.player.y, this.particles, 4);
                this.shakeAmount = 3;

                if (!this.player.isAlive()) {
                    this.state = STATE.GAME_OVER;
                }
                break;
            }
        }

        // Check if all enemies are dead
        if (this.enemies.length === 0) {
            this.currentWave++;
            const level = LEVELS[this.currentLevel];
            if (this.currentWave >= level.waves.length) {
                this.state = STATE.LEVEL_COMPLETE;
            } else {
                this.spawnWave();
            }
        }

        // Screen shake
        if (this.shakeAmount > 0) {
            this.shakeAmount -= dt / 1000;
        }
    }

    render() {
        // Clear canvas
        ctx.fillStyle = COLORS.darkBlue;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Draw grid
        drawGrid(ctx, canvas);

        if (this.state === STATE.PLAYING) {
            // Apply screen shake
            let offsetX = 0;
            let offsetY = 0;
            if (this.shakeAmount > 0) {
                offsetX = (Math.random() - 0.5) * 4 * this.shakeAmount;
                offsetY = (Math.random() - 0.5) * 4 * this.shakeAmount;
            }
            ctx.save();
            ctx.translate(offsetX, offsetY);

            // Draw game entities
            this.particles.forEach((p) => p.draw(ctx));
            this.enemies.forEach((enemy) => enemy.draw(ctx));
            this.player.draw(ctx);
            this.bullets.forEach((bullet) => bullet.draw(ctx));

            ctx.restore();

            // Draw HUD
            drawHUD(
                ctx,
                canvas,
                this.player,
                this.currentLevel,
                this.currentWave + 1,
                LEVELS[this.currentLevel].waves.length,
                this.score
            );
        } else if (this.state === STATE.MENU) {
            drawStartMenu(ctx, canvas);
        } else if (this.state === STATE.LEVEL_COMPLETE) {
            this.particles.forEach((p) => p.draw(ctx));
            this.enemies.forEach((enemy) => enemy.draw(ctx));
            this.player.draw(ctx);
            this.bullets.forEach((bullet) => bullet.draw(ctx));
            drawLevelComplete(ctx, canvas, this.currentLevel, this.score);
        } else if (this.state === STATE.GAME_OVER) {
            this.particles.forEach((p) => p.draw(ctx));
            this.enemies.forEach((enemy) => enemy.draw(ctx));
            this.player.draw(ctx);
            this.bullets.forEach((bullet) => bullet.draw(ctx));
            drawGameOver(ctx, canvas, this.score);
        } else if (this.state === STATE.WIN) {
            drawWinScreen(ctx, canvas, this.score);
        }
    }

    loop() {
        const now = Date.now();
        const dt = now - this.lastTime;
        this.lastTime = now;

        this.update(dt);
        this.render();

        requestAnimationFrame(() => this.loop());
    }
}

const game = new Game();
game.loop();
