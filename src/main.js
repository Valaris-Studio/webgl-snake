import { createRenderer } from "./renderer.js";
import { createGame } from "./game.js";
import { setupInput } from "./input.js";

const GRID_SIZE = 20;
const CELL_SIZE = 32; // canvas pixels per grid cell
const BASE_TICK_INTERVAL = 150; // ms — base speed
const MIN_TICK_INTERVAL = 60;  // ms — fastest allowed speed

/** Returns tick interval in ms based on current score. */
function getTickInterval(score) {
  const speedLevel = Math.floor(score / 5);
  return Math.max(BASE_TICK_INTERVAL - speedLevel * 10, MIN_TICK_INTERVAL);
}

function drawOverlayText(ctx, text, canvas) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "rgba(255, 255, 255, 0.7)";
  ctx.font = "20px monospace";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(text, canvas.width / 2, canvas.height / 2);
}

function drawHUD(ctx, canvas, score, speedLevel) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.font = "14px monospace";
  ctx.textBaseline = "top";
  // Score — top left
  ctx.fillStyle = "rgba(255, 255, 255, 0.55)";
  ctx.textAlign = "left";
  ctx.fillText(`Score: ${score}`, 10, 10);
  // Speed level — top right (subtle)
  ctx.textAlign = "right";
  ctx.fillText(`SPD ${speedLevel}`, canvas.width - 10, 10);
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
    const tickInterval = getTickInterval(game.state.score);

    // --- Tick at dynamic interval (slows down less as score grows) ---
    if (game.state.running && timestamp - lastTick >= tickInterval) {
      game.tick();
      lastTick = timestamp;
    }

    // --- Render ---
    renderer.clear();

    if (game.state.running) {
      renderer.drawGrid(GRID_SIZE, GRID_SIZE, CELL_SIZE);
      renderer.drawSnake(game.state.snake);
      renderer.drawFood(game.state.food);
      const speedLevel = Math.floor(game.state.score / 5);
      drawHUD(overlayCtx, overlayCanvas, game.state.score, speedLevel);
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
