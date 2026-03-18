// Module: Physics & Collision

function checkTileCollision(x, y, w, h, isProjectile = false) {
    const buffer = isProjectile ? 2 : 6; 
    const left = Math.floor((x + buffer) / TILE_SIZE);
    const right = Math.floor((x + w - buffer) / TILE_SIZE);
    const top = Math.floor((y + buffer) / TILE_SIZE);
    const bottom = Math.floor((y + h - buffer) / TILE_SIZE);

    for (let r = top; r <= bottom; r++) {
        for (let c = left; c <= right; c++) {
            if (currentMap[r] && currentMap[r][c] !== 0) {
                // Armadilhas periódicas são atravessáveis (não bloqueiam movimento)
                if (currentMap[r][c] === TILE_TRAP_PERIODIC) {
                    continue;
                }
                return currentMap[r][c];
            }
        }
    }
    return 0;
}

function moveWithCollision(ent, dx, dy) {
    if (!checkTileCollision(ent.x + dx, ent.y, ent.w, ent.h)) ent.x += dx;
    if (!checkTileCollision(ent.x, ent.y + dy, ent.w, ent.h)) ent.y += dy;
}