/**
 * WebGL renderer — handles all GPU-side drawing.
 * Draws snake, trail ghosts, food, and background using raw WebGL 2.0.
 */

const BG_COLOR = [10 / 255, 10 / 255, 10 / 255, 1.0]; // #0a0a0a

// Minimal vertex shader: positions a unit quad via NDC offset + scale uniforms.
const VERT_SRC = `#version 300 es
uniform vec2 u_pos;   // NDC top-left corner of the cell
uniform vec2 u_scale; // NDC width/height of one cell
in vec2 a_vert;       // unit quad [-0, 1] in each axis
void main() {
  gl_Position = vec4(u_pos + a_vert * u_scale, 0.0, 1.0);
}
`;

// Fragment shader: flat RGBA color controlled by uniform.
const FRAG_SRC = `#version 300 es
precision mediump float;
uniform vec4 u_color;
out vec4 outColor;
void main() {
  outColor = u_color;
}
`;

// Snake body color: neon green
const SNAKE_COLOR = [0.2, 1.0, 0.3, 1.0];
// Food color: neon red
const FOOD_COLOR = [1.0, 0.2, 0.2, 1.0];

// Trail fades from alpha 0.32 down to 0.0 over 5 age buckets (age 0..4).
// Formula: 0.4 * (1 - (age + 1) / 5) → 0.32, 0.24, 0.16, 0.08, 0.0
function trailAlpha(age) {
  return 0.4 * (1 - (age + 1) / 5);
}

/**
 * Compile a GLSL shader and throw a descriptive error on failure.
 * @param {WebGL2RenderingContext} gl
 * @param {number} type - gl.VERTEX_SHADER or gl.FRAGMENT_SHADER
 * @param {string} src
 * @returns {WebGLShader}
 */
function compileShader(gl, type, src) {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, src);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    const log = gl.getShaderInfoLog(shader);
    gl.deleteShader(shader);
    const typeName = type === gl.VERTEX_SHADER ? "vertex" : "fragment";
    throw new Error(`${typeName} shader compile error:\n${log}`);
  }
  return shader;
}

/**
 * Link a WebGL program from pre-compiled shaders, throwing on link failure.
 * @param {WebGL2RenderingContext} gl
 * @param {WebGLShader} vs
 * @param {WebGLShader} fs
 * @returns {WebGLProgram}
 */
function compileProgram(gl, vs, fs) {
  const prog = gl.createProgram();
  gl.attachShader(prog, vs);
  gl.attachShader(prog, fs);
  gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
    const log = gl.getProgramInfoLog(prog);
    gl.deleteProgram(prog);
    throw new Error(`shader program link error:\n${log}`);
  }
  return prog;
}

/**
 * Build and return the renderer.
 * @param {WebGL2RenderingContext} gl
 * @param {number} gridWidth  - grid columns
 * @param {number} gridHeight - grid rows
 */
export function createRenderer(gl, gridWidth, gridHeight) {
  gl.clearColor(...BG_COLOR);

  // Enable alpha blending for trail transparency.
  gl.enable(gl.BLEND);
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

  const vs = compileShader(gl, gl.VERTEX_SHADER, VERT_SRC);
  const fs = compileShader(gl, gl.FRAGMENT_SHADER, FRAG_SRC);
  const prog = compileProgram(gl, vs, fs);

  const aVert = gl.getAttribLocation(prog, "a_vert");
  const uPos = gl.getUniformLocation(prog, "u_pos");
  const uScale = gl.getUniformLocation(prog, "u_scale");
  const uColor = gl.getUniformLocation(prog, "u_color");

  // Unit quad: two triangles covering [0,1]x[0,1] (Y increases downward in
  // grid space; we flip Y when converting to NDC so Y-down grid maps correctly).
  const quadVerts = new Float32Array([
    0, 0,
    1, 0,
    0, 1,
    0, 1,
    1, 0,
    1, 1,
  ]);

  const vao = gl.createVertexArray();
  gl.bindVertexArray(vao);

  const vbo = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
  gl.bufferData(gl.ARRAY_BUFFER, quadVerts, gl.STATIC_DRAW);
  gl.enableVertexAttribArray(aVert);
  gl.vertexAttribPointer(aVert, 2, gl.FLOAT, false, 0, 0);

  gl.bindVertexArray(null);

  // NDC cell dimensions (Y flipped: grid row 0 is top of screen = NDC y=+1).
  const cellW = 2 / gridWidth;
  const cellH = 2 / gridHeight;

  /**
   * Convert a grid cell (col, row) to NDC top-left corner.
   * Grid is Y-down; NDC is Y-up, so row 0 → NDC y = +1.
   */
  function cellNDC(x, y) {
    return [-1 + x * cellW, 1 - y * cellH];
  }

  function drawCell(x, y, color) {
    const [ndcX, ndcY] = cellNDC(x, y);
    gl.uniform2f(uPos, ndcX, ndcY);
    // Y scale is negative because quad Y goes 0→1 but NDC Y goes down.
    gl.uniform2f(uScale, cellW, -cellH);
    gl.uniform4fv(uColor, color);
    gl.drawArrays(gl.TRIANGLES, 0, 6);
  }

  function clear() {
    gl.clear(gl.COLOR_BUFFER_BIT);
  }

  function drawGrid() {
    // Subtle grid background is handled by the clear color; no extra draw needed.
  }

  /**
   * Draw fading trail ghosts (age 0 = most recent ghost, 4 = oldest/fully faded).
   * Trails are batched by age so same-age segments share one uniform set.
   * @param {Array<{x:number, y:number, age:number}>} trail
   */
  function drawTrail(trail) {
    gl.useProgram(prog);
    gl.bindVertexArray(vao);

    // Group by age for minimal uniform uploads; ages 0–4 = 5 buckets max.
    const byAge = Array.from({ length: 5 }, () => []);
    for (const ghost of trail) {
      if (ghost.age < 5) byAge[ghost.age].push(ghost);
    }

    for (let age = 4; age >= 0; age--) {
      const alpha = trailAlpha(age);
      if (alpha <= 0) continue;
      const color = [SNAKE_COLOR[0], SNAKE_COLOR[1], SNAKE_COLOR[2], alpha];
      for (const { x, y } of byAge[age]) {
        drawCell(x, y, color);
      }
    }

    gl.bindVertexArray(null);
  }

  /**
   * Draw snake body segments.
   * @param {Array<{x:number, y:number}>} segments
   */
  function drawSnake(segments) {
    gl.useProgram(prog);
    gl.bindVertexArray(vao);
    for (const seg of segments) {
      drawCell(seg.x, seg.y, SNAKE_COLOR);
    }
    gl.bindVertexArray(null);
  }

  /**
   * Draw the food item.
   * @param {{x:number, y:number}} position
   */
  function drawFood(position) {
    gl.useProgram(prog);
    gl.bindVertexArray(vao);
    drawCell(position.x, position.y, FOOD_COLOR);
    gl.bindVertexArray(null);
  }

  return { clear, drawGrid, drawTrail, drawSnake, drawFood };
}
