// Module: Render System

function renderGame() {
    const biome = biomeData[currentBiome];
    ctx.fillStyle = biome.floor; 
    ctx.fillRect(0, 0, 400, 400);

    // Floor effects (igual ao original)
    if (currentBiome === 'forest') {
        ctx.fillStyle = 'rgba(34, 139, 34, 0.5)';
        for (let i = 0; i < 50; i++) {
            const x = Math.random() * 400;
            const y = Math.random() * 400;
            ctx.fillRect(x, y, 2, 2);
        }
    } else if (currentBiome === 'desert') {
        ctx.fillStyle = 'rgba(139, 69, 19, 0.3)';
        for (let i = 0; i < 30; i++) {
            const x = Math.random() * 400;
            const y = Math.random() * 400;
            ctx.beginPath();
            ctx.arc(x, y, 3 + Math.random() * 3, 0, Math.PI * 2);
            ctx.fill();
        }
    } else if (currentBiome === 'ice') {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        for (let i = 0; i < 20; i++) {
            if (Math.random() < 0.5) {
                const x = Math.random() * 400;
                const y = Math.random() * 400;
                ctx.fillRect(x, y, 2, 2);
            }
        }
    } else if (currentBiome === 'hell') {
        ctx.fillStyle = 'rgba(255, 69, 0, 0.3)';
        const pulse = Math.sin(Date.now() / 500) * 0.2 + 0.3;
        ctx.globalAlpha = pulse;
        ctx.fillRect(0, 0, 400, 400);
        ctx.globalAlpha = 1.0;
    }

    for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
            const t = currentMap[r][c];
            const tx = c * 40, ty = r * 40;

            if (t === 1) { 
                ctx.fillStyle = biome.wall;
                ctx.fillRect(tx, ty, 40, 40); 
                ctx.strokeStyle = 'rgba(0,0,0,0.3)';
                ctx.strokeRect(tx+2, ty+2, 36, 36); 
            }
            else if (t === 2) { 
                ctx.fillStyle = player.keys >= 1 ? '#f39c12' : '#444';
                ctx.fillRect(tx, ty, 40, 40); 
                ctx.fillStyle = '#000';
                ctx.beginPath();
                ctx.arc(tx+20, ty+18, 4, 0, Math.PI*2);
                ctx.fill();
                ctx.fillRect(tx+18, ty+18, 4, 8);
            }
            else if (t === 4) { 
                ctx.fillStyle = player.keys >= 2 ? '#e67e22' : '#444';
                ctx.fillRect(tx, ty, 40, 40); 
                ctx.fillStyle = '#111';
                ctx.font = 'bold 20px Courier';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText("2", tx+20, ty+20);
            }
            else if (t === 5) { 
                ctx.fillStyle = enemies.length === 0 ? '#27ae60' : '#c0392b';
                ctx.fillRect(tx, ty, 40, 40); 
                ctx.fillStyle = '#111';
                ctx.font = 'bold 20px Courier';
                ctx.textAlign = 'center';
                ctx.fillText("☠", tx+20, ty+20);
            }
            else if (t === 6) { 
                ctx.fillStyle = '#8e44ad';
                ctx.fillRect(tx, ty, 40, 40); 
                ctx.strokeStyle = 'rgba(231, 76, 60, 0.7)';
                ctx.lineWidth = 3;
                ctx.strokeRect(tx+2, ty+2, 36, 36);
                ctx.fillStyle = '#e74c3c';
                ctx.font = 'bold 24px Courier';
                ctx.textAlign = 'center';
                ctx.fillText("!", tx+20, ty+20);
            }
            else if (t === 3) { 
                // Obstáculo normal – usar cor do bioma com variação
                ctx.fillStyle = biome.obstacle;
                if (currentBiome === 'forest') {
                    ctx.beginPath();
                    ctx.arc(tx+20, ty+20, 18, 0, Math.PI*2);
                    ctx.fill();
                    ctx.beginPath();
                    ctx.moveTo(tx+20, ty+10);
                    ctx.lineTo(tx+10, ty+30);
                    ctx.lineTo(tx+30, ty+30);
                    ctx.fill();
                } else if (currentBiome === 'desert') {
                    ctx.beginPath();
                    ctx.moveTo(tx+20, ty+5);
                    ctx.lineTo(tx+35, ty+35);
                    ctx.lineTo(tx+5, ty+35);
                    ctx.closePath();
                    ctx.fill();
                } else if (currentBiome === 'ice') {
                    ctx.beginPath();
                    ctx.moveTo(tx+20, ty+5);
                    ctx.lineTo(tx+30, ty+20);
                    ctx.lineTo(tx+35, ty+35);
                    ctx.lineTo(tx+20, ty+30);
                    ctx.lineTo(tx+5, ty+35);
                    ctx.lineTo(tx+10, ty+20);
                    ctx.closePath();
                    ctx.fill();
                    ctx.fillStyle = 'rgba(255,255,255,0.7)';
                    ctx.fillRect(tx+15, ty+15, 10, 10);
                } else {
                    ctx.beginPath();
                    ctx.moveTo(tx+20, ty+5);
                    ctx.lineTo(tx+35, ty+35);
                    ctx.lineTo(tx+5, ty+35);
                    ctx.closePath();
                    ctx.fill();
                    ctx.fillStyle = 'rgba(255, 0, 0, 0.5)';
                    ctx.beginPath();
                    ctx.arc(tx+20, ty+20, 5, 0, Math.PI*2);
                    ctx.fill();
                }
            }
            else if (t === TILE_BREAKABLE) {
                // Quebrável: tamanho reduzido (30x30) centralizado
                ctx.fillStyle = biome.obstacle;
                ctx.fillRect(tx + 5, ty + 5, 30, 30);
                // Textura de rachadura
                ctx.strokeStyle = '#555';
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.moveTo(tx + 10, ty + 10);
                ctx.lineTo(tx + 30, ty + 30);
                ctx.moveTo(tx + 30, ty + 10);
                ctx.lineTo(tx + 10, ty + 30);
                ctx.stroke();
                // Mostrar saúde restante
                if (breakableHealth[r][c] > 0) {
                    ctx.fillStyle = '#fff';
                    ctx.font = 'bold 12px Courier';
                    ctx.fillText(breakableHealth[r][c], tx + 15, ty + 25);
                }
            }
            else if (t === TILE_TRAP_PERIODIC) {
                // Desenha o chão base
                ctx.fillStyle = biome.floor;
                ctx.fillRect(tx, ty, 40, 40);
                
                // Desenha borda pontilhada (sempre presente)
                ctx.fillStyle = biome.wall;
                const dotSize = 2;
                const step = 5;
                // Borda superior
                for (let x = tx + 2; x < tx + 40; x += step) {
                    ctx.fillRect(x, ty + 2, dotSize, dotSize);
                }
                // Borda inferior
                for (let x = tx + 2; x < tx + 40; x += step) {
                    ctx.fillRect(x, ty + 38 - dotSize, dotSize, dotSize);
                }
                // Borda esquerda
                for (let y = ty + 2; y < ty + 40; y += step) {
                    ctx.fillRect(tx + 2, y, dotSize, dotSize);
                }
                // Borda direita
                for (let y = ty + 2; y < ty + 40; y += step) {
                    ctx.fillRect(tx + 38 - dotSize, y, dotSize, dotSize);
                }

                // Se ativo, desenha os spikes no centro
                if (trapState[r][c] === 1) {
                    ctx.fillStyle = biome.wall;
                    const centerX = tx + 20;
                    const centerY = ty + 20;
                    const size = 8;
                    
                    // Spike para cima
                    ctx.beginPath();
                    ctx.moveTo(centerX - size/2, centerY - size/2);
                    ctx.lineTo(centerX, centerY - size);
                    ctx.lineTo(centerX + size/2, centerY - size/2);
                    ctx.fill();
                    
                    // Spike para baixo
                    ctx.beginPath();
                    ctx.moveTo(centerX - size/2, centerY + size/2);
                    ctx.lineTo(centerX, centerY + size);
                    ctx.lineTo(centerX + size/2, centerY + size/2);
                    ctx.fill();
                    
                    // Spike para esquerda
                    ctx.beginPath();
                    ctx.moveTo(centerX - size/2, centerY - size/2);
                    ctx.lineTo(centerX - size, centerY);
                    ctx.lineTo(centerX - size/2, centerY + size/2);
                    ctx.fill();
                    
                    // Spike para direita
                    ctx.beginPath();
                    ctx.moveTo(centerX + size/2, centerY - size/2);
                    ctx.lineTo(centerX + size, centerY);
                    ctx.lineTo(centerX + size/2, centerY + size/2);
                    ctx.fill();
                }
            }
        }
    }

    // Sombras
    ctx.globalAlpha = 0.4;
    ctx.fillStyle = '#000';
    const drawShadow = (x, y, w) => {
        ctx.beginPath();
        ctx.ellipse(x + w/2, y + w - 2, w/2, 4, 0, 0, Math.PI*2);
        ctx.fill();
    };
    drawShadow(player.x, player.y, player.w);
    enemies.forEach(en => drawShadow(en.x, en.y, en.w));
    ctx.globalAlpha = 1.0;

    // Chaves no chão
    ctx.fillStyle = 'gold';
    keysOnGround.forEach(k => ctx.fillRect(k.x, k.y, k.w, k.h));

    // Drops
    drops.forEach(d => {
        if (d.type === 'heart') ctx.fillStyle = '#ff4757';
        else if (d.type === 'speed') ctx.fillStyle = '#2f3542';
        else if (d.type === 'shield') ctx.fillStyle = '#1e90ff';
        else if (d.type === 'sword') ctx.fillStyle = '#ffa502';
        ctx.beginPath();
        ctx.arc(d.x + 10, d.y + 10, 8, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = 'white';
        ctx.font = 'bold 12px Courier';
        ctx.textAlign = 'center';
        let sym = "H";
        if (d.type === 'speed') sym = "S";
        if (d.type === 'shield') sym = "O";
        if (d.type === 'sword') sym = "!";
        ctx.fillText(sym, d.x + 10, d.y + 14);
    });

    // Inimigos
    enemies.forEach(en => {
        ctx.fillStyle = en.hitFlashTimer > 0 ? '#fff' : en.color;
        if (en.type === 'shadow') ctx.globalAlpha = 0.6;
        ctx.fillRect(en.x, en.y, en.w, en.h);
        ctx.globalAlpha = 1.0;
        ctx.fillStyle = 'black';
        ctx.fillRect(en.x, en.y-5, en.w, 3);
        ctx.fillStyle = '#2ecc71';
        ctx.fillRect(en.x, en.y-5, (en.health/en.maxHealth)*en.w, 3);
    });

    // Projéteis
    projectiles.forEach(p => {
        ctx.fillStyle = p.color;
        ctx.fillRect(p.x, p.y, p.w, p.h);
    });

    // Afterimages do dash
    player.dashAfterimages.forEach(img => {
        ctx.globalAlpha = img.alpha;
        ctx.fillStyle = 'rgba(255,255,255,0.8)';
        ctx.fillRect(img.x, img.y, player.w, player.h);
    });
    ctx.globalAlpha = 1.0;

    // Jogador (com invulnerabilidade piscando)
    if (player.invulnTimer % 10 < 5) {
        ctx.fillStyle = player.isDashing ? '#fff' : '#2ecc71'; 
        ctx.fillRect(player.x, player.y, player.w, player.h);
        ctx.fillStyle = '#f1c40f';
        ctx.fillRect(player.x+4, player.y, 14, 4);
        if (player.speedBoostTimer > 0) {
            ctx.strokeStyle = '#00d2ff';
            ctx.lineWidth = 2;
            ctx.strokeRect(player.x - 2, player.y - 2, player.w + 4, player.h + 4);
        }
        if (player.shieldActive) {
            ctx.strokeStyle = '#1e90ff';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(player.x + player.w/2, player.y + player.h/2, 18, 0, Math.PI*2);
            ctx.stroke();
        }
    }

    // Ataque do jogador
    if (player.isAttacking) {
        ctx.fillStyle = (player.swordBoostTimer > 0 && Date.now() % 100 < 50) ? 'red' : 'white';
        let sx = player.x, sy = player.y, sw = 4, sh = 4, r = 20;
        if (player.dir === 'up') { sx += 9; sy -= r; sh = r; }
        else if (player.dir === 'down') { sx += 9; sy += 22; sh = r; }
        else if (player.dir === 'left') { sx -= r; sy += 9; sw = r; }
        else { sx += 22; sy += 9; sw = r; }
        ctx.fillRect(sx, sy, sw, sh);
    }

    // Partículas
    particles.forEach(p => {
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.life / 30;
        ctx.fillRect(p.x, p.y, 4, 4);
    });
    ctx.globalAlpha = 1.0;

    // Vignette
    ctx.save();
    ctx.globalCompositeOperation = 'multiply';
    let grad = ctx.createRadialGradient(
        player.x + player.w/2, player.y + player.h/2, 20, 
        player.x + player.w/2, player.y + player.h/2, 180
    );
    grad.addColorStop(0, 'white');
    grad.addColorStop(1, '#333');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 400, 400);
    ctx.restore();

    // Desenhar tutorial se ativo
    if (window.tutorial) window.tutorial.draw(ctx);

    if (biomeTransitionTimer > 0) {
        ctx.globalAlpha = biomeTransitionTimer / 60 * 0.5;
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, 400, 400);
        ctx.globalAlpha = 1.0;
    }
}

