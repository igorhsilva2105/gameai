// Module: Transition Helpers

function startTransition() {
    currentState = GameState.TRANSITION;
    transition.phase = 'fadeOut';
    transition.frame = 0;
    transition.alpha = 0;
    playSound('doorOpen');
}