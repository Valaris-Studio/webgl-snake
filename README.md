# WebGL Snake

A modern browser-based snake game built with vanilla JavaScript and raw WebGL. No frameworks, no dependencies — just the GPU and the browser.

## Run

Open `index.html` in any modern browser, or serve it locally:

```bash
python3 -m http.server 8080
# then visit http://localhost:8080
```

Controls: Arrow keys or WASD to steer, SPACE to start/pause.

## Roadmap

- [ ] WebGL grid rendering (line primitives with subtle color)
- [ ] Snake movement and growth (head advance, tail trim, food collision)
- [ ] Food spawning and collision detection
- [ ] Score display and game over screen
- [ ] Visual effects — glow shader on snake, fading trail, particle burst on food pickup
