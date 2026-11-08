// French cleat rail: a 45-degree wall strip that cleat hooks, shelves and holders hang on.
// Print: lying on its back as shown, no supports. Print several and butt them end to end for a long wall.
// Every number below is a slider (Params). From the BREPcode catalog: french-cleat.
const length = 200;  // [40:250] rail length, mm
const cleatH = 40;   // [20:80] rail height, mm
const cleatT = 12;   // [6:20] rail thickness (the bevel is as deep), mm
const holes = 3;     // [0:8] screw holes
const screwD = 4.5;  // [3:6.5] screw diameter, mm

// cross-section: y up the wall, z out from it, stretched along x
const H = Math.max(cleatH, cleatT + 3 * screwD + 4);
const section = [[0, 0], [H - cleatT, 0], [H, cleatT], [0, cleatT]];   // the bevel rises as far as it runs: 45 degrees
// rotate([90, 90, 0]) sends the outline's x to y, its y to z, and the length to +x
const rail = rotate([90, 90, 0], linearExtrude({ h: length }, polygon(section)));
if (holes < 1) return translate([-length / 2, -H / 2, 0], rail);
// countersunk screws in the full-thickness band under the bevel
const yh = (H - cleatT) / 2;
const edge = Math.min(25, length / 4);
const xs = holes === 1 ? [length / 2] : Array.from({ length: holes }, (_, i) => edge + (length - 2 * edge) * i / (holes - 1));
const k = Math.min(screwD / 2, cleatT - 2);
const cuts = xs.flatMap((x) => [
  translate([x, yh, -1], cylinder({ r: screwD / 2, h: cleatT + 2, $fn: 24 })),
  translate([x, yh, cleatT - k + 0.02], cylinder({ r1: screwD / 2, r2: screwD / 2 + k, h: k, $fn: 24 })),
]);
return translate([-length / 2, -H / 2, 0], difference(rail, ...cuts));
