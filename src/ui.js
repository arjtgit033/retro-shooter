function drawHUD(ctx, canvas, player, level, wave, totalWaves, score) {
    ctx.fillStyle = COLORS.white;
    ctx.font = '14px monospace';

    // Health
    ctx.fillText(`HP: ${player.health}/${player.maxHealth}`, 10, 20);

    // Level and wave
    ctx.fillText(`LEVEL ${level + 1} WAVE ${wave}/${totalWaves}`, canvas.width / 2 - 60, 20);

    // Score
    ctx.fillText(`SCORE: ${score}`, canvas.width - 120, 20);
}

function drawStartMenu(ctx, canvas) {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = COLORS.cyan;
    ctx.font = 'bold 32px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('RETRO SHOOTER', canvas.width / 2, 100);

    ctx.fillStyle = COLORS.white;
    ctx.font = '16px monospace';
    ctx.fillText('Arrow Keys to Move', canvas.width / 2, 200);
    ctx.fillText('Mouse to Aim', canvas.width / 2, 240);
    ctx.fillText('Click to Shoot', canvas.width / 2, 280);

    ctx.fillStyle = COLORS.yellow;
    ctx.font = 'bold 20px monospace';
    ctx.fillText('PRESS ENTER TO START', canvas.width / 2, 400);

    ctx.textAlign = 'left';
}

function drawLevelComplete(ctx, canvas, level, score) {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = COLORS.green;
    ctx.font = 'bold 32px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('LEVEL COMPLETE!', canvas.width / 2, 150);

    ctx.fillStyle = COLORS.white;
    ctx.font = '20px monospace';
    ctx.fillText(`LEVEL ${level + 1} CLEAR`, canvas.width / 2, 250);
    ctx.fillText(`SCORE: ${score}`, canvas.width / 2, 310);

    ctx.fillStyle = COLORS.yellow;
    ctx.font = 'bold 18px monospace';
    ctx.fillText('PRESS ENTER FOR NEXT LEVEL', canvas.width / 2, 420);

    ctx.textAlign = 'left';
}

function drawGameOver(ctx, canvas, finalScore) {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = COLORS.red;
    ctx.font = 'bold 40px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('GAME OVER', canvas.width / 2, 150);

    ctx.fillStyle = COLORS.white;
    ctx.font = '24px monospace';
    ctx.fillText(`FINAL SCORE: ${finalScore}`, canvas.width / 2, 280);

    ctx.fillStyle = COLORS.yellow;
    ctx.font = 'bold 18px monospace';
    ctx.fillText('PRESS ENTER TO RESTART', canvas.width / 2, 400);

    ctx.textAlign = 'left';
}

function drawWinScreen(ctx, canvas, totalScore) {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = COLORS.yellow;
    ctx.font = 'bold 48px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('YOU WIN!', canvas.width / 2, 150);

    ctx.fillStyle = COLORS.lightGreen;
    ctx.font = '24px monospace';
    ctx.fillText(`TOTAL SCORE: ${totalScore}`, canvas.width / 2, 280);

    ctx.fillStyle = COLORS.cyan;
    ctx.font = '18px monospace';
    ctx.fillText('Thanks for Playing!', canvas.width / 2, 380);

    ctx.textAlign = 'left';
}
