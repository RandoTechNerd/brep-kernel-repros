// Skadis bin: a bin, cup, shelf or divided tray that hangs on IKEA Skadis pegboard by its own tabs.
// Print: upright as shown, no supports. PETG if it will carry tools. Tilt the top toward the board to slip the tabs in, then let it drop onto the slots below.
// Every number below is a slider (Params). From the BREPcode catalog: skadis-bin.
const width = 80;     // [30:220] width (or cup diameter), mm
const depth = 50;     // [20:150] depth out from the board, mm
const height = 60;    // [12:150] bin height (a shelf's front lip), mm
const backH = 0;      // [0:100] back plate above the rim, mm
const wall = 1.8;     // [1.2:4] wall thickness, mm
const floor = 2;      // [1.2:5] floor thickness, mm
const cornerR = 6;    // [1:20] front corner radius, mm
const sections = 1;   // [1:8] compartments across (box only)
const shape = "box";  // [box, cup] shape

// x across, y out from the board (the board's face is y = 0), z up
const tB = 5, tabW = 4.5, tabH = 10;                 // a 5 mm board; a tab through its 5 x 15 mm slot
const upT = 4, rise = 7;                             // the turn-up behind the board
const backT = Math.max(3, wall);
// the plate rises above the rim when a low bin or shelf could not carry the tab itself
const top = Math.max(height + backH, tabH + tabW / 2 + 4);
const zU = top - tabH - 2;                           // the hooking tabs
const zL = zU - 40;                                  // the resting tabs, one Skadis row down
// slots at one height are 40 mm apart; two tabs as far apart as the width allows,
// plus one in the middle when that is a slot too (an even number of 40s between)
const span = Math.floor((width - 2 * wall - tabW - 2) / 40);
const xs = span >= 1 ? [-span * 20, span * 20, ...(span >= 4 && span % 2 === 0 ? [0] : [])] : [0];
// a tab's section: tabW wide, pointed underneath at 45 degrees
const section = (h) => polygon([[-tabW / 2, 0], [0, -tabW / 2], [tabW / 2, 0], [tabW / 2, h], [-tabW / 2, h]]);
// pushed back through the board (-y) from inside the plate
const tab = (x, z, h, len) => translate([x, 0.5, z], rotate([90, 0, 0], linearExtrude({ h: len + 0.5 }, section(h))));
const reach = tB + 0.4 + upT;
const tabs = xs.flatMap((x) => [
  tab(x, zU, tabH, reach),
  translate([x - tabW / 2, -reach, zU], cube([tabW, upT, tabH + rise])),      // turns up behind the board
  ...(zL >= tabW / 2 + 1 ? [tab(x, zL, 6, tB - 0.6)] : []),
]);

let bin;
if (shape === "cup") {
  const R = width / 2;
  const outer = union(
    translate([0, R, 0], cylinder({ r: R, h: height, $fn: 64 })),
    translate([-R, 0, 0], cube([2 * R, backT, top])),
  );
  bin = difference(outer, translate([0, R, floor], cylinder({ r: R - wall, h: top, $fn: 64 })));
} else {
  const rr = Math.max(0.6, Math.min(cornerR, width / 2 - 1, depth / 2 - 1));
  // a flat back against the board, rounded front corners
  const box = (w, d, y0, z0, h, r) => hull(
    translate([-w / 2, y0, z0], cube([w, 0.1, h])),
    translate([-w / 2 + r, y0 + d - r, z0], cylinder({ r, h, $fn: 32 })),
    translate([w / 2 - r, y0 + d - r, z0], cylinder({ r, h, $fn: 32 })),
  );
  const outer = top > height + 0.01
    ? union(box(width, depth, 0, 0, height, rr), translate([-width / 2, 0, 0], cube([width, backT, top])))
    : box(width, depth, 0, 0, height, rr);
  bin = difference(outer, box(width - 2 * wall, depth - backT - wall, backT, floor, top, Math.max(0.5, rr - wall)));
  if (sections > 1) {
    // thin walls from the back plate to the front wall, splitting the width evenly
    const inner = width - 2 * wall, run = depth - backT - wall;
    const divs = Array.from({ length: sections - 1 }, (_, i) =>
      translate([-inner / 2 + inner * (i + 1) / sections - wall / 2, backT - 0.01, floor - 0.01], cube([wall, run + 0.02, height - floor + 0.01])));
    bin = union(bin, ...divs);
  }
}
return union(bin, ...tabs);
