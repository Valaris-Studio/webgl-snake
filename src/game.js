/**
 * Game state machine — pure data, no rendering.
 */

const OPPOSITE = { up: "down", down: "up", left: "right", right: "left" };

const MOVE_DELTA = {
  up:    { x:  0, y: -1 },
  down:  { x:  0, y:  1 },
  left:  { x: -1, y:  0 },
  right: { x:  1, y:  0 },
};

function spawnFood(snake, gridWidth, gridHeight) {
  // Collect all cells not occupied by the snake
  const occupied = new Set(snake.map(({ x, y }) => `${x},${y}`));
  const free = [];
  for (let y = 0; y < gridHeight; y++) {
    for (let x = 0; x < gridWidth; x++) {
      if (!occupied.has(`${x},${y}`)) free.push({ x, y });
    }
  }
  return free[Math.floor(Math.random() * free.length)];
}

function initialState(gridWidth, gridHeight) {
  const snake = [{ x: Math.floor(gridWidth / 2), y: Math.floor(gridHeight / 2) }];
  return {
    snake,
    food: spawnFood(snake, gridWidth, gridHeight),
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

    // Wall collision — wrap around
    next.x = (next.x + state.gridWidth) % state.gridWidth;
    next.y = (next.y + state.gridHeight) % state.gridHeight;

    // Self-collision check before moving
    const hitsBody = state.snake.some(({ x, y }) => x === next.x && y === next.y);
    if (hitsBody) {
      state.gameOver = true;
      state.running = false;
      return;
    }

    const ateFood = next.x === state.food.x && next.y === state.food.y;

    state.snake.unshift(next);
    if (ateFood) {
      state.score += 1;
      state.food = spawnFood(state.snake, state.gridWidth, state.gridHeight);
    } else {
      state.snake.pop(); // remove tail only when not growing
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
