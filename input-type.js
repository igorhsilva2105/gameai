// Module: Input Type (apenas estado, sem atualização de DOM)

let currentInputType = 'keyboard';

window.inputType = {
    set: (type) => { currentInputType = type; },
    get: () => currentInputType
};