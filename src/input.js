/**
 * Keyboard input — translates key events into game actions.
 *
 * SPACE behaviour per phase:
 *   not_started → start
 *   playing     → pause
 *   paused      → resume
 *   game_over   → restart
 *
 * ESC always restarts (resets to not_started) regardless of phase.
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
      const { phase } = game.state;
      if (phase === "not_started") {
        game.start();
      } else if (phase === "playing" || phase === "paused") {
        game.togglePause();
      } else if (phase === "game_over") {
        game.reset();
      }
      return;
    }

    if (e.key === "Escape") {
      e.preventDefault();
      game.reset();
      return;
    }

    const direction = KEY_MAP[e.key];
    if (direction) {
      e.preventDefault();
      game.changeDirection(direction);
    }
  });
}
