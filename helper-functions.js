// Module: Helper Functions

function seededRandom(seed) {
    const x = Math.sin(seed) * 10000;
    return x - Math.floor(x);
}

function generateBiomeSequence(seed) {
    const biomes = ['forest', 'desert', 'ice', 'hell'];
    const seq = [];
    for (let i = 0; i < 20; i++) {
        const biomeIdx = Math.floor(seededRandom(seed + i) * biomes.length);
        const floors = 3 + Math.floor(seededRandom(seed + i + 100) * 4);
        seq.push({ biome: biomes[biomeIdx], floors });
    }
    return seq;
}

function getBiome(level) {
    let floorCount = 1;
    let seqIdx = 0;
    let cumulativeFloors = 0;
    while (cumulativeFloors + biomeSequence[seqIdx].floors < level) {
        cumulativeFloors += biomeSequence[seqIdx].floors;
        seqIdx++;
        if (seqIdx >= biomeSequence.length) {
            biomeSequence = biomeSequence.concat(generateBiomeSequence(GLOBAL_SEED + seqIdx * 1000));
        }
    }
    return biomeSequence[seqIdx].biome;
}