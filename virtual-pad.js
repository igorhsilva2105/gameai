// Module: Virtual Pad (Design aprimorado - inspirado no anexo)
// Glassmorphism refinado, botões mais elegantes, elementos decorativos.

(function() {
    // Remove qualquer pad antigo
    const oldPad = document.getElementById('virtual-pad');
    if (oldPad) oldPad.remove();

    // ========== ESTILOS ==========
    const style = document.createElement('style');
    style.textContent = `
        #virtual-pad {
            display: none;
            touch-action: manipulation;
            user-select: none;
            font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            z-index: 20;
            box-sizing: border-box;
        }

        /* Efeito glass refinado (mais suave) */
        .glass {
            background: rgba(255, 255, 255, 0.05);
            backdrop-filter: blur(12px);
            -webkit-backdrop-filter: blur(12px);
            border: 1px solid rgba(255, 255, 255, 0.1);
            box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.37);
            color: rgba(255, 255, 255, 0.9);
            transition: all 0.15s ease;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: bold;
        }

        .glass:active {
            transform: scale(0.92);
            background: rgba(255, 255, 255, 0.15);
            border-color: rgba(255, 255, 255, 0.3);
            box-shadow: 0 0 20px rgba(255, 255, 255, 0.2);
        }

        /* D-Pad - estilo mais quadrado e elegante */
        .dpad {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            grid-template-rows: repeat(3, 1fr);
            gap: 6px;
            width: 160px;
            height: 160px;
            background: transparent;
        }
        .dpad-cell {
            background: rgba(255, 255, 255, 0.05);
            backdrop-filter: blur(8px);
            border: 1px solid rgba(255, 255, 255, 0.15);
            border-radius: 16px;
            color: #ffd966;
            font-size: 30px;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            transition: all 0.1s;
            box-shadow: 0 4px 10px rgba(0, 0, 0, 0.3);
        }
        .dpad-cell:active {
            transform: scale(0.9);
            background: rgba(255, 255, 255, 0.2);
            border-color: rgba(255, 255, 255, 0.4);
        }
        .dpad-cell.empty {
            background: transparent;
            border: none;
            box-shadow: none;
            pointer-events: none;
        }

        /* Botões de ação (redondos, estilo PlayStation) */
        .action-buttons {
            display: flex;
            flex-direction: column;
            gap: 15px;
            background: transparent;
        }
        .action-row {
            display: flex;
            gap: 20px;
            justify-content: center;
        }
        .action-btn {
            width: 65px;
            height: 65px;
            border-radius: 50%;
            background: rgba(255, 255, 255, 0.05);
            backdrop-filter: blur(8px);
            border: 2px solid rgba(255, 255, 255, 0.2);
            box-shadow: 0 8px 20px rgba(0, 0, 0, 0.5);
            font-size: 28px;
            font-family: 'Arial Black', sans-serif;
            color: white;
            transition: all 0.1s;
        }
        .action-btn:active {
            transform: scale(0.85);
            background: rgba(255, 255, 255, 0.25);
            border-color: rgba(255, 255, 255, 0.5);
        }
        .action-btn.a { background: rgba(46, 204, 113, 0.3); }
        .action-btn.b { background: rgba(231, 76, 60, 0.3); }
        .action-btn.y { background: rgba(241, 196, 15, 0.3); color: #222; }

        /* Botões centrais (START/SELECT) */
        .center-buttons {
            display: flex;
            gap: 20px;
        }
        .center-btn {
            width: 90px;
            height: 50px;
            border-radius: 30px;
            background: rgba(0, 0, 0, 0.4);
            backdrop-filter: blur(8px);
            border: 1px solid rgba(255, 255, 255, 0.2);
            color: white;
            font-size: 18px;
            font-weight: bold;
            letter-spacing: 1px;
            cursor: pointer;
            transition: all 0.1s;
            box-shadow: 0 4px 10px rgba(0,0,0,0.5);
        }
        .center-btn:active {
            transform: scale(0.9);
            background: rgba(255, 255, 255, 0.2);
        }

        /* Elementos decorativos (touchpad e joysticks) - apenas para visual */
        .decor-touchpad {
            width: 200px;
            height: 80px;
            border-radius: 30px;
            background: rgba(255, 255, 255, 0.03);
            backdrop-filter: blur(4px);
            border: 1px solid rgba(255, 255, 255, 0.1);
            display: flex;
            align-items: center;
            justify-content: center;
            color: rgba(255, 255, 255, 0.3);
            font-size: 14px;
            text-transform: uppercase;
            letter-spacing: 2px;
            margin: 0 10px;
        }
        .decor-joystick {
            width: 70px;
            height: 70px;
            border-radius: 50%;
            background: rgba(255, 255, 255, 0.03);
            border: 1px solid rgba(255, 255, 255, 0.1);
            position: relative;
        }
        .decor-joystick::after {
            content: '';
            position: absolute;
            width: 35px;
            height: 35px;
            border-radius: 50%;
            background: rgba(255, 255, 255, 0.1);
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            border: 1px solid rgba(255, 255, 255, 0.2);
        }

        /* Layout Portrait */
        @media (max-width: 800px) and (orientation: portrait) {
            body {
                justify-content: flex-start !important;
            }
            #virtual-pad {
                display: flex;
                flex-direction: row;
                flex-wrap: wrap;
                justify-content: center;
                align-items: center;
                gap: 20px;
                margin-top: 10px;
                width: 100%;
                max-width: 600px;
                pointer-events: auto;
            }
            .left-area {
                order: 1;
            }
            .right-area {
                order: 2;
            }
            .center-buttons {
                order: 3;
                width: 100%;
                justify-content: center;
                margin-top: 10px;
            }
            .decor-row {
                display: none; /* esconde elementos decorativos no portrait para economizar espaço */
            }
        }

        /* Layout Landscape */
        @media (max-width: 800px) and (orientation: landscape) {
            body {
                flex-direction: row !important;
                align-items: center;
                justify-content: center;
                gap: 10px;
                padding: 5px;
                height: 100vh;
                overflow: hidden;
            }
            #game-container {
                margin-bottom: 0;
                max-height: 100vh;
                display: flex;
                align-items: center;
            }
            canvas {
                max-width: 100%;
                max-height: 100vh;
                width: auto;
                height: auto;
            }
            #virtual-pad {
                display: flex;
                flex-direction: row;
                justify-content: space-between;
                align-items: center;
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                padding: 10px;
                box-sizing: border-box;
                pointer-events: none;
            }
            #virtual-pad > .left-area,
            #virtual-pad > .right-area {
                pointer-events: auto;
            }
            #virtual-pad > .center-buttons {
                position: absolute;
                left: 50%;
                transform: translateX(-50%);
                bottom: 20px;
                display: flex;
                gap: 20px;
                pointer-events: auto;
            }
            .decor-row {
                position: absolute;
                top: 10px;
                left: 0;
                width: 100%;
                display: flex;
                justify-content: center;
                gap: 20px;
                pointer-events: none;
                opacity: 0.5;
            }
        }

        /* Ajustes para telas muito pequenas */
        @media (max-width: 600px) {
            .dpad { width: 140px; height: 140px; }
            .dpad-cell { font-size: 26px; }
            .action-btn { width: 55px; height: 55px; font-size: 24px; }
            .center-btn { width: 80px; height: 45px; font-size: 16px; }
        }
    `;
    document.head.appendChild(style);

    // ========== CRIAÇÃO DOS ELEMENTOS ==========
    const pad = document.createElement('div');
    pad.id = 'virtual-pad';

    // Linha decorativa superior (touchpad + joysticks) - apenas visual
    const decorRow = document.createElement('div');
    decorRow.className = 'decor-row';
    decorRow.innerHTML = `
        <div class="decor-joystick"></div>
        <div class="decor-touchpad">TOUCHPAD</div>
        <div class="decor-joystick"></div>
    `;
    pad.appendChild(decorRow);

    // Área esquerda (D-Pad)
    const leftArea = document.createElement('div');
    leftArea.className = 'left-area';

    const dpad = document.createElement('div');
    dpad.className = 'dpad';
    const dpadLayout = [
        ['', '▲', ''],
        ['◀', '', '▶'],
        ['', '▼', '']
    ];
    const keyMap = { '▲': 'ArrowUp', '▼': 'ArrowDown', '◀': 'ArrowLeft', '▶': 'ArrowRight' };

    dpadLayout.forEach(row => {
        row.forEach(symbol => {
            const cell = document.createElement('div');
            cell.className = 'dpad-cell' + (symbol === '' ? ' empty' : '');
            if (symbol) {
                cell.textContent = symbol;
                const key = keyMap[symbol];
                const pressHandler = (e) => {
                    e.preventDefault();
                    keys[key] = true;
                    window.inputType.set('mobile');
                };
                const releaseHandler = (e) => {
                    e.preventDefault();
                    delete keys[key];
                };
                cell.addEventListener('touchstart', pressHandler);
                cell.addEventListener('touchend', releaseHandler);
                cell.addEventListener('touchcancel', releaseHandler);
                cell.addEventListener('mousedown', pressHandler);
                cell.addEventListener('mouseup', releaseHandler);
                cell.addEventListener('mouseleave', releaseHandler);
            }
            dpad.appendChild(cell);
        });
    });
    leftArea.appendChild(dpad);

    // Área direita (botões de ação)
    const rightArea = document.createElement('div');
    rightArea.className = 'right-area';

    const actionContainer = document.createElement('div');
    actionContainer.className = 'action-buttons';

    // Linha superior: A e B
    const row1 = document.createElement('div');
    row1.className = 'action-row';
    const btnA = document.createElement('div');
    btnA.className = 'action-btn a';
    btnA.textContent = 'A';
    btnA.setAttribute('data-action', 'attack');
    const btnB = document.createElement('div');
    btnB.className = 'action-btn b';
    btnB.textContent = 'B';
    btnB.setAttribute('data-action', 'dash');
    row1.appendChild(btnA);
    row1.appendChild(btnB);

    // Linha inferior: Y (e talvez um espaço vazio para simetria)
    const row2 = document.createElement('div');
    row2.className = 'action-row';
    const btnY = document.createElement('div');
    btnY.className = 'action-btn y';
    btnY.textContent = 'Y';
    btnY.setAttribute('data-action', 'restart');
    // Adiciona um espaço vazio para manter o centro? Não, deixamos só o Y
    row2.appendChild(btnY);

    actionContainer.appendChild(row1);
    actionContainer.appendChild(row2);
    rightArea.appendChild(actionContainer);

    // Botões centrais (START/SELECT)
    const centerButtons = document.createElement('div');
    centerButtons.className = 'center-buttons';

    const btnStart = document.createElement('div');
    btnStart.className = 'center-btn';
    btnStart.textContent = 'START';
    btnStart.setAttribute('data-action', 'start');

    const btnSelect = document.createElement('div');
    btnSelect.className = 'center-btn';
    btnSelect.textContent = 'SELECT';
    btnSelect.setAttribute('data-action', 'menu');

    centerButtons.appendChild(btnStart);
    centerButtons.appendChild(btnSelect);

    // Monta o pad
    pad.appendChild(leftArea);
    pad.appendChild(centerButtons);
    pad.appendChild(rightArea);

    // Insere o pad após o game-container
    const gameContainer = document.getElementById('game-container');
    if (gameContainer) {
        gameContainer.parentNode.insertBefore(pad, gameContainer.nextSibling);
    } else {
        document.body.appendChild(pad);
    }

    // Mapeamento de ações
    const actionMap = {
        'attack': playerAttack,
        'dash': playerDash,
        'restart': playerRestart,
        'start': (e) => {
            e.preventDefault();
            window.inputType.set('mobile');
            if (currentState === GameState.MENU) {
                playerStart();
            } else if (currentState === GameState.PLAYING) {
                if (window.tutorial && window.tutorial.isActive()) {
                    playerStart(); // pula tutorial
                } else {
                    playerPause();
                }
            } else if (currentState === GameState.PAUSED) {
                playerPause();
            }
        },
        'menu': playerMenu
    };

    const addEvents = (el) => {
        const action = el.getAttribute('data-action');
        if (action && actionMap[action]) {
            const handler = (e) => {
                e.preventDefault();
                window.inputType.set('mobile');
                actionMap[action](e);
            };
            el.addEventListener('touchstart', handler);
            el.addEventListener('mousedown', handler);
        }
    };

    pad.querySelectorAll('[data-action]').forEach(addEvents);
})();
