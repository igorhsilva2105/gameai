# Correlação entre Módulos do Jogo "Mini Quest: Biome Omen"

Este documento mapeia as dependências entre os 22 módulos do jogo, destacando como cada um impacta os demais. Como todos compartilham o escopo global, alterações em um módulo podem propagar efeitos para outros que o utilizam.

## Legenda
- **Dependências**: Módulos dos quais este módulo precisa (variáveis ou funções definidas em outros).
- **Impactos em Outros**: Módulos que dependem deste ou que são afetados por suas alterações.
- **Nível de Impacto**: Alto (crítico para o funcionamento), Médio (afeta uma área específica) ou Baixo (localizado).

## 1. State System
- **Dependências**: Nenhuma.
- **Impactos em Outros**: Quase todos os módulos usam `currentState` e `GameState` para controle de fluxo (Update, Render, Input, Tutorial, etc.).
- **Impacto**: Alto.

## 2. Core Data
- **Dependências**: State System (usa `currentState`).
- **Impactos em Outros**: Fornece todas as variáveis globais (`player`, `enemies`, `currentMap`, `TILE_SIZE`, etc.) usadas em Physics, Update, Render, Level Generation, Tutorial, UI Manager, etc.
- **Impacto**: Alto.

## 3. Input Type
- **Dependências**: Nenhuma (apenas estado interno).
- **Impactos em Outros**: Fornece `window.inputType.get()` e `set()` para Gamepad Support, Virtual Pad, Input System, Tutorial e Render (para exibir textos adequados).
- **Impacto**: Médio.

## 4. Procedural Music Data
- **Dependências**: Nenhuma.
- **Impactos em Outros**: `biomeData` e `scales` são usados por Audio System, Level Generation, Enemy Factory e Render System (cores).
- **Impacto**: Médio.

## 5. Gamepad Support
- **Dependências**: Input Type (`window.inputType`), Core Data (`keys`), State System, Tutorial (`window.tutorial.onAttack`, `onDash`).
- **Impactos em Outros**: Define ações (`playerAttack`, etc.) chamadas por Virtual Pad e Input System. Atualiza `keys` e `currentInputType`.
- **Impacto**: Médio.

## 6. Virtual Pad
- **Dependências**: Input Type, Core Data (`keys`), State System.
- **Impactos em Outros**: Mesmo que Gamepad Support, porém focado em mobile. Atualiza `keys` e chama as mesmas ações.
- **Impacto**: Médio.

## 7. Helper Functions
- **Dependências**: Core Data (`GLOBAL_SEED`, `biomeSequence`).
- **Impactos em Outros**: `seededRandom` é usado em Level Generation, Enemy Factory, Audio System. `getBiome` é usado em Level Generation.
- **Impacto**: Alto (base para proceduralidade).

## 8. Audio System
- **Dependências**: Procedural Music Data (`scales`, `biomeData`), Helper Functions (`seededRandom`), Core Data (`audioCtx`, `currentBiome`).
- **Impactos em Outros**: `playSound` e `startBiomeMusic` são chamados por Update System, Level Generation, Damage Handler, etc.
- **Impacto**: Médio.

## 9. Physics & Collision
- **Dependências**: Core Data (`currentMap`, `TILE_SIZE`).
- **Impactos em Outros**: `checkTileCollision` e `moveWithCollision` são usados por Update System para movimento de todas as entidades.
- **Impacto**: Alto.

## 10. Effects
- **Dependências**: Core Data (`particles`).
- **Impactos em Outros**: `spawnParticles` é chamado por Update System (destruição de inimigos, quebráveis, ativação de armadilhas). Render System desenha as partículas.
- **Impacto**: Baixo (apenas visual).

## 11. Enemy Factory
- **Dependências**: Procedural Music Data (`biomeData`), Core Data (`currentBiome`, `dungeonLevel`), Helper Functions (`seededRandom`).
- **Impactos em Outros**: `createEnemy` é usado por Level Generation para povoar as salas.
- **Impacto**: Médio.

## 12. Level Generation
- **Dependências**: Helper Functions (`getBiome`, `seededRandom`), Procedural Music Data (`biomeData`), Enemy Factory, Core Data (quase todos), Audio System (`startBiomeMusic`), Tutorial (indireto, pois define mapa especial).
- **Impactos em Outros**: `initLevel` é chamado por Initialization & Reset e Transition Helpers. Define `currentMap`, `enemies`, etc., usados por Update, Render e Tutorial.
- **Impacto**: Alto.

## 13. Drop System
- **Dependências**: Core Data (`currentRoomType`, `drops`).
- **Impactos em Outros**: `spawnDrop` é chamado por Update System (ao matar inimigos ou quebrar tiles). Render System desenha os drops.
- **Impacto**: Baixo.

