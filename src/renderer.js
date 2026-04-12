/**
 * WebGL renderer — handles all GPU-side drawing.
 * Each draw method will be replaced with real shader-based rendering.
 */

const BG_COLOR = [10 / 255, 10 / 255, 10 / 255, 1.0]; // #0a0a0a

export function createRenderer(gl) {
  gl.clearColor(...BG_COLOR);

  function clear() {
    gl.clear(gl.COLOR_BUFFER_BIT);
  }

  function drawGrid(width, height, cellSize) {
    // TODO: render subtle grid lines via line primitives
    console.log("TODO: draw grid", { width, height, cellSize });
  }

  function drawSnake(segments) {
    // TODO: render snake segments as colored quads with glow
    console.log("TODO: draw snake", segments);
  }

  function drawFood(position) {
    // TODO: render food as a pulsing bright quad
    console.log("TODO: draw food", position);
  }

  return { clear, drawGrid, drawSnake, drawFood };
}
