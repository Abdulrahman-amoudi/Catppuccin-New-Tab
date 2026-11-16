/* Interface style switcher: Pixel, Minimal, Glass, Liquid, Crowded, Simple.
 * Loaded in <head> so the saved style is applied before the first paint.
 * Styles are independent of the colour theme (data-theme), so every theme works with every style.
 */
(function () {
    'use strict';
    const STYLES = [
        { id: 'pixel',   name: 'Pixel',   desc: 'Chunky 8-bit panels' },
        { id: 'minimal', name: 'Minimal', desc: 'Just the clock and search' },
        { id: 'glass',   name: 'Glass',   desc: 'Frosted panels' },
        { id: 'liquid',  name: 'Liquid',  desc: 'Glass on moving colour' },
        { id: 'crowded', name: 'Crowded', desc: 'Everything on one board' },
        { id: 'simple',  name: 'Simple',  desc: 'Flat and calm' },
    ];
    const KEY = 'catUiStyle';
    const read = () => { try { return localStorage.getItem(KEY); } catch (e) { return null; } };
    const valid = (id) => STYLES.some(s => s.id === id);

    function apply(id) {
        if (!valid(id)) id = 'pixel';
        document.documentElement.setAttribute('data-ui-style', id);
        try { localStorage.setItem(KEY, id); } catch (e) { /* storage blocked: style still applies */ }
        const menu = document.getElementById('styleMenu');
        if (menu) menu.querySelectorAll('.style-option').forEach(o => o.classList.toggle('active', o.dataset.style === id));
        const sel = document.getElementById('settingUiStyle');
        if (sel) sel.value = id;
    }

    apply(read() || 'pixel');   // before paint

    function wire() {
        const wrap = document.querySelector('.style-tool-wrapper');
        const btn = document.getElementById('styleBtn');
        const menu = document.getElementById('styleMenu');
        const sel = document.getElementById('settingUiStyle');
        const current = () => document.documentElement.getAttribute('data-ui-style');

        if (menu) {
            menu.innerHTML = STYLES.map(s => `
                <button type="button" class="style-option" role="menuitemradio" data-style="${s.id}">
                    <span class="style-swatch style-swatch--${s.id}" aria-hidden="true"><i></i><i></i><i></i></span>
                    <span class="style-text"><b>${s.name}</b><small>${s.desc}</small></span>
                </button>`).join('');
            menu.addEventListener('click', (e) => {
                const opt = e.target.closest('.style-option');
                if (!opt) return;
                apply(opt.dataset.style);
                wrap && wrap.classList.remove('open');
                btn && btn.setAttribute('aria-expanded', 'false');
            });
        }
        if (btn && wrap) {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const open = wrap.classList.toggle('open');
                btn.setAttribute('aria-expanded', String(open));
            });
            document.addEventListener('click', (e) => { if (!wrap.contains(e.target)) { wrap.classList.remove('open'); btn.setAttribute('aria-expanded', 'false'); } });
            document.addEventListener('keydown', (e) => { if (e.key === 'Escape') wrap.classList.remove('open'); });
        }
        if (sel) {
            sel.innerHTML = STYLES.map(s => `<option value="${s.id}">${s.name}</option>`).join('');
            sel.addEventListener('change', () => apply(sel.value));
        }
        apply(current());
    }

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', wire);
    else wire();

    window.UiStyle = { styles: STYLES, apply };
})();