## 14. Initialization & Reset
- **Dependências**: Level Generation (`initLevel`), Audio System (`stopMusic`), Core Data (reset de variáveis), Tutorial (`window.tutorial.reset`).
- **Impactos em Outros**: `resetGameData` e `startNewRun` são usados por Gamepad Support, Virtual Pad e Initial Boot. Afetam todo o estado do jogo.
- **Impacto**: Alto.

## 15. Transition Helpers
- **Dependências**: Core Data (`transition`), State System (`GameState`), Audio System (`playSound`).
- **Impactos em Outros**: `startTransition` é chamado por Update System quando o jogador entra em uma porta. Altera `currentState` e `transition`, usados por Render System.
- **Impacto**: Médio.

## 16. Damage Handler
- **Dependências**: Core Data (`player`, `shakeTimer`), Audio System (`playSound`), State System (`GameState`), UI Manager (`uiManager.update`).
- **Impactos em Outros**: `damagePlayer` é chamado por Update System. Afeta a saúde do jogador e a UI.
- **Impacto**: Médio.

## 17. Input System
- **Dependências**: Input Type (`window.inputType`), Core Data (`keys`), State System, Tutorial (`window.tutorial.skip` para pular tutorial).
- **Impactos em Outros**: Processa teclado e chama as ações definidas em Gamepad Support. Atualiza `keys`, lido por Update System.
- **Impacto**: Alto.

## 18. Update System
- **Dependências**: Quase todos os módulos anteriores: Physics, Effects, Enemy Factory (indireto), Audio, Damage, Transition, Drop, Input (via `keys`), Core Data, Tutorial (chama `onMove`, `onKeyCollected`, `onDoorOpened`), UI Manager (`uiManager.update`).
- **Impactos em Outros**: É o núcleo da lógica; chama funções de outros módulos e modifica estados que serão renderizados. Qualquer erro aqui paralisa o jogo.
- **Impacto**: Alto.

## 19. Render System
- **Dependências**: Core Data (todas as entidades), Procedural Music Data (cores), Effects (partículas), State System (para escolher a tela), Tutorial (`window.tutorial.draw`), Input Type (para textos no menu).
- **Impactos em Outros**: Não modifica estados, apenas desenha. Alterações visuais não afetam a lógica.
- **Impacto**: Médio.

## 20. UI Manager
- **Dependências**: Core Data (`player`, `dungeonLevel`, `currentBiome`, `biomeData`), State System (`currentState`).
- **Impactos em Outros**: Cria e atualiza elementos da interface. É chamado por Update System, Damage Handler, Initialization & Reset e Initial Boot.
- **Impacto**: Médio.

## 21. Tutorial
- **Dependências**: Core Data (`dungeonLevel`, `currentState`), Input Type (`window.inputType.get`), Gamepad Support (chamadas de `onAttack`, `onDash`), Update System (chamadas de `onMove`, `onKeyCollected`, `onDoorOpened`), Input System (chamada de `skip`).
- **Impactos em Outros**: Desenha a caixa de tutorial via Render System. Controla o fluxo de aprendizado na primeira sala.
- **Impacto**: Baixo (apenas na primeira sala).

## 22. Initial Boot
- **Dependências**: Initialization & Reset (`resetGameData`), UI Manager (`uiManager.update`), Input Type (`inputType.updateHints` – se ainda existir, mas foi removido, então apenas `uiManager.update`).
- **Impactos em Outros**: Executado uma única vez ao carregar a página. Define o estado inicial.
- **Impacto**: Baixo.

## Diagrama de Dependências Simplificado

State System (1) → Core Data (2) → Helper Functions (7) → Procedural Music Data (4)
↓
Audio System (8)
↓
Input Type (3) ← Gamepad Support (5) ← Virtual Pad (6) ← Input System (17)
↓                              ↓                    ↓
└──────────┬───────────────────┴────────────────────┘
↓
Update System (18) ← Physics (9) ← Effects (10)
↓
+------------+------------+------------+------------+
↓            ↓            ↓            ↓            ↓
Damage Handler Level Gen.  Drop System  Transition   Tutorial
(16)          (12)         (13)         (15)        (21)
↓            ↓                         ↓
└────────────┼─────────────────────────┘
↓
Initialization & Reset (14)
↓
Initial Boot (20)
↓
Render System (19) ← UI Manager (20)


## Recomendações para Edição
- Comece pelos módulos de base (1, 2, 7) e teste progressivamente.
- Use `console.log` ou ferramentas de debug para rastrear impactos.
- Ao modificar funções globais, verifique todos os arquivos que as chamam (busca por texto no projeto).
- O módulo Tutorial é relativamente isolado, mas suas chamadas estão espalhadas em Gamepad Support e Update System.
- A UI agora é gerida pelo `ui-manager.js`, então alterações na interface devem ser feitas lá.
- O `input-type.js` é simples, mas crítico para adaptar textos e tutoriais ao tipo de controle.