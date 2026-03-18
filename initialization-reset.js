// Module: Initialization & Reset

function resetGameData() {
    stopMusic(); 
    enemies.length = 0;
    projectiles.length = 0;
    drops.length = 0;
    keysOnGround.length = 0;
    particles.length = 0;
    dungeonLevel = 1;
    totalKills = 0;
    standardKeyDropped = false;
    shakeTimer = 0;
    biomeSequence = generateBiomeSequence(GLOBAL_SEED);
    player.health = 3;
    player.maxHealth = 3;
    player.keys = 0;
    player.speedBoostTimer = 0;
    player.swordBoostTimer = 0;
    player.shieldActive = false;
    player.isDashing = false;
    player.dashTimer = 0;
    player.dashCooldown = 0;
    player.dashAfterimages.length = 0;
    player.invulnTimer = 0;
    player.isAttacking = false;
    player.attackTimer = 0;
    player.stepTimer = 0;

    // Reset tutorial
    if (window.tutorial && window.tutorial.reset) window.tutorial.reset();
}

function startNewRun() {
    stopMusic(); 
    resetGameData();
    initLevel();
    transition.alpha = 0;
    currentState = GameState.PLAYING;
    if (window.uiManager) uiManager.update();
}