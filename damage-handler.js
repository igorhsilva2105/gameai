// Module: Damage Handler

function damagePlayer(amount) {
    if (player.invulnTimer > 0) return;

    if (player.shieldActive) {
        player.shieldActive = false;
        player.invulnTimer = 30;
        shakeTimer = 8;
        if (window.uiManager) uiManager.update();
        return;
    }

    player.health -= amount;
    player.invulnTimer = 60;
    shakeTimer = 15;
    playSound('playerDamage');
    if (window.uiManager) uiManager.update();

    if (player.health <= 0) {
        currentState = GameState.GAMEOVER;
        playSound('playerDeath');
        if (window.uiManager) uiManager.update();
    }
}