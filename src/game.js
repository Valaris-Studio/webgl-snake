/**
 * Game state machine — pure data, no rendering.
 * Trail ghosts are stored as {x, y, age} objects; age increments each tick.
 * Ghosts with age >= 5 are pruned (fully transparent).
 */

const OPPOSITE = { up: "down", down: "up", left: "right", right: "left" };

const DIRECTION_DELTA = {
  up:    { dx:  0, dy: -1 },
  down:  { dx:  0, dy:  1 },
  left:  { dx: -1, dy:  0 },
  right: { dx:  1, dy:  0 },
};

function randomCell(gridWidth, gridHeight, exclude) {
  let cell;
  do {
    cell = {
      x: Math.floor(Math.random() * gridWidth),
      y: Math.floor(Math.random() * gridHeight),
    };
  } while (exclude.some((s) => s.x === cell.x && s.y === cell.y));
  return cell;
}

function initialState(gridWidth, gridHeight) {
  return {
    snake: [{ x: Math.floor(gridWidth / 2), y: Math.floor(gridHeight / 2) }],
    trail: [], // [{x, y, age}] — ghost segments fading over 5 frames
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
    const { dx, dy } = DIRECTION_DELTA[state.direction];
    const head = state.snake[0];
    const newHead = { x: head.x + dx, y: head.y + dy };

    // Wall collision
    if (
      newHead.x < 0 || newHead.x >= state.gridWidth ||
      newHead.y < 0 || newHead.y >= state.gridHeight
    ) {
      state.running = false;
      state.gameOver = true;
      return;
    }

    // Self collision
    if (state.snake.some((s) => s.x === newHead.x && s.y === newHead.y)) {
      state.running = false;
      state.gameOver = true;
      return;
    }

    const ateFood = newHead.x === state.food.x && newHead.y === state.food.y;

    // Add ghost for the tail segment that will be removed (or not, if growing).
    // Each existing ghost ages by 1; newly shed tail becomes age 0.
    state.trail = state.trail
      .map((g) => ({ ...g, age: g.age + 1 }))
      .filter((g) => g.age < 5);

    if (!ateFood) {
      const tail = state.snake[state.snake.length - 1];
      state.trail.push({ x: tail.x, y: tail.y, age: 0 });
      state.snake.pop();
    } else {
      state.score += 1;
      state.food = randomCell(state.gridWidth, state.gridHeight, state.snake);
    }

    state.snake.unshift(newHead);
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
