// Door wedge: a ridged wedge that holds a door or window open, or levels a wobbly table.
// Print: lying on its bottom as shown, no supports. TPU grips best, PETG or PLA work.
// Every number below is a slider (Params). From the BREPcode catalog: door-wedge.
const length = 120;  // [30:250] length, mm
const width = 40;    // [15:120] width, mm
const height = 30;   // [3:80] height at the tall end, mm
const tipH = 2;      // [0.6:15] height at the thin end, mm
const ridges = 6;    // [0:20] grip ridges
const ridgeH = 1.5;  // [0.5:4] ridge height, mm
const holeD = 8;     // [0:20] hanging hole (0 = none), mm

// side view: x along the wedge, y up; stood up across the width
const h0 = Math.min(tipH, height - 0.5);
const slope = (x) => h0 + (height - h0) * x / length;
// ridges along the middle of the ramp, clear of the hole at the tall end
const w = Math.min(6, length * 0.5 / Math.max(1, ridges));     // never wider than their spacing
const xs = Array.from({ length: ridges }, (_, i) => length * 0.22 + (length * 0.5) * (i + 0.5) / ridges);
const bumps = xs.reverse().flatMap((x) => [[x + w / 2, slope(x + w / 2)], [x, slope(x) + ridgeH], [x - w / 2, slope(x - w / 2)]]);
const outline = [[0, 0], [length, 0], [length, height], ...bumps, [0, h0]];
// rotate([90, 0, 0]) stands the outline up: its y becomes z, and it extrudes toward -y
const wedge = translate([0, width, 0], rotate([90, 0, 0], linearExtrude({ h: width }, polygon(outline))));
const hx = length - Math.max(holeD, 6) / 2 - 6;
const shaped = holeD > 0 && hx > length * 0.75
  ? difference(wedge, translate([hx, width / 2, -1], cylinder({ r: holeD / 2, h: height + 2, $fn: 32 })))
  : wedge;
return translate([-length / 2, -width / 2, 0], shaped);
