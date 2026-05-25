class Player {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.vx = 0;
        this.vy = 0;
        this.speed = 150;
        this.angle = 0;
        this.health = 3;
        this.maxHealth = 3;
        this.radius = 5;
        this.shootCooldown = 0;
        this.shootDelay = 250;
        this.invincibilityFrames = 0;
        this.invincibilityDuration = 1500;
        this.animationFrame = 0;
        this.animationTimer = 0;
    }

    update(dt, input, mouseWorldPos, canvas) {
        // Movement
        this.vx = 0;
        this.vy = 0;
        if (input.up) this.vy -= this.speed;
        if (input.down) this.vy += this.speed;
        if (input.left) this.vx -= this.speed;
        if (input.right) this.vx += this.speed;

        // Normalize diagonal movement
        const len = Math.hypot(this.vx, this.vy);
        if (len > 0) {
            this.vx = (this.vx / len) * this.speed;
            this.vy = (this.vy / len) * this.speed;
        }

        this.x += this.vx * (dt / 1000);
        this.y += this.vy * (dt / 1000);

        // Clamp to canvas
        this.x = Math.max(this.radius, Math.min(canvas.width - this.radius, this.x));
        this.y = Math.max(this.radius, Math.min(canvas.height - this.radius, this.y));

        // Rotation toward mouse
        this.angle = Math.atan2(mouseWorldPos.y - this.y, mouseWorldPos.x - this.x);

        // Animation
        if (len > 0) {
            this.animationTimer += dt;
            if (this.animationTimer > 100) {
                this.animationFrame = (this.animationFrame + 1) % PLAYER_FRAMES.length;
                this.animationTimer = 0;
            }
        } else {
            this.animationFrame = 0;
        }

        // Cooldowns
        if (this.shootCooldown > 0) {
            this.shootCooldown -= dt;
        }
        if (this.invincibilityFrames > 0) {
            this.invincibilityFrames -= dt;
        }
    }

    shoot() {
        if (this.shootCooldown <= 0) {
            this.shootCooldown = this.shootDelay;
            return true;
        }
        return false;
    }

    takeDamage(amount) {
        if (this.invincibilityFrames <= 0) {
            this.health -= amount;
            this.invincibilityFrames = this.invincibilityDuration;
        }
    }

    isAlive() {
        return this.health > 0;
    }

    draw(ctx) {
        if (this.invincibilityFrames > 0 && Math.floor(this.invincibilityFrames / 100) % 2 === 0) {
            ctx.globalAlpha = 0.5;
        }
        drawPlayer(ctx, PLAYER_FRAMES[this.animationFrame], this.x - 8, this.y - 8, this.angle);
        ctx.globalAlpha = 1;
    }
}

class Enemy {
    constructor(x, y, type) {
        this.x = x;
        this.y = y;
        this.type = type; // 'A', 'B', 'C'
        this.vx = 0;
        this.vy = 0;
        this.angle = 0;
        this.animationFrame = 0;
        this.animationTimer = 0;

        const configs = {
            A: { speed: 60, health: 1, fireRate: 1, bulletSpeed: 100, range: 300, radius: 5 },
            B: { speed: 120, health: 1, fireRate: 1.5, bulletSpeed: 150, range: 250, radius: 3 },
            C: { speed: 40, health: 3, fireRate: 0.5, bulletSpeed: 80, range: 350, radius: 7 },
        };

        const cfg = configs[type];
        this.speed = cfg.speed;
        this.health = cfg.health;
        this.maxHealth = cfg.health;
        this.fireRate = cfg.fireRate;
        this.bulletSpeed = cfg.bulletSpeed;
        this.preferredRange = cfg.range;
        this.radius = cfg.radius;
        this.shootCooldown = 0;
    }

    update(dt, player) {
        // AI: move toward player
        const dx = player.x - this.x;
        const dy = player.y - this.y;
        const dist = Math.hypot(dx, dy);

        this.angle = Math.atan2(dy, dx);

        // Move toward player if further than preferred range
        if (dist > this.preferredRange) {
            this.vx = (dx / dist) * this.speed;
            this.vy = (dy / dist) * this.speed;
        } else {
            this.vx = 0;
            this.vy = 0;
        }

        this.x += this.vx * (dt / 1000);
        this.y += this.vy * (dt / 1000);

        // Animation
        this.animationTimer += dt;
        if (this.animationTimer > 200) {
            this.animationFrame = (this.animationFrame + 1) % 2;
            this.animationTimer = 0;
        }

        // Cooldown
        if (this.shootCooldown > 0) {
            this.shootCooldown -= dt;
        }
    }

    canShoot() {
        if (this.shootCooldown <= 0) {
            this.shootCooldown = 1000 / this.fireRate;
            return true;
        }
        return false;
    }

    takeDamage(amount) {
        this.health -= amount;
    }

    isAlive() {
        return this.health > 0;
    }

    draw(ctx) {
        let frames, drawFunc;
        if (this.type === 'A') {
            frames = ENEMY_A_FRAMES;
            drawFunc = drawEnemyA;
        } else if (this.type === 'B') {
            frames = ENEMY_B_FRAMES;
            drawFunc = drawEnemyB;
        } else {
            frames = ENEMY_C_FRAMES;
            drawFunc = drawEnemyC;
        }

        drawFunc(ctx, frames[this.animationFrame], this.x - 5, this.y - 5, this.angle);
    }
}

class Bullet {
    constructor(x, y, angle, speed, isPlayerBullet) {
        this.x = x;
        this.y = y;
        this.vx = Math.cos(angle) * speed;
        this.vy = Math.sin(angle) * speed;
        this.isPlayerBullet = isPlayerBullet;
        this.radius = 2;
        this.damage = 1;
    }

    update(dt, canvas) {
        this.x += this.vx * (dt / 1000);
        this.y += this.vy * (dt / 1000);

        return this.x >= 0 && this.x <= canvas.width && this.y >= 0 && this.y <= canvas.height;
    }

    draw(ctx) {
        drawBullet(ctx, this.x, this.y, this.isPlayerBullet);
    }
}

class Particle {
    constructor(x, y, vx, vy, color) {
        this.x = x;
        this.y = y;
        this.vx = vx;
        this.vy = vy;
        this.color = color;
        this.alpha = 1;
        this.life = 600;
    }

    update(dt) {
        this.x += this.vx * (dt / 1000);
        this.y += this.vy * (dt / 1000);
        this.life -= dt;
        this.alpha = Math.max(0, this.life / 600);
    }

    isAlive() {
        return this.life > 0;
    }

    draw(ctx) {
        ctx.globalAlpha = this.alpha;
        drawParticle(ctx, this.x, this.y, this.color);
        ctx.globalAlpha = 1;
    }
}

function createExplosion(x, y, particles, count = 8) {
    const colors = [COLORS.orange, COLORS.yellow, COLORS.darkOrange, COLORS.red];
    for (let i = 0; i < count; i++) {
        const angle = (Math.PI * 2 * i) / count;
        const speed = 100 + Math.random() * 100;
        const vx = Math.cos(angle) * speed;
        const vy = Math.sin(angle) * speed;
        const color = colors[Math.floor(Math.random() * colors.length)];
        particles.push(new Particle(x, y, vx, vy, color));
    }
}
