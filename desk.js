/* Pieces of the desk that sit on top of script.js:
 *  - an LCD dot-matrix clock for the Pixel style (it mirrors #timeDisplay)
 *  - the pixel horizon at the bottom of the Pixel style
 *  - number keys 1–9 open the matching shortcut
 */
(function () {
    'use strict';
    const root = document.documentElement;
    const isPixel = () => (root.getAttribute('data-ui-style') || 'pixel') === 'pixel';
    const css = (name, fallback) => getComputedStyle(root).getPropertyValue(name).trim() || fallback;

    // mix two colours (hex or rgb()) in JS; canvas can't take color-mix()
    function rgb(c) {
        const ctx = rgb.ctx || (rgb.ctx = document.createElement('canvas').getContext('2d'));
        ctx.fillStyle = '#000'; ctx.fillStyle = c;
        const v = ctx.fillStyle;
        if (v[0] === '#') return [1, 3, 5].map(i => parseInt(v.slice(i, i + 2), 16));
        return (v.match(/[\d.]+/g) || [0, 0, 0]).slice(0, 3).map(Number);
    }
    function mix(a, b, t) {
        const A = rgb(a), B = rgb(b);
        return `rgb(${A.map((v, i) => Math.round(v * t + B[i] * (1 - t))).join(',')})`;
    }

    /* ---------- LCD clock ---------- */
    // 5×7 glyphs. '#' is a lit cell.
    const GLYPHS = {
        '0': ['.###.', '#...#', '#..##', '#.#.#', '##..#', '#...#', '.###.'],
        '1': ['..#..', '.##..', '..#..', '..#..', '..#..', '..#..', '.###.'],
        '2': ['.###.', '#...#', '....#', '...#.', '..#..', '.#...', '#####'],
        '3': ['#####', '...#.', '..#..', '...#.', '....#', '#...#', '.###.'],
        '4': ['...#.', '..##.', '.#.#.', '#..#.', '#####', '...#.', '...#.'],
        '5': ['#####', '#....', '####.', '....#', '....#', '#...#', '.###.'],
        '6': ['..##.', '.#...', '#....', '####.', '#...#', '#...#', '.###.'],
        '7': ['#####', '....#', '...#.', '..#..', '.#...', '.#...', '.#...'],
        '8': ['.###.', '#...#', '#...#', '.###.', '#...#', '#...#', '.###.'],
        '9': ['.###.', '#...#', '#...#', '.####', '....#', '...#.', '.##..'],
        ':': ['.', '.', '#', '.', '#', '.', '.'],
        ' ': ['..', '..', '..', '..', '..', '..', '..'],
        'A': ['.###.', '#...#', '#...#', '#####', '#...#', '#...#', '#...#'],
        'P': ['####.', '#...#', '#...#', '####.', '#....', '#....', '#....'],
        'M': ['#...#', '##.##', '#.#.#', '#.#.#', '#...#', '#...#', '#...#'],
    };
    const GHOST = '8';

    const timeEl = document.getElementById('timeDisplay');
    let lcd = null;
    if (timeEl) {
        lcd = document.createElement('canvas');
        lcd.className = 'lcd-clock';
        lcd.setAttribute('aria-hidden', 'true');
        timeEl.after(lcd);
    }

    function drawClock() {
        if (!lcd) return;
        const on = isPixel();
        root.classList.toggle('has-lcd', on);
        if (!on) return;
        const text = timeEl.textContent.trim().toUpperCase();
        const ampm = /(AM|PM)$/.exec(text);
        const main = text.replace(/\s*(AM|PM)$/, '');
        const portrait = innerHeight > innerWidth || innerWidth <= 900;
        const cell = Math.round(Math.min(Math.max(Math.min(innerWidth * (portrait ? .019 : .0125), innerHeight * .022), 7), 18));
        const gap = Math.max(2, Math.round(cell / 6));
        const pitch = cell + gap;
        const colonOn = new Date().getSeconds() % 2 === 0;

        // Layout: main digits at full size, AM/PM at half size beside them.
        const cols = [];
        for (const ch of main) cols.push({ ch, w: (GLYPHS[ch] || GLYPHS[' '])[0].length });
        let wMain = cols.reduce((s, c) => s + c.w, 0) + (cols.length - 1);
        const small = Math.max(4, Math.round(cell / 2.2)), sgap = Math.max(1, Math.round(small / 5)), sp = small + sgap;
        const wAmpm = ampm ? (5 * 2 + 1) * sp + pitch : 0;
        const dpr = window.devicePixelRatio || 1;
        const W = wMain * pitch - gap + wAmpm, H = 7 * pitch - gap + Math.round(cell * .6);
        lcd.width = Math.ceil(W * dpr); lcd.height = Math.ceil(H * dpr);
        lcd.style.width = W + 'px'; lcd.style.height = H + 'px';
        const ctx = lcd.getContext('2d');
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        ctx.clearRect(0, 0, W, H);

        const lit = css('--cat-text', '#cdd6f4');
        const ghost = mix(css('--cat-surface0', '#313244'), css('--cat-base', '#1e1e2e'), .32);
        const shade = css('--cat-crust', '#11111b');
        const accent = css('--cat-mauve', '#cba6f7');
        const drop = Math.round(cell * .45);

        const cellAt = (x, y, size, color, withShadow) => {
            if (withShadow) { ctx.fillStyle = shade; ctx.fillRect(x + drop, y + drop, size, size); }
            ctx.fillStyle = color; ctx.fillRect(x, y, size, size);
        };
        // pass 1: ghost segments and shadows; pass 2: lit cells (so shadows never cover a lit cell)
        for (const pass of [0, 1]) {
            let x = 0;
            for (const { ch, w } of cols) {
                const g = GLYPHS[ch] || GLYPHS[' '];
                const ghostG = ch === ':' ? GLYPHS[':'] : (/\d/.test(ch) ? GLYPHS[GHOST] : null);
                for (let r = 0; r < 7; r++) for (let c = 0; c < w; c++) {
                    const px = x + c * pitch, py = r * pitch;
                    const isLit = g[r][c] === '#' && (ch !== ':' || colonOn);
                    if (pass === 0) {
                        if (ghostG && ghostG[r][c] === '#' && !isLit) cellAt(px, py, cell, ghost, false);
                        if (isLit) { ctx.fillStyle = shade; ctx.fillRect(px + drop, py + drop, cell, cell); }
                    } else if (isLit) cellAt(px, py, cell, ch === ':' ? accent : lit, false);
                }
                x += (w + 1) * pitch;
            }
            if (ampm && pass === 1) {
                let ax = wMain * pitch - gap + pitch;
                for (const ch of ampm[1]) {
                    const g = GLYPHS[ch];
                    for (let r = 0; r < 7; r++) for (let c = 0; c < 5; c++)
                        if (g[r][c] === '#') cellAt(ax + c * sp, 7 * pitch - gap - 7 * sp + sgap + r * sp, small, accent, false);
                    ax += 6 * sp;
                }
            }
        }
    }

    /* ---------- Pixel horizon ---------- */
    const scene = document.createElement('canvas');
    scene.className = 'pixel-horizon';
    scene.setAttribute('aria-hidden', 'true');
    document.body.prepend(scene);

    function rng(seed) { return () => (seed = (seed * 16807) % 2147483647) / 2147483647; }

    function drawScene() {
        const on = isPixel() && !document.body.classList.contains('has-bg-image');
        scene.hidden = !on;
        if (!on) return;
        const P = 4; // one art pixel = 4 css px
        const W = Math.ceil(innerWidth / P), H = Math.ceil(innerHeight / P);
        scene.width = W; scene.height = H;
        const ctx = scene.getContext('2d');
        ctx.clearRect(0, 0, W, H);
        const col = {
            far: css('--cat-surface0', '#313244'),
            mid: css('--cat-mantle', '#181825'),
            near: css('--cat-crust', '#11111b'),
            glow: css('--cat-yellow', '#f9e2af'),
            sun: css('--cat-peach', '#fab387'),
            moon: css('--cat-text', '#cdd6f4'),
            base: css('--cat-base', '#1e1e2e'),
        };
        const hour = new Date().getHours();
        const day = hour >= 6 && hour < 18;

        // sky body: a moon or sun, low on the right
        const cx = Math.round(W * (W > H ? .86 : .8)), cy = Math.round(H * (W > H ? .3 : .22)), R = Math.max(5, Math.round(Math.min(W, H) * .028));
        for (let y = -R; y <= R; y++) for (let x = -R; x <= R; x++) {
            const d = x * x + y * y;
            if (d > R * R) continue;
            if (!day) { const bx = x + Math.round(R * .45), by = y - Math.round(R * .3); if (bx * bx + by * by < R * R * .8) continue; }
            ctx.fillStyle = day ? col.sun : col.moon;
            ctx.fillRect(cx + x, cy + y, 1, 1);
        }

        // three ridges of stepped hills, back to front
        const layer = (seed, baseY, amp, step, color) => {
            const r = rng(seed);
            let y = baseY, x = 0;
            ctx.fillStyle = color;
            while (x < W) {
                const run = step + Math.floor(r() * step * 2);
                y = Math.round(Math.max(baseY - amp, Math.min(baseY + amp * .4, y + (r() - .5) * amp * .8)));
                ctx.fillRect(x, y, run, H - y);
                x += run;
            }
        };
        layer(7, Math.round(H * .80), Math.round(H * .07), 6, col.far);
        layer(13, Math.round(H * .87), Math.round(H * .05), 4, col.mid);

        // the nearest ridge carries a few houses with lit windows
        const r = rng(29);
        const groundY = Math.round(H * .93);
        ctx.fillStyle = col.near;
        ctx.fillRect(0, groundY, W, H - groundY);
        let x = Math.round(W * .04);
        while (x < W) {
            const w = 6 + Math.floor(r() * 7), h = 5 + Math.floor(r() * 9);
            if (r() < .55) {
                ctx.fillStyle = col.near;
                ctx.fillRect(x, groundY - h, w, h);
                // roof
                for (let i = 0; i < Math.ceil(w / 2); i++) ctx.fillRect(x + i, groundY - h - i - 1, w - i * 2, 1);
                // windows
                for (let wy = groundY - h + 2; wy < groundY - 2; wy += 3)
                    for (let wx = x + 1; wx < x + w - 1; wx += 3)
                        if (r() < .35) { ctx.fillStyle = col.glow; ctx.fillRect(wx, wy, 1, 1); ctx.fillStyle = col.near; }
                x += w + 2 + Math.floor(r() * 10);
            } else x += 4 + Math.floor(r() * 14);
        }
    }

    /* ---------- number keys open shortcuts ---------- */
    document.addEventListener('keydown', e => {
        if (e.ctrlKey || e.metaKey || e.altKey || e.repeat) return;
        const t = e.target;
        if (t && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName))) return;
        if (document.querySelector('.modal-overlay.open')) return;
        const n = parseInt(e.key, 10);
        if (!(n >= 1 && n <= 9)) return;
        const link = document.querySelectorAll('#shortcutsGrid a.shortcut-item')[n - 1];
        if (link) { e.preventDefault(); link.click(); }
    });

    function numberSlots() {
        document.querySelectorAll('#shortcutsGrid a.shortcut-item').forEach((a, i) => {
            if (i < 9) a.dataset.key = i + 1; else delete a.dataset.key;
        });
    }
    const grid = document.getElementById('shortcutsGrid');
    if (grid) new MutationObserver(numberSlots).observe(grid, { childList: true });
    numberSlots();

    /* ---------- wiring ---------- */
    const redraw = () => { drawClock(); drawScene(); };
    if (timeEl) new MutationObserver(drawClock).observe(timeEl, { childList: true, characterData: true, subtree: true });
    setInterval(drawClock, 1000);
    new MutationObserver(() => requestAnimationFrame(redraw))
        .observe(root, { attributes: true, attributeFilter: ['data-theme', 'data-ui-style'] });
    new MutationObserver(() => requestAnimationFrame(drawScene))
        .observe(document.body, { attributes: true, attributeFilter: ['class'] });
    let rt; window.addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(redraw, 120); });
    setInterval(drawScene, 10 * 60 * 1000); // sun ↔ moon
    if (document.fonts) document.fonts.ready.then(redraw);
    redraw();
})();
