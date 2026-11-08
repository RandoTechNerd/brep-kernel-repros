// Weight plate peg: a wall peg sized to a weight plate's centre hole, with a flared lip and a screw plate.
// Print: on its back as shown, no supports. PETG, 6 walls, 50% infill; screw into a stud and keep the heavy plates near the wall.
// Every number below is a slider (Params). From the BREPcode catalog: plate-peg.
const pegD = 46;     // [20:60] peg diameter, mm
const pegL = 120;    // [40:220] peg length, mm
const plateW = 90;   // [60:160] wall plate width, mm
const plateH = 120;  // [60:200] wall plate height, mm
const plateT = 8;    // [5:15] wall plate thickness, mm
const collar = 4;    // [0:10] tip lip height (0 = none), mm

const rp = pegD / 2;
const H = Math.max(plateH, 2 * rp + 50);                  // room above and below the peg for the screws
const W = plateW;
// four countersunk screws in the plate's corners, cut before the peg goes on
const screwCut = (x, y) => [translate([x, y, -1], cylinder({ r: 2.6, h: plateT + 2, $fn: 16 })), translate([x, y, plateT - 2.6], cylinder({ r1: 2.6, r2: 5.3, h: 2.61, $fn: 16 }))];
const sx = W / 2 - 12, sy = H / 2 - 12;
const wallPlate = difference(translate([-W / 2, -H / 2, 0], cube([W, H, plateT])),
  ...screwCut(-sx, -sy), ...screwCut(sx, -sy), ...screwCut(-sx, sy), ...screwCut(sx, sy));
// the peg: a root cone, the shank, and a lip flaring out at 50 degrees.
// The root cone stays inside the wall plate's edge: on a narrow plate it
// used to poke past the side face, and its seam crossing that face left
// the union with overused edges (not watertight).
const z0 = plateT - 0.5, L = pegL + 0.5, lipH = collar * 1.2;
const rootR = Math.max(rp + 2, Math.min(rp + 8, W / 2 - 1, H / 2 - 1));
const prof = [[0, 0], [rootR, 0], [rp, 8]];
if (collar > 0) prof.push([rp, L - lipH - 2], [rp + collar, L - 2], [rp + collar, L]);
else prof.push([rp, L]);
prof.push([0, L]);
// turned a little so the revolve's seam never lies along a plate edge
return union(wallPlate, translate([0, 0, z0], rotate([0, 0, 10], revolve(360, polygon(prof)))));
