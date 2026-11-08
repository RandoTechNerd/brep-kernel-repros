// Toothbrush stand: a countertop block with holes the toothbrushes stand in, a drain under each hole and an optional toothpaste hole.
// Print: upright as shown, no supports. PETG copes with a wet sink better than PLA.
// Every number below is a slider (Params). From the BREPcode catalog: toothbrush-stand.
const holes = 4;    // [1:12] toothbrush holes
const rows = 1;     // [1:3] rows of holes
const holeD = 17;   // [8:40] hole diameter, mm
const spacing = 7;  // [3:25] plastic between holes, mm
const height = 55;  // [20:140] block height, mm
const floor = 3;    // [1.6:10] floor under the holes, mm
const drain = 4;    // [0:10] drain hole under each hole (0 = none), mm
const pasteD = 0;   // [0:60] toothpaste tube hole (0 = none), mm

// the sides lean in toward the top and the top edge is chamfered, so the
// margin round the holes is set at the bottom and is `spacing` at the top
const lean = Math.min(1.5, height / 25), ch = Math.min(1.5, height / 12);
const edge = Math.max(4, spacing) + lean + ch;

// the holes: rows of round holes, short rows centred, and a toothpaste hole at the end
const cols = Math.ceil(holes / Math.min(rows, holes));
const nRows = Math.ceil(holes / cols);
const pitch = holeD + spacing;
const r0 = holeD / 2, pr = pasteD / 2;
const rowSpan = (cols - 1) * pitch + holeD;
const colSpan = (nRows - 1) * pitch + holeD;
const W = rowSpan + 2 * edge + (pasteD > 0 ? pasteD + spacing : 0);
// deep enough to stand steady, and to take the toothpaste hole
const D = Math.max(colSpan + 2 * edge, 0.55 * height, pasteD + 2 * edge);
const x0 = -W / 2 + edge + r0;
const spots = Array.from({ length: holes }, (_, i) => {
  const r = Math.floor(i / cols), c = i % cols;
  const inRow = Math.min(cols, holes - r * cols);
  return [x0 + (c + (cols - inRow) / 2) * pitch, (r - (nRows - 1) / 2) * pitch];
});

// the corners are rounded concentric with the corner holes, so the wall is even all round
const rL = edge + r0, rR = pasteD > 0 ? edge + pr : rL;
const corner = (R, sx, sy) => [
  translate([sx * (W / 2 - R), sy * (D / 2 - R), 0], cylinder({ r1: R, r2: R - lean, h: height - ch, $fn: 48 })),
  translate([sx * (W / 2 - R), sy * (D / 2 - R), height - ch], cylinder({ r1: R - lean, r2: R - lean - ch, h: ch, $fn: 48 })),
];
const block = hull(...corner(rL, -1, -1), ...corner(rL, -1, 1), ...corner(rR, 1, -1), ...corner(rR, 1, 1));

const cuts = [];
const floorZ = Math.min(floor, height - 6);
const bore = (x, y, r) => {
  cuts.push(translate([x, y, floorZ], cylinder({ r, h: height, $fn: 40 })));
  // a little lead-in chamfer round the mouth
  cuts.push(translate([x, y, height - 1.2], cylinder({ r1: r, r2: r + 1.2, h: 1.21, $fn: 40 })));
  if (drain > 0) cuts.push(translate([x, y, -1], cylinder({ r: Math.min(drain / 2, r - 1.5), h: floorZ + 1.5, $fn: 20 })));
};
for (const [x, y] of spots) bore(x, y, holeD / 2);
if (pasteD > 0) bore(W / 2 - edge - pr, 0, pr);
return difference(block, ...cuts);
