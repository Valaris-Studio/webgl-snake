/**
 * WebGL renderer — handles all GPU-side drawing.
 * Each draw method will be replaced with real shader-based rendering.
 */

const BG_COLOR = [10 / 255, 10 / 255, 10 / 255, 1.0]; // #0a0a0a

// Minimal shaders shared by all quad-based draw calls
const QUAD_VERT_SRC = `
  attribute vec2 a_pos;
  void main() {
    gl_Position = vec4(a_pos, 0.0, 1.0);
  }
`;

const QUAD_FRAG_SRC = `
  precision mediump float;
  uniform vec4 u_color;
  void main() {
    gl_FragColor = u_color;
  }
`;

function compileShader(gl, type, src) {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, src);
  gl.compileShader(shader);
  return shader;
}

function buildProgram(gl) {
  const prog = gl.createProgram();
  gl.attachShader(prog, compileShader(gl, gl.VERTEX_SHADER,   QUAD_VERT_SRC));
  gl.attachShader(prog, compileShader(gl, gl.FRAGMENT_SHADER, QUAD_FRAG_SRC));
  gl.linkProgram(prog);
  return prog;
}

export function createRenderer(gl) {
  gl.clearColor(...BG_COLOR);

  const prog    = buildProgram(gl);
  const aPosLoc = gl.getAttribLocation(prog,  "a_pos");
  const uColorLoc = gl.getUniformLocation(prog, "u_color");
  const quadBuf = gl.createBuffer();

  // Draw a solid-color rectangle defined in clip space
  function fillRect(x, y, w, h, r, g, b, a) {
    const x1 = x, y1 = y, x2 = x + w, y2 = y + h;
    // prettier-ignore
    const verts = new Float32Array([
      x1, y1,
      x2, y1,
      x1, y2,
      x2, y2,
    ]);
    gl.useProgram(prog);
    gl.bindBuffer(gl.ARRAY_BUFFER, quadBuf);
    gl.bufferData(gl.ARRAY_BUFFER, verts, gl.DYNAMIC_DRAW);
    gl.enableVertexAttribArray(aPosLoc);
    gl.vertexAttribPointer(aPosLoc, 2, gl.FLOAT, false, 0, 0);
    gl.uniform4f(uColorLoc, r, g, b, a);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  }

  // Convert grid cell to clip-space rect: returns [clipX, clipY, clipW, clipH]
  function cellToClip(col, row, gridW, gridH) {
    const cw = 2 / gridW;
    const ch = 2 / gridH;
    return [-1 + col * cw, 1 - (row + 1) * ch, cw, ch];
  }

  function clear() {
    gl.clear(gl.COLOR_BUFFER_BIT);
  }

  function drawGrid(width, height, cellSize) {
    // TODO: render subtle grid lines via line primitives
  }

  function drawSnake(segments) {
    // TODO: render snake segments as colored quads with glow
  }

  // Renders food as a pulsing red dot (#ff4444).
  // Pulse amplitude is ±15% brightness driven by real time.
  function drawFood(position) {
    const t = performance.now() / 1000;
    const pulse = 0.85 + 0.15 * Math.sin(t * Math.PI * 2); // 1 Hz pulse

    // Grid dimensions are not passed here; derive from canvas aspect & known GRID_SIZE=20
    const gridSize = 20;
    const [cx, cy, cw, ch] = cellToClip(position.x, position.y, gridSize, gridSize);

    // Inset by 20% for a dot rather than a full-cell square
    const inset = 0.2;
    fillRect(
      cx + cw * inset,
      cy + ch * inset,
      cw * (1 - 2 * inset),
      ch * (1 - 2 * inset),
      1.0 * pulse, 0.267 * pulse, 0.267 * pulse, 1.0, // #ff4444 modulated
    );
  }

  return { clear, drawGrid, drawSnake, drawFood };
}
