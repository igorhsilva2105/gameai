// Module: UI Manager
// Cria e gerencia todos os elementos da interface do usuário dinamicamente

let uiElements = {};

function createUI() {
    // Se já existir, não recriar
    if (document.getElementById('stats-left')) return;

    const gameContainer = document.getElementById('game-container');
    if (!gameContainer) return;

    // Container superior
    const uiTop = document.createElement('div');
    uiTop.className = 'ui-top';
    uiTop.id = 'ui-top';

    // stats-left
    const statsLeft = document.createElement('div');
    statsLeft.id = 'stats-left';
    statsLeft.innerText = 'Floor 1 · Forest';
    uiTop.appendChild(statsLeft);

    // hearts container
    const heartsDiv = document.createElement('div');
    heartsDiv.id = 'hearts';
    heartsDiv.innerText = '❤️❤️❤️';
    uiTop.appendChild(heartsDiv);

    // boost indicator (dentro de hearts)
    const boostSpan = document.createElement('span');
    boostSpan.id = 'boost-indicator';
    heartsDiv.appendChild(boostSpan);

    gameContainer.appendChild(uiTop);

    // Barra de dash
    const dashContainer = document.createElement('div');
    dashContainer.id = 'dash-bar-container';
    const dashBar = document.createElement('div');
    dashBar.id = 'dash-bar';
    dashContainer.appendChild(dashBar);
    gameContainer.appendChild(dashContainer);

    // Guardar referências
    uiElements = {
        statsLeft,
        heartsDiv,
        boostSpan,
        dashContainer,
        dashBar
    };
}

function updateUI() {
    // Se os elementos não existirem, criar
    if (!uiElements.statsLeft) {
        createUI();
    }

    if (currentState === GameState.MENU) {
        // No menu, não mostrar detalhes do jogador
        uiElements.statsLeft.innerText = '';
        uiElements.heartsDiv.innerHTML = '';
        // Reinserir boostSpan vazio (para manter referência)
        uiElements.heartsDiv.appendChild(uiElements.boostSpan);
        uiElements.boostSpan.innerText = '';
        uiElements.dashContainer.style.display = 'none';
        return;
    } else {
        uiElements.dashContainer.style.display = 'block';
    }

    // Atualizar andar e bioma
    uiElements.statsLeft.innerText = `Floor ${dungeonLevel} · ${biomeData[currentBiome].name}`;

    // Atualizar corações
    let heartsText = '';
    for (let i = 0; i < player.maxHealth; i++) {
        heartsText += i < player.health ? '❤️' : '🖤';
    }
    // Preservar o boostSpan (ele está dentro de heartsDiv)
    uiElements.heartsDiv.innerHTML = heartsText;
    // Reinserir o boostSpan (pois innerHTML o removeu)
    uiElements.heartsDiv.appendChild(uiElements.boostSpan);

    // Atualizar boosts
    let boostText = '';
    if (player.speedBoostTimer > 0) boostText += '⚡';
    if (player.shieldActive) boostText += '🛡️';
    if (player.swordBoostTimer > 0) boostText += '⚔️';
    uiElements.boostSpan.innerText = boostText;

    // Atualizar barra de dash
    const dashPct = player.dashCooldown <= 0 ? 100 : (1 - (player.dashCooldown / player.dashMaxCooldown)) * 100;
    uiElements.dashBar.style.width = dashPct + '%';
    uiElements.dashBar.style.background = dashPct === 100 ? '#00d2ff' : '#555';
}

// Inicializar UI quando o DOM estiver pronto
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', createUI);
} else {
    createUI();
}

// Expor para outros módulos
window.uiManager = {
    update: updateUI
};