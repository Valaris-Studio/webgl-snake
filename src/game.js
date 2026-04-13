/**
 * Game state machine — pure data, no rendering.
 */

const OPPOSITE = { up: "down", down: "up", left: "right", right: "left" };
const DIR_DELTA = { right: [1, 0], left: [-1, 0], down: [0, 1], up: [0, -1] };

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

  function spawnFood() {
    let pos;
    do {
      pos = {
        x: Math.floor(Math.random() * state.gridWidth),
        y: Math.floor(Math.random() * state.gridHeight),
      };
    } while (state.snake.some((seg) => seg.x === pos.x && seg.y === pos.y));
    state.food = pos;
  }

  function tick() {
    const [dx, dy] = DIR_DELTA[state.direction];
    const head = state.snake[0];
    const newHead = { x: head.x + dx, y: head.y + dy };

    // Wall collision
    if (
      newHead.x < 0 ||
      newHead.x >= state.gridWidth ||
      newHead.y < 0 ||
      newHead.y >= state.gridHeight
    ) {
      state.running = false;
      state.gameOver = true;
      return;
    }

    // Self collision
    if (state.snake.some((seg) => seg.x === newHead.x && seg.y === newHead.y)) {
      state.running = false;
      state.gameOver = true;
      return;
    }

    const ateFood = newHead.x === state.food.x && newHead.y === state.food.y;

    state.snake.unshift(newHead);

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
    Object.assign(state, initialState(gridWidth, gridHeight));
  }

  return { state, tick, changeDirection, reset };
}
