// Module: Level Generation

function generateTutorialLevel() {
    // Mapa fixo igual ao do anexo
    return [
        [1,1,1,1,2,1,1,1,1,1],
        [1,0,0,0,0,0,0,0,0,1],
        [1,0,3,0,0,0,0,3,0,1],
        [1,0,0,0,0,0,0,0,0,1],
        [1,0,0,0,3,3,0,0,0,1],
        [1,0,0,0,3,3,0,0,0,1],
        [1,0,0,0,0,0,0,0,0,1],
        [1,0,3,0,0,0,0,3,0,1],
        [1,0,0,0,0,0,0,0,0,1],
        [1,1,1,1,1,1,1,1,1,1]
    ];
}

function generateRoom(level, kills, doorTile) {
    const roomSeed = GLOBAL_SEED + level * 17 + kills * 9;
    let newMap = [];

    for (let r = 0; r < ROWS; r++) {
        newMap[r] = [];
        for (let c = 0; c < COLS; c++) {
            newMap[r][c] = (r === 0 || r === ROWS - 1 || c === 0 || c === COLS - 1) ? 1 : 0;
        }
    }

    const doorWall = Math.floor(seededRandom(roomSeed) * 3);
    let door = { r: 0, c: 5 }, thresh = { r: 1, c: 5 };
    if (doorWall === 1) { door = { r: 5, c: 0 }; thresh = { r: 5, c: 1 }; }
    else if (doorWall === 2) { door = { r: 5, c: 9 }; thresh = { r: 5, c: 8 }; }
    newMap[door.r][door.c] = doorTile;

    // Área proibida: tiles onde o player começa (aproximadamente linha 8, coluna 4-5) e arredores imediatos
    const forbiddenTiles = [
        { r: 8, c: 4 }, { r: 8, c: 5 }, // posição do player
        { r: 7, c: 4 }, { r: 7, c: 5 }, // acima
        { r: 9, c: 4 }, { r: 9, c: 5 }, // abaixo
        { r: 8, c: 3 }, { r: 8, c: 6 }  // laterais
    ];

    // Função para verificar se uma tile é permitida
    function isTileAllowed(r, c) {
        // Não pode ser parede (borda), nem a porta, nem o threshold, nem a área proibida
        if (r === 0 || r === ROWS-1 || c === 0 || c === COLS-1) return false;
        if (r === door.r && c === door.c) return false;
        if (r === thresh.r && c === thresh.c) return false;
        for (let f of forbiddenTiles) {
            if (f.r === r && f.c === c) return false;
        }
        return true;
    }

    // Quebráveis (2 a 5)
    let breakableCount = 2 + Math.floor(seededRandom(roomSeed + 100) * 4);
    for (let i = 0; i < breakableCount; i++) {
        let attempts = 0;
        while (attempts < 100) {
            const r = 1 + Math.floor(seededRandom(roomSeed + i + 300 + attempts) * 8);
            const c = 1 + Math.floor(seededRandom(roomSeed + i + 400 + attempts) * 8);
            if (isTileAllowed(r, c) && newMap[r][c] === 0) {
                newMap[r][c] = TILE_BREAKABLE;
                break;
            }
            attempts++;
        }
    }

    // Armadilhas periódicas (1 a 3)
    let trapCount = 1 + Math.floor(seededRandom(roomSeed + 200) * 3);
    for (let i = 0; i < trapCount; i++) {
        let attempts = 0;
        while (attempts < 100) {
            const r = 1 + Math.floor(seededRandom(roomSeed + i + 500 + attempts) * 8);
            const c = 1 + Math.floor(seededRandom(roomSeed + i + 600 + attempts) * 8);
            if (isTileAllowed(r, c) && newMap[r][c] === 0) {
                newMap[r][c] = TILE_TRAP_PERIODIC;
                break;
            }
            attempts++;
        }
    }

    // Obstáculos normais (tile 3) – reduzidos para dar espaço
    let obsCount = 2 + Math.floor(seededRandom(roomSeed + 1) * 4);
    for (let i = 0; i < obsCount; i++) {
        let attempts = 0;
        while (attempts < 100) {
            const r = 1 + Math.floor(seededRandom(roomSeed + i + 2) * 8);
            const c = 1 + Math.floor(seededRandom(roomSeed + i + 50) * 8);
            if (isTileAllowed(r, c) && newMap[r][c] === 0) {
                newMap[r][c] = 3;
                break;
            }
            attempts++;
        }
    }

    return newMap;
}

