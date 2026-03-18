// Module: Procedural Music Data

const scales = {
    major: [0, 2, 4, 5, 7, 9, 11],
    naturalMinor: [0, 2, 3, 5, 7, 8, 10],
    phrygian: [0, 1, 3, 5, 7, 8, 10],
    locrian: [0, 1, 3, 5, 6, 8, 10]
};

const biomeData = {
    forest: { 
        name: 'Forest', 
        wall: '#1b4d3e', floor: '#0d3d0d', obstacle: '#228b22', 
        weights: { slime: 0.6, berserker: 0.2, shadow: 0.1, mage: 0.1 },
        bpm: 120,
        scaleType: 'major',
        progressions: [[0, 4, 5, 2], [0, 5, 3, 4]],
        bassType: 'triangle',
        leadType: 'sine',
        arpType: 'triangle'
    },
    desert: { 
        name: 'Desert', 
        wall: '#8b4513', floor: '#f4a460', obstacle: '#cd853f', 
        weights: { mage: 0.5, shadow: 0.3, berserker: 0.1, slime: 0.1 },
        bpm: 105,
        scaleType: 'phrygian',
        progressions: [[0, 3, 1, 4], [0, 1, 4, 3]],
        bassType: 'sawtooth',
        leadType: 'sawtooth',
        arpType: 'sawtooth'
    },
    ice: { 
        name: 'Ice', 
        wall: '#4682b4', floor: '#add8e6', obstacle: '#00bfff', 
        weights: { slime: 0.4, mage: 0.4, shadow: 0.1, berserker: 0.1 },
        bpm: 90,
        scaleType: 'naturalMinor',
        progressions: [[0, 5, 3, 6], [0, 3, 6, 5]],
        bassType: 'sine',
        leadType: 'triangle',
        arpType: 'triangle'
    },
    hell: { 
        name: 'Hell', 
        wall: '#8b0000', floor: '#b22222', obstacle: '#ff4500', 
        weights: { berserker: 0.5, shadow: 0.2, mage: 0.2, slime: 0.1 },
        bpm: 150,
        scaleType: 'locrian',
        progressions: [[0, 3, 6, 1], [0, 6, 1, 3]],
        bassType: 'square',
        leadType: 'square',
        arpType: 'sawtooth'
    }
};

// Audio music system
let audioCtx = null;
let masterGain = null;
let sfxGain = null;
let currentPattern = null;
let previousPattern = null;
let bpm = 120;
let beatDuration = 0;
let nextBeatTime = 0;
let currentBeat = 0;
let musicSchedulerId = null;
let progressionIdx = 0;
let loopCount = 0;
let combatIntensity = 0;
let crossfadeTimer = 0;
let crossfadeDuration = 120;