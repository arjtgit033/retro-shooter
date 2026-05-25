const SPRITE_SCALE = 1.2;
const PIXEL_SIZE = 8;

const COLORS = {
    black: '#000',
    darkGrey: '#333',
    grey: '#666',
    lightGrey: '#999',
    white: '#fff',
    darkGreen: '#0a4d0a',
    green: '#22aa22',
    lightGreen: '#66ff66',
    darkBlue: '#0a0a4d',
    blue: '#2266ff',
    cyan: '#00ffff',
    darkRed: '#4d0a0a',
    red: '#ff2222',
    darkOrange: '#664400',
    orange: '#ff8800',
    yellow: '#ffff00',
    pink: '#ff00ff',
};

// Player sprites - simple circle
const PLAYER_IDLE = [
    [0, 1, 1, 0],
    [1, 1, 1, 1],
    [1, 1, 1, 1],
    [0, 1, 1, 0],
];

const PLAYER_WALK_1 = [
    [0, 1, 1, 0],
    [1, 1, 1, 1],
    [1, 1, 1, 1],
    [0, 2, 1, 0],
];

const PLAYER_WALK_2 = [
    [0, 1, 1, 0],
    [1, 1, 1, 1],
    [1, 1, 1, 1],
    [0, 1, 2, 0],
];

const PLAYER_FRAMES = [PLAYER_IDLE, PLAYER_WALK_1, PLAYER_WALK_2, PLAYER_IDLE];

// Enemy Type A - Grunt (brown, slow)
const ENEMY_A_IDLE = [
    [0, 1, 1, 0],
    [1, 1, 1, 1],
    [1, 1, 1, 1],
    [0, 1, 1, 0],
];

const ENEMY_A_WALK = [
    [0, 1, 1, 0],
    [1, 1, 1, 1],
    [1, 1, 1, 1],
    [1, 0, 0, 1],
];

const ENEMY_A_FRAMES = [ENEMY_A_IDLE, ENEMY_A_WALK];

// Enemy Type B - Speeder (cyan, fast, smaller)
const ENEMY_B_IDLE = [
    [0, 1, 0],
    [1, 1, 1],
    [0, 1, 0],
];

const ENEMY_B_WALK = [
    [1, 0, 0],
    [1, 1, 1],
    [0, 0, 1],
];

const ENEMY_B_FRAMES = [ENEMY_B_IDLE, ENEMY_B_WALK];

// Enemy Type C - Heavy (red, circle, slow)
const ENEMY_C_IDLE = [
    [0, 1, 1, 1, 0],
    [1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1],
    [0, 1, 1, 1, 0],
];

const ENEMY_C_IDLE2 = [
    [0, 1, 1, 1, 0],
    [1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1],
    [0, 1, 1, 1, 0],
];

const ENEMY_C_FRAMES = [ENEMY_C_IDLE, ENEMY_C_IDLE2];

// Bullet sprite
const BULLET_SPRITE = [
    [1],
];

function drawSprite(ctx, frameData, x, y, scale, angle, colorMap) {
    ctx.save();
    ctx.translate(x, y);
    if (angle) ctx.rotate(angle);

    const palette = colorMap || {
        0: COLORS.black,
        1: COLORS.grey,
        2: COLORS.lightGrey,
    };

    for (let row = 0; row < frameData.length; row++) {
        for (let col = 0; col < frameData[row].length; col++) {
            const colorIdx = frameData[row][col];
            if (colorIdx !== 0) {
                ctx.fillStyle = palette[colorIdx];
                ctx.fillRect(col * PIXEL_SIZE * scale, row * PIXEL_SIZE * scale, PIXEL_SIZE * scale, PIXEL_SIZE * scale);
            }
        }
    }

    ctx.restore();
}

function drawPlayer(ctx, frameData, x, y, angle) {
    const colorMap = {
        0: COLORS.black,
        1: COLORS.green,
        2: COLORS.lightGrey,
    };
    drawSprite(ctx, frameData, x, y, SPRITE_SCALE, angle, colorMap);
}

function drawEnemyA(ctx, frameData, x, y, angle) {
    const colorMap = {
        0: COLORS.black,
        1: COLORS.orange,
        2: COLORS.darkOrange,
    };
    drawSprite(ctx, frameData, x, y, SPRITE_SCALE, angle, colorMap);
}

function drawEnemyB(ctx, frameData, x, y, angle) {
    const colorMap = {
        0: COLORS.black,
        1: COLORS.cyan,
        2: COLORS.blue,
    };
    drawSprite(ctx, frameData, x, y, SPRITE_SCALE, angle, colorMap);
}

function drawEnemyC(ctx, frameData, x, y, angle) {
    const colorMap = {
        0: COLORS.black,
        1: COLORS.red,
        2: COLORS.yellow,
    };
    drawSprite(ctx, frameData, x, y, SPRITE_SCALE * 1.5, angle, colorMap);
}

function drawBullet(ctx, x, y, isPlayerBullet) {
    ctx.fillStyle = isPlayerBullet ? COLORS.yellow : COLORS.pink;
    ctx.fillRect(x - 2, y - 2, 4, 4);
}

function drawParticle(ctx, x, y, color) {
    ctx.fillStyle = color;
    ctx.fillRect(x - 2, y - 2, 4, 4);
}

function drawExplosion(ctx, particles) {
    particles.forEach(p => {
        ctx.globalAlpha = p.alpha;
        drawParticle(ctx, p.x, p.y, p.color);
        ctx.globalAlpha = 1;
    });
}

function drawGrid(ctx, canvas) {
    ctx.strokeStyle = '#111122';
    ctx.lineWidth = 1;
    const gridSize = 32;
    for (let x = 0; x < canvas.width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
    }
    for (let y = 0; y < canvas.height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
    }
}
