import { createRenderer } from "./renderer.js";
import { createGame, MOVE_INTERVAL_MS } from "./game.js";
import { setupInput } from "./input.js";

const GRID_SIZE = 20;
const CELL_SIZE = 32; // canvas pixels per grid cell

function drawOverlayText(ctx, text, canvas) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "rgba(255, 255, 255, 0.7)";
  ctx.font = "20px monospace";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(text, canvas.width / 2, canvas.height / 2);
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

  console.log("WebGL Snake initialized");

  let lastTick = 0;

  function loop(timestamp) {
    // --- Tick at fixed interval ---
    if (game.state.running && timestamp - lastTick >= MOVE_INTERVAL_MS) {
      game.tick();
      lastTick = timestamp;
    }

    // --- Render ---
    renderer.clear();

    if (game.state.running) {
      renderer.drawGrid(GRID_SIZE, GRID_SIZE, CELL_SIZE);
      renderer.drawSnake(game.state.snake, CELL_SIZE);
      renderer.drawFood(game.state.food, CELL_SIZE);
      overlayCtx.clearRect(0, 0, overlayCanvas.width, overlayCanvas.height);
    } else if (game.state.gameOver) {
      drawOverlayText(overlayCtx, `Game Over  -  Score: ${game.state.score}  -  Press SPACE to restart`, overlayCanvas);
    } else {
      drawOverlayText(overlayCtx, "Press SPACE to start", overlayCanvas);
    }

    requestAnimationFrame(loop);
  }

  requestAnimationFrame(loop);
}

main();
