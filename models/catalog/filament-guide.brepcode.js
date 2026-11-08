// Filament guide: a guide that snaps onto a 2020, 3030 or 4040 frame extrusion and leads filament or PTFE tube through an eyelet.
// Print: flat as shown, no supports.
// Every number below is a slider (Params). From the BREPcode catalog: filament-guide.
const extrusion = 20;  // [15:45] extrusion size, mm
const slotW = 6;       // [3:10] slot opening, mm
const armL = 40;       // [10:100] arm length, mm
const holeD = 4.5;     // [2.5:8] eyelet hole, mm
const thickness = 10;  // [6:20] clip thickness, mm
const wallT = 3;       // [2:5] wall thickness, mm

// profile across the extrusion: x sideways, y up; extruded `thickness` along the extrusion
const w = wallT, f = 0.2;
const hx = extrusion / 2 + f;                        // inside of the clamp
const top = extrusion / 2 + f;                       // underside of its top bar
const low = -extrusion / 4;                          // the arms reach past the side slots' middle
const bs = Math.min(slotW * 0.8, extrusion / 3), bd = Math.min(1.2, slotW / 4);
const rect = (x0, y0, x1, y1) => [[x0, y0], [x1, y0], [x1, y1], [x0, y1]];
const sw = Math.max(holeD + 2 * w, 8);               // the arm's width
const yTop = top + w + armL;
const pieces = [
  rect(-hx - w, top, hx + w, top + w),
  rect(-hx - w, low, -hx, top + 0.01),
  rect(hx, low, hx + w, top + 0.01),
  // barbs that click into the side slots
  [[-hx - 0.01, -bs / 2], [-hx + bd, 0], [-hx - 0.01, bs / 2]],
  [[hx + 0.01, -bs / 2], [hx + 0.01, bs / 2], [hx - bd, 0]],
  rect(-sw / 2, top + w - 0.01, sw / 2, yTop),
];
const solid = union(...pieces.map((p) => linearExtrude({ h: thickness }, polygon(p))),
  translate([0, yTop, 0], cylinder({ r: sw / 2, h: thickness, $fn: 32 })));
// the eyelet: across the arm, a teardrop pointing up the print
const r = Math.min(holeD / 2, (thickness / 2 - 0.8) / 1.42);
const zc = thickness / 2;
const eyelet = hull(
  translate([-sw, yTop, zc], rotate([0, 90, 0], cylinder({ r, h: 2 * sw, $fn: 24 }))),
  translate([-sw, yTop - 0.01, zc + r * 1.41 - 0.01], cube([2 * sw, 0.02, 0.02])),
);
return difference(solid, eyelet);
