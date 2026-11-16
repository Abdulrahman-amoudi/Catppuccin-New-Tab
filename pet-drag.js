/* Drag the companion anywhere on the page.
 * The spot is saved as a fraction of the window, so it survives resizes and other monitors.
 * Drop it near the search bar, or double-click it, to send it back to its perch.
 */
(function () {
    'use strict';
    const perch = document.querySelector('.companion-perch');
    if (!perch) return;
    const KEY = 'catPetPos';
    const SNAP = 70; // px from home that counts as "put it back"
    let pos = null;
    try { pos = JSON.parse(localStorage.getItem(KEY)); } catch (e) { pos = null; }

    const save = () => { try { pos ? localStorage.setItem(KEY, JSON.stringify(pos)) : localStorage.removeItem(KEY); } catch (e) {} };
    const clamp = (v, lo, hi) => Math.min(Math.max(v, lo), Math.max(lo, hi));

    function place() {
        if (!pos) {
            perch.classList.remove('is-free');
            perch.style.left = perch.style.top = '';
            return;
        }
        perch.classList.add('is-free');
        const w = perch.offsetWidth, h = perch.offsetHeight;
        perch.style.left = clamp(pos.x * innerWidth - w / 2, 0, innerWidth - w) + 'px';
        perch.style.top = clamp(pos.y * innerHeight - h, 0, innerHeight - h) + 'px';
    }

    function homeCenter() {
        // where the perch sits when it isn't free: centred above the search bar
        const bar = document.querySelector('.search-container');
        const r = bar ? bar.getBoundingClientRect() : { left: innerWidth / 2, width: 0, top: innerHeight / 2 };
        return { x: r.left + r.width / 2, y: r.top };
    }

    let start = null, dragging = false, grab = { x: 0, y: 0 };

    perch.addEventListener('pointerdown', e => {
        if (e.button !== 0) return;
        start = { x: e.clientX, y: e.clientY };
        const r = perch.getBoundingClientRect();
        grab = { x: e.clientX - r.left, y: e.clientY - r.top };
    });

    window.addEventListener('pointermove', e => {
        if (!start) return;
        if (!dragging) {
            if (Math.hypot(e.clientX - start.x, e.clientY - start.y) < 5) return;
            dragging = true;
            const r = perch.getBoundingClientRect();
            perch.classList.add('is-free', 'is-held');
            perch.style.left = r.left + 'px';
            perch.style.top = r.top + 'px';
            document.body.classList.add('pet-dragging');
            setHeld(true);
        }
        perch.style.left = clamp(e.clientX - grab.x, 0, innerWidth - perch.offsetWidth) + 'px';
        perch.style.top = clamp(e.clientY - grab.y, 0, innerHeight - perch.offsetHeight) + 'px';
        perch.classList.toggle('near-home', nearHome());
    });

    function nearHome() {
        const r = perch.getBoundingClientRect(), h = homeCenter();
        return Math.hypot(r.left + r.width / 2 - h.x, r.bottom - h.y) < SNAP;
    }

    window.addEventListener('pointerup', () => {
        if (!start) return;
        start = null;
        if (!dragging) return;
        dragging = false;
        perch.classList.remove('is-held', 'near-home');
        document.body.classList.remove('pet-dragging');
        if (nearHome()) pos = null;
        else {
            const r = perch.getBoundingClientRect();
            pos = { x: (r.left + r.width / 2) / innerWidth, y: r.bottom / innerHeight };
        }
        save(); place(); setHeld(false);
        // the pointerup is followed by a click; don't let it count as a poke
        window.PixelPets && (window.PixelPets.suppressClick = true);
        setTimeout(() => { if (window.PixelPets) window.PixelPets.suppressClick = false; }, 0);
    });

    perch.addEventListener('dblclick', () => { pos = null; save(); place(); });

    function setHeld(on) {
        const c = perch.querySelector('canvas.pixel-pet');
        if (c && c._pet) c._pet.setHeld(on);
    }

    window.addEventListener('resize', place);
    // the companion's size can change with the style; re-place once things settle
    new MutationObserver(() => requestAnimationFrame(place))
        .observe(document.documentElement, { attributes: true, attributeFilter: ['data-ui-style'] });
    place();
    requestAnimationFrame(place);
})();
