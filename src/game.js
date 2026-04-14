/**
 * Game state machine — pure data, no rendering.
 */

const OPPOSITE = { up: "down", down: "up", left: "right", right: "left" };
const MOVE_DELTA = { up: { x: 0, y: -1 }, down: { x: 0, y: 1 }, left: { x: -1, y: 0 }, right: { x: 1, y: 0 } };

function randomFoodPosition(snake, gridWidth, gridHeight) {
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
    const head = state.snake[0];
    const delta = MOVE_DELTA[state.direction];
    const next = { x: head.x + delta.x, y: head.y + delta.y };

    // Wall collision
    if (next.x < 0 || next.x >= state.gridWidth || next.y < 0 || next.y >= state.gridHeight) {
      state.running = false;
      state.gameOver = true;
      return;
    }

    // Self-collision (skip tail tip since it will move away)
    const body = state.snake.slice(0, -1);
    if (body.some((seg) => seg.x === next.x && seg.y === next.y)) {
      state.running = false;
      state.gameOver = true;
      return;
    }

    const ateFood = next.x === state.food.x && next.y === state.food.y;
    state.snake = [next, ...state.snake.slice(0, ateFood ? undefined : -1)];

    if (ateFood) {
      state.score += 1;
      state.food = randomFoodPosition(state.snake, state.gridWidth, state.gridHeight);
    }
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
