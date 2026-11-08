// Spool holder: a desk stand for filament spools: open-topped uprights and a drop-in axle through the spool's hub.
// Print: base flat, axle standing beside it, no supports.
// Every number below is a slider (Params). From the BREPcode catalog: spool-holder.
const spoolD = 200;  // [60:300] spool diameter, mm
const spoolW = 70;   // [30:120] spool width, mm
const boreD = 53;    // [15:80] spool hub hole, mm
const axleD = 16;    // [8:30] axle diameter, mm
const spools = 1;    // [1:3] spools side by side
const wall = 5;      // [3:10] base and upright thickness, mm

const ad = Math.min(axleD, boreD - 4);              // the axle has to go through the hub
const ut = Math.max(6, wall * 1.4);                 // upright thickness, along the axle
const bay = spoolW + 6;                             // room for one spool between uprights
const L = spools * bay + (spools + 1) * ut;         // base length, along the axle
const D = Math.max(60, spoolD * 0.5);               // base depth, front to back
// the spool hangs from the axle: its centre is (bore - axle) / 2 below the axle's
const axleZ = wall + 5 + spoolD / 2 + (boreD - ad) / 2;
const ar = ad / 2 + 0.6;                            // notch radius
const topZ = axleZ + ad * 0.5;
const uw = ad + 2 * wall + 8;                       // upright width at the top
const r = Math.min(8, D / 4);
const base = hull(...[[-1, -1], [1, -1], [1, 1], [-1, 1]].map(([sx, sy]) =>
  translate([sx * (L / 2 - r), sy * (D / 2 - r), 0], cylinder({ r, h: wall, $fn: 24 }))));
// an upright: a trapezoid drawn across (y, z), standing at x
// rotate([90, 90, 0]) sends the profile's x to y, its y to z, and the extrusion to +x
const upright = (x) => translate([x, 0, 0], rotate([90, 90, 0], linearExtrude({ h: ut },
  polygon([[-D * 0.4, 0], [D * 0.4, 0], [uw / 2, topZ], [-uw / 2, topZ]]))));
const ups = Array.from({ length: spools + 1 }, (_, i) => upright(-L / 2 + i * (bay + ut)));
const notch = union(
  translate([-L / 2 - 1, 0, axleZ], rotate([0, 90, 0], cylinder({ r: ar, h: L + 2, $fn: 40 }))),
  translate([-L / 2 - 1, -ar, axleZ], cube([L + 2, 2 * ar, topZ])),
);
const stand = difference(union(base, ...ups), notch);
// the axle, standing: a collar on the bed, the shaft, a 45 degree flare on top
const ce = Math.min(3, (boreD - ad) / 2 - 0.5);
const shaftH = L + 1;
const ra = ad / 2;
const axle = revolve(360, polygon(ce >= 1
  ? [[0, 0], [ra + ce, 0], [ra + ce, 3], [ra, 3], [ra, 3 + shaftH], [ra + ce, 3 + shaftH + ce], [0, 3 + shaftH + ce]]
  : [[0, 0], [ra, 0], [ra, shaftH + 6], [0, shaftH + 6]]));
return group(stand, translate([0, D / 2 + ad / 2 + ce + 8, 0], axle));
