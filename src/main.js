import { createRenderer } from "./renderer.js";
import { createGame } from "./game.js";
import { setupInput } from "./input.js";

const GRID_SIZE = 20;
const CELL_SIZE = 32; // canvas pixels per grid cell
const TICK_INTERVAL_MS = 120;
const HIGH_SCORE_KEY = "snakeHighScore";

function loadHighScore() {
  return parseInt(localStorage.getItem(HIGH_SCORE_KEY) || "0", 10);
}

function saveHighScore(score) {
  localStorage.setItem(HIGH_SCORE_KEY, String(score));
}

function drawOverlayText(ctx, text, canvas) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "rgba(255, 255, 255, 0.7)";
  ctx.font = "20px monospace";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(text, canvas.width / 2, canvas.height / 2);
}

// Draws score and high score in the top-left corner during gameplay.
function drawHUD(ctx, canvas, score, highScore) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "rgba(255, 255, 255, 0.65)";
  ctx.font = "16px monospace";
  ctx.textAlign = "left";
  ctx.textBaseline = "top";
  ctx.fillText(`Score: ${score}`, 10, 10);
  ctx.fillText(`Best: ${highScore}`, 10, 30);
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
  let highScore = loadHighScore();

  function loop(timestamp) {
    // --- Tick at fixed interval ---
    if (game.state.running && timestamp - lastTick >= TICK_INTERVAL_MS) {
      game.tick();
      lastTick = timestamp;

      // Persist new high score whenever current score exceeds it.
      if (game.state.score > highScore) {
        highScore = game.state.score;
        saveHighScore(highScore);
      }
    }

    // --- Render ---
    renderer.clear();

    if (game.state.running) {
      renderer.drawGrid(GRID_SIZE, GRID_SIZE, CELL_SIZE);
      renderer.drawSnake(game.state.snake);
      renderer.drawFood(game.state.food);
      drawHUD(overlayCtx, overlayCanvas, game.state.score, highScore);
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
