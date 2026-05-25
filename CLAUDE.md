# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Quick Start

**Run the game:** Open `index.html` in a web browser (Chrome, Firefox, Safari all work). No build step needed.

## ⚠️ IMPORTANT: Regular Commits & Pushes

**Commit and push regularly — at least after every completed feature or fix.** This ensures work is never lost and we have a clean history to revert to if needed.

**Workflow:**
1. Make changes to one or more files
2. Test the changes in the browser
3. Stage and commit with a clear message: `git add <files> && git commit -m "description"`
4. Push immediately: `git push origin master`

**Commit message format:**
```bash
git commit -m "Feature|Fix|Refactor|Docs: Short description of what changed and why"
```

Examples:
- `git commit -m "Feature: Add new Heavy enemy type with 3 health"`
- `git commit -m "Fix: Reduce player collision radius for better movement"`
- `git commit -m "Docs: Update CLAUDE.md with new level design guide"`

**Never skip pushing.** If work isn't on GitHub, it's at risk of being lost.

## Architecture Overview

This is a browser-based 2D top-down shooter built with vanilla JavaScript and HTML5 Canvas. No frameworks or build tools.

### Game Loop
The main loop in `src/game.js` runs via `requestAnimationFrame` at ~60 FPS. Each frame:
1. **Update** — processes input, moves entities, checks collisions, spawns waves
2. **Render** — draws background, sprites, HUD, and overlays

### State Machine
Game has 5 states managed in `Game.state`:
- `MENU` — start screen
- `PLAYING` — active level
- `LEVEL_COMPLETE` — level cleared, show score
- `GAME_OVER` — player died
- `WIN` — all 5 levels cleared

State transitions happen on Enter key or when level/health conditions change.

### Entity System
All moving objects inherit patterns from `src/entities.js`:
- **Player** — controlled by arrow keys, rotates toward mouse, shoots on click
- **Enemy** — AI-driven, chases player, shoots back. Three types (A/B/C) with different speeds/health
- **Bullet** — travels in a direction, destroyed on collision or canvas exit
- **Particle** — short-lived, used for explosions

### Collision Detection
Implemented as distance checks between entity radii (circular hitboxes):
- Player bullets vs enemies: destroys bullet, damages enemy, spawns particles
- Enemy bullets vs player: damages player (3 health max), screen shake, particles
- Collision radii defined in `Enemy` constructor config

### Level System
`src/levels.js` defines 5 levels. Each level has `waves` — arrays of enemy spawn configs.
- Waves spawn sequentially when previous wave is cleared
- Level complete when all waves are done
- After level 5, game shows WIN screen

### Sprite System
Pixel art defined in `src/sprites.js` as 2D arrays where each number is a color index:
```javascript
const SPRITE = [
    [0, 1, 1, 0],      // 0 = transparent, 1 = color 1, etc.
    [1, 1, 1, 1],
    [1, 1, 1, 1],
    [0, 1, 1, 0],
];
```

Multiple frames enable animation. `drawSprite()` renders with scale and rotation (angle).

## File Structure

| File | Purpose |
|------|---------|
| `index.html` | Canvas setup, script includes |
| `style.css` | Canvas centering and styling |
| `src/game.js` | Main loop, state machine, input handling, collision detection |
| `src/entities.js` | Player, Enemy, Bullet, Particle classes |
| `src/sprites.js` | Pixel art definitions, draw functions |
| `src/levels.js` | Level wave definitions |
| `src/ui.js` | Menu, HUD, and screen drawing |

## Common Workflows

### Add a New Level
1. Add entry to `LEVELS` array in `src/levels.js` with `name` and `waves`
2. Each wave is an array of `{ type, x, y }` spawn configs
3. Game auto-increments from level 4→5; after level 5 → WIN screen

### Add a New Enemy Type
1. Define two sprite animations in `src/sprites.js` (e.g., `ENEMY_D_IDLE`, `ENEMY_D_WALK`)
2. Create `ENEMY_D_FRAMES = [idle, walk]` and `drawEnemyD()` function
3. Add config to `Enemy` constructor in `src/entities.js`:
   ```javascript
   D: { speed: 80, health: 2, fireRate: 1.2, bulletSpeed: 120, range: 280, radius: 6 }
   ```
4. Use type `'D'` in level spawn configs

### Adjust Difficulty
- **Player:** `shootDelay` in Player constructor, `speed`, `health`
- **Enemies:** `speed`, `fireRate`, `bulletSpeed`, `preferredRange` per type
- **Levels:** Add more enemies or additional waves to `LEVELS` in `src/levels.js`

### Tweak Visuals
- **Colors:** Edit `COLORS` object in `src/sprites.js`
- **Sprite size:** Adjust `SPRITE_SCALE` in `src/sprites.js` (affects all sprites proportionally)
- **Canvas:** Modify `width`/`height` in `index.html`; grid size in `drawGrid()`

## Key Constants

| Name | Location | Effect |
|------|----------|--------|
| `SPRITE_SCALE` | `sprites.js` | Global size multiplier for all sprites |
| `PIXEL_SIZE` | `sprites.js` | Base pixel dimension (usually 8) |
| `shootDelay` | `entities.js` (Player) | Cooldown between player shots (ms) |
| `preferredRange` | `entities.js` (Enemy config) | Distance enemy tries to maintain from player |
| `invincibilityDuration` | `entities.js` (Player) | Flash duration after taking damage (ms) |

## Testing in Browser

Open `index.html` → Press ENTER to start → Arrow keys to move, mouse to aim, click to shoot.

**Quick test checklist:**
- Player moves smoothly in all directions
- Enemies spawn and chase correctly
- Bullets collide and deal damage
- Screen shake on hit
- Level transitions work
- Win screen appears after level 5

## Git Workflow (Critical)

**After every meaningful change, immediately commit and push:**

1. **Stage changes:** `git add src/entities.js src/levels.js` (specific files, not `.`)
2. **Commit with message:** `git commit -m "Feature: Add new enemy type X with AI behavior"`
3. **Push to GitHub:** `git push origin master`
4. **Verify on GitHub:** Visit https://github.com/arjtgit033/retro-shooter to confirm the push

**Commit early, commit often.** Each commit should represent one logical change (e.g., "Add new level", "Fix bullet collision", "Adjust enemy speed").

**Never force-push** (`git push --force`). If you need to undo, revert or create a new commit instead. This preserves history and allows reverting to any previous state.
