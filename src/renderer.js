/**
 * WebGL renderer — handles all GPU-side drawing.
 */

const BG_COLOR = [10 / 255, 10 / 255, 10 / 255, 1.0]; // #0a0a0a

export function createRenderer(gl) {
  gl.clearColor(...BG_COLOR);

  function clear() {
    gl.clear(gl.COLOR_BUFFER_BIT);
  }

  return { clear };
}
