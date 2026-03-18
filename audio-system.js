// Module: Audio System

// Cache para buffers de ruído (reutilização)
const noiseBufferCache = new Map();

function getNoiseBuffer(durationSec) {
    const sampleRate = audioCtx.sampleRate;
    const bufferSize = Math.floor(sampleRate * durationSec);
    const key = bufferSize;
    if (noiseBufferCache.has(key)) return noiseBufferCache.get(key);
    const buffer = audioCtx.createBuffer(1, bufferSize, sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
    }
    noiseBufferCache.set(key, buffer);
    return buffer;
}

function createOscillator(type, frequency, startTime, duration, gainNode, volume, pitch = 1) {
    const osc = audioCtx.createOscillator();
    osc.type = type;
    osc.frequency.value = frequency * pitch;
    osc.connect(gainNode);
    osc.start(startTime);
    osc.stop(startTime + duration);
    return osc;
}

function createEnvelope(gainNode, startTime, attackTime, peakVolume, releaseTime, endVolume = 0.01) {
    gainNode.gain.setValueAtTime(0, startTime);
    gainNode.gain.linearRampToValueAtTime(peakVolume, startTime + attackTime);
    gainNode.gain.exponentialRampToValueAtTime(endVolume, startTime + attackTime + releaseTime);
}

function playOscillator(options) {
    const {
        frequency,
        duration,
        type = 'sine',
        volume = 0.1,
        pitch = 1,
        attack = 0.01,
        release = 0.1,
        sfx = false
    } = options;
    const now = audioCtx.currentTime;
    const gain = audioCtx.createGain();
    gain.connect(sfx ? sfxGain : masterGain);
    createOscillator(type, frequency, now, duration, gain, volume, pitch);
    createEnvelope(gain, now, attack, volume, release);
}

function playNoise(options) {
    const {
        duration,
        filterType = 'lowpass',
        filterFreq = 800,
        volume = 0.1,
        pitch = 1,
        attack = 0.01,
        release = 0.1,
        sfx = false
    } = options;
    const now = audioCtx.currentTime;
    const buffer = getNoiseBuffer(duration);
    const noise = audioCtx.createBufferSource();
    noise.buffer = buffer;
    const filter = audioCtx.createBiquadFilter();
    filter.type = filterType;
    filter.frequency.setValueAtTime(filterFreq * pitch, now);
    filter.frequency.exponentialRampToValueAtTime(filterFreq * pitch * 0.3, now + duration);
    const gain = audioCtx.createGain();
    noise.connect(filter);
    filter.connect(gain);
    gain.connect(sfx ? sfxGain : masterGain);
    createEnvelope(gain, now, attack, volume, release);
    noise.start(now);
    noise.stop(now + duration);
}

function initAudio() {
    if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        masterGain = audioCtx.createGain();
        masterGain.connect(audioCtx.destination);
        masterGain.gain.value = 0;
        sfxGain = audioCtx.createGain();
        sfxGain.gain.value = 0.3;
        sfxGain.connect(audioCtx.destination);
    }
}

function noteFreq(midiNote) {
    return 440 * Math.pow(2, (midiNote - 69) / 12);
}

function playTone(midiNote, durationBeats, opts = {}) {
    if (midiNote <= 0) return;
    const now = audioCtx.currentTime;
    const freq = noteFreq(midiNote);
    const osc = audioCtx.createOscillator();
    osc.frequency.value = freq;
    osc.type = opts.type || 'sine';
    const gain = audioCtx.createGain();
    gain.connect(opts.sfx ? sfxGain : masterGain);
    osc.connect(gain);
    gain.gain.setValueAtTime(opts.vol || 0.1, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + durationBeats * beatDuration);
    osc.start(now);
    osc.stop(now + durationBeats * beatDuration);
}

function generateMusicPattern(biomeKey, level) {
    const data = biomeData[biomeKey];
    const scale = scales[data.scaleType];
    const rootMidi = 60;
    const seedBase = GLOBAL_SEED + level * 100;
    let bass = [];
    let melody = [];
    let arp = [];
    let kick = [];
    let snare = [];
    let extraPerc = [];
    for (let b = 0; b < 16; b++) {
        const beatSeed = seedBase + b * 10;
        const chordIdx = Math.floor(b / 4) % 4;
        const progression = data.progressions[progressionIdx % data.progressions.length];
        const chordDeg = progression[chordIdx];
        const chordRootSemi = scale[chordDeg];
        
        let bassVar = seededRandom(beatSeed + 500) < 0.3 ? 12 : (seededRandom(beatSeed + 501) < 0.5 ? 7 : 0);
        bass[b] = rootMidi + chordRootSemi - 12 + bassVar;
        const melSeed = beatSeed + 1000;
        let melNote = -1;
        if (seededRandom(melSeed) > 0.25) {
            let step = Math.floor(seededRandom(melSeed + 1) * scale.length);
            if (loopCount % 4 === 0 && seededRandom(melSeed + 2) < 0.5) step = (step + 1) % scale.length;
            const leadBase = rootMidi + 24;
            melNote = leadBase + scale[step];
        }
        melody[b] = melNote;
        const arpNotes = [chordRootSemi, chordRootSemi + scale[2 % scale.length], chordRootSemi + scale[4 % scale.length]];
        arp[b] = rootMidi + arpNotes[b % 3] + 12;
        const beatMod4 = b % 4;
        kick[b] = (beatMod4 === 0 || beatMod4 === 2) ? 1 : 0;
        snare[b] = (beatMod4 === 1 || beatMod4 === 3) ? 1 : 0;
        extraPerc[b] = (b % 2 === 0 && seededRandom(beatSeed + 3000) > 0.7) ? 1 : 0;
        if (biomeKey === 'hell') {
            kick[b] = 1;
            snare[b] = seededRandom(beatSeed + 2000) > 0.4 ? 1 : 0;
        } else if (biomeKey === 'ice') {
            kick[b] = Math.random() < 0.6 ? kick[b] : 0;
            snare[b] = Math.random() < 0.7 ? snare[b] : 0;
        }
    }
    return { bass, melody, arp, kick, snare, extraPerc, loopLength: 16 };
}

