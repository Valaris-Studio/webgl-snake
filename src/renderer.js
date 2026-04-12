/**
 * WebGL renderer — handles all GPU-side drawing.
 * Each draw method will be replaced with real shader-based rendering.
 */

const BG_COLOR = [10 / 255, 10 / 255, 10 / 255, 1.0]; // #0a0a0a

// Clip-space passthrough — positions already in [-1, 1]
const GRID_VERT_SRC = `
  attribute vec2 a_pos;
  void main() {
    gl_Position = vec4(a_pos, 0.0, 1.0);
  }
`;

// Faint white lines for the subtle grid overlay
const GRID_FRAG_SRC = `
  precision mediump float;
  void main() {
    gl_FragColor = vec4(1.0, 1.0, 1.0, 0.05);
  }
`;

function compileShader(gl, type, src) {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, src);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    throw new Error(`Shader compile error: ${gl.getShaderInfoLog(shader)}`);
  }
  return shader;
}

function createProgram(gl, vertSrc, fragSrc) {
  const prog = gl.createProgram();
  gl.attachShader(prog, compileShader(gl, gl.VERTEX_SHADER, vertSrc));
  gl.attachShader(prog, compileShader(gl, gl.FRAGMENT_SHADER, fragSrc));
  gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
    throw new Error(`Program link error: ${gl.getProgramInfoLog(prog)}`);
  }
  return prog;
}

// Build flat Float32Array of line endpoint pairs in clip space.
// gridCols/gridRows are number of cells; each cell boundary becomes a line.
function buildGridVertices(gridCols, gridRows) {
  // (gridCols+1) vertical lines + (gridRows+1) horizontal lines, 2 endpoints each, 2 floats per point
  const vertexCount = (gridCols + 1 + gridRows + 1) * 2;
  const verts = new Float32Array(vertexCount * 2);
  let i = 0;

  // Vertical lines: x steps from -1 to +1 in (gridCols+1) steps
  for (let col = 0; col <= gridCols; col++) {
    const x = (col / gridCols) * 2.0 - 1.0;
    verts[i++] = x; verts[i++] = -1.0; // bottom
    verts[i++] = x; verts[i++] =  1.0; // top
  }

  // Horizontal lines: y steps from -1 to +1 in (gridRows+1) steps
  for (let row = 0; row <= gridRows; row++) {
    const y = (row / gridRows) * 2.0 - 1.0;
    verts[i++] = -1.0; verts[i++] = y; // left
    verts[i++] =  1.0; verts[i++] = y; // right
  }

  return verts;
}

export function createRenderer(gl) {
  gl.clearColor(...BG_COLOR);

  // Compile grid shader program once
  const gridProg = createProgram(gl, GRID_VERT_SRC, GRID_FRAG_SRC);
  const gridPosLoc = gl.getAttribLocation(gridProg, "a_pos");
  const gridVbo = gl.createBuffer();

  // Track the last grid dimensions so we only rebuild the VBO when they change
  let cachedGridCols = 0;
  let cachedGridRows = 0;
  let cachedVertexCount = 0;

  // Alpha blending so the 0.05 opacity actually shows through
  gl.enable(gl.BLEND);
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

  function clear() {
    gl.clear(gl.COLOR_BUFFER_BIT);
  }

  // width/height are grid cell counts; cellSize is pixels per cell (unused here
  // because the grid spans the full canvas regardless of pixel size)
  function drawGrid(width, height, cellSize) {
    if (width !== cachedGridCols || height !== cachedGridRows) {
      const verts = buildGridVertices(width, height);
      cachedGridCols = width;
      cachedGridRows = height;
      // 2 floats per vertex, 2 endpoints per line
      cachedVertexCount = (width + 1 + height + 1) * 2;

      gl.bindBuffer(gl.ARRAY_BUFFER, gridVbo);
      gl.bufferData(gl.ARRAY_BUFFER, verts, gl.STATIC_DRAW);
    }

    gl.useProgram(gridProg);
    gl.bindBuffer(gl.ARRAY_BUFFER, gridVbo);
    gl.enableVertexAttribArray(gridPosLoc);
    gl.vertexAttribPointer(gridPosLoc, 2, gl.FLOAT, false, 0, 0);

    gl.drawArrays(gl.LINES, 0, cachedVertexCount);

    gl.disableVertexAttribArray(gridPosLoc);
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
