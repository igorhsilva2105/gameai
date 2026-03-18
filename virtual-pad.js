// Module: Virtual Pad (Glassmorphism + Responsivo)
// Versão final com ajustes de layout e remoção do botão pause duplicado.
// Corrigido: START pula tutorial durante o tutorial e pausa depois.

(function() {
    // Remove qualquer pad antigo que possa existir
    const oldPad = document.getElementById('virtual-pad');
    if (oldPad) oldPad.remove();

    // ========== ESTILOS ==========
    const style = document.createElement('style');
    style.textContent = `
        /* Container principal do pad – visível apenas em telas pequenas */
        #virtual-pad {
            display: none;
            touch-action: manipulation;
            user-select: none;
            font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            z-index: 20;
            box-sizing: border-box;
        }

        /* Efeito glass base – mais translúcido */
        .glass {
            background: rgba(255, 255, 255, 0.05);
            backdrop-filter: blur(12px);
            -webkit-backdrop-filter: blur(12px);
            border: 1px solid rgba(255, 255, 255, 0.15);
            box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.5);
            color: rgba(255, 255, 255, 0.9);
            transition: all 0.1s ease;
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
        }

        /* D-Pad */
        .dpad {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            grid-template-rows: repeat(3, 1fr);
            gap: 6px;
            width: 140px;
            height: 140px;
            background: rgba(0, 0, 0, 0.2);
            border-radius: 20px;
            padding: 8px;
            backdrop-filter: blur(4px);
        }
        .dpad-cell {
            background: rgba(255, 255, 255, 0.08);
            border-radius: 12px;
            box-shadow: inset 0 -2px 0 rgba(0,0,0,0.3), 0 4px 0 #1a1a1a;
            color: #ffd966;
            font-size: 28px;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            transition: all 0.05s;
        }
        .dpad-cell:active {
            transform: translateY(4px);
            box-shadow: inset 0 -1px 0 #0a0a0a, 0 2px 0 #1a1a1a;
        }
        .dpad-cell.empty {
            background: transparent;
            box-shadow: none;
            pointer-events: none;
        }

        /* Botões de ação */
        .action-buttons {
            display: flex;
            flex-direction: column;
            gap: 12px;
            background: rgba(0, 0, 0, 0.2);
            border-radius: 40px;
            padding: 20px 15px;
            backdrop-filter: blur(4px);
        }
        .action-row {
            display: flex;
            gap: 20px;
            justify-content: center;
        }
        .action-btn {
            width: 60px;
            height: 60px;
            border-radius: 50%;
            background: rgba(255, 255, 255, 0.08);
            border: 1px solid rgba(255, 255, 255, 0.15);
            box-shadow: 0 6px 0 #111, 0 8px 12px rgba(0,0,0,0.6);
            font-size: 24px;
            font-family: 'Arial Black', sans-serif;
            color: white;
            transition: all 0.05s;
        }
        .action-btn:active {
            transform: translateY(6px);
            box-shadow: 0 2px 0 #111, 0 4px 8px rgba(0,0,0,0.6);
            background: rgba(255, 255, 255, 0.2);
        }
        .action-btn.a { background: rgba(46, 204, 113, 0.3); }
        .action-btn.b { background: rgba(231, 76, 60, 0.3); }
        .action-btn.y { background: rgba(241, 196, 15, 0.3); color: #222; }

        /* Botões centrais (start/select) */
        .center-btn {
            width: 80px;
            height: 50px;
            border-radius: 30px;
            background: rgba(0, 0, 0, 0.4);
            backdrop-filter: blur(8px);
            border: 1px solid rgba(255, 255, 255, 0.15);
            color: white;
            font-size: 16px;
            font-weight: bold;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            transition: all 0.1s;
        }
        .center-btn:active {
            transform: scale(0.9);
            background: rgba(255, 255, 255, 0.15);
        }

        /* Layout para portrait (celular em pé) – tudo abaixo do canvas com quebra de linha se necessário */
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
                gap: 15px;
                margin-top: 10px;
                width: 100%;
                max-width: 600px;
                pointer-events: auto;
            }
            .center-buttons {
                display: flex;
                gap: 15px;
                order: 2; /* Coloca os centrais abaixo dos outros */
                width: 100%;
                justify-content: center;
                margin-top: 5px;
            }
            .left-area {
                order: 1;
            }
            .right-area {
                order: 1;
            }
        }

        /* Layout para landscape (celular deitado) – botões laterais e centrais sobre o canvas */
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
                max-height: 100vh;
                width: auto;
                max-width: 100%;
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
        }

        /* Ajustes para telas muito pequenas */
        @media (max-width: 600px) {
            .dpad { width: 120px; height: 120px; }
            .action-btn { width: 50px; height: 50px; font-size: 20px; }
            .center-btn { width: 70px; height: 45px; font-size: 14px; }
        }
    `;
    document.head.appendChild(style);

    // ========== CRIAÇÃO DOS ELEMENTOS ==========

    const pad = document.createElement('div');
    pad.id = 'virtual-pad';

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
                // Eventos de toque e mouse
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

    // Área direita (botões de ação) – sem pause
    const rightArea = document.createElement('div');
    rightArea.className = 'right-area';

    const actionContainer = document.createElement('div');
    actionContainer.className = 'action-buttons';

    // Linha 1: A e B
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

    // Linha 2: Y
    const row2 = document.createElement('div');
    row2.className = 'action-row';
    const btnY = document.createElement('div');
    btnY.className = 'action-btn y';
    btnY.textContent = 'Y';
    btnY.setAttribute('data-action', 'restart');
    row2.appendChild(btnY);

    actionContainer.appendChild(row1);
    actionContainer.appendChild(row2);
    rightArea.appendChild(actionContainer);

    // Botões centrais (start, select) – sem pause
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

    // Insere o pad no DOM após o game-container
    const gameContainer = document.getElementById('game-container');
    if (gameContainer) {
        gameContainer.parentNode.insertBefore(pad, gameContainer.nextSibling);
    } else {
        document.body.appendChild(pad);
    }

    // Adiciona eventos aos botões de ação
    const actionMap = {
        'attack': playerAttack,
        'dash': playerDash,
        'restart': playerRestart,
        'start': (e) => {
            e.preventDefault();
            window.inputType.set('mobile');
            if (currentState === GameState.MENU) {
                playerStart(); // inicia o jogo
            } else if (currentState === GameState.PLAYING) {
                // Se o tutorial estiver ativo, pula; senão, pausa
                if (window.tutorial && window.tutorial.isActive()) {
                    playerStart(); // isso vai pular o tutorial
                } else {
                    playerPause();
                }
            } else if (currentState === GameState.PAUSED) {
                playerPause(); // despausa
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
                actionMap[action]();
            };
            el.addEventListener('touchstart', handler);
            el.addEventListener('mousedown', handler);
        }
    };

    pad.querySelectorAll('[data-action]').forEach(addEvents);
})();