function stopMusic(fadeTime = 0.3) {
    if (masterGain) {
        masterGain.gain.linearRampToValueAtTime(0, audioCtx.currentTime + fadeTime);
    }
    currentPattern = null;
}

function startBiomeMusic(crossfade = false) {
    initAudio();
    const newPattern = generateMusicPattern(currentBiome, dungeonLevel);
    bpm = biomeData[currentBiome].bpm;
    beatDuration = 60 / bpm;
    currentBeat = 0;
    loopCount = 0;
    progressionIdx = 0;
    if (crossfade) {
        previousPattern = currentPattern;
        crossfadeTimer = crossfadeDuration;
        nextBeatTime = audioCtx.currentTime + beatDuration * 0.5;
    } else {
        stopMusic(0.2);
        nextBeatTime = audioCtx.currentTime + beatDuration * 0.5;
    }
    currentPattern = newPattern;
    if (!musicSchedulerId) {
        schedulerLoop();
    }
    setTimeout(() => {
        if (masterGain) masterGain.gain.linearRampToValueAtTime(0.2, audioCtx.currentTime + 0.5);
    }, 50);
}

function schedulePatternBeat(beatIdx, pattern, volMult = 1) {
    if (!pattern || !audioCtx) return;
    const data = biomeData[currentBiome];
    const time = nextBeatTime;
    playTone(pattern.bass[beatIdx], 0.9, { type: data.bassType, vol: 0.18 * volMult });
    playTone(pattern.melody[beatIdx], 0.85, { type: data.leadType, vol: 0.12 * volMult });
    playTone(pattern.arp[beatIdx], 0.3, { type: data.arpType, vol: 0.08 * volMult });
    if (pattern.kick[beatIdx]) {
        const oscK = audioCtx.createOscillator();
        oscK.type = 'sine';
        const gainK = audioCtx.createGain();
        oscK.connect(gainK); gainK.connect(masterGain);
        oscK.frequency.setValueAtTime(100 + Math.random() * 40, time);
        oscK.frequency.exponentialRampToValueAtTime(30, time + 0.12);
        gainK.gain.setValueAtTime(0.25 * volMult, time);
        gainK.gain.exponentialRampToValueAtTime(0.01, time + 0.18);
        oscK.start(time);
        oscK.stop(time + 0.18);
    }
    if (pattern.snare[beatIdx]) {
        const buffer = getNoiseBuffer(0.12);
        const noise = audioCtx.createBufferSource();
        noise.buffer = buffer;
        const gainS = audioCtx.createGain();
        const filter = audioCtx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(800, time);
        filter.frequency.exponentialRampToValueAtTime(250, time + 0.1);
        noise.connect(filter);
        filter.connect(gainS);
        gainS.connect(masterGain);
        gainS.gain.setValueAtTime(0.18 * volMult, time);
        gainS.gain.exponentialRampToValueAtTime(0.01, time + 0.15);
        noise.start(time);
        noise.stop(time + 0.15);
    }
    if (combatIntensity > 0 && pattern.extraPerc[beatIdx]) {
        const oscE = audioCtx.createOscillator();
        oscE.type = 'triangle';
        const gainE = audioCtx.createGain();
        oscE.connect(gainE); gainE.connect(masterGain);
        oscE.frequency.setValueAtTime(200 + Math.random() * 100, time);
        gainE.gain.setValueAtTime(0.1 * combatIntensity * volMult, time);
        gainE.gain.exponentialRampToValueAtTime(0.01, time + 0.1);
        oscE.start(time);
        oscE.stop(time + 0.1);
    }
}

