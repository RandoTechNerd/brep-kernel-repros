// Token tray: a board-game tray of compartments with scooped fronts, for tokens, coins and bits.
// Print: upright as shown, no supports.
// Every number below is a slider (Params). From the BREPcode catalog: token-tray.
const width = 150;  // [40:250] width, mm
const depth = 100;  // [30:250] depth, mm
const height = 25;  // [8:60] height, mm
const cols = 3;     // [1:8] compartments across
const rows = 2;     // [1:6] rows
const wall = 1.6;   // [1.2:4] wall thickness, mm
const floor = 1.6;  // [1:4] floor thickness, mm
const scoop = 12;   // [0:30] scoop radius at the front (0 = square), mm
const cornerR = 4;  // [0.5:15] outer corner radius (limited by the wall), mm

// a rounded rectangle w x d, h tall, from the origin corner
const rounded = (w, d, h, r) => hull(...[[r, r], [w - r, r], [r, d - r], [w - r, d - r]].map(([x, y]) =>
  translate([x, y, 0], cylinder({ r, h, $fn: 32 }))));
// the corners can only be as round as keeps 0.8 mm of wall outside the square compartments
const rr = Math.max(0.5, Math.min(cornerR, width / 2 - 1, depth / 2 - 1, (Math.SQRT2 * wall - 0.8) / (Math.SQRT2 - 1)));
const cw = (width - (cols + 1) * wall) / cols, cd = (depth - (rows + 1) * wall) / rows;
const s = Math.max(0, Math.min(scoop, cd * 0.6, height - floor - 1));
// one compartment's side profile: x runs front to back, y runs up; a quarter-round scoop at the front
const scoopArc = Array.from({ length: 13 }, (_, i) => {
  const a = Math.PI + (Math.PI / 2) * i / 12;
  return [s + s * Math.cos(a), floor + s + s * Math.sin(a)];
});
const prof = s > 0.5
  ? [[0, height + 1], ...scoopArc, [cd, floor], [cd, height + 1]]
  : [[0, floor], [cd, floor], [cd, height + 1], [0, height + 1]];
const cells = [];
for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
  cells.push(translate([wall + c * (cw + wall), wall + r * (cd + wall), 0],
    rotate([0, 0, 90], rotate([90, 0, 0], linearExtrude({ h: cw }, polygon(prof))))));
}
return translate([-width / 2, -depth / 2, 0], difference(rounded(width, depth, height, rr), ...cells));
