/* Pixel Pets — hand-drawn pixel-art companions, animated on a <canvas>.
 * Sprites are drawn as filled silhouettes; the outline is generated automatically.
 * Colours come from the active theme's CSS variables, so every palette recolours them.
 *
 * Usage: <canvas class="pixel-pet" data-pet="cat"></canvas>  →  PixelPets.mount(canvas)
 */
(function () {
    'use strict';

    // Palette letters → CSS variable (with fallbacks for themes that don't define every swatch)
    const PALETTE = {
        b: ['--cat-text', '#cdd6f4'],          // body (light fur)
        s: ['--cat-subtext0', '#a6adc8'],      // shade
        w: ['--pet-white', '#ffffff'],         // white patches
        p: ['--cat-pink', '--cat-mauve', '#f5c2e7'],
        e: ['--cat-crust', '#11111b'],         // eyes / mouth lines
        k: ['--cat-surface1', '--cat-surface2', '#45475a'],  // panda black
        g: ['--pet-white', '#ffffff'],         // eye glint
        y: ['--cat-yellow', '#f9e2af'],
        r: ['--cat-peach', '#fab387'],
        u: ['--cat-sapphire', '--cat-blue', '--cat-sky', '#74c7ec'],
        c: ['--cat-sky', '--cat-teal', '#89dceb'],
        a: ['--cat-mauve', '#cba6f7'],         // accent (hearts, water)
        o: ['--cat-crust', '#11111b'],         // outline
    };

    function readPalette() {
        const cs = getComputedStyle(document.documentElement);
        const out = {};
        for (const [k, list] of Object.entries(PALETTE)) {
            let val = '';
            for (const item of list) {
                if (!item.startsWith('--')) { val = item; break; }
                const v = cs.getPropertyValue(item).trim();
                if (v) { val = v; break; }
            }
            out[k] = val;
        }
        // On light themes the crust is pale: draw the outline with the text colour instead.
        const theme = document.documentElement.getAttribute('data-theme');
        if (theme === 'latte' || theme === 'sky-blue') { out.o = cs.getPropertyValue('--cat-text').trim() || '#4c4f69'; out.e = out.o; out.b = '#ffffff'; }
        return out;
    }

    // ---------- sprites ----------
    // Each: rows (silhouette), body char, optional tail/extra frames, sway rows, blink rule.
    const SPRITES = {
        cat: {
            rows: [
                '..bb..........bb..',
                '.bpbb........bbpb.',
                '.bppbb......bbppb.',
                '.bbbbbbbbbbbbbbbb.',
                'bbbbbbbbbbbbbbbbbb',
                'bbbeebbbbbbbbeebbb',
                'bbbeebbbbbbbbeebbb',
                'bbbbbbbbbbbbbbbbbb',
                'bpbbbbbbppbbbbbbpb',
                'bbbbbbbebbebbbbbbb',
                '.bbbbbbbeebbbbbbb.',
                '..bbbbbbbbbbbbbb..',
                '..bbbbwwwwwwbbbb..',
                '.bbbbwwwwwwwwbbbb.',
                '.bbbbwwwwwwwwbbbb.',
                '.bbbbbwwwwwwbbbbb.',
                '.bbsbbbbbbbbbbsbb.',
                '.bbsbbbbbbbbbbsbb.',
            ],
            body: 'b', pad: [2, 3, 6, 2],                     // top, left, right, bottom
            tail(f) {                                          // curling tail, sways
                const sway = [0, 1, 1, 0, -1, -1][f % 6];
                const pts = [[18, 16], [19, 16], [19, 15], [20, 15], [20, 14], [21, 14], [20 + (sway > 0 ? 1 : 0), 13], [21 + (sway > 0 ? 1 : 0), 13],
                             [20 + sway, 12], [21 + sway, 12], [20 + sway, 11], [21 + sway, 11], [19 + sway, 10], [20 + sway, 10]];
                return pts.map(([x, y]) => [x, y, 'b']);
            },
        },
        dog: {
            rows: [
                '....bbbbbbbbbb....',
                '..bbbbbbbbbbbbbb..',
                '.rrrbbbbbbbbbbrrr.',
                'rrrbbbbbbbbbbbbrrr',
                'rrrbbeebbbbeebbrrr',
                'rrrbbeebbbbeebbrrr',
                'rrbbbbbbbbbbbbbbrr',
                'rr.bbbbwwwwbbbb.rr',
                'r..bbbwweewwbbb..r',
                '...bbbwwwwwwbbb...',
                '....bbwewwewbb....',
                '....bbbweewbbb....',
                '...bbbbbppbbbbb...',
                '..bbbbbbbbbbbbbb..',
                '..bbbbwwwwwwbbbb..',
                '..bbbbwwwwwwbbbb..',
                '..bbsbbbbbbbbsbb..',
            ],
            body: 'b', pad: [2, 2, 5, 2],
            tail(f) {
                const up = f % 2 === 0;
                return up ? [[17, 13, 'b'], [18, 12, 'b'], [19, 11, 'b']]
                          : [[17, 13, 'b'], [18, 13, 'b'], [19, 12, 'b']];
            },
            tongue: true,
        },
        panda: {
            rows: [
                '.kk............kk.',
                'kkkk..........kkkk',
                'kkkkwwwwwwwwwwkkkk',
                '.kkwwwwwwwwwwwwkk.',
                '.wwwwwwwwwwwwwwww.',
                'wwwkkkwwwwwwkkkwww',
                'wwkkgkkwwwwkkgkkww',
                'wwkkkkwwwwwwkkkkww',
                'wwwkkwwwkkwwwkkwww',
                'wwwwwwwwweewwwwwww',
                '.wwwwwwwewwewwwww.',
                '..wwwwwwwwwwwwww..',
                '.kkkwwwwwwwwwwkkk.',
                'kkkkwwwwwwwwwwkkkk',
                'kkkwwwwwwwwwwwwkkk',
                '.kkwwwwwwwwwwwwkk.',
                '..kkkk......kkkk..',
            ],
            body: 'w', pad: [2, 2, 2, 2], blink: { g: 'k' },
        },
        giraffe: {
            rows: [
                '...r......r...',
                '...y......y...',
                '..yyyyyyyyyy..',
                '.yyyyyyyyyyyy.',
                'yyyeyyyyyyeyyy',
                'yyyeyyyyyyeyyy',
                'yyyyyyyyyyyyyy',
                '.yywwwwwwwwyy.',
                '.yywewwwwewyy.',
                '..ywwwwwwwwy..',
                '...yyyyyyyy...',
                '....yyrryy....',
                '....yryyyy....',
                '....yyyyry....',
                '....yryyyy....',
                '...yyyyyryy...',
                '..yyryyyyyyy..',
                '.yyyyyyryyyyy.',
                '.yyryyyyyyryy.',
                '.yyyyyyyyyyyy.',
                '.yy.yy..yy.yy.',
                '.rr.rr..rr.rr.',
            ],
            body: 'y', pad: [2, 3, 3, 2], swayRows: 11,
        },
        whale: {
            rows: [
                '......uuuuuuuuuu..........',
                '....uuuuuuuuuuuuuu......uu',
                '...uuuuuuuuuuuuuuuu....uuu',
                '..uuuuuuuuuuuuuuuuuu..uuu.',
                '.uuuuguuuuuuuuuuuuuuuuuu..',
                '.uuuueuuuuuuuuuuuuuuuuu...',
                'uuuuuuuuuuuuuuuuuuuuuu....',
                'ucccccccccccccuuuuuuu.....',
                '.ccccccccccccccuuuu.......',
                '..cccccccccccccuu.........',
                '....cccccccccc............',
            ],
            body: 'u', pad: [7, 2, 2, 3], float: true,
            spout(f) {
                const h = [0, 2, 4, 5, 5, 4, 2, 0][f % 8];
                const px = [];
                for (let i = 1; i <= h; i++) px.push([9, 7 - i, 'a']);
                if (h >= 4) px.push([8, 7 - h, 'a'], [10, 7 - h, 'a'], [7, 8 - h, 'a'], [11, 8 - h, 'a']);
                return px;
            },
        },
        bunny: {
            rows: [
                '...bb......bb...',
                '..bppb....bppb..',
                '..bppb....bppb..',
                '..bppb....bppb..',
                '..bbbb....bbbb..',
                '..bbbbbbbbbbbb..',
                '.bbbbbbbbbbbbbb.',
                'bbbeebbbbbbeebbb',
                'bbbeebbbbbbeebbb',
                'bpbbbbbppbbbbbpb',
                '.bbbbbbeebbbbbb.',
                '..bbbbbbbbbbbb..',
                '.bbbbwwwwwwbbbb.',
                'bbbbwwwwwwwwbbbb',
                'bbbbwwwwwwwwbbbb',
                '.bbsbbbbbbbbsbb.',
            ],
            body: 'b', pad: [2, 2, 4, 2], earWiggle: true,
            tail() { return [[16, 13, 'w'], [17, 13, 'w'], [16, 14, 'w'], [17, 14, 'w']]; },
        },
    };

    // ---------- rendering ----------
    function compose(sp, f, blinking) {
        const [pt, pl, pr, pb] = sp.pad;
        const W = sp.rows[0].length + pl + pr, H = sp.rows.length + pt + pb;
        const g = Array.from({ length: H }, () => Array(W).fill('.'));
        sp.rows.forEach((row, y) => {
            let shift = 0;
            if (sp.swayRows && y < sp.swayRows) shift = [0, 0, 1, 1, 0, 0, -1, -1][f % 8];
            if (sp.earWiggle && y < 5) shift = [0, 0, 0, 0, 0, 0, 1, 0][f % 8];
            for (let x = 0; x < row.length; x++) {
                let ch = row[x];
                if (ch === '.') continue;
                if (blinking) {
                    if (sp.blink && sp.blink[ch]) ch = sp.blink[ch];
                    else if (ch === 'e' && sp.rows[y + 1] && sp.rows[y + 1][x] === 'e') ch = sp.body;
                    else if (ch === 'g') ch = sp.body;
                }
                const gx = x + pl + shift, gy = y + pt;
                if (gx >= 0 && gx < W) g[gy][gx] = ch;
            }
        });
        const extra = [].concat(sp.tail ? sp.tail(f) : [], sp.spout ? sp.spout(f) : []);
        extra.forEach(([x, y, ch]) => {
            const gx = x + pl, gy = y + pt;
            if (gy >= 0 && gy < H && gx >= 0 && gx < W && g[gy][gx] === '.') g[gy][gx] = ch;
        });
        if (sp.tongue && f % 4 < 2) { // panting tongue
            const ty = 13 + pt, tx = 8 + pl;
            if (g[ty]) { g[ty][tx] = 'p'; g[ty][tx + 1] = 'p'; }
        }
        // auto outline (4-neighbour)
        const out = g.map(r => r.slice());
        for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
            if (g[y][x] !== '.') continue;
            const n = (yy, xx) => yy >= 0 && yy < H && xx >= 0 && xx < W && g[yy][xx] !== '.' && g[yy][xx] !== 'a';
            if (n(y - 1, x) || n(y + 1, x) || n(y, x - 1) || n(y, x + 1)) out[y][x] = 'o';
        }
        return { grid: out, W, H };
    }

    const HEART = ['.aa.aa.', 'aaaaaaa', 'aaaaaaa', '.aaaaa.', '..aaa..', '...a...'];

    class Pet {
        constructor(canvas) {
            this.canvas = canvas;
            this.kind = canvas.dataset.pet || 'cat';
            this.sp = SPRITES[this.kind] || SPRITES.cat;
            const probe = compose(this.sp, 0, false);
            this.W = probe.W; this.H = probe.H + 10;          // headroom for hops and hearts
            canvas.width = this.W; canvas.height = this.H;
            this.ctx = canvas.getContext('2d');
            this.palette = readPalette();
            this.f = 0; this.hop = []; this.hearts = []; this.nextBlink = 20; this.blinkLeft = 0;
            this.scale();
            canvas.addEventListener('click', () => this.poke());
            this.timer = setInterval(() => this.tick(), 125);   // 8 fps: stepped, like real sprites
            this.draw();
        }
        scale() {
            const target = parseInt(getComputedStyle(this.canvas).getPropertyValue('--pet-size')) || 150;
            const s = Math.max(2, Math.round(target / this.H));
            this.canvas.style.width = this.W * s + 'px';
            this.canvas.style.height = this.H * s + 'px';
        }
        poke() {
            this.hop = [-2, -4, -5, -4, -2, 0];
            this.hearts.push({ x: Math.floor(this.W / 2) - 3 + (Math.random() * 6 | 0) - 3, y: 6, life: 10 });
        }
        tick() {
            this.f++;
            if (this.blinkLeft > 0) this.blinkLeft--;
            else if (--this.nextBlink <= 0) { this.blinkLeft = 1; this.nextBlink = 20 + (Math.random() * 30 | 0); }
            if (this.hop.length) this.hop.shift();
            this.hearts.forEach(h => { h.y -= 1; h.life--; });
            this.hearts = this.hearts.filter(h => h.life > 0);
            this.draw();
        }
        draw() {
            const { grid, W, H } = compose(this.sp, this.f, this.blinkLeft > 0);
            const ctx = this.ctx, P = this.palette;
            ctx.clearRect(0, 0, this.W, this.H);
            const breathe = this.sp.float ? [0, 0, 1, 1, 1, 0, 0, -1][this.f % 8] : (this.f % 8 < 4 ? 0 : 1);
            const oy = 10 + (this.hop[0] || 0) + (this.hop.length ? 0 : breathe) - (this.sp.float ? 1 : 0);
            // ground shadow
            ctx.fillStyle = P.o; ctx.globalAlpha = 0.25;
            ctx.fillRect(3, this.H - 1, W - 6, 1);
            ctx.globalAlpha = 1;
            for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
                const ch = grid[y][x];
                if (ch === '.') continue;
                ctx.fillStyle = P[ch] || P.b;
                ctx.fillRect(x, y + oy - 1, 1, 1);
            }
            this.hearts.forEach(h => {
                ctx.globalAlpha = Math.min(1, h.life / 4);
                HEART.forEach((r, yy) => { for (let xx = 0; xx < r.length; xx++) if (r[xx] === 'a') { ctx.fillStyle = P.p; ctx.fillRect(h.x + xx, h.y + yy, 1, 1); } });
                ctx.globalAlpha = 1;
            });
        }
        refresh() { this.palette = readPalette(); this.scale(); this.draw(); }
        destroy() { clearInterval(this.timer); }
    }

    const live = new Set();
    window.PixelPets = {
        kinds: Object.keys(SPRITES),
        mount(canvas) { const p = new Pet(canvas); live.add(p); canvas._pet = p; return p; },
        mountAll(root = document) { root.querySelectorAll('canvas.pixel-pet').forEach(c => { if (!c._pet) this.mount(c); }); },
        unmount(canvas) { if (canvas && canvas._pet) { canvas._pet.destroy(); live.delete(canvas._pet); canvas._pet = null; } },
        refreshAll() { live.forEach(p => { if (!document.contains(p.canvas)) { p.destroy(); live.delete(p); } else p.refresh(); }); },
    };

    // Recolour when the theme or style changes
    new MutationObserver(() => window.PixelPets.refreshAll())
        .observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme', 'data-ui-style'] });
})();
