/**
 * Game state machine — pure data, no rendering.
 */

const OPPOSITE = { up: "down", down: "up", left: "right", right: "left" };
const HIGH_SCORE_KEY = "snake_high_score";

/** Reads high score from localStorage; returns 0 if unavailable or unset. */
function loadHighScore() {
  try {
    return parseInt(localStorage.getItem(HIGH_SCORE_KEY) ?? "0", 10) || 0;
  } catch {
    return 0;
  }
}

/** Persists high score to localStorage; silently no-ops if unavailable. */
function saveHighScore(score) {
  try {
    localStorage.setItem(HIGH_SCORE_KEY, String(score));
  } catch {
    // localStorage unavailable — degrade gracefully
  }
}

function initialState(gridWidth, gridHeight, highScore) {
  return {
    snake: [{ x: Math.floor(gridWidth / 2), y: Math.floor(gridHeight / 2) }],
    food: { x: Math.floor(gridWidth / 4), y: Math.floor(gridHeight / 4) },
    direction: "right",
    score: 0,
    highScore,
    newRecord: false, // true only when this game's final score beat the previous best
    running: false,
    gameOver: false,
    gridWidth,
    gridHeight,
  };
}

export function createGame(gridWidth, gridHeight) {
  let state = initialState(gridWidth, gridHeight, loadHighScore());

  /** Called internally when a collision is detected — updates and persists the high score. */
  function recordGameOver() {
    if (state.score > state.highScore) {
      state.highScore = state.score;
      state.newRecord = true;
      saveHighScore(state.highScore);
    }
    state.running = false;
    state.gameOver = true;
  }

  function tick() {
    // TODO: move snake head, check collisions, grow on food, spawn new food
    // When collision is detected, call recordGameOver() here.
    console.log("TODO: tick");
  }

  function changeDirection(dir) {
    if (OPPOSITE[dir] === state.direction) return; // prevent 180-degree reversal
    state.direction = dir;
  }

  function reset() {
    const highScore = state.highScore; // carry high score across resets
    Object.assign(state, initialState(gridWidth, gridHeight, highScore));
  }

  return { state, tick, changeDirection, recordGameOver, reset };
}
