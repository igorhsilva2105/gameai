// Module: Core Data

const TILE_SIZE = 40;
const ROWS = 10, COLS = 10;
const GLOBAL_SEED = Math.floor(Math.random() * 1000000);

// Novos tipos de tile
const TILE_BREAKABLE = 7;
const TILE_TRAP_PERIODIC = 8;

// Arrays para estados de obstáculos
let breakableHealth = []; // matriz 10x10, 0 = não quebrável, >0 = saúde atual
let trapState = [];       // matriz 10x10, 0 = inativo, 1 = ativo
let trapTimer = [];       // matriz 10x10, frames restantes para próxima mudança

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

let currentState = GameState.MENU;
let debugMode = false;

// Game progression
let dungeonLevel = 1;
let totalKills = 0;
let currentMap = [];
let enemies = [];
let projectiles = [];
let drops = [];
let keysOnGround = [];
let standardKeyDropped = false;
let currentRoomType = 0;
let currentBiome = 'forest';
let biomeSequence = [];

// Visual effects
let particles = [];
let shakeTimer = 0;
const shakeIntensity = 8;
let biomeTransitionTimer = 0; // For visual cue on biome change

// Player
const player = {
    x: 0, y: 0, w: 22, h: 22,
    baseSpeed: 3.5, dir: 'down',
    health: 3, maxHealth: 3,
    keys: 0, isAttacking: false,
    attackTimer: 0, invulnTimer: 0,
    speedBoostTimer: 0,
    shieldActive: false,
    swordBoostTimer: 0,
    isDashing: false,
    dashTimer: 0,
    dashCooldown: 0,
    dashMaxCooldown: 35,
    dashAfterimages: [],
    stepTimer: 0,
    stepCooldown: 15
};

// Transition controller
let transition = {
    phase: 'fadeOut',
    frame: 0,
    maxFrames: 18,
    alpha: 0
};