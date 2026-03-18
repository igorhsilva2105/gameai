// Module: Initial Boot
resetGameData();
currentState = GameState.MENU;
if (window.uiManager) uiManager.update();
window.inputType.updateHints(); // Atualiza hints iniciais