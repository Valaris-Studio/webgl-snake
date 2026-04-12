/**
 * WebGL renderer — handles all GPU-side drawing.
 *
 * Coordinate system: WebGL clip space (-1..1). Each grid cell maps to
 * (CELL_SIZE / canvas_half) units of clip space.
 *
 * Snake glow is achieved by drawing a slightly larger, semi-transparent
 * quad behind each segment before the opaque segment quad.
 */

const BG_COLOR = [10 / 255, 10 / 255, 10 / 255, 1.0]; // #0a0a0a

// #00ff88 — neon green snake
const SNAKE_COLOR = [0.0, 1.0, 0.533, 1.0];
// Glow: same hue, lower alpha and slightly desaturated
const GLOW_COLOR = [0.0, 1.0, 0.533, 0.18];
const GLOW_SCALE = 1.6; // how much larger the glow quad is vs the segment

const VERT_SRC = `
  attribute vec2 a_pos;
  uniform vec2 u_resolution; // canvas width, height in pixels
  uniform vec4 u_rect;       // x, y, w, h in pixels (top-left origin)

  void main() {
    // a_pos is a unit quad [0..1] x [0..1]
    vec2 pixel = u_rect.xy + a_pos * u_rect.zw;
    // convert pixel coords (top-left origin) to clip space
    vec2 clip = (pixel / u_resolution) * 2.0 - 1.0;
    clip.y = -clip.y; // flip Y: canvas top-left → WebGL bottom-left
    gl_Position = vec4(clip, 0.0, 1.0);
  }
`;

const FRAG_SRC = `
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
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.error("Shader compile error:", gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

function buildProgram(gl, vertSrc, fragSrc) {
  const vert = compileShader(gl, gl.VERTEX_SHADER, vertSrc);
  const frag = compileShader(gl, gl.FRAGMENT_SHADER, fragSrc);
  const prog = gl.createProgram();
  gl.attachShader(prog, vert);
  gl.attachShader(prog, frag);
  gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
    console.error("Program link error:", gl.getProgramInfoLog(prog));
    return null;
  }
  return prog;
}

export function createRenderer(gl) {
  gl.clearColor(...BG_COLOR);
  gl.enable(gl.BLEND);
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

  const program = buildProgram(gl, VERT_SRC, FRAG_SRC);
  gl.useProgram(program);

  // Unit quad: two triangles covering [0..1] x [0..1]
  const quadVerts = new Float32Array([0, 0, 1, 0, 0, 1, 0, 1, 1, 0, 1, 1]);
  const vbo = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
  gl.bufferData(gl.ARRAY_BUFFER, quadVerts, gl.STATIC_DRAW);

  const aPos = gl.getAttribLocation(program, "a_pos");
  gl.enableVertexAttribArray(aPos);
  gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

  const uResolution = gl.getUniformLocation(program, "u_resolution");
  const uRect = gl.getUniformLocation(program, "u_rect");
  const uColor = gl.getUniformLocation(program, "u_color");

  const canvasW = gl.canvas.width;
  const canvasH = gl.canvas.height;
  gl.uniform2f(uResolution, canvasW, canvasH);

  function drawRect(x, y, w, h, color) {
    gl.uniform4f(uRect, x, y, w, h);
    gl.uniform4fv(uColor, color);
    gl.drawArrays(gl.TRIANGLES, 0, 6);
  }

  function clear() {
    gl.clear(gl.COLOR_BUFFER_BIT);
  }

  function drawGrid(width, height, cellSize) {
    // TODO: render subtle grid lines via line primitives
  }

  function drawSnake(segments, cellSize = 32) {
    for (const seg of segments) {
      const px = seg.x * cellSize;
      const py = seg.y * cellSize;

      // Glow quad — larger, semi-transparent
      const glowPad = (cellSize * (GLOW_SCALE - 1)) / 2;
      drawRect(
        px - glowPad,
        py - glowPad,
        cellSize * GLOW_SCALE,
        cellSize * GLOW_SCALE,
        GLOW_COLOR
      );

      // Solid segment with 1px inset so adjacent segments don't merge visually
      drawRect(px + 1, py + 1, cellSize - 2, cellSize - 2, SNAKE_COLOR);
    }
  }

  function drawFood(position, cellSize = 32) {
    // TODO: render food as a pulsing bright quad
  }

  return { clear, drawGrid, drawSnake, drawFood };
}
