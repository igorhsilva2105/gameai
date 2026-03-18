// Module: Drop System

function spawnDrop(x, y) {
    let chance = 0.3; 
    if (currentRoomType === 2 || currentRoomType === 3) chance = 0.6; 
    if (Math.random() < chance) {
        const types = ['heart', 'speed', 'shield', 'sword'];
        const type = types[Math.floor(Math.random() * types.length)];
        drops.push({ x: x, y: y, w: 20, h: 20, type: type });
    }
}