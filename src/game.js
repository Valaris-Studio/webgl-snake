/**
 * Game state machine — pure data, no rendering.
 *
 * State machine:
 *   not_started → (SPACE) → playing → (SPACE) → paused → (SPACE) → playing
 *   playing     → (game over condition) → game_over → (SPACE/ESC) → not_started
 *   any state   → (ESC) → not_started
 */

const OPPOSITE = { up: "down", down: "up", left: "right", right: "left" };

function initialState(gridWidth, gridHeight) {
  return {
    snake: [{ x: Math.floor(gridWidth / 2), y: Math.floor(gridHeight / 2) }],
    food: { x: Math.floor(gridWidth / 4), y: Math.floor(gridHeight / 4) },
    direction: "right",
    score: 0,
    // phase: "not_started" | "playing" | "paused" | "game_over"
    phase: "not_started",
    gridWidth,
    gridHeight,
  };
}

export function createGame(gridWidth, gridHeight) {
  let state = initialState(gridWidth, gridHeight);

  function tick() {
    // TODO: move snake head, check collisions, grow on food, spawn new food
  }

  function changeDirection(dir) {
    if (OPPOSITE[dir] === state.direction) return; // prevent 180-degree reversal
    state.direction = dir;
  }

  function start() {
    if (state.phase === "not_started") state.phase = "playing";
  }

  function togglePause() {
    if (state.phase === "playing") state.phase = "paused";
    else if (state.phase === "paused") state.phase = "playing";
  }

  function reset() {
    Object.assign(state, initialState(gridWidth, gridHeight));
  }

  return { state, tick, changeDirection, start, togglePause, reset };
}
