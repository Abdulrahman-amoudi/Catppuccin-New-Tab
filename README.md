# Catppuccin New Tab

A pixel-art new tab page for Chrome and other Chromium browsers. It has a small animated pet sitting on your search bar, a desk of tiles around it, and two independent switches for the look:

- **Interface style:** how things are shaped.
- **Colour theme:** what colours they use.

Any style works with any theme.

## Interface styles

| Style | What it looks like |
|---|---|
| Pixel | Chunky 8-bit panels, notched corners, hard drop shadows, a dithered sky. This is the default. |
| Minimal | Only the clock, the search bar and a quiet row of shortcuts. The tools fade out until you hover them. |
| Glass | Frosted panels over soft pools of colour. |
| Liquid | Glass with rounder shapes and colour that slowly drifts. |
| Crowded | Everything on one dense board, mono type, weather details always open. |
| Simple | Flat cards with thin borders, no blur and no shadows. |

To change the style, use the grid button next to the theme picker, or go to Settings → Interface Style.

## Colour themes

There are 16:

- Catppuccin: Mocha, Macchiato, Frappé, Latte
- Forest, Orange, Samurai Red, Sky Blue, Dark Blue
- Cyberpunk, Dracula, Nord, Sakura, Hot Pink, Toxic, Lavender

## Pets

The pets are drawn in pixel art on a canvas. Each one blinks, breathes and has its own small move:

- Cat: swishes its tail.
- Dog: wags its tail and pants.
- Panda: has a blinking eye glint.
- Bunny: wiggles its ears.
- Giraffe: sways its neck.
- Whale: floats and spouts.

Click a pet to make it hop. The pets recolour themselves to match the theme. The old SVG Bongo Cat is still in the list, and you can also pick none.

## Everything else

- Clock (12h or 24h, any timezone), date and greeting
- Weather for any city. It uses Open-Meteo, so no key is needed.
- Search across several engines
- Shortcuts with brand icons:
  - drag to reorder them
  - edit or delete them on hover
  - choose oval, rounded, circle or square
- Notes, saved on this device
- Background image, video or YouTube link
- Star particles and ambient sounds

The fonts are bundled in `fonts/`, so the page doesn't need Google Fonts and looks the same offline. They are all SIL Open Font License; the licences are next to the font files.

## Install

1. Download or clone this repo.
2. Open `chrome://extensions` and turn on **Developer mode**.
3. Click **Load unpacked** and pick the repo folder.
4. Open a new tab.

## Files

| File | What it holds |
|---|---|
| `index.html` | The layout |
| `style.css` | The themes (`data-theme`) and the interface styles (`data-ui-style`) |
| `ui-style.js` | The style switcher. It loads in `<head>` so the page doesn't flash. |
| `pixel-pets.js` | The sprites and their animation |
| `script.js` | Everything else: clock, weather, search, shortcuts, notes, settings and background |
