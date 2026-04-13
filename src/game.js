/**
 * Game state machine — pure data, no rendering.
 */

const OPPOSITE = { up: "down", down: "up", left: "right", right: "left" };

function initialState(gridWidth, gridHeight) {
  return {
    snake: [{ x: Math.floor(gridWidth / 2), y: Math.floor(gridHeight / 2) }],
    food: { x: Math.floor(gridWidth / 4), y: Math.floor(gridHeight / 4) },
    direction: "right",
    score: 0,
    running: false,
    gameOver: false,
    gridWidth,
    gridHeight,
    trail: [], // [{x, y, age}] — ghost segments fading over 5 ticks
  };
}

export function createGame(gridWidth, gridHeight) {
  let state = initialState(gridWidth, gridHeight);

  function tick() {
    // Age existing trail ghosts and drop expired ones (lifetime = 5 ticks)
    state.trail = state.trail
      .map(g => ({ ...g, age: g.age + 1 }))
      .filter(g => g.age < 5);

    // Snapshot current snake positions before movement as new ghosts
    for (const seg of state.snake) {
      state.trail.push({ x: seg.x, y: seg.y, age: 0 });
    }

    // TODO: move snake head, check collisions, grow on food, spawn new food
    console.log("TODO: tick");
  }

  function changeDirection(dir) {
    if (OPPOSITE[dir] === state.direction) return; // prevent 180-degree reversal
    state.direction = dir;
  }

  function reset() {
    Object.assign(state, initialState(gridWidth, gridHeight));
  }

  return { state, tick, changeDirection, reset };
}
