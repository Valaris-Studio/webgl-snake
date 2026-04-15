import { createRenderer } from "./renderer.js";
import { createGame } from "./game.js";
import { setupInput } from "./input.js";

const GRID_SIZE = 20;
const CELL_SIZE = 32; // canvas pixels per grid cell

const BASE_TICK_INTERVAL = 150; // ms at score 0
const MIN_TICK_INTERVAL = 60;   // ms floor — game doesn't get faster past this

/** Compute tick interval from score: drops 10ms per 5 points, floored at MIN. */
function tickInterval(score) {
  return Math.max(MIN_TICK_INTERVAL, BASE_TICK_INTERVAL - Math.floor(score / 5) * 10);
}

function drawOverlayText(ctx, text, canvas) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "rgba(255, 255, 255, 0.7)";
  ctx.font = "20px monospace";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(text, canvas.width / 2, canvas.height / 2);
}

/** Draw HUD: score top-left, speed level top-right. */
function drawHUD(ctx, canvas, score, speedLevel) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
  ctx.font = "14px monospace";

  ctx.textAlign = "left";
  ctx.textBaseline = "top";
  ctx.fillText(`Score: ${score}`, 8, 8);

  ctx.textAlign = "right";
  ctx.fillText(`SPD ${speedLevel}`, canvas.width - 8, 8);
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
    const { score } = game.state;
    const interval = tickInterval(score);
    const speedLevel = Math.floor(score / 5) + 1;

    // --- Tick at dynamic interval ---
    if (game.state.running && timestamp - lastTick >= interval) {
      game.tick();
      lastTick = timestamp;
    }

    // --- Render ---
    renderer.clear();

    if (game.state.running) {
      renderer.drawGrid(GRID_SIZE, GRID_SIZE, CELL_SIZE);
      renderer.drawSnake(game.state.snake);
      renderer.drawFood(game.state.food);
      drawHUD(overlayCtx, overlayCanvas, score, speedLevel);
    } else if (game.state.gameOver) {
      drawOverlayText(overlayCtx, `Game Over  -  Score: ${score}  -  Press SPACE to restart`, overlayCanvas);
    } else {
      drawOverlayText(overlayCtx, "Press SPACE to start", overlayCanvas);
    }

    requestAnimationFrame(loop);
  }

  requestAnimationFrame(loop);
}

main();
