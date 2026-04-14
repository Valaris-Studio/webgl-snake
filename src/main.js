import { createRenderer } from "./renderer.js";
import { createGame } from "./game.js";
import { setupInput } from "./input.js";

const GRID_SIZE = 20;
const CELL_SIZE = 32; // canvas pixels per grid cell
const TICK_INTERVAL_MS = 120;

function drawGameOverOverlay(ctx, score, canvas) {
  const cx = canvas.width / 2;
  const cy = canvas.height / 2;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Semi-transparent dark backdrop so the WebGL scene stays visible but dimmed
  ctx.fillStyle = "rgba(0, 0, 0, 0.55)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 52px monospace";
  ctx.fillText("GAME OVER", cx, cy - 48);

  ctx.font = "28px monospace";
  ctx.fillText(`Score: ${score}`, cx, cy + 16);

  ctx.fillStyle = "rgba(255, 255, 255, 0.6)";
  ctx.font = "18px monospace";
  ctx.fillText("Press SPACE to restart", cx, cy + 60);
}

function drawStartOverlay(ctx, canvas) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "rgba(255, 255, 255, 0.7)";
  ctx.font = "20px monospace";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("Press SPACE to start", canvas.width / 2, canvas.height / 2);
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
    if (game.state.running && timestamp - lastTick >= TICK_INTERVAL_MS) {
      game.tick();
      lastTick = timestamp;
    }

    // --- Render ---
    renderer.clear();
    renderer.drawGrid(GRID_SIZE, GRID_SIZE, CELL_SIZE);
    renderer.drawSnake(game.state.snake);
    renderer.drawFood(game.state.food);

    if (game.state.running) {
      overlayCtx.clearRect(0, 0, overlayCanvas.width, overlayCanvas.height);
    } else if (game.state.gameOver) {
      drawGameOverOverlay(overlayCtx, game.state.score, overlayCanvas);
    } else {
      drawStartOverlay(overlayCtx, overlayCanvas);
    }

    requestAnimationFrame(loop);
  }

  requestAnimationFrame(loop);
}

main();
