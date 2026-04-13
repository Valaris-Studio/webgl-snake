/**
 * WebGL renderer — handles all GPU-side drawing.
 * Each draw method will be replaced with real shader-based rendering.
 */

const BG_COLOR = [10 / 255, 10 / 255, 10 / 255, 1.0]; // #0a0a0a
const SNAKE_COLOR = [0.0, 1.0, 0.4]; // neon green

// Shaders used for solid-color quad rendering (trail and future draw calls)
const VS_SRC = `
  attribute vec2 a_position;
  void main() {
    gl_Position = vec4(a_position, 0.0, 1.0);
  }
`;

const FS_SRC = `
  precision mediump float;
  uniform vec4 u_color;
  void main() {
    gl_FragColor = u_color;
  }
`;

function compileProgram(gl, vsSrc, fsSrc) {
  const vs = gl.createShader(gl.VERTEX_SHADER);
  gl.shaderSource(vs, vsSrc);
  gl.compileShader(vs);

  const fs = gl.createShader(gl.FRAGMENT_SHADER);
  gl.shaderSource(fs, fsSrc);
  gl.compileShader(fs);

  const prog = gl.createProgram();
  gl.attachShader(prog, vs);
  gl.attachShader(prog, fs);
  gl.linkProgram(prog);
  return prog;
}

// Returns 6 NDC vertices (2 triangles) for the grid cell at (x, y).
function cellQuad(x, y, gridW, gridH) {
  const x0 = (x / gridW) * 2 - 1;
  const x1 = ((x + 1) / gridW) * 2 - 1;
  const y0 = 1 - (y / gridH) * 2;
  const y1 = 1 - ((y + 1) / gridH) * 2;
  // two triangles: top-left, top-right, bottom-left | bottom-left, top-right, bottom-right
  return [x0, y0, x1, y0, x0, y1, x0, y1, x1, y0, x1, y1];
}

export function createRenderer(gl, gridWidth, gridHeight) {
  gl.clearColor(...BG_COLOR);

  const prog = compileProgram(gl, VS_SRC, FS_SRC);
  const posLoc = gl.getAttribLocation(prog, "a_position");
  const colorLoc = gl.getUniformLocation(prog, "u_color");
  const vbo = gl.createBuffer();

  // Enable alpha blending for trail transparency
  gl.enable(gl.BLEND);
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

  function clear() {
    gl.clear(gl.COLOR_BUFFER_BIT);
  }

  // Upload float32 vertex data and issue a single TRIANGLES draw call.
  function drawQuads(vertices, color) {
    gl.useProgram(prog);
    gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.DYNAMIC_DRAW);
    gl.enableVertexAttribArray(posLoc);
    gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);
    gl.uniform4fv(colorLoc, color);
    gl.drawArrays(gl.TRIANGLES, 0, vertices.length / 2);
  }

  function drawGrid(width, height, cellSize) {
    // TODO: render subtle grid lines via line primitives
    console.log("TODO: draw grid", { width, height, cellSize });
  }

  /**
   * Render fading ghost segments behind the snake.
   * Ghosts are batched by age to minimise draw calls (5 max).
   * Alpha range: 0.4 (age 0) → ~0.0 (age 4), invisible at age 5+.
   */
  function drawTrail(trail) {
    if (!trail || trail.length === 0) return;

    // Group ghosts by age so each age bucket shares one draw call
    const buckets = [[], [], [], [], []]; // indices 0-4
    for (const ghost of trail) {
      if (ghost.age >= 0 && ghost.age < 5) {
        buckets[ghost.age].push(ghost);
      }
    }

    for (let age = 0; age < 5; age++) {
      if (buckets[age].length === 0) continue;
      const alpha = 0.4 * (1 - age / 5);
      const verts = [];
      for (const ghost of buckets[age]) {
        verts.push(...cellQuad(ghost.x, ghost.y, gridWidth, gridHeight));
      }
      drawQuads(verts, [SNAKE_COLOR[0], SNAKE_COLOR[1], SNAKE_COLOR[2], alpha]);
    }
  }

  function drawSnake(segments) {
    // TODO: render snake segments as colored quads with glow
    console.log("TODO: draw snake", segments);
  }

  function drawFood(position) {
    // TODO: render food as a pulsing bright quad
    console.log("TODO: draw food", position);
  }

  return { clear, drawGrid, drawTrail, drawSnake, drawFood };
}
