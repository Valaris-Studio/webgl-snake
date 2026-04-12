/**
 * Keyboard input — translates key events into game actions.
 */

const KEY_MAP = {
  ArrowUp: "up",
  ArrowDown: "down",
  ArrowLeft: "left",
  ArrowRight: "right",
  w: "up",
  s: "down",
  a: "left",
  d: "right",
};

export function setupInput(game) {
  window.addEventListener("keydown", (e) => {
    if (e.key === " ") {
      e.preventDefault();
      if (game.state.gameOver) {
        game.reset();
      }
      game.state.running = !game.state.running;
      return;
    }

    const direction = KEY_MAP[e.key];
    if (direction) {
      e.preventDefault();
      game.changeDirection(direction);
    }
  });
}
