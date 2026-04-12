/**
 * Game state machine — pure data, no rendering.
 */

export const MOVE_INTERVAL_MS = 150; // ms per cell; tune for difficulty

const OPPOSITE = { up: "down", down: "up", left: "right", right: "left" };

function randomFoodPos(snake, gridWidth, gridHeight) {
  let pos;
  do {
    pos = {
      x: Math.floor(Math.random() * gridWidth),
      y: Math.floor(Math.random() * gridHeight),
    };
  } while (snake.some((seg) => seg.x === pos.x && seg.y === pos.y));
  return pos;
}

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
  };
}

export function createGame(gridWidth, gridHeight) {
  let state = initialState(gridWidth, gridHeight);

  function tick() {
    if (!state.running) return;

    const head = state.snake[0];
    const next = { x: head.x, y: head.y };

    if (state.direction === "right") next.x += 1;
    else if (state.direction === "left") next.x -= 1;
    else if (state.direction === "up") next.y -= 1;
    else if (state.direction === "down") next.y += 1;

    // Wrap around edges
    next.x = ((next.x % gridWidth) + gridWidth) % gridWidth;
    next.y = ((next.y % gridHeight) + gridHeight) % gridHeight;

    const ateFood = next.x === state.food.x && next.y === state.food.y;

    // Grow on food (keep tail); otherwise drop tail
    const newSnake = [next, ...state.snake];
    if (!ateFood) newSnake.pop();

    if (ateFood) {
      state.score += 1;
      state.food = randomFoodPos(newSnake, gridWidth, gridHeight);
    }

    state.snake = newSnake;
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
