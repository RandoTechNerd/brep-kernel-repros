// Cartridge holder: a stepped block of pockets that stands game cartridges or memory cards upright, labels facing out.
// Print: upright as shown, no supports.
// Every number below is a slider (Params). From the BREPcode catalog: cartridge-holder.
const cartW = 21.5;  // [5:140] cartridge width, mm
const cartH = 31;    // [10:140] cartridge height, mm
const cartT = 3.3;   // [0.8:30] cartridge thickness, mm
const cols = 6;      // [1:12] pockets across
const rows = 3;      // [1:6] rows
const sink = 0.45;   // [0.2:0.8] how much of each one sits in its pocket
const rowGap = 5;    // [2:20] space between rows, mm
const rowStep = 8;   // [0:30] each row higher than the last by, mm
const wall = 2;      // [1.2:6] wall between pockets, mm

// pockets get 0.3 mm of room each side
const pw = cartW + 0.6, pt = cartT + 0.6;
const depthIn = Math.max(5, cartH * sink);       // how far each one sits in
const flr = Math.max(1.6, wall);
const pitchX = pw + wall, pitchY = pt + rowGap;
const W = cols * pitchX + wall;
const D = rows * pt + (rows + 1) * rowGap;
const yRow = (r) => rowGap + r * pitchY;          // front face of row r's pockets
const zTop = (r) => flr + depthIn + r * rowStep;  // top of row r's step
// stepped side profile: x runs front to back, y runs up; pushed across the width
const prof = [[0, 0], [D, 0], [D, zTop(rows - 1)]];
for (let r = rows - 1; r >= 1; r--) {
  const yb = yRow(r) - rowGap / 2;
  prof.push([yb, zTop(r)], [yb, zTop(r - 1)]);
}
prof.push([0, zTop(0)]);
const block = rotate([0, 0, 90], rotate([90, 0, 0], linearExtrude({ h: W }, polygon(prof))));
const pockets = [];
for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
  pockets.push(translate([wall + c * pitchX, yRow(r), zTop(r) - depthIn], cube([pw, pt, depthIn + 1])));
}
return translate([-W / 2, -D / 2, 0], difference(block, ...pockets));