function renderMenu() {
    ctx.fillStyle = '#0a0a0a';
    ctx.fillRect(0, 0, 400, 400);
    ctx.fillStyle = '#8e44ad';
    ctx.font = 'bold 28px Courier';
    ctx.textAlign = 'center';
    ctx.fillText('MINI QUEST', 200, 120);
    ctx.font = 'bold 18px Courier';
    ctx.fillStyle = '#27ae60';
    ctx.fillText('BIOME OMEN', 200, 160);
    ctx.font = '16px Courier';
    ctx.fillStyle = '#ccc';
    if (window.inputType.get() === 'gamepad') {
        ctx.fillText('Press START to start', 200, 240);
    } else if (window.inputType.get() === 'mobile') {
        ctx.fillText('Use START button', 200, 240);
    } else {
        ctx.fillText('Press ENTER to start', 200, 240);
    }
    if (debugMode) {
        ctx.fillStyle = '#f39c12';
        ctx.fillText('DEBUG MODE', 200, 280);
    }
    ctx.fillStyle = '#666';
    ctx.font = '12px Courier';
    ctx.fillText('M for debug toggle', 200, 320);
}

function renderPauseOverlay() {
    ctx.fillStyle = 'rgba(0,0,0,0.7)';
    ctx.fillRect(0, 0, 400, 400);
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 24px Courier';
    ctx.textAlign = 'center';
    ctx.fillText('PAUSED', 200, 150);
    ctx.font = '16px Courier';
    if (window.inputType.get() === 'gamepad') {
        ctx.fillText('START to Resume', 200, 210);
        ctx.fillText('Y to Restart', 200, 250);
        ctx.fillText('Select to Menu', 200, 290);
    } else if (window.inputType.get() === 'mobile') {
        ctx.fillText('Pause button to Resume', 200, 210);
        ctx.fillText('Y to Restart', 200, 250);
        ctx.fillText('Select to Menu', 200, 290);
    } else {
        ctx.fillText('ESC to Resume', 200, 210);
        ctx.fillText('R to Restart', 200, 250);
        ctx.fillText('M to Menu', 200, 290);
    }
}