function schedulerLoop() {
    if (!currentPattern || !audioCtx) {
        musicSchedulerId = requestAnimationFrame(schedulerLoop);
        return;
    }
    const time = audioCtx.currentTime;
    while (nextBeatTime < time + 0.25) {
        const beatIdx = currentBeat % currentPattern.loopLength;
        schedulePatternBeat(beatIdx, currentPattern);
        if (previousPattern && crossfadeTimer > 0) {
            schedulePatternBeat(beatIdx, previousPattern, crossfadeTimer / crossfadeDuration);
        }
        currentBeat++;
        if (currentBeat % 16 === 0) {
            loopCount++;
            if (loopCount % 8 === 0) progressionIdx++;
        }
        nextBeatTime += beatDuration;
    }
    musicSchedulerId = requestAnimationFrame(schedulerLoop);
}

function playSound(type, pitch = 1) {
    if (!audioCtx) return;

    switch (type) {
        case 'step':
            playOscillator({
                frequency: 80,
                duration: 0.05,
                type: 'sine',
                volume: 0.1,
                pitch,
                attack: 0,
                release: 0.05,
                sfx: true
            });
            break;

        case 'attack':
            playNoise({
                duration: 0.1,
                filterType: 'lowpass',
                filterFreq: 800,
                volume: 0.15,
                pitch,
                attack: 0,
                release: 0.1,
                sfx: true
            });
            break;

        case 'dash':
            playOscillator({
                frequency: 600,
                duration: 0.15,
                type: 'sawtooth',
                volume: 0.2,
                pitch,
                attack: 0,
                release: 0.15,
                sfx: true
            });
            break;

        case 'playerDamage':
            playOscillator({
                frequency: 150,
                duration: 0.2,
                type: 'sine',
                volume: 0.25,
                pitch,
                attack: 0,
                release: 0.2,
                sfx: true
            });
            playNoise({
                duration: 0.2,
                filterType: 'lowpass',
                filterFreq: 800,
                volume: 0.1,
                pitch,
                attack: 0,
                release: 0.2,
                sfx: true
            });
            break;

        case 'playerDeath':
            playOscillator({
                frequency: 100,
                duration: 0.5,
                type: 'sawtooth',
                volume: 0.3,
                pitch,
                attack: 0,
                release: 0.5,
                sfx: true
            });
            break;

        case 'pickup':
            playTone(60 * pitch, 0.1, { type: 'sine', vol: 0.15, sfx: true });
            setTimeout(() => playTone(64 * pitch, 0.1, { type: 'sine', vol: 0.15, sfx: true }), 100);
            setTimeout(() => playTone(67 * pitch, 0.1, { type: 'sine', vol: 0.15, sfx: true }), 200);
            break;

        case 'doorOpen':
            playOscillator({
                frequency: 300,
                duration: 0.3,
                type: 'sine',
                volume: 0.2,
                pitch,
                attack: 0,
                release: 0.3,
                sfx: true
            });
            break;

        case 'enemyHit':
            playNoise({
                duration: 0.08,
                filterType: 'highpass',
                filterFreq: 400,
                volume: 0.15,
                pitch,
                attack: 0,
                release: 0.08,
                sfx: true
            });
            break;

        case 'enemyDeath':
            playNoise({
                duration: 0.15,
                filterType: 'lowpass',
                filterFreq: 800,
                volume: 0.2,
                pitch,
                attack: 0,
                release: 0.15,
                sfx: true
            });
            break;

        case 'slimeSplit':
            playOscillator({
                frequency: 500,
                duration: 0.1,
                type: 'sine',
                volume: 0.15,
                pitch,
                attack: 0,
                release: 0.1,
                sfx: true
            });
            break;

        case 'mageShoot':
            playOscillator({
                frequency: 400,
                duration: 0.1,
                type: 'sawtooth',
                volume: 0.15,
                pitch,
                attack: 0,
                release: 0.1,
                sfx: true
            });
            break;

        case 'projectileHit':
            playNoise({
                duration: 0.1,
                filterType: 'lowpass',
                filterFreq: 200,
                volume: 0.15,
                pitch,
                attack: 0,
                release: 0.1,
                sfx: true
            });
            break;

        case 'newFloor':
            const scaleType = biomeData[currentBiome].scaleType;
            const baseNote = 60;
            playTone(baseNote, 0.2, { type: 'triangle', vol: 0.2, sfx: true });
            setTimeout(() => playTone(baseNote + scales[scaleType][2], 0.2, { type: 'triangle', vol: 0.2, sfx: true }), 200);
            setTimeout(() => playTone(baseNote + scales[scaleType][4], 0.2, { type: 'triangle', vol: 0.2, sfx: true }), 400);
            break;

        case 'break':
            playNoise({
                duration: 0.12,
                filterType: 'lowpass',
                filterFreq: 400,
                volume: 0.2,
                pitch,
                attack: 0,
                release: 0.12,
                sfx: true
            });
            break;

        case 'trapActivate':
            playOscillator({
                frequency: 600,
                duration: 0.06,
                type: 'sine',
                volume: 0.15,
                pitch,
                attack: 0,
                release: 0.06,
                sfx: true
            });
            setTimeout(() => {
                playOscillator({
                    frequency: 900,
                    duration: 0.04,
                    type: 'triangle',
                    volume: 0.1,
                    pitch,
                    attack: 0,
                    release: 0.04,
                    sfx: true
                });
            }, 30);
            break;
    }
}
