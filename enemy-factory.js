// Module: Enemy Factory

function pickEnemyType(biome) {
    const weights = biomeData[biome].weights;
    const rand = Math.random();
    let cumulative = 0;
    for (let type in weights) {
        cumulative += weights[type];
        if (rand <= cumulative) return type;
    }
    return 'slime';
}

function createEnemy(type, tx, ty, isSmall = false) {
    const e = {
        type: type,
        x: tx * TILE_SIZE + 5,
        y: ty * TILE_SIZE + 5,
        w: isSmall ? 18 : 28,
        h: isSmall ? 18 : 28,
        health: isSmall ? 1 : 2,
        maxHealth: isSmall ? 1 : 2,
        speed: 1,
        dir: 'down',
        moveTimer: 0,
        shootTimer: 0,
        teleportTimer: 120,
        isSmall: isSmall,
        dropsKey: false,
        color: '#fff',
        hitFlashTimer: 0
    };
    const hpBonus = Math.floor(dungeonLevel / 4);
    
    switch(type) {
        case 'slime': 
            e.color = currentBiome === 'hell' ? '#e67e22' : (currentBiome === 'ice' ? '#81d4fa' : '#2ecc71');
            e.speed = 0.8; 
            e.health = (isSmall ? 1 : 2) + hpBonus;
            break;
        case 'mage': 
            e.color = currentBiome === 'desert' ? '#f39c12' : '#9b59b6'; 
            e.speed = 0.5; 
            e.shootTimer = 60;
            break;
        case 'berserker': 
            e.color = currentBiome === 'forest' ? '#795548' : '#e74c3c'; 
            e.health = 3 + hpBonus;
            break;
        case 'shadow': 
            e.color = '#34495e'; 
            e.speed = 1.2;
            break;
    }
    e.maxHealth = e.health;
    return e;
}