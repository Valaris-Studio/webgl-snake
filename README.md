# WebGL Snake

A modern browser-based snake game built with vanilla JavaScript and raw WebGL. No frameworks, no dependencies — just the GPU and the browser.

## Run

Open `index.html` in any modern browser, or serve it locally:

```bash
python3 -m http.server 8080
# then visit http://localhost:8080
```

Controls: Arrow keys or WASD to steer, SPACE to start/pause.

## Gameplay Mechanics

**Progressive speed**: The game accelerates as your score climbs. Tick interval starts at 150 ms and drops 10 ms for every 5 points scored, bottoming out at 60 ms. The current speed level (`SPD N`) is displayed in the top-right corner of the HUD; level increments by 1 per 5 points.

| Score range | Tick interval | Speed level |
|-------------|--------------|-------------|
| 0–4         | 150 ms       | 1           |
| 5–9         | 140 ms       | 2           |
| 10–14       | 130 ms       | 3           |
| …           | …            | …           |
| 45+         | 60 ms (cap)  | 10+         |

## Roadmap

- [x] WebGL grid rendering (line primitives with subtle color)
- [x] Snake movement and growth (head advance, tail trim, food collision)
- [x] Food spawning and collision detection
- [x] Score display and game over screen
- [x] Progressive speed increase (150 ms → 60 ms floor, -10 ms per 5 pts)
- [ ] Visual effects — glow shader on snake, fading trail, particle burst on food pickup
