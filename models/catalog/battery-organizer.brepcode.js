// Battery organizer: a block of pockets that AA, AAA, 18650, 9 V or coin cell batteries stand up in.
// Print: upright as shown, no supports.
// Every number below is a slider (Params). From the BREPcode catalog: battery-organizer.
const cellD = 14.5;  // [5:35] battery diameter (or width), mm
const cellT = 0;     // [0:30] battery thickness for flat cells (0 = round), mm
const cellL = 50.5;  // [3:72] battery length, mm
const cols = 6;      // [1:12] pockets across
const rows = 4;      // [1:10] rows
const count = 0;     // [0:120] pockets wanted (0 = across x rows; a number sets the grid)
const hold = 0.55;   // [0.3:0.9] share of each battery held in the block
const fit = 0.5;     // [0.2:1.2] pocket clearance, mm

const rib = Math.max(1.6, cellD * 0.12);            // plastic between pockets
const flat = cellT > 0;
const pw = cellD + fit, pt = (flat ? cellT : cellD) + fit;
const px = pw + rib, py = pt + rib;                 // pocket pitch across and along
const depth = Math.max(3, Math.min(cellL * hold, cellL - 2));
const floor = Math.max(1.6, rib);
// the chat folds a count into cols x rows before the code is written; this
// is for the slider, when someone turns the count up by hand
const nX = count > 0 ? Math.min(12, Math.ceil(Math.sqrt(count))) : cols;
const nY = count > 0 ? Math.min(10, Math.ceil(count / nX)) : rows;
const W = nX * px + rib, D = nY * py + rib, H = depth + floor;
const r = Math.min(4, W / 2 - 0.5, D / 2 - 0.5);
const block = hull(...[[-1, -1], [1, -1], [1, 1], [-1, 1]].map(([sx, sy]) =>
  translate([sx * (W / 2 - r), sy * (D / 2 - r), 0], cylinder({ r, h: H, $fn: 24 }))));
const pockets = [];
for (let i = 0; i < nX; i++) {
  for (let j = 0; j < nY; j++) {
    const x = -W / 2 + rib + px * i + pw / 2, y = -D / 2 + rib + py * j + pt / 2;
    pockets.push(flat
      ? translate([x - pw / 2, y - pt / 2, floor], cube([pw, pt, depth + 1]))
      : translate([x, y, floor], cylinder({ d: pw, h: depth + 1, $fn: 28 })));
  }
}
return difference(block, ...pockets);
