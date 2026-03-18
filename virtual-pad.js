// Module: Virtual Pad (Glassmorphism + Responsivo)
// Cria dinamicamente um controle virtual com layout adaptativo.

(function() {
    // Evita recriar se já existir
    if (document.getElementById('virtual-pad')) return;

    // ========== ESTILOS ==========
    const style = document.createElement('style');
    style.textContent = `
        /* Container principal do pad */
        #virtual-pad {
            position: relative;
            width: 100%;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            touch-action: manipulation;
            user-select: none;
            font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            pointer-events: none; /* Para que cliques no canvas passem, mas os botões próprios têm pointer-events auto */
            z-index: 20;
        }

        /* Em landscape, o pad fica sobreposto ao canvas */
        @media (orientation: landscape) {
            #virtual-pad {
                position: absolute;
                top: 0;
                left: 0;
                height: 100%;
                flex-direction: row;
                justify-content: space-between;
                padding: 10px;
                box-sizing: border-box;
                pointer-events: none;
            }
            #virtual-pad > * {
                pointer-events: auto;
            }
            .canvas-area {
                position: relative;
                width: 400px; /* mesmo tamanho do canvas */
                height: 400px;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            .center-buttons {
                position: absolute;
                bottom: 20px;
                left: 0;
                right: 0;
                display: flex;
                justify-content: center;
                gap: 20px;
                pointer-events: auto;
            }
        }

        /* Em portrait, tudo abaixo do canvas */
        @media (orientation: portrait) {
            #virtual-pad {
                margin-top: 10px;
                flex-direction: column;
                align-items: center;
                gap: 10px;
                pointer-events: auto;
            }
            .canvas-area {
                display: none; /* não usado em portrait */
            }
            .bottom-row {
                display: flex;
                flex-direction: row;
                justify-content: center;
                align-items: center;
                gap: 20px;
                width: 100%;
                max-width: 600px;
            }
            .center-buttons {
                display: flex;
                flex-direction: row;
                gap: 10px;
            }
        }

        /* Efeito glass base */
        .glass {
            background: rgba(255, 255, 255, 0.1);
            backdrop-filter: blur(12px);
            -webkit-backdrop-filter: blur(12px);
            border: 1px solid rgba(255, 255, 255, 0.2);
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
            background: rgba(255, 255, 255, 0.2);
            border-color: rgba(255, 255, 255, 0.4);
        }

        /* D-Pad */
        .dpad {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            grid-template-rows: repeat(3, 1fr);
            gap: 6px;
            width: 140px;
            height: 140px;
            background: rgba(0, 0, 0, 0.3);
            border-radius: 20px;
            padding: 8px;
            backdrop-filter: blur(4px);
        }
        .dpad-cell {
            background: rgba(255, 255, 255, 0.1);
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
            background: rgba(0, 0, 0, 0.3);
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
            background: rgba(255, 255, 255, 0.1);
            border: 1px solid rgba(255, 255, 255, 0.2);
            box-shadow: 0 6px 0 #111, 0 8px 12px rgba(0,0,0,0.6);
            font-size: 24px;
            font-family: 'Arial Black', sans-serif;
            color: white;
            transition: all 0.05s;
        }
        .action-btn:active {
            transform: translateY(6px);
            box-shadow: 0 2px 0 #111, 0 4px 8px rgba(0,0,0,0.6);
            background: rgba(255, 255, 255, 0.25);
        }
        .action-btn.a { background: rgba(46, 204, 113, 0.4); }
        .action-btn.b { background: rgba(231, 76, 60, 0.4); }
        .action-btn.y { background: rgba(241, 196, 15, 0.4); color: #222; }
        .action-btn.start, .action-btn.select, .action-btn.pause {
            width: 70px;
            height: 50px;
            border-radius: 40px;
            background: rgba(85, 85, 85, 0.4);
            font-size: 18px;
            box-shadow: 0 4px 0 #222;
        }
        .action-btn.pause { background: rgba(52, 152, 219, 0.4); }

        /* Botões centrais (start/select) no landscape */
        .center-btn {
            width: 80px;
            height: 50px;
            border-radius: 30px;
            background: rgba(0, 0, 0, 0.5);
            backdrop-filter: blur(8px);
            border: 1px solid rgba(255, 255, 255, 0.2);
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
            background: rgba(255, 255, 255, 0.2);
        }

        /* Ajustes para telas pequenas */
        @media (max-width: 600px) {
            .dpad { width: 120px; height: 120px; }
            .action-btn { width: 50px; height: 50px; font-size: 20px; }
            .action-btn.start, .action-btn.select, .action-btn.pause { width: 60px; height: 45px; font-size: 16px; }
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

    // Área central (canvas area) - usada apenas em landscape
    const canvasArea = document.createElement('div');
    canvasArea.className = 'canvas-area';

    // Botões centrais (start/select) - serão posicionados dentro da canvasArea em landscape, ou na bottom row em portrait
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
    canvasArea.appendChild(centerButtons);

    // Área direita (botões de ação)
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

    // Linha 2: Y e Start (mas start já está no centro, então aqui talvez seja redundante; mas manteremos para portrait)
    const row2 = document.createElement('div');
    row2.className = 'action-row';
    const btnY = document.createElement('div');
    btnY.className = 'action-btn y';
    btnY.textContent = 'Y';
    btnY.setAttribute('data-action', 'restart');
    // Em portrait, os botões centrais estarão na bottom row, então não precisamos duplicar start aqui.
    // Vamos colocar apenas Y, e talvez um botão de pause? Mas pause já está nos centrais.
    // Para manter consistência, colocaremos Y e um botão de "menu" (select) mas já temos select nos centrais.
    // Vamos colocar Y e um botão de "pause" para ter mais opções? Melhor seguir o original: restart, start, menu, pause.
    // Mas no original, os action buttons tinham restart (Y), start, menu (select), pause.
    // Como start/select já estão nos centrais, podemos deixar apenas Y e talvez um botão de "pause" extra? Vamos manter apenas Y aqui.
    row2.appendChild(btnY);

    const row3 = document.createElement('div');
    row3.className = 'action-row';
    // Adicionar botão de pause? Já temos no centro. Para não duplicar, deixamos vazio ou colocamos um extra.
    // Para manter funcionalidade completa, adicionamos pause também aqui? Mas pause já está no centro. Vamos manter apenas Y e depois um botão de "pause" opcional?
    // O usuário pediu que os botões de ação (A, B, Y, etc.) fiquem na direita. No original, havia restart (Y), start, select e pause. 
    // Vamos colocar: A, B, Y, e um botão de "pause" na direita também, mas manteremos os centrais para start/select.
    // Assim, na direita teremos A, B, Y e Pause. Em landscape, os centrais são sobrepostos.
    const btnPauseRight = document.createElement('div');
    btnPauseRight.className = 'action-btn pause';
    btnPauseRight.textContent = '⏸';
    btnPauseRight.setAttribute('data-action', 'pause');
    row3.appendChild(btnPauseRight);

    actionContainer.appendChild(row1);
    actionContainer.appendChild(row2);
    actionContainer.appendChild(row3);
    rightArea.appendChild(actionContainer);

    // Linha inferior para portrait (agrupa left, centerButtons e right)
    const bottomRow = document.createElement('div');
    bottomRow.className = 'bottom-row';
    // Em portrait, vamos mover os centerButtons para a bottomRow
    // Precisamos clonar ou mover? Vamos criar uma cópia para portrait, mas para simplificar, vamos adicionar centerButtons também à bottomRow,
    // e no landscape eles estão na canvasArea. Vamos usar CSS para mostrar/esconder conforme orientação.
    // Mas os elementos não podem estar em dois lugares. A solução é ter duas estruturas diferentes? Ou usar CSS para reposicionar?
    // Melhor: ter um único conjunto de centerButtons e, via media queries, alterar seu posicionamento.
    // Vamos colocar centerButtons fora da canvasArea, e em landscape usamos position absolute sobre o canvas.
    // Vamos ajustar o CSS: .center-buttons será posicionado absolutamente dentro de #virtual-pad quando landscape, e dentro da bottom-row quando portrait.
    // Para isso, vamos criar centerButtons como filho direto de #virtual-pad, e usar CSS para posicionar.
    // Refazendo: centerButtons será filho de #virtual-pad, e terá posicionamento diferente conforme orientação.

    // Remove canvasArea, pois não será necessário. Em vez disso, usaremos o próprio canvas como referência.
    // Vamos posicionar centerButtons de forma absoluta em relação ao #game-container quando landscape.

    // Nova abordagem:
    // - leftArea e rightArea ficam nas laterais.
    // - centerButtons fica posicionado absolutamente sobre o canvas em landscape, e na bottom-row em portrait.
    // - Precisamos de um container para a bottom-row que só aparece em portrait.

    // Vamos reconstruir:

    // Limpa o pad
    pad.innerHTML = '';

    // Left area
    pad.appendChild(leftArea);

    // Center buttons (serão reposicionados via CSS)
    const centerBtns = document.createElement('div');
    centerBtns.className = 'center-buttons';
    centerBtns.appendChild(btnStart.cloneNode(true)); // clonar para evitar duplicidade de eventos? Melhor criar novos elementos.
    // Melhor criar novamente:
    const btnStart2 = document.createElement('div');
    btnStart2.className = 'center-btn';
    btnStart2.textContent = 'START';
    btnStart2.setAttribute('data-action', 'start');
    const btnSelect2 = document.createElement('div');
    btnSelect2.className = 'center-btn';
    btnSelect2.textContent = 'SELECT';
    btnSelect2.setAttribute('data-action', 'menu');
    const btnPause2 = document.createElement('div');
    btnPause2.className = 'center-btn';
    btnPause2.textContent = 'PAUSE';
    btnPause2.setAttribute('data-action', 'pause');
    centerBtns.appendChild(btnStart2);
    centerBtns.appendChild(btnSelect2);
    centerBtns.appendChild(btnPause2);
    pad.appendChild(centerBtns);

    // Right area
    pad.appendChild(rightArea);

    // Bottom row (para portrait) - conterá leftArea, centerBtns, rightArea? Mas left/right já estão lá.
    // Em portrait, queremos que left, center, right fiquem na mesma linha abaixo do canvas.
    // Então em portrait, leftArea e rightArea devem estar lado a lado com centerBtns no meio.
    // Vamos criar um container .portrait-row que será exibido apenas em portrait, e dentro dele colocaremos cópias ou moveremos os elementos?
    // Como os elementos já existem, podemos usar CSS para reorganizá-los: em portrait, leftArea, centerBtns, rightArea devem ficar em linha.
    // Para isso, em portrait, #virtual-pad deve ter display: flex; flex-direction: row; justify-content: center; align-items: center; gap: 20px;
    // E então leftArea, centerBtns, rightArea serão os filhos diretos. Em landscape, leftArea fica à esquerda, rightArea à direita, e centerBtns fica posicionado absolutamente sobre o canvas.
    // Precisamos de um posicionamento absoluto para centerBtns em landscape. Vamos fazer:

    // CSS adicional:
    const extraStyle = document.createElement('style');
    extraStyle.textContent = `
        /* Landscape */
        @media (orientation: landscape) {
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
            #virtual-pad > .left-area, #virtual-pad > .right-area {
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
        /* Portrait */
        @media (orientation: portrait) {
            #virtual-pad {
                display: flex;
                flex-direction: row;
                justify-content: center;
                align-items: center;
                gap: 20px;
                margin-top: 10px;
                pointer-events: auto;
                position: relative;
                width: 100%;
            }
            #virtual-pad > .center-buttons {
                display: flex;
                gap: 10px;
            }
        }
    `;
    document.head.appendChild(extraStyle);

    // Agora adicionamos os eventos aos botões
    const actionMap = {
        'attack': playerAttack,
        'dash': playerDash,
        'restart': playerRestart,
        'start': playerStart,
        'menu': playerMenu,
        'pause': playerPause
    };

    // Função para adicionar eventos a um elemento com data-action
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

    // Seleciona todos os botões com data-action
    pad.querySelectorAll('[data-action]').forEach(addEvents);

    // Insere o pad no DOM
    const gameContainer = document.getElementById('game-container');
    if (gameContainer) {
        gameContainer.parentNode.insertBefore(pad, gameContainer.nextSibling);
    } else {
        document.body.appendChild(pad);
    }

    // Ajuste para que o pad não bloqueie cliques no canvas em landscape
    // O pointer-events: none no container e auto nos filhos já resolve.
})();