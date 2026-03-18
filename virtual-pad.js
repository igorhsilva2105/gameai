// Module: Virtual Pad (Glassmorphism style) – Criado dinamicamente

(function() {
    // Evita recriar se já existir
    if (document.getElementById('virtual-pad')) return;

    // Cria o container principal
    const pad = document.createElement('div');
    pad.id = 'virtual-pad';
    pad.className = 'virtual-pad glass-pad';

    // ========== ESTILOS ==========
    const style = document.createElement('style');
    style.textContent = `
        .glass-pad {
            display: none;
            width: 100%;
            max-width: 600px;
            justify-content: space-between;
            align-items: center;
            margin-top: 10px;
            gap: 20px;
            touch-action: manipulation;
            font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            color: rgba(255, 255, 255, 0.8);
        }

        /* Glassmorphism base */
        .glass {
            background: rgba(255, 255, 255, 0.05);
            backdrop-filter: blur(12px);
            -webkit-backdrop-filter: blur(12px);
            border: 1px solid rgba(255, 255, 255, 0.1);
            box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.37);
            transition: all 0.1s ease;
            cursor: pointer;
            user-select: none;
        }

        .glass:active {
            transform: scale(0.92);
            background: rgba(255, 255, 255, 0.15);
            box-shadow: 0 0 15px rgba(255, 255, 255, 0.2);
        }

        /* D-Pad (direcionais) */
        .dpad-container {
            display: grid;
            grid-template-rows: repeat(3, 1fr);
            grid-template-columns: repeat(3, 1fr);
            gap: 6px;
            width: 140px;
            height: 140px;
            background: rgba(30,30,30,0.8);
            border-radius: 20px;
            padding: 8px;
            box-shadow: 0 8px 0 #111, 0 10px 20px rgba(0,0,0,0.5);
        }

        .dpad-cell {
            display: flex;
            align-items: center;
            justify-content: center;
            background: rgba(255,255,255,0.05);
            border-radius: 12px;
            box-shadow: inset 0 -2px 0 rgba(0,0,0,0.2), 0 4px 0 #1a1a1a;
            color: #ffd966;
            font-size: 28px;
            font-weight: bold;
            cursor: pointer;
            touch-action: manipulation;
            transition: all 0.05s;
            backdrop-filter: blur(4px);
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

        /* Botões de ação (estilo glass) */
        .action-buttons {
            display: flex;
            flex-direction: column;
            gap: 12px;
            background: rgba(30,30,30,0.8);
            border-radius: 40px;
            padding: 20px 15px;
            box-shadow: 0 8px 0 #111, 0 10px 20px rgba(0,0,0,0.5);
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
            background: rgba(255,255,255,0.05);
            backdrop-filter: blur(8px);
            border: 1px solid rgba(255,255,255,0.15);
            box-shadow: 0 6px 0 #111, 0 8px 12px rgba(0,0,0,0.6);
            color: white;
            font-weight: bold;
            font-size: 24px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-family: 'Arial Black', sans-serif;
            cursor: pointer;
            touch-action: manipulation;
            transition: all 0.05s;
        }

        .action-btn:active {
            transform: translateY(6px);
            box-shadow: 0 2px 0 #111, 0 4px 8px rgba(0,0,0,0.6);
            background: rgba(255,255,255,0.2);
        }

        .action-btn.a { background: rgba(46, 204, 113, 0.3); }
        .action-btn.b { background: rgba(231, 76, 60, 0.3); }
        .action-btn.y { background: rgba(241, 196, 15, 0.3); color: #222; }
        .action-btn.start, .action-btn.select, .action-btn.pause { 
            width: 70px; 
            border-radius: 40px; 
            background: rgba(85, 85, 85, 0.3); 
            font-size: 18px;
            box-shadow: 0 4px 0 #222;
        }
        .action-btn.pause { background: rgba(52, 152, 219, 0.3); }

        /* Touchpad decorativo (opcional) */
        .touchpad-decor {
            width: 100px;
            height: 50px;
            border-radius: 20px;
            background: rgba(255,255,255,0.03);
            border: 1px solid rgba(255,255,255,0.1);
            backdrop-filter: blur(4px);
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 12px;
            opacity: 0.5;
            margin: 0 10px;
        }

        /* Joysticks decorativos */
        .joystick-decor {
            width: 60px;
            height: 60px;
            border-radius: 50%;
            background: rgba(255,255,255,0.03);
            border: 1px solid rgba(255,255,255,0.1);
            position: relative;
        }
        .joystick-decor::after {
            content: '';
            position: absolute;
            width: 30px;
            height: 30px;
            border-radius: 50%;
            background: rgba(255,255,255,0.1);
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            border: 1px solid rgba(255,255,255,0.2);
        }

        @media (max-width: 800px) {
            .glass-pad {
                display: flex;
            }
        }
        @media (max-width: 800px) and (orientation: portrait) {
            .glass-pad {
                flex-direction: row;
                justify-content: space-around;
                max-width: 100%;
            }
            .dpad-container {
                width: 130px;
                height: 130px;
            }
            .action-btn {
                width: 55px;
                height: 55px;
                font-size: 22px;
            }
            .action-btn.start, .action-btn.select, .action-btn.pause {
                width: 65px;
                font-size: 16px;
            }
        }
        @media (max-width: 800px) and (orientation: landscape) {
            body {
                flex-direction: row;
                align-items: center;
                justify-content: center;
                gap: 10px;
                padding: 5px;
            }
            .glass-pad {
                flex-direction: row;
                margin-top: 0;
                width: auto;
                max-width: none;
            }
        }
    `;
    document.head.appendChild(style);

    // ========== ESTRUTURA DO PAD ==========

    // Linha superior com touchpad decorativo e gatilhos (opcional, apenas visual)
    const topRow = document.createElement('div');
    topRow.style.display = 'flex';
    topRow.style.justifyContent = 'space-between';
    topRow.style.width = '100%';
    topRow.style.marginBottom = '10px';

    const leftTrigger = document.createElement('div');
    leftTrigger.className = 'glass action-btn start';
    leftTrigger.textContent = 'L1';
    leftTrigger.style.width = '50px';
    leftTrigger.style.height = '30px';
    leftTrigger.style.borderRadius = '20px 20px 10px 10px';
    leftTrigger.style.fontSize = '14px';

    const touchpad = document.createElement('div');
    touchpad.className = 'touchpad-decor';
    touchpad.textContent = 'TOUCH';

    const rightTrigger = document.createElement('div');
    rightTrigger.className = 'glass action-btn start';
    rightTrigger.textContent = 'R1';
    rightTrigger.style.width = '50px';
    rightTrigger.style.height = '30px';
    rightTrigger.style.borderRadius = '20px 20px 10px 10px';
    rightTrigger.style.fontSize = '14px';

    topRow.appendChild(leftTrigger);
    topRow.appendChild(touchpad);
    topRow.appendChild(rightTrigger);
    pad.appendChild(topRow);

    // Linha principal: D-Pad e Botões de ação
    const mainRow = document.createElement('div');
    mainRow.style.display = 'flex';
    mainRow.style.justifyContent = 'space-between';
    mainRow.style.width = '100%';
    mainRow.style.alignItems = 'center';

    // D-Pad
    const dpad = document.createElement('div');
    dpad.className = 'dpad-container';
    const dpadLayout = [
        ['', '▲', ''],
        ['◀', '', '▶'],
        ['', '▼', '']
    ];
    const keyMap = {
        '▲': 'ArrowUp',
        '▼': 'ArrowDown',
        '◀': 'ArrowLeft',
        '▶': 'ArrowRight'
    };
    dpadLayout.forEach(row => {
        row.forEach(symbol => {
            const cell = document.createElement('div');
            cell.className = 'dpad-cell' + (symbol === '' ? ' empty' : '');
            if (symbol) {
                cell.textContent = symbol;
                cell.setAttribute('data-key', keyMap[symbol]);
                // Eventos
                const key = keyMap[symbol];
                cell.addEventListener('touchstart', (e) => {
                    e.preventDefault();
                    keys[key] = true;
                    window.inputType.set('mobile');
                });
                cell.addEventListener('touchend', (e) => {
                    e.preventDefault();
                    delete keys[key];
                });
                cell.addEventListener('touchcancel', (e) => {
                    e.preventDefault();
                    delete keys[key];
                });
                cell.addEventListener('mousedown', (e) => {
                    e.preventDefault();
                    keys[key] = true;
                    window.inputType.set('mobile');
                });
                cell.addEventListener('mouseup', (e) => {
                    e.preventDefault();
                    delete keys[key];
                });
                cell.addEventListener('mouseleave', (e) => {
                    // Se o mouse sair enquanto pressionado, solta a tecla
                    delete keys[key];
                });
            }
            dpad.appendChild(cell);
        });
    });

    // Espaço para joystick decorativo (opcional)
    const leftJoystick = document.createElement('div');
    leftJoystick.className = 'joystick-decor';

    // Botões de ação
    const actionContainer = document.createElement('div');
    actionContainer.className = 'action-buttons';

    const row1 = document.createElement('div');
    row1.className = 'action-row';
    const btnAttack = document.createElement('div');
    btnAttack.className = 'action-btn a';
    btnAttack.textContent = 'A';
    btnAttack.setAttribute('data-action', 'attack');
    const btnDash = document.createElement('div');
    btnDash.className = 'action-btn b';
    btnDash.textContent = 'B';
    btnDash.setAttribute('data-action', 'dash');
    row1.appendChild(btnAttack);
    row1.appendChild(btnDash);

    const row2 = document.createElement('div');
    row2.className = 'action-row';
    const btnRestart = document.createElement('div');
    btnRestart.className = 'action-btn y';
    btnRestart.textContent = 'Y';
    btnRestart.setAttribute('data-action', 'restart');
    const btnStart = document.createElement('div');
    btnStart.className = 'action-btn start';
    btnStart.textContent = 'Start';
    btnStart.setAttribute('data-action', 'start');
    row2.appendChild(btnRestart);
    row2.appendChild(btnStart);

    const row3 = document.createElement('div');
    row3.className = 'action-row';
    const btnMenu = document.createElement('div');
    btnMenu.className = 'action-btn select';
    btnMenu.textContent = 'Select';
    btnMenu.setAttribute('data-action', 'menu');
    const btnPause = document.createElement('div');
    btnPause.className = 'action-btn pause';
    btnPause.textContent = 'Pause';
    btnPause.setAttribute('data-action', 'pause');
    row3.appendChild(btnMenu);
    row3.appendChild(btnPause);

    actionContainer.appendChild(row1);
    actionContainer.appendChild(row2);
    actionContainer.appendChild(row3);

    // Joystick direito decorativo
    const rightJoystick = document.createElement('div');
    rightJoystick.className = 'joystick-decor';

    mainRow.appendChild(leftJoystick);
    mainRow.appendChild(dpad);
    mainRow.appendChild(actionContainer);
    mainRow.appendChild(rightJoystick);
    pad.appendChild(mainRow);

    // Adiciona eventos aos botões de ação
    const actionMap = {
        'attack': playerAttack,
        'dash': playerDash,
        'restart': playerRestart,
        'start': playerStart,
        'menu': playerMenu,
        'pause': playerPause
    };
    pad.querySelectorAll('[data-action]').forEach(btn => {
        const action = btn.getAttribute('data-action');
        const handler = (e) => {
            e.preventDefault();
            window.inputType.set('mobile');
            actionMap[action]();
        };
        btn.addEventListener('touchstart', handler);
        btn.addEventListener('mousedown', handler);
    });

    // Insere o pad no DOM após o game-container
    const gameContainer = document.getElementById('game-container');
    if (gameContainer) {
        gameContainer.parentNode.insertBefore(pad, gameContainer.nextSibling);
    } else {
        // Fallback: insere no body
        document.body.appendChild(pad);
    }

    // Expõe o pad para referência (opcional)
    window.virtualPad = pad;
})();