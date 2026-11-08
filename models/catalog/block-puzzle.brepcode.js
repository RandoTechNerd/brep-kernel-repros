// Block puzzle: pentomino, tetromino or Soma cube puzzle pieces built from unit blocks, with an optional pentomino tray.
// Print: flat as shown, no supports. At the default 18 mm unit no piece is a small part.
// Every number below is a slider (Params). From the BREPcode catalog: block-puzzle.
const kind = "pentomino";  // [pentomino, tetromino, soma] which puzzle
const unit = 18;           // [8:30] unit square size, mm
const thick = 8;           // [4:30] flat piece thickness, mm
const gap = 0.4;           // [0.1:1.5] clearance round each piece, mm
const tray = "no";         // [no, yes] 6 x 10 tray (pentominoes)

const SETS = {
  pentomino: [
    [[1, 0], [2, 0], [0, 1], [1, 1], [1, 2]], [[0, 0], [0, 1], [0, 2], [0, 3], [0, 4]], [[0, 0], [0, 1], [0, 2], [0, 3], [1, 0]],
    [[0, 0], [0, 1], [1, 1], [1, 2], [1, 3]], [[0, 0], [1, 0], [0, 1], [1, 1], [0, 2]], [[0, 2], [1, 2], [2, 2], [1, 1], [1, 0]],
    [[0, 0], [2, 0], [0, 1], [1, 1], [2, 1]], [[0, 0], [1, 0], [2, 0], [0, 1], [0, 2]], [[0, 0], [1, 0], [1, 1], [2, 1], [2, 2]],
    [[1, 0], [0, 1], [1, 1], [2, 1], [1, 2]], [[0, 0], [0, 1], [0, 2], [0, 3], [1, 2]], [[0, 0], [1, 0], [1, 1], [1, 2], [2, 2]],
  ],
  tetromino: [
    [[0, 0], [0, 1], [0, 2], [0, 3]], [[0, 0], [1, 0], [0, 1], [1, 1]], [[0, 0], [1, 0], [2, 0], [1, 1]], [[0, 0], [1, 0], [1, 1], [2, 1]],
    [[1, 0], [2, 0], [0, 1], [1, 1]], [[0, 0], [1, 0], [1, 1], [1, 2]], [[0, 0], [1, 0], [0, 1], [0, 2]],
  ],
  // Soma: [x, y, z] cubes, every raised cube standing on another
  soma: [
    [[0, 0, 0], [1, 0, 0], [0, 1, 0]], [[0, 0, 0], [1, 0, 0], [2, 0, 0], [0, 1, 0]], [[0, 0, 0], [1, 0, 0], [2, 0, 0], [1, 1, 0]],
    [[0, 0, 0], [1, 0, 0], [1, 1, 0], [2, 1, 0]], [[0, 0, 0], [1, 0, 0], [1, 1, 0], [1, 1, 1]],
    [[1, 0, 0], [0, 0, 0], [0, 1, 0], [0, 1, 1]], [[0, 0, 0], [1, 0, 0], [0, 1, 0], [0, 0, 1]],
  ],
};
const u = unit, g = gap;
const h = kind === "soma" ? u : thick;                    // layer pitch
const tall = kind === "soma" ? u - g : thick;             // a layer's own height
// one layer of a piece, inset g/2 all round: a box per run of cells along x, and a bridge
// per run of cells shared with the next row up (merged, so a 2 x 2 block has no pinhole)
const layer = (cells, z) => {
  const has = new Set(cells.map(([x, y]) => x + "," + y));
  const ys = [...new Set(cells.map((c) => c[1]))];
  const runs = (y, keep) => {
    const xs = cells.filter((c) => c[1] === y && keep(c[0])).map((c) => c[0]).sort((p, q) => p - q);
    const out = [];
    for (const x of xs) { const last = out[out.length - 1]; if (last && last[1] === x - 1) last[1] = x; else out.push([x, x]); }
    return out;
  };
  const parts = [];
  for (const y of ys) {
    for (const [x0, x1] of runs(y, () => true)) parts.push(translate([x0 * u + g / 2, y * u + g / 2, z], cube([(x1 - x0 + 1) * u - g, u - g, tall])));
    for (const [x0, x1] of runs(y, (x) => has.has(x + "," + (y + 1)))) parts.push(translate([x0 * u + g / 2, (y + 1) * u - g / 2 - 0.01, z], cube([(x1 - x0 + 1) * u - g, g + 0.02, tall])));
  }
  return parts;
};
const piece = (cells) => {
  const flat = cells.filter((c) => !(c[2] > 0));
  const parts = layer(flat, 0);
  // a Soma piece's raised cube stands on the one below it, joined across the gap
  for (const [x, y, zc] of cells.filter((c) => c[2] > 0)) parts.push(translate([x * u + g / 2, y * u + g / 2, zc * h - g - 0.01], cube([u - g, u - g, tall + g + 0.01])));
  return parts.length > 1 ? union(...parts) : parts[0];
};
// lay the pieces out in rows, each turned so it is wider than it is deep
const set = SETS[kind].map((cells) => {
  const w = Math.max(...cells.map((c) => c[0])), d = Math.max(...cells.map((c) => c[1]));
  return d > w ? cells.map(([x, y, zc]) => (zc === undefined ? [y, x] : [y, x, zc])) : cells;
});
const placed = [];
let x = 0, y = 0, row = 0, width = 0;
for (const cells of set) {
  const w = (Math.max(...cells.map((c) => c[0])) + 1) * u, d = (Math.max(...cells.map((c) => c[1])) + 1) * u;
  if (x > 0 && x + w > 250) { y += row + 4; x = 0; row = 0; }
  placed.push(translate([x, y, 0], piece(cells)));
  x += w + 4; row = Math.max(row, d); width = Math.max(width, x - 4);
}
const all = translate([-width / 2, -(y + row) / 2, 0], group(...placed));
if (kind !== "pentomino" || tray !== "yes") return all;
// a 6 x 10 tray with a little room
const rim = 4, fl = 2, clr = 0.5, TW = 10 * u + 2 * clr, TD = 6 * u + 2 * clr;
const box = difference(cube([TW + 2 * rim, TD + 2 * rim, fl + thick * 0.6]), translate([rim, rim, fl], cube([TW, TD, thick])));
return group(all, translate([-(TW + 2 * rim) / 2, (y + row) / 2 + 6, 0], box));
