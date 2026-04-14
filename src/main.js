import { createRenderer } from "./renderer.js";
import { createGame } from "./game.js";
import { setupInput } from "./input.js";

const GRID_SIZE = 20;
const CELL_SIZE = 32; // canvas pixels per grid cell
const TICK_INTERVAL_MS = 120;

function drawOverlayText(ctx, text, canvas) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "rgba(255, 255, 255, 0.7)";
  ctx.font = "20px monospace";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(text, canvas.width / 2, canvas.height / 2);
}

/** Dims the WebGL canvas and draws "PAUSED" centered on the overlay. */
function drawPausedOverlay(ctx, glCanvas, overlayCanvas) {
  ctx.clearRect(0, 0, overlayCanvas.width, overlayCanvas.height);
  // Semi-transparent dark wash over the WebGL canvas
  ctx.fillStyle = "rgba(0, 0, 0, 0.45)";
  ctx.fillRect(0, 0, overlayCanvas.width, overlayCanvas.height);
  ctx.fillStyle = "rgba(255, 255, 255, 0.85)";
  ctx.font = "bold 28px monospace";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("PAUSED", overlayCanvas.width / 2, overlayCanvas.height / 2);
}

function main() {
  const glCanvas = document.getElementById("glCanvas");
  const overlayCanvas = document.getElementById("overlay");
  const gl = glCanvas.getContext("webgl");

  if (!gl) {
    document.body.textContent = "WebGL not supported in this browser.";
    return;
  }

  const overlayCtx = overlayCanvas.getContext("2d");
  const renderer = createRenderer(gl);
  const game = createGame(GRID_SIZE, GRID_SIZE);

  setupInput(game);

  let lastTick = 0;

  function loop(timestamp) {
    const { phase } = game.state;

    // --- Tick only while actively playing ---
    if (phase === "playing" && timestamp - lastTick >= TICK_INTERVAL_MS) {
      game.tick();
      lastTick = timestamp;
    }

    // --- Render ---
    renderer.clear();

    if (phase === "playing") {
      renderer.drawGrid(GRID_SIZE, GRID_SIZE, CELL_SIZE);
      renderer.drawSnake(game.state.snake);
      renderer.drawFood(game.state.food);
      overlayCtx.clearRect(0, 0, overlayCanvas.width, overlayCanvas.height);
    } else if (phase === "paused") {
      renderer.drawGrid(GRID_SIZE, GRID_SIZE, CELL_SIZE);
      renderer.drawSnake(game.state.snake);
      renderer.drawFood(game.state.food);
      drawPausedOverlay(overlayCtx, glCanvas, overlayCanvas);
    } else if (phase === "game_over") {
      drawOverlayText(overlayCtx, `Game Over  -  Score: ${game.state.score}  -  Press SPACE to restart`, overlayCanvas);
    } else {
      // not_started
      drawOverlayText(overlayCtx, "Press SPACE to start", overlayCanvas);
    }

    requestAnimationFrame(loop);
  }

  requestAnimationFrame(loop);
}

main();
