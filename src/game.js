/**
 * Game state machine — pure data, no rendering.
 */

const OPPOSITE = { up: "down", down: "up", left: "right", right: "left" };

function spawnFood(snake, gridWidth, gridHeight) {
  const occupied = new Set(snake.map(({ x, y }) => `${x},${y}`));
  let pos;
  do {
    pos = {
      x: Math.floor(Math.random() * gridWidth),
      y: Math.floor(Math.random() * gridHeight),
    };
  } while (occupied.has(`${pos.x},${pos.y}`));
  return pos;
}

function initialState(gridWidth, gridHeight) {
  const midX = Math.floor(gridWidth / 2);
  const midY = Math.floor(gridHeight / 2);
  return {
    snake: [{ x: midX, y: midY }],
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
    const { snake, direction, food, gridWidth, gridHeight } = state;
    const head = snake[0];

    const delta = { up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0] }[direction];
    const newHead = { x: head.x + delta[0], y: head.y + delta[1] };

    // Wall collision
    if (newHead.x < 0 || newHead.x >= gridWidth || newHead.y < 0 || newHead.y >= gridHeight) {
      state.running = false;
      state.gameOver = true;
      return;
    }

    // Self collision (exclude tail tip since it will move away)
    const bodyWithoutTail = snake.slice(0, -1);
    if (bodyWithoutTail.some(({ x, y }) => x === newHead.x && y === newHead.y)) {
      state.running = false;
      state.gameOver = true;
      return;
    }

    const ateFood = newHead.x === food.x && newHead.y === food.y;
    const newSnake = [newHead, ...snake];
    if (!ateFood) {
      newSnake.pop(); // remove tail unless growing
    }

    state.snake = newSnake;

    if (ateFood) {
      state.score += 1;
      state.food = spawnFood(newSnake, gridWidth, gridHeight);
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
