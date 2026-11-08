// Maze puzzle: a tray with a generated maze of walls, one way through, for a finger or a marble; change the seed for a new maze.
// Print: flat as shown, no supports. No small parts; a marble is a choking hazard for under-3s, so trace it with a finger instead.
// Every number below is a slider (Params). From the BREPcode catalog: maze-puzzle.
const cells = 8;  // [4:14] cells across
const rows = 0;   // [0:14] rows of cells (0 = as many as across, a square maze)
const cell = 16;  // [10:30] cell size, mm
const wallT = 2;  // [1.2:4] wall thickness, mm
const wallH = 8;  // [3:20] wall height, mm
const baseT = 3;  // [2:6] base thickness, mm
const seed = 1;   // [1:999] maze number (each one differs)

// a seeded random walk carves the maze: the same seed, the same maze. nx cells
// across, ny rows (a square maze unless rows says otherwise).
let s = (seed * 2654435761) % 4294967296;
const rand = () => { s = (s * 1664525 + 1013904223) % 4294967296; return s / 4294967296; };
const nx = cells, ny = rows > 0 ? rows : cells;
const right = Array.from({ length: nx }, () => Array(ny).fill(true));   // wall on a cell's +x side
const up = Array.from({ length: nx }, () => Array(ny).fill(true));      // wall on a cell's +y side
const seen = Array.from({ length: nx }, () => Array(ny).fill(false));
const stack = [[0, 0]];
seen[0][0] = true;
while (stack.length) {
  const [x, y] = stack[stack.length - 1];
  const next = [[1, 0], [-1, 0], [0, 1], [0, -1]].map(([dx, dy]) => [x + dx, y + dy, dx, dy]).filter(([a, b]) => a >= 0 && b >= 0 && a < nx && b < ny && !seen[a][b]);
  if (!next.length) { stack.pop(); continue; }
  const [a, b, dx, dy] = next[Math.floor(rand() * next.length)];
  if (dx === 1) right[x][y] = false; else if (dx === -1) right[a][b] = false;
  else if (dy === 1) up[x][y] = false; else up[a][b] = false;
  seen[a][b] = true;
  stack.push([a, b]);
}
// walls: the outside frame with a gap in at the first cell and out at the last, then the inside walls merged into runs
const L = nx * cell + wallT, D = ny * cell + wallT, z = baseT - 0.01, h = wallH + 0.01;
const wallX = (x0, x1, y) => translate([x0, y, z], cube([x1 - x0 + wallT, wallT, h]));   // along x at a grid line y
const wallY = (y0, y1, x) => translate([x, y0, z], cube([wallT, y1 - y0 + wallT, h]));   // along y at a grid line x
const runs = [wallX(0, nx * cell, 0), wallX(0, nx * cell, ny * cell), wallY(cell, ny * cell, 0), wallY(0, (ny - 1) * cell, nx * cell)];
for (let c = 0; c < nx - 1; c++) {
  let start = -1;
  for (let r = 0; r <= ny; r++) {
    const on = r < ny && right[c][r];
    if (on && start < 0) start = r;
    if (!on && start >= 0) { runs.push(wallY(start * cell, r * cell, (c + 1) * cell)); start = -1; }
  }
}
for (let r = 0; r < ny - 1; r++) {
  let start = -1;
  for (let c = 0; c <= nx; c++) {
    const on = c < nx && up[c][r];
    if (on && start < 0) start = c;
    if (!on && start >= 0) { runs.push(wallX(start * cell, c * cell, (r + 1) * cell)); start = -1; }
  }
}
return translate([-L / 2, -D / 2, 0], union(cube([L, D, baseT]), ...runs));
