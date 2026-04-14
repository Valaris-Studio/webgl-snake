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

  function spawnFood() {
    // Pick a random cell not occupied by the snake
    const occupied = new Set(state.snake.map(({ x, y }) => `${x},${y}`));
    let pos;
    do {
      pos = {
        x: Math.floor(Math.random() * state.gridWidth),
        y: Math.floor(Math.random() * state.gridHeight),
      };
    } while (occupied.has(`${pos.x},${pos.y}`));
    state.food = pos;
  }

  function tick() {
    const head = state.snake[0];
    const next = { ...head };

    if (state.direction === "up")    next.y -= 1;
    if (state.direction === "down")  next.y += 1;
    if (state.direction === "left")  next.x -= 1;
    if (state.direction === "right") next.x += 1;

    // Wall collision
    if (next.x < 0 || next.x >= state.gridWidth || next.y < 0 || next.y >= state.gridHeight) {
      recordGameOver();
      return;
    }

    // Self collision (exclude tail tip — it moves away this tick)
    const bodyWithoutTail = state.snake.slice(0, -1);
    if (bodyWithoutTail.some(({ x, y }) => x === next.x && y === next.y)) {
      recordGameOver();
      return;
    }

    const ateFood = next.x === state.food.x && next.y === state.food.y;

    state.snake.unshift(next);
    if (ateFood) {
      state.score += 1;
      spawnFood();
    } else {
      state.snake.pop();
    }
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
