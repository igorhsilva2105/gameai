# Modularização do Jogo "Mini Quest: Biome Omen"

Este documento descreve cada um dos 22 módulos JavaScript que compõem o jogo, organizados na ordem de carregamento das tags `<script>` no arquivo HTML. Cada módulo é responsável por uma parte específica do jogo, e todos compartilham o escopo global, permitindo comunicação direta entre si.

## 1. State System (`state-system.js`)
Define os estados possíveis do jogo através de um objeto congelado (`Object.freeze`):
- `MENU` – tela inicial.
- `PLAYING` – jogo em andamento.
- `PAUSED` – jogo pausado.
- `GAMEOVER` – tela de fim de jogo.
- `TRANSITION` – transição entre salas.

Esses estados são usados por quase todos os outros módulos para controlar o fluxo do jogo.

## 2. Core Data (`core-data.js`)
Declara todas as constantes e variáveis globais essenciais:
- Dimensões do mapa (`TILE_SIZE`, `ROWS`, `COLS`).
- Semente global (`GLOBAL_SEED`) para geração procedural.
- Novos tipos de tile: `TILE_BREAKABLE` (7) e `TILE_TRAP_PERIODIC` (8).
- Matrizes de estado: `breakableHealth`, `trapState`, `trapTimer`.
- Referências ao canvas e contexto 2D.
- Progressão: `dungeonLevel`, `totalKills`, `currentMap`, listas de entidades (`enemies`, `projectiles`, `drops`, `keysOnGround`).
- Biomas: `currentBiome`, `biomeSequence`.
- Efeitos visuais: `particles`, `shakeTimer`, `biomeTransitionTimer`.
- Objeto do jogador (`player`) com todas as suas propriedades (posição, saúde, timers, etc.).
- Controlador de transição (`transition`).

## 3. Input Type (`input-type.js`)
Gerencia o tipo de entrada atual (`keyboard`, `gamepad`, `mobile`). Não atualiza mais a interface diretamente; apenas armazena o estado e o expõe via objeto `window.inputType`.

## 4. Procedural Music Data (`procedural-music.js`)
Contém os dados musicais e definições dos biomas:
- Escalas musicais (`scales`) – major, naturalMinor, phrygian, locrian.
- `biomeData` – para cada bioma: nome, cores, pesos de inimigos, BPM, tipo de escala, progressões de acordes, tipos de onda (bass, lead, arp).
- Variáveis de áudio: `audioCtx`, `masterGain`, `sfxGain`, `currentPattern`, `bpm`, `beatDuration`, `nextBeatTime`, `crossfadeTimer`, etc.

## 5. Gamepad Support (`gamepad-support.js`)
Adiciona suporte a controles (gamepads):
- Detecta conexão/desconexão e atualiza `currentInputType` via `window.inputType.set()`.
- Define funções de ação: `playerAttack`, `playerDash`, `playerRestart`, `playerMenu`, `playerPause`, `playerStart`.
- Mapeia botões do gamepad e eixos para teclas virtuais (`keys`) e dispara as ações.
- Mantém `previousButtonStates` para evitar repetição.
- Agora também notifica o tutorial sobre ataques e dashes (`window.tutorial.onAttack()` e `window.tutorial.onDash()`).

## 6. Virtual Pad (Mobile) (`virtual-pad.js`)
Configura os botões virtuais na tela para dispositivos móveis:
- Adiciona eventos de toque e mouse aos elementos do pad direcional e botões de ação.
- Atualiza `keys` e `currentInputType` para `mobile` via `window.inputType.set()`.
- Chama as mesmas funções de ação definidas no módulo de gamepad.

## 7. Helper Functions (`helper-functions.js`)
Funções utilitárias para geração procedural:
- `seededRandom(seed)` – gerador de números pseudoaleatórios baseado em semente.
- `generateBiomeSequence(seed)` – cria uma sequência de biomas com número variável de andares.
- `getBiome(level)` – retorna o bioma correspondente ao andar atual.

## 8. Audio System (`audio-system.js`)
Sistema de áudio completo, com música procedural e efeitos sonoros (refatorado com funções auxiliares e cache de buffers).

