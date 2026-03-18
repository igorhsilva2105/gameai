// Module: Tutorial (ensina passo a passo)

(function() {
    // Etapas do tutorial
    const STEPS = {
        MOVE: 0,
        ATTACK: 1,
        DASH: 2,
        COLLECT_KEY: 3,
        OPEN_DOOR: 4,
        COMPLETED: 5,
        SKIPPED: 6  // Novo estado para tutorial pulado
    };

    let currentStep = STEPS.MOVE;
    let tutorialActive = true;
    let moveDone = false;
    let attackDone = false;
    let dashDone = false;
    let keyCollected = false;
    let doorOpened = false;

    window.tutorial = {
        isActive: function() {
            return tutorialActive && dungeonLevel === 1 && currentState === GameState.PLAYING && currentStep !== STEPS.SKIPPED;
        },
        getStep: function() {
            return currentStep;
        },
        skip: function() {
            if (tutorialActive && dungeonLevel === 1) {
                currentStep = STEPS.SKIPPED;
                tutorialActive = false;
            }
        },
        onMove: function() {
            if (!tutorialActive || currentStep !== STEPS.MOVE) return;
            moveDone = true;
            currentStep = STEPS.ATTACK;
        },
        onAttack: function() {
            if (!tutorialActive || currentStep !== STEPS.ATTACK) return;
            attackDone = true;
            currentStep = STEPS.DASH;
        },
        onDash: function() {
            if (!tutorialActive || currentStep !== STEPS.DASH) return;
            dashDone = true;
            currentStep = STEPS.COLLECT_KEY;
        },
        onKeyCollected: function() {
            if (!tutorialActive || currentStep !== STEPS.COLLECT_KEY) return;
            keyCollected = true;
            currentStep = STEPS.OPEN_DOOR;
        },
        onDoorOpened: function() {
            if (!tutorialActive || currentStep !== STEPS.OPEN_DOOR) return;
            doorOpened = true;
            currentStep = STEPS.COMPLETED;
            tutorialActive = false;
        },
        reset: function() {
            currentStep = STEPS.MOVE;
            moveDone = false;
            attackDone = false;
            dashDone = false;
            keyCollected = false;
            doorOpened = false;
            tutorialActive = true;
        },
        draw: function(ctx) {
            if (!this.isActive()) return;

            const inputType = window.inputType.get();
            ctx.save();
            
            // Fundo semi-transparente com borda
            ctx.fillStyle = 'rgba(0,0,0,0.8)';
            ctx.strokeStyle = '#ffd966';
            ctx.lineWidth = 3;
            ctx.fillRect(20, 200, 360, 180); // Aumentei a altura para caber a mensagem de pular
            ctx.strokeRect(20, 200, 360, 180);

            ctx.shadowColor = '#000';
            ctx.shadowBlur = 6;
            ctx.shadowOffsetX = 2;
            ctx.shadowOffsetY = 2;
            ctx.textAlign = 'left';

            // Título
            ctx.font = 'bold 18px "Courier New", monospace';
            ctx.fillStyle = '#ffd966';
            ctx.fillText('TUTORIAL', 30, 230);

            ctx.font = 'bold 14px "Courier New", monospace';
            ctx.fillStyle = '#fff';

            let instruction = '';
            let target = '';

            switch (currentStep) {
                case STEPS.MOVE:
                    instruction = 'Mova-se usando:';
                    if (inputType === 'gamepad') target = 'Direcional';
                    else if (inputType === 'mobile') target = 'Botões direcionais';
                    else target = 'Setas (↑↓←→)';
                    break;
                case STEPS.ATTACK:
                    instruction = 'Ataque o slime usando:';
                    if (inputType === 'gamepad') target = 'A';
                    else if (inputType === 'mobile') target = 'Botão A';
                    else target = 'Z';
                    break;
                case STEPS.DASH:
                    instruction = 'Use o dash:';
                    if (inputType === 'gamepad') target = 'B';
                    else if (inputType === 'mobile') target = 'Botão B';
                    else target = 'X';
                    break;
                case STEPS.COLLECT_KEY:
                    instruction = 'Pegue a chave que o slime dropou';
                    target = 'Ande até ela';
                    break;
                case STEPS.OPEN_DOOR:
                    instruction = 'Vá até a porta dourada';
                    target = 'Ela se abrirá com a chave';
                    break;
            }

            ctx.fillText(instruction, 30, 260);
            ctx.fillStyle = '#ffd966';
            ctx.fillText(target, 30, 290);

            // Mensagem de como pular
            ctx.font = '12px "Courier New", monospace';
            ctx.fillStyle = '#aaa';
            if (inputType === 'gamepad' || inputType === 'mobile') {
                ctx.fillText('Pressione START para pular', 30, 330);
            } else {
                ctx.fillText('Pressione ESC para pular', 30, 330);
            }

            ctx.restore();
        }
    };
})();