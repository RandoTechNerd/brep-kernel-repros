// Tool rack: a wall shelf with a row of holes or open slots that hangs screwdrivers, pliers, wrenches or a drill.
// Print: upright as shown (back plate on the bed edge, wedge under the shelf), no supports. PETG for heavy tools.
// Every number below is a slider (Params). From the BREPcode catalog: tool-rack.
const count = 8;       // [1:20] how many tools
const form = "round";  // [round, slot] round holes or open-front slots
const holeD = 10;      // [3:60] hole or slot width, mm
const pitch = 28;      // [8:140] spacing between tools, mm
const depth = 30;      // [12:130] shelf depth out from the wall, mm
const shelfT = 6;      // [3:20] shelf front thickness, mm
const above = 18;      // [12:60] back plate above the shelf (for screws), mm
const wall = 5;        // [3:10] back plate thickness, mm
const screwD = 4.5;    // [3:6] screw hole diameter, mm

// side profile: x runs out from the wall, y runs up; extruded along the wall
const D = Math.max(depth, holeD + 6);           // room for the hole with plastic all round
const step = Math.max(pitch, holeD + 4);
const top = shelfT + D * 1.15;                  // shelf top; the wedge rises 1.15 per 1 out, steeper than 45 degrees
const peak = top + above;                       // top of the back plate
const L = Math.max(40, count * step);
const outline = [[0, 0], [wall, 0], [wall + D, D * 1.15], [wall + D, top], [wall, top], [wall, peak], [0, peak]];
const bar = translate([0, L / 2, 0], rotate([90, 0, 0], linearExtrude({ h: L }, polygon(outline))));

const ys = Array.from({ length: count }, (_, i) => (i - (count - 1) / 2) * step);
const r = holeD / 2;
const cuts = ys.map((y) => form === "slot"
  // open to the front, round at the back
  ? hull(
      translate([wall + 3 + r, y, -1], cylinder({ r, h: top + 2, $fn: 40 })),
      translate([wall + D + 1, y - r, -1], cube([0.01, holeD, top + 2])))
  : translate([wall + D / 2, y, -1], cylinder({ r, h: top + 2, $fn: 40 })));

// countersunk screw holes through the plate above the shelf
const k = screwD / 2;
const sy = L / 2 - 10;
const screwYs = L > 220 ? [-sy, 0, sy] : [-sy, sy];
for (const y of screwYs) {
  cuts.push(translate([-1, y, top + above / 2], rotate([0, 90, 0], cylinder({ r: screwD / 2, h: wall + 2, $fn: 24 }))));
  cuts.push(translate([wall - k + 0.02, y, top + above / 2], rotate([0, 90, 0], cylinder({ r1: screwD / 2, r2: screwD / 2 + k, h: k, $fn: 24 }))));
}
return translate([-(wall + D) / 2, 0, 0], difference(bar, ...cuts));
