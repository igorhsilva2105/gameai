// Module: Gamepad Support

let gamepadIndex = null;
let previousButtonStates = {};

window.addEventListener('gamepadconnected', (e) => {
    gamepadIndex = e.gamepad.index;
    window.inputType.set('gamepad');
});

window.addEventListener('gamepaddisconnected', () => {
    gamepadIndex = null;
    window.inputType.set('keyboard');
    delete keys['ArrowUp'];
    delete keys['ArrowDown'];
    delete keys['ArrowLeft'];
    delete keys['ArrowRight'];
});

(function checkExistingGamepad() {
    const gamepads = navigator.getGamepads ? navigator.getGamepads() : [];
    for (let i = 0; i < gamepads.length; i++) {
        if (gamepads[i]) {
            gamepadIndex = i;
            window.inputType.set('gamepad');
            break;
        }
    }
})();

// Funções de ação
function playerAttack() {
    if (currentState !== GameState.PLAYING) return;
    if (!player.isAttacking && !player.isDashing) {
        player.isAttacking = true;
        player.attackTimer = 12;
        playSound('attack');
        if (window.tutorial) window.tutorial.onAttack();
    }
}

function playerDash() {
    if (currentState !== GameState.PLAYING) return;
    if (!player.isDashing && player.dashCooldown <= 0) {
        player.isDashing = true;
        player.dashTimer = 12;
        player.invulnTimer = 14;
        player.isAttacking = false;
        playSound('dash');
        if (window.tutorial) window.tutorial.onDash();
    }
}

function playerRestart() {
    if (currentState === GameState.GAMEOVER || currentState === GameState.PAUSED) {
        startNewRun();
    }
}

function playerMenu() {
    if (currentState === GameState.PAUSED || currentState === GameState.GAMEOVER) {
        resetGameData();
        currentState = GameState.MENU;
        if (window.uiManager) uiManager.update();
    }
}

function playerPause() {
    if (currentState === GameState.PLAYING) {
        currentState = GameState.PAUSED;
    } else if (currentState === GameState.PAUSED) {
        currentState = GameState.PLAYING;
    }
}

function playerStart() {
    if (currentState === GameState.MENU) {
        startNewRun();
    } else if (currentState === GameState.PLAYING && window.tutorial && window.tutorial.isActive()) {
        // Pular tutorial com START durante o jogo
        window.tutorial.skip();
    }
}

// Nota: A função playerStart é chamada pelo botão START no gamepad e também pelo Enter no teclado (via input-system.js)
// Então a modificação acima cobre ambos os casos.