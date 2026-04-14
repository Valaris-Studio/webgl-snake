# WebGL Snake

A modern browser-based snake game built with vanilla JavaScript and raw WebGL. No frameworks, no dependencies — just the GPU and the browser.

## Run

Open `index.html` in any modern browser, or serve it locally:

```bash
python3 -m http.server 8080
# then visit http://localhost:8080
```

Controls: Arrow keys or WASD to steer, SPACE to start/pause.

## Visual Effects

**Trail effect**: Each snake segment leaves a ghost that fades over 5 frames, ranging from alpha 0.32 down to 0.0. Trails share the snake's color and are rendered before the snake body so they appear behind it. Age-bucketed batching (up to 5 draw calls) keeps the effect performant within the `requestAnimationFrame` loop.

## Roadmap

- [ ] WebGL grid rendering (line primitives with subtle color)
- [ ] Snake movement and growth (head advance, tail trim, food collision)
- [ ] Food spawning and collision detection
- [ ] Score display and game over screen
- [x] Visual trail — fading ghost behind each segment (5-frame decay, alpha 0.32 → 0.0)
- [ ] Visual effects — glow shader on snake, particle burst on food pickup
