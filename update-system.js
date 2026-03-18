// Module: Update System

function breakTile(r, c) {
    if (currentMap[r][c] === TILE_BREAKABLE) {
        currentMap[r][c] = 0;
        breakableHealth[r][c] = 0;
        spawnParticles(c * TILE_SIZE + TILE_SIZE / 2, r * TILE_SIZE + TILE_SIZE / 2, '#aaa', 8);
        playSound('break');
        if (Math.random() < 0.1) {
            spawnDrop(c * TILE_SIZE + 5, r * TILE_SIZE + 5);
        }
    }
}

function update() {
    handleGamepad();
    if (currentState !== GameState.PLAYING && currentState !== GameState.TRANSITION) return;

    if (currentState === GameState.PLAYING) {
        if (player.speedBoostTimer > 0) player.speedBoostTimer--;
        if (player.swordBoostTimer > 0) player.swordBoostTimer--;
        if (shakeTimer > 0) shakeTimer--;

        for (let i = particles.length - 1; i >= 0; i--) {
            let p = particles[i];
            p.x += p.vx;
            p.y += p.vy;
            p.life--;
            if (p.life <= 0) particles.splice(i, 1);
        }

        combatIntensity = enemies.length > 0 ? Math.min(1, combatIntensity + 0.01) : Math.max(0, combatIntensity - 0.01);

        // Atualizar armadilhas periódicas
        for (let r = 0; r < ROWS; r++) {
            for (let c = 0; c < COLS; c++) {
                if (currentMap[r][c] === TILE_TRAP_PERIODIC) {
                    if (trapTimer[r][c] > 0) {
                        trapTimer[r][c]--;
                        if (trapTimer[r][c] <= 0) {
                            trapState[r][c] = trapState[r][c] === 1 ? 0 : 1;
                            trapTimer[r][c] = 60 + Math.floor(Math.random() * 120);
                            if (trapState[r][c] === 1) {
                                spawnParticles(c * TILE_SIZE + TILE_SIZE / 2, r * TILE_SIZE + TILE_SIZE / 2, '#f00', 5);
                                playSound('trapActivate');
                            }
                        }
                    }
                }
            }
        }

        // Dano de armadilhas ao jogador
        let playerLeft = player.x;
        let playerRight = player.x + player.w;
        let playerTop = player.y;
        let playerBottom = player.y + player.h;
        let startCol = Math.floor(playerLeft / TILE_SIZE);
        let endCol = Math.floor(playerRight / TILE_SIZE);
        let startRow = Math.floor(playerTop / TILE_SIZE);
        let endRow = Math.floor(playerBottom / TILE_SIZE);
        let trapHit = false;
        for (let r = startRow; r <= endRow && !trapHit; r++) {
            for (let c = startCol; c <= endCol && !trapHit; c++) {
                if (r >= 0 && r < ROWS && c >= 0 && c < COLS) {
                    if (currentMap[r][c] === TILE_TRAP_PERIODIC && trapState[r][c] === 1) {
                        damagePlayer(1);
                        trapHit = true;
                    }
                }
            }
        }

        // Movimento do jogador
        if (player.isDashing) {
            let dSpeed = 9;
            let dDx = 0, dDy = 0;
            if (player.dir === 'up') dDy = -dSpeed;
            else if (player.dir === 'down') dDy = dSpeed;
            else if (player.dir === 'left') dDx = -dSpeed;
            else if (player.dir === 'right') dDx = dSpeed;

            let futureX = player.x + dDx;
            let futureY = player.y + dDy;
            let tileR = Math.floor(futureY / TILE_SIZE);
            let tileC = Math.floor(futureX / TILE_SIZE);
            if (tileR >= 0 && tileR < ROWS && tileC >= 0 && tileC < COLS) {
                if (currentMap[tileR][tileC] === TILE_BREAKABLE) {
                    breakTile(tileR, tileC);
                }
            }
            moveWithCollision(player, dDx, dDy);

            // Notificar tutorial sobre movimento (dash também conta como movimento)
            if (window.tutorial) window.tutorial.onMove();

            if (player.dashTimer % 3 === 0) {
                player.dashAfterimages.push({ x: player.x, y: player.y, alpha: 0.6 });
            }
            player.dashTimer--;
            if (player.dashTimer <= 0) {
                player.isDashing = false;
                player.dashCooldown = player.dashMaxCooldown;
            }
        } else {
            if (player.dashCooldown > 0) player.dashCooldown--;

            let currentSpeed = player.speedBoostTimer > 0 ? player.baseSpeed * 1.5 : player.baseSpeed;
            let dx = 0, dy = 0;
            let moving = false;

            if (!player.isAttacking) {
                if (keys['ArrowUp']) { dy = -currentSpeed; player.dir = 'up'; moving = true; }
                else if (keys['ArrowDown']) { dy = currentSpeed; player.dir = 'down'; moving = true; }
                if (keys['ArrowLeft']) { dx = -currentSpeed; player.dir = 'left'; moving = true; }
                else if (keys['ArrowRight']) { dx = currentSpeed; player.dir = 'right'; moving = true; }
            }

            if (moving && player.stepTimer <= 0) {
                playSound('step', Math.random() * 0.2 + 0.9);
                player.stepTimer = player.stepCooldown;
                // Notificar tutorial sobre movimento
                if (window.tutorial) window.tutorial.onMove();
            }
            if (player.stepTimer > 0) player.stepTimer--;

            const hit = checkTileCollision(player.x + dx, player.y + dy, player.w, player.h);
            if (hit === 6) {
                damagePlayer(1);
                if (currentState === GameState.PLAYING) {
                    if (window.tutorial && dungeonLevel === 1) window.tutorial.onDoorOpened();
                    startTransition();
                    return;
                }
            } else if (hit === 2 && player.keys >= 1) {
                if (window.tutorial && dungeonLevel === 1) window.tutorial.onDoorOpened();
                startTransition();
                return;
            } else if (hit === 4 && player.keys >= 2) {
                if (window.tutorial && dungeonLevel === 1) window.tutorial.onDoorOpened();
                startTransition();
                return;
            } else if (hit === 5 && enemies.length === 0) {
                if (window.tutorial && dungeonLevel === 1) window.tutorial.onDoorOpened();
                startTransition();
                return;
            }
            moveWithCollision(player, dx, dy);
        }

        player.dashAfterimages.forEach(img => img.alpha -= 0.05);
        player.dashAfterimages = player.dashAfterimages.filter(img => img.alpha > 0);

        if (player.invulnTimer > 0) player.invulnTimer--;

        // Ataque do jogador
        if (player.isAttacking) {
            player.attackTimer--;
            let sX = player.x, sY = player.y, sW = player.w, sH = player.h, r = 28;
            if (player.dir === 'up') sY -= r; else if (player.dir === 'down') sY += player.h;
            else if (player.dir === 'left') sX -= r; else sX += player.w;
            if (player.dir === 'up' || player.dir === 'down') sW = player.w; else sH = player.h;
            if (player.dir === 'left' || player.dir === 'right') sW = r; else sH = r;

            // Verificar tiles quebráveis no retângulo de ataque
            for (let tr = Math.floor(sY / TILE_SIZE); tr <= Math.floor((sY + sH) / TILE_SIZE); tr++) {
                for (let tc = Math.floor(sX / TILE_SIZE); tc <= Math.floor((sX + sW) / TILE_SIZE); tc++) {
                    if (tr >= 0 && tr < ROWS && tc >= 0 && tc < COLS) {
                        if (currentMap[tr][tc] === TILE_BREAKABLE) {
                            breakableHealth[tr][tc]--;
                            playSound('hit');
                            if (breakableHealth[tr][tc] <= 0) {
                                breakTile(tr, tc);
                            } else {
                                spawnParticles(tc * TILE_SIZE + TILE_SIZE / 2, tr * TILE_SIZE + TILE_SIZE / 2, '#fff', 3);
                            }
                        }
                    }
                }
            }

            // Ataque a inimigos
            for (let index = enemies.length - 1; index >= 0; index--) {
                let en = enemies[index];
                if (sX < en.x + en.w && sX + sW > en.x && sY < en.y + en.h && sY + sH > en.y) {
                    if (player.swordBoostTimer > 0) en.health = 0; else en.health--;
                    en.hitFlashTimer = 5;

                    const kb = 40;
                    if (player.dir === 'up') moveWithCollision(en, 0, -kb);
                    else if (player.dir === 'down') moveWithCollision(en, 0, kb);
                    else if (player.dir === 'left') moveWithCollision(en, -kb, 0);
                    else moveWithCollision(en, kb, 0);
                    playSound('enemyHit');

                    if (en.health <= 0) {
                        spawnParticles(en.x + en.w/2, en.y + en.h/2, en.color, 12);
                        
                        // Calcular posição segura para os drops (centralizado na tile)
                        let tileX = Math.floor(en.x / TILE_SIZE);
                        let tileY = Math.floor(en.y / TILE_SIZE);
                        let centerX = tileX * TILE_SIZE + TILE_SIZE/2;
                        let centerY = tileY * TILE_SIZE + TILE_SIZE/2;
                        let itemX = centerX - 10;
                        let itemY = centerY - 10;

                        // Verificar se a tile é vazia; se não, procurar uma vazia próxima
                        if (currentMap[tileY] && currentMap[tileY][tileX] !== 0) {
                            // Procura nas 4 direções + centro
                            const dirs = [[0,0], [-1,0], [1,0], [0,-1], [0,1]];
                            let found = false;
                            for (let [dx, dy] of dirs) {
                                let nx = tileX + dx;
                                let ny = tileY + dy;
                                if (nx >= 0 && nx < COLS && ny >= 0 && ny < ROWS && currentMap[ny][nx] === 0) {
                                    centerX = nx * TILE_SIZE + TILE_SIZE/2;
                                    centerY = ny * TILE_SIZE + TILE_SIZE/2;
                                    itemX = centerX - 10;
                                    itemY = centerY - 10;
                                    found = true;
                                    break;
                                }
                            }
                            if (!found) {
                                // Fallback: coloca na posição original do inimigo (mas pode ficar em tile sólida)
                                itemX = en.x + 5;
                                itemY = en.y + 5;
                            }
                        }

                        if (en.dropsKey) {
                            keysOnGround.push({ x: itemX, y: itemY, w: 20, h: 20 });
                        }
                        spawnDrop(itemX, itemY);
                        playSound('enemyDeath');
                        
                        if (en.type === 'slime' && !en.isSmall) {
                            enemies.push(createEnemy('slime', en.x/40, en.y/40, true));
                            enemies.push(createEnemy('slime', (en.x+10)/40, (en.y+10)/40, true));
                            playSound('slimeSplit');
                        }
                        enemies.splice(index, 1);
                        totalKills++;
                    }
                    player.isAttacking = false;
                }
            }
            if (player.attackTimer <= 0) player.isAttacking = false;
        }

        // Movimento e comportamento dos inimigos
        enemies.forEach(en => {
            if (en.hitFlashTimer > 0) en.hitFlashTimer--;

            if (en.type === 'berserker' && en.health <= en.maxHealth / 2) {
                en.speed = 2.2;
                const angle = Math.atan2((player.y - en.y), (player.x - en.x));
                moveWithCollision(en, Math.cos(angle) * en.speed, Math.sin(angle) * en.speed);
            } else if (en.type === 'shadow') {
                en.teleportTimer--;
                if (en.teleportTimer <= 0) {
                    const rx = 1 + Math.floor(Math.random() * 8);
                    const ry = 1 + Math.floor(Math.random() * 8);
                    if (currentMap[ry][rx] === 0) {
                        en.x = rx * TILE_SIZE + 5; en.y = ry * TILE_SIZE + 5;
                        en.teleportTimer = 120 + Math.random() * 60;
                    }
                }
            } else if (en.type === 'mage') {
                en.shootTimer--;
                if (en.shootTimer <= 0) {
                    const angle = Math.atan2((player.y - en.y), (player.x - en.x));
                    const pColor = currentBiome === 'hell' ? '#ff5722' : '#f1c40f';
                    projectiles.push({ x: en.x + 10, y: en.y + 10, w: 8, h: 8, vx: Math.cos(angle) * 3, vy: Math.sin(angle) * 3, color: pColor });
                    en.shootTimer = 100;
                    playSound('mageShoot');
                }
            } else {
                en.moveTimer--;
                if (en.moveTimer <= 0) {
                    const d = ['u','d','l','r']; en.dir = d[Math.floor(Math.random()*4)];
                    en.moveTimer = 30 + Math.random()*40;
                }
                let ex=0, ey=0;
                if (en.dir === 'u') ey = -en.speed; else if (en.dir === 'd') ey = en.speed;
                else if (en.dir === 'l') ex = -en.speed; else ex = en.speed;
                moveWithCollision(en, ex, ey);
            }

            // Colisão inimigo com jogador
            if (player.x < en.x+en.w && player.x+player.w > en.x && player.y < en.y+en.h && player.y+player.h > en.y) damagePlayer(1);
        });

        // Projéteis
        for (let idx = projectiles.length - 1; idx >= 0; idx--) {
            let p = projectiles[idx];
            p.x += p.vx; p.y += p.vy;

            // Colisão com tiles (ignorar armadilhas)
            let tileR = Math.floor(p.y / TILE_SIZE);
            let tileC = Math.floor(p.x / TILE_SIZE);
            if (tileR >= 0 && tileR < ROWS && tileC >= 0 && tileC < COLS) {
                const tile = currentMap[tileR][tileC];
                if (tile === TILE_BREAKABLE) {
                    breakableHealth[tileR][tileC]--;
                    if (breakableHealth[tileR][tileC] <= 0) {
                        breakTile(tileR, tileC);
                    }
                    projectiles.splice(idx, 1);
                    continue;
                } else if (tile !== 0 && tile !== TILE_TRAP_PERIODIC) {
                    projectiles.splice(idx, 1);
                    continue;
                }
            }

            // Colisão com jogador
            if (player.x < p.x + p.w && player.x + player.w > p.x && player.y < p.y + p.h && player.y + player.h > p.y) {
                damagePlayer(1);
                projectiles.splice(idx, 1);
                playSound('projectileHit');
            }
        }

        // Inimigos tomam dano de armadilhas (com posição segura para drops)
        enemies.forEach(en => {
            let enLeft = en.x;
            let enRight = en.x + en.w;
            let enTop = en.y;
            let enBottom = en.y + en.h;
            let startCol = Math.floor(enLeft / TILE_SIZE);
            let endCol = Math.floor(enRight / TILE_SIZE);
            let startRow = Math.floor(enTop / TILE_SIZE);
            let endRow = Math.floor(enBottom / TILE_SIZE);
            let damaged = false;
            for (let r = startRow; r <= endRow && !damaged; r++) {
                for (let c = startCol; c <= endCol && !damaged; c++) {
                    if (r >= 0 && r < ROWS && c >= 0 && c < COLS) {
                        if (currentMap[r][c] === TILE_TRAP_PERIODIC && trapState[r][c] === 1) {
                            en.health--;
                            en.hitFlashTimer = 5;
                            playSound('enemyHit');
                            if (en.health <= 0) {
                                spawnParticles(en.x + en.w/2, en.y + en.h/2, en.color, 12);
                                
                                // Posição segura (centralizada na tile)
                                let tileX = Math.floor(en.x / TILE_SIZE);
                                let tileY = Math.floor(en.y / TILE_SIZE);
                                let centerX = tileX * TILE_SIZE + TILE_SIZE/2;
                                let centerY = tileY * TILE_SIZE + TILE_SIZE/2;
                                let itemX = centerX - 10;
                                let itemY = centerY - 10;

                                if (currentMap[tileY] && currentMap[tileY][tileX] !== 0) {
                                    const dirs = [[0,0], [-1,0], [1,0], [0,-1], [0,1]];
                                    let found = false;
                                    for (let [dx, dy] of dirs) {
                                        let nx = tileX + dx;
                                        let ny = tileY + dy;
                                        if (nx >= 0 && nx < COLS && ny >= 0 && ny < ROWS && currentMap[ny][nx] === 0) {
                                            centerX = nx * TILE_SIZE + TILE_SIZE/2;
                                            centerY = ny * TILE_SIZE + TILE_SIZE/2;
                                            itemX = centerX - 10;
                                            itemY = centerY - 10;
                                            found = true;
                                            break;
                                        }
                                    }
                                    if (!found) {
                                        itemX = en.x + 5;
                                        itemY = en.y + 5;
                                    }
                                }

                                if (en.dropsKey) {
                                    keysOnGround.push({ x: itemX, y: itemY, w: 20, h: 20 });
                                }
                                spawnDrop(itemX, itemY);
                                playSound('enemyDeath');
                                enemies = enemies.filter(e => e !== en);
                            }
                            damaged = true;
                        }
                    }
                }
            }
        });

        // Lógica de chaves e drops (apenas para salas normais, não na primeira sala tutorial)
        if (currentRoomType === 0 && dungeonLevel !== 1 && enemies.length === 0 && !standardKeyDropped) {
            keysOnGround.push({ x: 192, y: 192, w: 15, h: 15 });
            standardKeyDropped = true;
        }

        for (let i = keysOnGround.length - 1; i >= 0; i--) {
            let k = keysOnGround[i];
            if (player.x < k.x + k.w && player.x + player.w > k.x && player.y < k.y + k.h && player.y + player.h > k.y) {
                player.keys++; keysOnGround.splice(i, 1);
                playSound('pickup');
                if (window.tutorial) window.tutorial.onKeyCollected();
            }
        }

        for (let i = drops.length - 1; i >= 0; i--) {
            let d = drops[i];
            if (player.x < d.x + d.w && player.x + player.w > d.x && player.y < d.y + d.h && player.y + player.h > d.y) {
                if (d.type === 'heart') {
                    player.health = Math.min(player.maxHealth, player.health + 1);
                    if (window.uiManager) uiManager.update();
                } else if (d.type === 'speed') {
                    player.speedBoostTimer = 300;
                } else if (d.type === 'shield') {
                    player.shieldActive = true;
                } else if (d.type === 'sword') {
                    player.swordBoostTimer = 300;
                }
                drops.splice(i, 1);
                playSound('pickup');
            }
        }

        // Atualizar UI a cada frame
        if (window.uiManager) uiManager.update();
    }

    if (crossfadeTimer > 0) crossfadeTimer--;
    if (biomeTransitionTimer > 0) biomeTransitionTimer--;

    if (currentState === GameState.TRANSITION) {
        transition.frame++;
        if (transition.frame > transition.maxFrames) transition.frame = transition.maxFrames;
        let progress = transition.frame / transition.maxFrames;
        let eased = progress < 0.5 ? 2 * progress * progress : 1 - 2 * (1 - progress) * (1 - progress);
        if (transition.phase === 'fadeOut') {
            transition.alpha = eased;
        } else {
            transition.alpha = 1 - eased;
        }
        if (transition.frame === transition.maxFrames) {
            if (transition.phase === 'fadeOut') {
                dungeonLevel++;
                player.health = Math.min(player.maxHealth, player.health + 1);
                if (window.uiManager) uiManager.update();
                initLevel();
                transition.phase = 'fadeIn';
                transition.frame = 0;
            } else {
                currentState = GameState.PLAYING;
                transition.alpha = 0;
            }
        }
    }
}