function initLevel() {
    const prevBiome = currentBiome;
    currentBiome = getBiome(dungeonLevel);
    if (prevBiome !== currentBiome) {
        biomeTransitionTimer = 60;
    }
    const crossfade = (prevBiome !== currentBiome);
    const roomSeed = GLOBAL_SEED + dungeonLevel * 100 + totalKills;
    
    // Se for o primeiro nível, usar mapa de tutorial fixo
    if (dungeonLevel === 1) {
        currentMap = generateTutorialLevel();
        currentRoomType = 0; // Tipo de sala padrão (porta 2)
    } else {
        currentRoomType = dungeonLevel === 1 ? 0 : Math.floor(seededRandom(roomSeed + 300) * 4);
        const doorTiles = [2, 4, 5, 6];
        const doorTile = doorTiles[currentRoomType];
        currentMap = generateRoom(dungeonLevel, totalKills, doorTile);
    }

    // Inicializar estados dos novos obstáculos
    breakableHealth = [];
    trapState = [];
    trapTimer = [];
    for (let r = 0; r < ROWS; r++) {
        breakableHealth[r] = [];
        trapState[r] = [];
        trapTimer[r] = [];
        for (let c = 0; c < COLS; c++) {
            if (currentMap[r][c] === TILE_BREAKABLE) {
                breakableHealth[r][c] = 2; // saúde padrão
            } else {
                breakableHealth[r][c] = 0;
            }
            if (currentMap[r][c] === TILE_TRAP_PERIODIC) {
                // Estado inicial aleatório
                trapState[r][c] = seededRandom(roomSeed + r * 10 + c) > 0.5 ? 1 : 0;
                // Timer entre 60 e 180 frames (1-3s a 60fps)
                trapTimer[r][c] = 60 + Math.floor(seededRandom(roomSeed + r * 20 + c) * 120);
            } else {
                trapState[r][c] = 0;
                trapTimer[r][c] = 0;
            }
        }
    }

    // Posicionar o jogador
    if (dungeonLevel === 1) {
        player.x = 200; // Posição mais próxima do tutorial
        player.y = 300;
    } else {
        player.x = 188;
        player.y = 320;
    }
    player.keys = 0;
    player.isDashing = false;
    player.dashTimer = 0;
    player.dashCooldown = 0;
    player.dashAfterimages = [];
    keysOnGround = [];
    drops = [];
    standardKeyDropped = false;
    enemies = [];
    projectiles = [];
    particles = [];
    player.speedBoostTimer = 0;
    player.swordBoostTimer = 0;
    player.shieldActive = false;

    // Gerar inimigos
    if (dungeonLevel === 1) {
        // Inimigo tutorial: um slime na posição (200,100) que é tile (2,5)
        let en = createEnemy('slime', 5, 2); // tx=5, ty=2
        en.dropsKey = true; // vai dropar a chave ao morrer
        enemies.push(en);
    } else {
        let enemyCount = 1 + Math.floor(dungeonLevel / 5);
        if (currentRoomType === 1) enemyCount += 1;
        else if (currentRoomType === 2) enemyCount += 2;

        for (let i = 0; i < enemyCount; i++) {
            const type = pickEnemyType(currentBiome);
            let placed = false;
            let attempts = 0;
            while (!placed && attempts < 200) {
                const tx = 1 + Math.floor(seededRandom(roomSeed + i + attempts) * 8);
                const ty = 1 + Math.floor(seededRandom(roomSeed + i + 10 + attempts) * 8);
                // Verificar se a tile está vazia (0) e não é a porta, threshold, ou área proibida do player
                if (currentMap[ty][tx] === 0 && !(ty === 8 && (tx === 4 || tx === 5))) {
                    let en = createEnemy(type, tx, ty);
                    if (currentRoomType === 1) en.dropsKey = true;
                    enemies.push(en);
                    placed = true;
                }
                attempts++;
            }
            // Se não conseguir colocar, coloca em qualquer tile vazia (fallback)
            if (!placed) {
                for (let r = 1; r < ROWS-1; r++) {
                    for (let c = 1; c < COLS-1; c++) {
                        if (currentMap[r][c] === 0 && !(r === 8 && (c === 4 || c === 5))) {
                            let en = createEnemy(type, c, r);
                            if (currentRoomType === 1) en.dropsKey = true;
                            enemies.push(en);
                            placed = true;
                            break;
                        }
                    }
                    if (placed) break;
                }
            }
        }
    }

    document.getElementById('stats-left').innerText = `Floor ${dungeonLevel} · ${biomeData[currentBiome].name}`;
    startBiomeMusic(crossfade);
    playSound('newFloor');
    if (window.uiManager) uiManager.update();
}