## 9. Physics & Collision (`physics-collision.js`)
Funções para detecção de colisão e movimento:
- `checkTileCollision(x, y, w, h, isProjectile)` – verifica se a entidade colide com tiles sólidos (ignora armadilhas).
- `moveWithCollision(ent, dx, dy)` – move a entidade respeitando as colisões.

## 10. Effects (`effects.js`)
Gerencia efeitos visuais de partículas:
- `spawnParticles(x, y, color, count)` – cria partículas em uma posição, usada ao destruir objetos, matar inimigos, etc.

## 11. Enemy Factory (`enemy-factory.js`)
Criação de inimigos com base no bioma e nível:
- `pickEnemyType(biome)` – escolhe um tipo aleatório com pesos definidos em `biomeData`.
- `createEnemy(type, tx, ty, isSmall)` – instancia um inimigo com atributos específicos (saúde, velocidade, cor, comportamentos).

## 12. Level Generation (`level-generation.js`)
Geração procedural de cada andar:
- `generateTutorialLevel()` – mapa fixo para a primeira sala (baseado no anexo).
- `generateRoom(level, kills, doorTile)` – constrói o mapa procedural para níveis > 1.
- `initLevel()` – inicializa o nível: determina bioma, tipo de sala, gera o mapa (usando o tutorial se for nível 1), posiciona o jogador, cria inimigos (um slime especial no tutorial) e inicia a música.

## 13. Drop System (`drop-system.js`)
Sistema de drops de itens:
- `spawnDrop(x, y)` – com certa chance (maior em salas especiais), cria um item (`heart`, `speed`, `shield`, `sword`) no chão.

## 14. Initialization & Reset (`initialization-reset.js`)
Funções para reiniciar o estado do jogo:
- `resetGameData()` – limpa todas as listas, reseta as propriedades do jogador e também reseta o tutorial (`window.tutorial.reset()`).
- `startNewRun()` – chama `resetGameData()` e `initLevel()` para começar uma nova partida.

## 15. Transition Helpers (`transition-helpers.js`)
Controla a transição entre salas:
- `startTransition()` – inicia o fade out, muda o estado para `TRANSITION` e toca o som de porta.

## 16. Damage Handler (`damage-handler.js`)
Aplica dano ao jogador e atualiza a UI via `uiManager.update()`.

## 17. Input System (`input-system.js`)
Gerencia entradas de teclado e integra com gamepad e virtual pad:
- Listeners de `keydown`/`keyup` para teclas definidas.
- Mapeia teclas para ações (`playerAttack`, `playerDash`, etc.).
- A função `handleGamepad()` é chamada no loop de update.

## 18. Update System (`update-system.js`)
Loop principal de atualização (chamado a cada frame):
- Atualiza timers, partículas, armadilhas.
- Processa movimento do jogador (normal ou dash), colisões com portas e tiles.
- Notifica o tutorial sobre movimento (`window.tutorial.onMove()`), coleta de chave (`onKeyCollected`) e abertura de porta (`onDoorOpened`).
- Ao matar inimigos, posiciona drops em tiles vazias (evita que caiam sobre obstáculos).
- Não gera chave extra na sala tutorial.

## 19. Render System (`render-system.js`)
Responsável por desenhar tudo na tela:
- `renderGame()` – desenha o mapa, entidades, efeitos.
- Chama `window.tutorial.draw(ctx)` para desenhar o tutorial se ativo.
- Demais funções de menu e overlays.

## 20. UI Manager (`ui-manager.js`)
Cria e gerencia dinamicamente todos os elementos da interface do usuário (corações, barra de dash, indicador de boosts). Atualiza esses elementos a cada frame via `uiManager.update()`.

## 21. Tutorial (`tutorial.js`)
Implementa um tutorial passo a passo na primeira sala:
- Etapas: Mover, Atacar, Dash, Pegar chave, Abrir porta.
- Cada ação é detectada e avança a etapa.
- Desenha uma caixa com instruções baseadas no tipo de input.
- Pode ser pulado pressionando ESC (teclado) ou Start (gamepad) – funcionalidade implementada via `window.tutorial.skip()` chamada pelo Input System.
- Exibe uma dica de como pular o tutorial.

## 22. Initial Boot (`initial-boot.js`)
Executado ao carregar a página:
- Chama `resetGameData()`, define `currentState = GameState.MENU` e atualiza a UI via `uiManager.update()`.
- Prepara o jogo para a primeira interação do usuário.