// Procedural pixel-art generator for Neko.
// Dependency-free: encodes PNGs directly with zlib. Deterministic (seeded RNG),
// so `npm run assets` always regenerates identical files.
import { deflateSync } from 'zlib';
import { writeFileSync, mkdirSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const OUT_DIR = join(dirname(fileURLToPath(import.meta.url)), '..', 'assets', 'generated');
mkdirSync(OUT_DIR, { recursive: true });

// ---------------------------------------------------------------- PNG encoder

const CRC_TABLE = (() => {
    const table = new Int32Array(256);
    for (let n = 0; n < 256; n++) {
        let c = n;
        for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
        table[n] = c;
    }
    return table;
})();

function crc32(buf) {
    let c = 0xffffffff;
    for (let i = 0; i < buf.length; i++) c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
    return (c ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
    const out = Buffer.alloc(12 + data.length);
    out.writeUInt32BE(data.length, 0);
    out.write(type, 4, 'ascii');
    data.copy(out, 8);
    out.writeUInt32BE(crc32(out.subarray(4, 8 + data.length)), 8 + data.length);
    return out;
}

function encodePng(width, height, rgba) {
    const raw = Buffer.alloc((width * 4 + 1) * height);
    for (let y = 0; y < height; y++) {
        raw[y * (width * 4 + 1)] = 0; // filter: none
        rgba.copy(raw, y * (width * 4 + 1) + 1, y * width * 4, (y + 1) * width * 4);
    }
    const ihdr = Buffer.alloc(13);
    ihdr.writeUInt32BE(width, 0);
    ihdr.writeUInt32BE(height, 4);
    ihdr[8] = 8;  // bit depth
    ihdr[9] = 6;  // color type: RGBA
    return Buffer.concat([
        Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
        chunk('IHDR', ihdr),
        chunk('IDAT', deflateSync(raw, { level: 9 })),
        chunk('IEND', Buffer.alloc(0)),
    ]);
}

// ---------------------------------------------------------------- draw helpers

function hex(color) {
    return [parseInt(color.slice(1, 3), 16), parseInt(color.slice(3, 5), 16), parseInt(color.slice(5, 7), 16), 255];
}

class Sprite {
    constructor(width, height) {
        this.width = width;
        this.height = height;
        this.data = Buffer.alloc(width * height * 4);
    }
    set(x, y, [r, g, b, a]) {
        if (x < 0 || y < 0 || x >= this.width || y >= this.height) return;
        const i = (y * this.width + x) * 4;
        this.data[i] = r; this.data[i + 1] = g; this.data[i + 2] = b; this.data[i + 3] = a;
    }
    fill(x, y, w, h, c) {
        for (let j = y; j < y + h; j++) for (let i = x; i < x + w; i++) this.set(i, j, c);
    }
    save(name) {
        writeFileSync(join(OUT_DIR, name), encodePng(this.width, this.height, this.data));
        console.log(`  ${name} (${this.width}x${this.height})`);
    }
}

function mulberry32(seed) {
    return () => {
        seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
        let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}

// Board tiles: friendly green checker with tiny confetti speckles, framed by
// a darker 1px edge so each tile reads as a crisp cell
const TILE_LIGHT = hex('#5cb46c');
const TILE_DARK = hex('#4aa25c');
const TILE_EDGE = hex('#357a44');
const HEDGE_RAMP = ['#1d472a', '#2c5e36', '#3a7343', '#4e8a51', '#66a262'].map(hex);
const HEART_RED = hex('#e8384f');
const HEART_DARK = hex('#a3213b');
const HEART_LIGHT = hex('#ff7d8a');
const WOOD_DARK = hex('#5c3a1e');
const WOOD_MID = hex('#8a5a2b');
const WOOD_LIGHT = hex('#b07f45');
const HONEY_GOLD = hex('#f2b134');

// ---------------------------------------------------------------- tiles

function grassTile(name, base) {
    const s = new Sprite(32, 32);
    s.fill(0, 0, 32, 32, base);
    // 1px darker edge so tiles read as cells; otherwise flat and clean
    s.fill(0, 0, 32, 1, TILE_EDGE);
    s.fill(0, 31, 32, 1, TILE_EDGE);
    s.fill(0, 0, 1, 32, TILE_EDGE);
    s.fill(31, 0, 1, 32, TILE_EDGE);
    s.save(name);
}

// Puffy pixel clouds on transparent sprites. The sky itself is a CSS gradient
// behind the (transparent) game canvas, and these drift across it via CSS
// animation — that's what makes the game truly full-screen.
function drawCloud(s, cx, cy, span, rnd) {
    const CLOUD = hex('#ffffff');
    const CLOUD_SHADE = hex('#d9ecf9');
    // A cloud is a union of round puffs along a flat base line
    const count = 3 + Math.floor(rnd() * 3);
    const puffs = [];
    for (let i = 0; i < count; i++) {
        const px = cx - span / 2 + (span * i) / (count - 1);
        const pr = 4 + rnd() * (span / 5);
        puffs.push({ px, py: cy - pr * 0.4, pr });
    }
    const base = cy + 2;
    for (let y = Math.floor(cy - span / 2); y <= base; y++) {
        for (let x = Math.floor(cx - span); x <= Math.ceil(cx + span); x++) {
            const inside = puffs.some(p => (x - p.px) ** 2 + (y - p.py) ** 2 < p.pr ** 2);
            if (!inside) continue;
            s.set(x, y, y >= base - 1 ? CLOUD_SHADE : CLOUD);
        }
    }
}

function cloudSprite(name, span, seed) {
    const w = span * 2 + 8;
    const h = span + 10;
    const s = new Sprite(w, h);
    drawCloud(s, w / 2, h * 0.6, span, mulberry32(seed));
    s.save(name);
}

// Keyboard keycap with a right-pointing arrow (rotated in-game for other
// directions), used by the How to Play demo
const KEYCAP_ROWS = [
    '.OOOOOOOOOOOOO..',
    '.OKKKKKKKKKKKO..',
    '.OKKKKKKAKKKKO..',
    '.OKKKKKKAAKKKO..',
    '.OKAAAAAAAAKKO..',
    '.OKAAAAAAAAAKO..',
    '.OKAAAAAAAAKKO..',
    '.OKKKKKKAAKKKO..',
    '.OKKKKKKAKKKKO..',
    '.OKKKKKKKKKKKO..',
    '.OSSSSSSSSSSSO..',
    '.OOOOOOOOOOOOO..',
];

function keycap() {
    drawMap(KEYCAP_ROWS, {
        O: hex('#222b20'),
        K: hex('#f4efe2'),
        A: hex('#222b20'),
        S: hex('#c9c2ae'), // bottom shade so the cap reads as a physical key
    }, 2).save('key_right.png');
}

// Draw a hand-authored pixel map: each character keys into `palette`,
// '.' is transparent, every cell becomes a `scale`x`scale` block
function drawMap(rows, palette, scale = 2) {
    const s = new Sprite(rows[0].length * scale, rows.length * scale);
    rows.forEach((row, y) => {
        [...row].forEach((ch, x) => {
            if (ch === '.') return;
            s.fill(x * scale, y * scale, scale, scale, palette[ch]);
        });
    });
    return s;
}

// A cute goldfish as a crisp SVG so it stays sharp at any screen size —
// round body, flowing tail, big eye, little smile
function fishSvg() {
    const O = '#6b3212';
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
  <path d="M42 32 Q56 12 61 18 Q58 27 48 32 Q58 37 61 46 Q56 52 42 36 Z" fill="#ef8a2e" stroke="${O}" stroke-width="2.5" stroke-linejoin="round"/>
  <path d="M15 22 Q21 5 34 16 Q24 13 17 23 Z" fill="#ef8a2e" stroke="${O}" stroke-width="2.5" stroke-linejoin="round"/>
  <ellipse cx="26" cy="32" rx="18" ry="14" fill="#f7a13f" stroke="${O}" stroke-width="2.5"/>
  <path d="M11 38 Q26 50 41 37 Q35 45.5 26 46 Q16 45.5 11 38 Z" fill="#ffd9a0"/>
  <path d="M27 38 Q33 40 31 46 Q25 44 25 40 Z" fill="#ef8a2e" stroke="${O}" stroke-width="2" stroke-linejoin="round"/>
  <circle cx="17" cy="30" r="5.4" fill="#ffffff" stroke="${O}" stroke-width="1.6"/>
  <circle cx="16" cy="31" r="2.7" fill="#241226"/>
  <circle cx="18.6" cy="28.4" r="1.3" fill="#ffffff"/>
  <path d="M9 37.5 Q11.5 40 14 37.5" stroke="${O}" stroke-width="2" fill="none" stroke-linecap="round"/>
  <circle cx="11.5" cy="34.5" r="2" fill="#ff9d9d" opacity="0.55"/>
</svg>
`;
    writeFileSync(join(OUT_DIR, 'fish.svg'), svg);
    console.log('  fish.svg');
}

// ---------------------------------------------------------------- ui + fx

const HEART_ROWS = [
    '..XX..XX..',
    '.XXXXXXXX.',
    'XXXXXXXXXX',
    'XXXXXXXXXX',
    'XXXXXXXXXX',
    '.XXXXXXXX.',
    '..XXXXXX..',
    '...XXXX...',
    '....XX....',
];

function heart() {
    const s = new Sprite(12, 11);
    HEART_ROWS.forEach((row, y) => {
        [...row].forEach((ch, x) => {
            if (ch !== 'X') return;
            s.set(x + 1, y + 1, HEART_RED);
        });
    });
    // outline + shading
    HEART_ROWS.forEach((row, y) => {
        [...row].forEach((ch, x) => {
            if (ch !== 'X') return;
            if (y === HEART_ROWS.length - 1 || HEART_ROWS[y + 1][x] !== 'X') s.set(x + 1, y + 1, HEART_DARK);
        });
    });
    s.set(3, 3, HEART_LIGHT);
    s.set(4, 3, HEART_LIGHT);
    s.set(3, 4, HEART_LIGHT);
    s.save('heart.png');
}

function particle() {
    const s = new Sprite(9, 9);
    const star = hex('#fff3c4');
    const core = hex('#ffffff');
    for (let i = 0; i < 9; i++) {
        s.set(4, i, star);
        s.set(i, 4, star);
    }
    s.fill(3, 3, 3, 3, star);
    s.set(4, 4, core);
    s.save('particle.png');
}

// Flat pill button in the dark UI style: rounded corners, 1px light border,
// subtle top bevel. Scaled in-game; flat fill keeps stretching artifact-free.
function pillButton(name, fill, border, bevel) {
    const s = new Sprite(120, 32);
    s.fill(2, 0, 116, 32, border);
    s.fill(0, 2, 120, 28, border);
    s.fill(1, 1, 118, 30, border);
    s.fill(3, 1, 114, 30, fill);
    s.fill(1, 3, 118, 26, fill);
    s.fill(2, 2, 116, 28, fill);
    s.fill(4, 2, 112, 2, bevel); // top bevel
    s.save(name);
}

function buttons() {
    pillButton('button_dark.png', hex('#222b20'), hex('#4c5c46'), hex('#33402f'));
    pillButton('button_red.png', hex('#8e4650'), hex('#b47079'), hex('#a35b64'));
}

// Border walls are invisible physics strips; ship a transparent texture so the
// sprites have something harmless to render
function wallTexture() {
    new Sprite(8, 8).save('wall.png');
}

// ---------------------------------------------------------------- sfx (wav)

const SAMPLE_RATE = 22050;

function writeWav(name, samples) {
    const buf = Buffer.alloc(44 + samples.length * 2);
    buf.write('RIFF', 0, 'ascii');
    buf.writeUInt32LE(36 + samples.length * 2, 4);
    buf.write('WAVE', 8, 'ascii');
    buf.write('fmt ', 12, 'ascii');
    buf.writeUInt32LE(16, 16);
    buf.writeUInt16LE(1, 20);            // PCM
    buf.writeUInt16LE(1, 22);            // mono
    buf.writeUInt32LE(SAMPLE_RATE, 24);
    buf.writeUInt32LE(SAMPLE_RATE * 2, 28);
    buf.writeUInt16LE(2, 32);
    buf.writeUInt16LE(16, 34);
    buf.write('data', 36, 'ascii');
    buf.writeUInt32LE(samples.length * 2, 40);
    samples.forEach((s, i) => buf.writeInt16LE((Math.max(-1, Math.min(1, s)) * 32767) | 0, 44 + i * 2));
    writeFileSync(join(OUT_DIR, name), buf);
    console.log(`  ${name} (${(samples.length / SAMPLE_RATE).toFixed(2)}s)`);
}

// One swept, decaying oscillator note
function tone({ freqStart, freqEnd = freqStart, duration, shape = 'sine', volume = 0.4, decay = 6 }) {
    const count = Math.floor(duration * SAMPLE_RATE);
    const samples = new Array(count);
    let phase = 0;
    for (let i = 0; i < count; i++) {
        const t = i / count;
        const freq = freqStart + (freqEnd - freqStart) * t;
        phase += (2 * Math.PI * freq) / SAMPLE_RATE;
        const raw = shape === 'square' ? Math.sign(Math.sin(phase))
            : shape === 'saw' ? 2 * ((phase / (2 * Math.PI)) % 1) - 1
            : Math.sin(phase);
        samples[i] = raw * volume * Math.exp(-decay * t);
    }
    return samples;
}

function sfx() {
    writeWav('sfx_jump.wav', tone({ freqStart: 300, freqEnd: 520, duration: 0.09, shape: 'square', volume: 0.25, decay: 3 }));
    writeWav('sfx_collect.wav', [
        ...tone({ freqStart: 660, duration: 0.07, volume: 0.35, decay: 2 }),
        ...tone({ freqStart: 990, duration: 0.13, volume: 0.35, decay: 5 }),
    ]);
    writeWav('sfx_death.wav', tone({ freqStart: 280, freqEnd: 70, duration: 0.38, shape: 'saw', volume: 0.35, decay: 4 }));
    writeWav('sfx_clear.wav', [523.25, 659.25, 783.99, 1046.5].flatMap(freq =>
        tone({ freqStart: freq, duration: 0.09, volume: 0.3, decay: 2 })
    ));
}

console.log('Generating assets into assets/generated');
grassTile('grass_a.png', TILE_LIGHT);
grassTile('grass_b.png', TILE_DARK);
grassTile('grass_c.png', TILE_LIGHT);
grassTile('grass_d.png', TILE_DARK);
cloudSprite('cloud_a.png', 30, 7);
cloudSprite('cloud_b.png', 20, 3);
cloudSprite('cloud_c.png', 24, 12);
wallTexture();
fishSvg();
heart();
particle();
keycap();
buttons();
sfx();
console.log('Done.');