function renderGameOverOverlay() {
    ctx.fillStyle = 'rgba(0,0,0,0.8)';
    ctx.fillRect(0, 0, 400, 400);
    ctx.fillStyle = '#e74c3c';
    ctx.font = 'bold 24px Courier';
    ctx.textAlign = 'center';
    ctx.fillText('GAME OVER', 200, 160);
    ctx.fillStyle = '#ccc';
    ctx.font = '16px Courier';
    ctx.fillText('Floor ' + dungeonLevel, 200, 200);
    if (window.inputType.get() === 'gamepad') {
        ctx.fillText('Press Y to Restart', 200, 250);
        ctx.fillText('Press Select for Menu', 200, 290);
    } else if (window.inputType.get() === 'mobile') {
        ctx.fillText('Press Y to Restart', 200, 250);
        ctx.fillText('Select for Menu', 200, 290);
    } else {
        ctx.fillText('Press R to Restart', 200, 250);
        ctx.fillText('Press M for Menu', 200, 290);
    }
}

let animationId = null;

function draw() {
    ctx.save();
    if (shakeTimer > 0 && (currentState === GameState.PLAYING || currentState === GameState.PAUSED || currentState === GameState.GAMEOVER)) {
        const dx = Math.random() * shakeIntensity * 2 - shakeIntensity;
        const dy = Math.random() * shakeIntensity * 2 - shakeIntensity;
        ctx.translate(dx, dy);
    }
    if (currentState === GameState.MENU) {
        ctx.restore();
        renderMenu();
    } else {
        renderGame();
        ctx.restore();
        if (currentState === GameState.PAUSED) {
            renderPauseOverlay();
        } else if (currentState === GameState.GAMEOVER) {
            renderGameOverOverlay();
        }
    }
    if (transition.alpha > 0) {
        ctx.fillStyle = `rgba(0, 0, 0, ${transition.alpha})`;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
    ctx.setTransform(1, 0, 0, 1, 0, 0);
}

function gameLoop() {
    update();
    draw();
    animationId = requestAnimationFrame(gameLoop);
}

if (!animationId) {
    gameLoop();
}