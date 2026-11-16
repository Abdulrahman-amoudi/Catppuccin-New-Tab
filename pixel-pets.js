/* Pixel pets: hand-drawn sprites animated on a <canvas>.
 * Each pet has its own fur palette (they don't recolour with the theme).
 * Idle: breathes, blinks, flicks its tail, twitches an ear.
 * Leave the tab alone and it falls asleep; type or move the mouse and it wakes.
 * Click it and it hops.
 *
 * Usage: <canvas class="pixel-pet" data-pet="cat"></canvas>, then PixelPets.mount(canvas)
 */
(function () {
    'use strict';

    const PALETTES = {
        "tabby": {
                "O": "#3a2018",
                "D": "#b8592b",
                "B": "#e8873f",
                "L": "#f7b66a",
                "C": "#fbe6c4",
                "E": "#26160f",
                "H": "#ffffff",
                "N": "#e57a86",
                "S": "#d9c3a3"
        },
        "black": {
                "O": "#0d0b14",
                "D": "#1d1a29",
                "B": "#2e2a3d",
                "L": "#4a4560",
                "C": "#4a4560",
                "E": "#f2d15c",
                "H": "#ffffff",
                "N": "#c86b7a",
                "S": "#3a3550",
                "P": "#0d0b14"
        },
        "shiba": {
                "O": "#3a2016",
                "D": "#b5642e",
                "B": "#d9873f",
                "L": "#efb06a",
                "C": "#fbf0de",
                "E": "#1f130d",
                "H": "#ffffff",
                "N": "#2a1912",
                "S": "#e2d2bd",
                "P": "#e5707e"
        },
        "bunny": {
                "O": "#5b4a5e",
                "D": "#c9bccb",
                "B": "#efe8ee",
                "L": "#ffffff",
                "C": "#ffffff",
                "E": "#2a2030",
                "H": "#ffffff",
                "N": "#ef8fa3",
                "S": "#d8ccd8"
        }
    };

    // O outline · D shade · B fur · L light fur · C cream · E eye · H eye glint · N nose/inner ear · S soft line · P tongue
    const SPRITES = {
        cat: {
            name: 'Ginger cat', pal: 'tabby',
            rows: [
            "..O..........O........",
            ".OLO........OBO.......",
            ".ONBO......OBNO.......",
            "ONNBBOOOOOOBBNNO......",
            "OLBBBBDBBDBBBBDO......",
            "OLBBBBBDDBBBBBDO......",
            "OLBHEBBBBBBHEBDO......",
            "OLBEEBBBBBBEEBDO......",
            "OLLBBBCNNCBBBDDO......",
            ".OLLBCCSSCCBDDO.......",
            "..OOLCCCCCCLOO........",
            "...OBLCCCCCBDO....OO..",
            "..OBBLCCCCCBBDO..OBDO.",
            ".OLBBLCCCCCBBDDO.OBDO.",
            ".OLDBBLCCCCBDBDO.OBDO.",
            "OLBDBBLCCCCBDBDDOOBDO.",
            "OLBBBBLCCCCBBBDDOBDDO.",
            "OLBBBBCCCCCCBBDDBDDO..",
            "OLBBBCCCCCCCCBDDDDO...",
            "ODDBCCSCCSCCSCDDDO....",
            ".OOOOOOOOOOOOOOOO....."
            ],
            tail: { x: 16, top: 11, bottom: 16 },
            ear: { x0: 11, x1: 15, y1: 2 },
        },
        blackcat: {
            name: 'Black cat', pal: 'black',
            rows: [
            "..O..........O........",
            ".OLO........OBO.......",
            ".ONBO......OBNO.......",
            "ONNBBOOOOOOBBNNO......",
            "OLBBBBBBBBBBBBDO......",
            "OLBBBBBBBBBBBBDO......",
            "OLBHEBBBBBBHEBDO......",
            "OLBEEBBBBBBEEBDO......",
            "OLLBBBBNNBBBBDDO......",
            ".OLLBBBBBBBBDDO.......",
            "..OOLBBBBBBLOO........",
            "...OBLBBBBBBDO....OO..",
            "..OBBLBBBBBBBDO..OBDO.",
            ".OLBBLBBBBBBBDDO.OBDO.",
            ".OLBBBLBBBBBBBDO.OBDO.",
            "OLBBBBLBBBBBBBDDOOBDO.",
            "OLBBBBLBBBBBBBDDOBDDO.",
            "OLBBBBBBBBBBBBDDBDDO..",
            "OLBBBBBBBBBBBBDDDDO...",
            "ODDBBBDBBDBBDBDDDO....",
            ".OOOOOOOOOOOOOOOO....."
            ],
            tail: { x: 16, top: 11, bottom: 16 },
            ear: { x0: 0, x1: 4, y1: 2 },
        },
        dog: {
            name: 'Shiba', pal: 'shiba',
            rows: [
            ".O............O.......",
            "OBO..........OBO......",
            "OCBO........OBCO......",
            "OCCBO......OBCCO......",
            "OCCBBOOOOOOBBCCO......",
            "OBBBCBBBBBBCBBDO......",
            "OBBHEBBBBBBHEBDO......",
            "OBCEECBBBBCEECDO......",
            "OCCCCCCNNCCCCCCO..OO..",
            "OCCCCCSCCSCCCCCO.OBBO.",
            ".OCCCCCSSCCCCCO.OBCCBO",
            "..OOCCCPPCCCOO..OBOOBO",
            "...OBCCCCCCBDO.OBCO.BO",
            "..OBBLCCCCCBBDOBDBOOBO",
            ".OLBBLCCCCCBBDODBDDBO.",
            ".OLBBBLCCCCBBDDOODDO..",
            "OLBBBBLCCCCBBBDDOOO...",
            "OLBBBBCCCCCCBBDDO.....",
            "OLBBBCCCCCCCCBDDO.....",
            "ODDBCCSCCSCCSCDDO.....",
            ".OOOOOOOOOOOOOOO......"
            ],
            tail: { x: 16, top: 8, bottom: 14 },
            ear: { x0: 11, x1: 15, y1: 3 },
            pant: { y: 11, x: 7 },
        },
        bunny: {
            name: 'Bunny', pal: 'bunny',
            rows: [
            "...OO.....OO......",
            "..OLBO...OLBO.....",
            "..ONBO...ONBO.....",
            "..ONBO...ONBO.....",
            "..ONBO...ONBO.....",
            "..OLBOOOOOLBO.....",
            ".OLBBBBBBBBBDO....",
            "OLBBBBBBBBBBBDO...",
            "OLBHEBBBBBHEBDO...",
            "OLBEEBBBBBEEBDO...",
            "OLNNBBBNBBBNNDO...",
            ".OLBBBSBSBBBDO....",
            "..OOBBBBBBBDOO....",
            ".OLBBBLLLBBBDO....",
            "OLBBBLLLLLBBBDO...",
            "OLBBBLLLLLBBBDOO..",
            "OLBBBBLLLBBBBDOLO.",
            "OLBBBBBBBBBBBDOLO.",
            "ODBBBSBBBSBBBDDO..",
            ".OOOOOOOOOOOOOO..."
            ],
            ear: { x0: 8, x1: 13, y1: 4 },
        },
    };

    const HEART = ['.NN.NN.', 'NNNNNNN', 'NNNNNNN', '.NNNNN.', '..NNN..', '...N...'];
    const ZED = ['EEE', '..E', '.E.', 'EEE'];
    const HEADROOM = 9;   // rows above the sprite for hops, hearts and z's
    const SLEEP_AFTER = 45 * 8; // ticks of no input (8 per second)

    function compose(sp, st) {
        const g = sp.rows.map(r => r.split(''));
        const H = g.length, W = g[0].length;
        // eyes closed: the glint row becomes fur, the bottom row becomes a lid line
        if (st.eyesClosed) {
            for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
                const c = sp.rows[y][x];
                if (c !== 'E' && c !== 'H') continue;
                const below = sp.rows[y + 1] && sp.rows[y + 1][x];
                g[y][x] = (below === 'E' || below === 'H') ? 'B' : 'O';
            }
        }
        // tail flick: shift the tail tip sideways, the base stays put
        if (sp.tail && st.tail) {
            const { x: tx, top, bottom } = sp.tail;
            for (let y = top; y <= bottom; y++) {
                const dx = (y - top) < (bottom - top) / 2 ? st.tail : 0;
                if (!dx) continue;
                const src = sp.rows[y].split('');
                for (let x = tx; x < W; x++) g[y][x] = '.';
                for (let x = tx; x < W; x++) if (src[x] !== '.' && x + dx >= tx && x + dx < W) g[y][x + dx] = src[x];
            }
        }
        // ear twitch: drop one ear tip a pixel
        if (sp.ear && st.ear) {
            const { x0, x1, y1 } = sp.ear;
            for (let y = y1; y >= 0; y--) for (let x = x0; x <= x1; x++) {
                const c = sp.rows[y][x];
                if (y === 0) g[y][x] = '.';
                if (c !== '.' && y + 1 <= y1 + 1) g[y + 1][x] = c;
            }
        }
        if (sp.pant && st.tongue === false) {
            g[sp.pant.y][sp.pant.x] = 'C'; g[sp.pant.y][sp.pant.x + 1] = 'C';
        }
        return g;
    }

    let lastInput = 0, clock = 0;
    const wake = () => { lastInput = clock; live.forEach(p => p.wake()); };
    ['mousemove', 'keydown', 'pointerdown', 'wheel'].forEach(ev => window.addEventListener(ev, wake, { passive: true }));

    class Pet {
        constructor(canvas) {
            this.canvas = canvas;
            this.sp = SPRITES[canvas.dataset.pet] || SPRITES.cat;
            this.P = PALETTES[this.sp.pal];
            this.W = this.sp.rows[0].length + 4;
            this.H = this.sp.rows.length + HEADROOM + 1;
            canvas.width = this.W; canvas.height = this.H;
            canvas.setAttribute('aria-label', this.sp.name);
            this.ctx = canvas.getContext('2d');
            this.f = 0; this.hop = []; this.hearts = []; this.zs = [];
            this.blink = 0; this.nextBlink = 24; this.tailT = 0; this.earT = 0; this.asleep = false;
            this.scale();
            canvas.addEventListener('click', e => { e.stopPropagation(); if (!window.PixelPets.suppressClick) this.poke(); });
            this.timer = setInterval(() => this.tick(), 125);
            this.draw();
        }
        scale() {
            const target = parseInt(getComputedStyle(this.canvas).getPropertyValue('--pet-size')) || 140;
            const s = Math.max(2, Math.round(target / this.sp.rows.length));
            this.canvas.style.width = this.W * s + 'px';
            this.canvas.style.height = this.H * s + 'px';
        }
        setHeld(on) {
            this.held = on;
            if (on) { this.wake(); this.hop = []; }
            else this.hop = [-1, -2, -1, 0];    // little bounce on landing
            this.draw();
        }
        wake() { if (this.asleep) { this.asleep = false; this.zs = []; this.earT = 3; this.hop = [-1, -2, -1, 0]; } }
        poke() {
            this.wake();
            this.hop = [-2, -4, -5, -5, -4, -2, 0];
            this.hearts.push({ x: (this.W >> 1) - 3 + ((Math.random() * 7) | 0) - 3, y: HEADROOM - 2, life: 12 });
        }
        tick() {
            this.f++;
            if (this.canvas === live.first) clock++;
            if (!this.asleep && clock - lastInput > SLEEP_AFTER) this.asleep = true;
            if (this.asleep) {
                if (this.f % 10 === 0) this.zs.push({ x: this.W - 7, y: HEADROOM + 1, life: 14 });
            } else {
                if (this.blink > 0) this.blink--;
                else if (--this.nextBlink <= 0) { this.blink = 1; this.nextBlink = 24 + ((Math.random() * 40) | 0); if (Math.random() < .2) this.nextBlink = 3; }
                if (this.tailT > 0) this.tailT--; else if (Math.random() < 0.03) this.tailT = 6;
                if (this.earT > 0) this.earT--; else if (Math.random() < 0.008) this.earT = 2;
            }
            if (this.hop.length) this.hop.shift();
            this.hearts.forEach(h => { h.y--; h.life--; }); this.hearts = this.hearts.filter(h => h.life > 0);
            this.zs.forEach(z => { z.life--; if (z.life % 2 === 0) z.y--; if (z.life % 4 === 0) z.x++; }); this.zs = this.zs.filter(z => z.life > 0);
            this.draw();
        }
        draw() {
            const st = {
                eyesClosed: this.asleep || this.blink > 0,
                tail: this.held ? [1, 1, 0, -1, -1, 0][this.f % 6] : (this.tailT ? [1, 1, 0, -1, -1, 0][this.tailT % 6] : 0),
                ear: this.earT > 0 && !this.asleep,
                tongue: this.asleep ? false : (this.f % 16 < 12),
            };
            const g = compose(this.sp, st);
            const ctx = this.ctx, P = this.P;
            ctx.clearRect(0, 0, this.W, this.H);
            const breathe = this.held ? 0 : this.asleep ? (this.f % 16 < 8 ? 0 : 1) : (this.f % 12 < 6 ? 0 : 1);
            const ox = 2, oy = HEADROOM + (this.hop[0] || 0);
            // soft ground shadow, shrinks while hopping
            const lift = -(this.hop[0] || 0);
            ctx.globalAlpha = .28; ctx.fillStyle = '#000';
            ctx.fillRect(ox + 1 + lift, this.H - 1, this.sp.rows[0].replace(/\.+$/, '').length - 2 - lift * 2, 1);
            ctx.globalAlpha = 1;
            for (let y = 0; y < g.length; y++) for (let x = 0; x < g[y].length; x++) {
                const c = g[y][x];
                if (c === '.') continue;
                ctx.fillStyle = P[c] || P.B;
                // breathing: everything above the belly rises a pixel; the belly row stretches to fill the gap
                const split = g.length - 6;
                if (breathe && y < split) {
                    ctx.fillRect(ox + x, oy + y - 1, 1, 1);
                    if (y === split - 1) ctx.fillRect(ox + x, oy + y, 1, 1);
                } else ctx.fillRect(ox + x, oy + y, 1, 1);
            }
            const sprite = (art, x, y, col, a) => {
                ctx.globalAlpha = a; ctx.fillStyle = col;
                art.forEach((r, yy) => { for (let xx = 0; xx < r.length; xx++) if (r[xx] !== '.') ctx.fillRect(x + xx, y + yy, 1, 1); });
                ctx.globalAlpha = 1;
            };
            this.hearts.forEach(h => sprite(HEART, h.x, h.y, '#ef8fa3', Math.min(1, h.life / 4)));
            this.zs.forEach(z => sprite(ZED, z.x, z.y, getComputedStyle(document.documentElement).getPropertyValue('--cat-subtext0').trim() || '#a6adc8', Math.min(1, z.life / 5)));
        }
        refresh() { this.scale(); this.draw(); }
        destroy() { clearInterval(this.timer); }
    }

    const live = new Set();
    Object.defineProperty(live, 'first', { get() { const it = live.values().next(); return it.done ? null : it.value.canvas; } });
    window.PixelPets = {
        kinds: Object.keys(SPRITES),
        names: Object.fromEntries(Object.entries(SPRITES).map(([k, v]) => [k, v.name])),
        mount(canvas) { const p = new Pet(canvas); live.add(p); canvas._pet = p; return p; },
        mountAll(root = document) { root.querySelectorAll('canvas.pixel-pet').forEach(c => { if (!c._pet) this.mount(c); }); },
        unmount(canvas) { if (canvas && canvas._pet) { canvas._pet.destroy(); live.delete(canvas._pet); canvas._pet = null; } },
        refreshAll() { live.forEach(p => { if (!document.contains(p.canvas)) { p.destroy(); live.delete(p); } else p.refresh(); }); },
    };

    new MutationObserver(() => window.PixelPets.refreshAll())
        .observe(document.documentElement, { attributes: true, attributeFilter: ['data-ui-style'] });
})();
