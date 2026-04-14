# WebGL Snake

A modern browser-based snake game built with vanilla JavaScript and raw WebGL. No frameworks, no dependencies — just the GPU and the browser.

## Run

Open `index.html` in any modern browser, or serve it locally:

```bash
python3 -m http.server 8080
# then visit http://localhost:8080
```

## Controls

| Key | Action |
|-----|--------|
| Arrow keys / WASD | Steer the snake |
| SPACE | Start game / Pause / Resume |
| ESC | Restart game (works from any state) |

**Game phases**: `not started → playing → paused → game over → not started`

When paused, the game loop freezes and a "PAUSED" overlay is shown. The snake scene remains visible beneath the overlay.

## Roadmap

- [ ] WebGL grid rendering (line primitives with subtle color)
- [ ] Snake movement and growth (head advance, tail trim, food collision)
- [ ] Food spawning and collision detection
- [ ] Score display and game over screen
- [ ] Visual effects — glow shader on snake, fading trail, particle burst on food pickup
