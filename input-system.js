// Module: Input System

const keys = {};

window.addEventListener('keydown', e => {
    if (!['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'KeyZ', 'KeyX', 'Escape', 'Enter', 'KeyR', 'KeyM'].includes(e.code)) return;
    e.preventDefault();

    if (window.inputType.get() !== 'keyboard') {
        window.inputType.set('keyboard');
    }

    if (audioCtx && audioCtx.state === 'suspended') {
        audioCtx.resume();
    }

    // Pular tutorial com ESC
    if (e.code === 'Escape' && window.tutorial && window.tutorial.isActive()) {
        window.tutorial.skip();
        return;
    }

    if (e.code === 'ArrowUp' || e.code === 'ArrowDown' || e.code === 'ArrowLeft' || e.code === 'ArrowRight') {
        keys[e.code] = true;
        return;
    }

    if (e.code === 'KeyM') { playerMenu(); return; }
    if (e.code === 'KeyR') { playerRestart(); return; }
    if (e.code === 'Enter') { playerStart(); return; }
    if (e.code === 'Escape') { playerPause(); return; }
    if (e.code === 'KeyZ') { playerAttack(); return; }
    if (e.code === 'KeyX') { playerDash(); return; }
});

window.addEventListener('keyup', e => {
    if (keys.hasOwnProperty(e.code)) {
        delete keys[e.code];
    }
});

function handleGamepad() {
    if (gamepadIndex === null) return;
    const gamepad = navigator.getGamepads()[gamepadIndex];
    if (!gamepad) return;

    const deadzone = 0.2;
    const axes = gamepad.axes;
    const buttons = gamepad.buttons;

    delete keys['ArrowUp'];
    delete keys['ArrowDown'];
    delete keys['ArrowLeft'];
    delete keys['ArrowRight'];

    const stickX = axes[0] || 0;
    const stickY = axes[1] || 0;

    if (Math.abs(stickX) > deadzone || Math.abs(stickY) > deadzone) {
        if (stickY < -deadzone) keys['ArrowUp'] = true;
        if (stickY > deadzone) keys['ArrowDown'] = true;
        if (stickX < -deadzone) keys['ArrowLeft'] = true;
        if (stickX > deadzone) keys['ArrowRight'] = true;
        if (window.inputType.get() !== 'gamepad') {
            window.inputType.set('gamepad');
        }
    } else {
        if (buttons[12] && buttons[12].pressed) keys['ArrowUp'] = true;
        if (buttons[13] && buttons[13].pressed) keys['ArrowDown'] = true;
        if (buttons[14] && buttons[14].pressed) keys['ArrowLeft'] = true;
        if (buttons[15] && buttons[15].pressed) keys['ArrowRight'] = true;
        if (buttons[12]?.pressed || buttons[13]?.pressed || buttons[14]?.pressed || buttons[15]?.pressed) {
            if (window.inputType.get() !== 'gamepad') {
                window.inputType.set('gamepad');
            }
        }
    }

    const buttonActions = [
        { index: 0, action: playerAttack },
        { index: 1, action: playerDash },
        { index: 3, action: playerRestart },
        { index: 8, action: playerMenu },
        { index: 9, action: playerStart },
        { index: 7, action: playerPause }
    ];

    buttonActions.forEach(({ index, action }) => {
        const pressed = buttons[index] && buttons[index].pressed;
        const prevPressed = previousButtonStates[index] || false;
        if (pressed && !prevPressed) {
            action();
            if (window.inputType.get() !== 'gamepad') {
                window.inputType.set('gamepad');
            }
        }
        previousButtonStates[index] = pressed;
    });
}