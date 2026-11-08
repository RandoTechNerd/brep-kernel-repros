// Saw blade hanger: a wall peg that holds saw blades, grinder discs or tape rolls by their centre hole.
// Print: wall plate flat on the bed, peg up, no supports. The peg is a little under the bore so blades slide on easily.
// Every number below is a slider (Params). From the BREPcode catalog: blade-peg.
const pegD = 15.3;   // [6:100] peg diameter (a little under the hole), mm
const length = 40;   // [10:120] peg length, mm
const angle = 12;    // [0:30] upward lean of the peg, degrees
const plateW = 50;   // [30:160] wall plate width, mm
const plateH = 80;   // [40:200] wall plate height, mm
const plateT = 5;    // [3:10] wall plate thickness, mm
const screwD = 4.5;  // [3:6] screw hole diameter, mm

const r = pegD / 2;
const pw = Math.max(plateW, pegD + 12);
const a = angle * Math.PI / 180;
const drift = length * Math.sin(a);              // how far the tip leans up the wall
const ph = Math.max(plateH, pegD + 36 + drift);  // room for a screw above and below the peg
const rc = Math.min(8, pw / 4);
const plate = hull(...[[-1, -1], [1, -1], [-1, 1], [1, 1]].map(([sx, sy]) =>
  translate([sx * (pw / 2 - rc), sy * (ph / 2 - rc), 0], cylinder({ r: rc, h: plateT, $fn: 32 }))));
// the peg: a foot on the plate hulled to the leaning column, so it rises
// smoothly with no step to overhang
const lift = r * Math.sin(a) + 0.5;
const leaning = (rr, h, z0) => translate([0, -drift / 2, plateT + lift + z0], rotate([-angle, 0, 0], cylinder({ r: rr, h, $fn: 64 })));
const peg = hull(translate([0, -drift / 2, plateT - 0.5], cylinder({ r, h: 0.6, $fn: 64 })), leaning(r, length, 0));
const cuts = [];
if (pegD > 30) cuts.push(leaning(r - 3, length + 1, 4));        // hollow a big peg from its tip
const k = screwD / 2;
for (const y of [ph / 2 - 9, -(ph / 2 - 9)]) {
  cuts.push(translate([0, y, -1], cylinder({ r: screwD / 2, h: plateT + 2, $fn: 24 })));
  cuts.push(translate([0, y, plateT - k + 0.02], cylinder({ r1: screwD / 2, r2: screwD / 2 + k, h: k, $fn: 24 })));
}
return difference(union(plate, peg), ...cuts);
