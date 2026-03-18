// Module: Virtual Pad (Glassmorphism + Responsivo)
// Versão com ajustes de transparência e posicionamento

(function() {
    const oldPad = document.getElementById('virtual-pad');
    if (oldPad) oldPad.remove();

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

        /* Fundo mais translúcido para não atrapalhar visibilidade */
        .glass {
            background: rgba(255, 255, 255, 0.05); /* reduzido de 0.1 para 0.05 */
            backdrop-filter: blur(8px); /* reduzido de 12px para 8px */
            -webkit-backdrop-filter: blur(8px);
            border: 1px solid rgba(255, 255, 255, 0.15);
            box-shadow: 0 4px 16px 0 rgba(0, 0, 0, 0.3);
            color: rgba(255, 255, 255, 0.8);
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

        .dpad {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            grid-template-rows: repeat(3, 1fr);
            gap: 6px;
            width: 140px;
            height: 140px;
            background: rgba(0, 0, 0, 0.2); /* reduzido de 0.3 */
            border-radius: 20px;
            padding: 8px;
            backdrop-filter: blur(4px);
        }

        .dpad-cell {
            background: rgba(255, 255, 255, 0.08); /* reduzido */
            border-radius: 12px;
            box-shadow: inset 0 -2px 0 rgba(0,0,0,0.2), 0 4px 0 #1a1a1a;
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
            box-shadow: 0 4px 0 #111, 0 6px 10px rgba(0,0,0,0.5);
            font-size: 24px;
            font-family: 'Arial Black', sans-serif;
            color: white;
            transition: all 0.05s;
        }

        .action-btn:active {
            transform: translateY(4px);
            box-shadow: 0 1px 0 #111, 0 3px 6px rgba(0,0,0,0.5);
            background: rgba(255, 255, 255, 0.2);
        }

        .action-btn.a { background: rgba(46, 204, 113, 0.3); }
        .action-btn.b { background: rgba(231, 76, 60, 0.3); }
        .action-btn.y { background: rgba(241, 196, 15, 0.3); color: #222; }
        .action-btn.pause { background: rgba(52, 152, 219, 0.3); }

        .center-btn {
            width: 80px;
            height: 50px;
            border-radius: 30px;
            background: rgba(0, 0, 0, 0.4);
            backdrop-filter: blur(6px);
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

        /* Portrait */
        @media (max-width: 800px) and (orientation: portrait) {
            body {
                justify-content: flex-start !important;
            }
            #virtual-pad {
                display: flex;
                flex-direction: row;
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
                gap: 8px;
            }
            /* Reduzir tamanho em telas muito pequenas */
            .dpad {
                width: 120px;
                height: 120px;
            }
            .action-btn {
                width: 50px;
                height: 50px;
                font-size: 20px;
            }
            .center-btn {
                width: 70px;
                height: 45px;
                font-size: 14px;
            }
        }

        /* Landscape */
        @media (max-width: 800px) and (orientation: landscape) {
            body {
                flex-direction: row !important;
                align-items: center;
                justify-content: center;
                gap: 10px;
                padding: 5px;
                margin: 0;
                min-height: 100vh;
                overflow: hidden; /* Evita rolagem indesejada */
            }
            #game-container {
                margin-bottom: 0;
                max-width: 400px;
                width: 100%;
                height: auto;
            }
            canvas {
                max-width: 100%;
                height: auto;
                display: block;
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
                padding: 10px 20px;
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
                bottom: 15px;
                display: flex;
                gap: 15px;
                pointer-events: auto;
            }
            /* Ajustar tamanho dos botões em landscape para não ocupar muito */
            .dpad {
                width: 120px;
                height: 120px;
            }
            .action-btn {
                width: 50px;
                height: 50px;
                font-size: 20px;
            }
            .center-btn {
                width: 70px;
                height: 40px;
                font-size: 14px;
            }
        }

        /* Telas muito pequenas (menos de 400px de largura) */
        @media (max-width: 400px) {
            .dpad {
                width: 100px;
                height: 100px;
                gap: 4px;
            }
            .action-btn {
                width: 45px;
                height: 45px;
                font-size: 18px;
            }
            .center-btn {
                width: 60px;
                height: 35px;
                font-size: 12px;
            }
        }
    `;
    document.head.appendChild(style);

    // Criação dos elementos (igual antes, sem mudanças)
    const pad = document.createElement('div');
    pad.id = 'virtual-pad';

    // Left area
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

    // Right area
    const rightArea = document.createElement('div');
    rightArea.className = 'right-area';
    const actionContainer = document.createElement('div');
    actionContainer.className = 'action-buttons';

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

    const row2 = document.createElement('div');
    row2.className = 'action-row';
    const btnY = document.createElement('div');
    btnY.className = 'action-btn y';
    btnY.textContent = 'Y';
    btnY.setAttribute('data-action', 'restart');
    row2.appendChild(btnY);

    const row3 = document.createElement('div');
    row3.className = 'action-row';
    const btnPauseRight = document.createElement('div');
    btnPauseRight.className = 'action-btn pause';
    btnPauseRight.textContent = '⏸';
    btnPauseRight.setAttribute('data-action', 'pause');
    row3.appendChild(btnPauseRight);

    actionContainer.appendChild(row1);
    actionContainer.appendChild(row2);
    actionContainer.appendChild(row3);
    rightArea.appendChild(actionContainer);

    // Center buttons
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
    const btnPause = document.createElement('div');
    btnPause.className = 'center-btn';
    btnPause.textContent = 'PAUSE';
    btnPause.setAttribute('data-action', 'pause');
    centerButtons.appendChild(btnStart);
    centerButtons.appendChild(btnSelect);
    centerButtons.appendChild(btnPause);

    pad.appendChild(leftArea);
    pad.appendChild(centerButtons);
    pad.appendChild(rightArea);

    const gameContainer = document.getElementById('game-container');
    if (gameContainer) {
        gameContainer.parentNode.insertBefore(pad, gameContainer.nextSibling);
    } else {
        document.body.appendChild(pad);
    }

    const actionMap = {
        'attack': playerAttack,
        'dash': playerDash,
        'restart': playerRestart,
        'start': playerStart,
        'menu': playerMenu,
        'pause': playerPause
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
