// Measuring scoop: a scoop that holds an exact volume when levelled, with a flat handle and a hanging hole.
// Print: upright as shown, no supports. Food contact: use PETG or PLA from a food-safe spool, hand wash, and replace it once scratched.
// Every number below is a slider (Params). From the BREPcode catalog: measuring-scoop.
const volume = 59;   // [1:500] capacity in millilitres (level full)
const deep = 0.6;    // [0.3:1.2] depth as a share of the width (higher = deeper, narrower)
const wall = 2;      // [1.2:4] wall thickness, mm
const floor = 2;     // [1.2:4] floor thickness, mm
const handleL = 90;  // [30:180] handle length past the cup, mm
const handleW = 16;  // [8:30] handle width, mm
const handleT = 4;   // [2.4:8] handle thickness, mm
const hangHole = 5;  // [0:10] hanging hole in the handle (0 = none), mm

// inside: a frustum flaring 10 degrees, depth = deep x its top width
const flare = Math.tan(10 * Math.PI / 180);
const c = 1 - 2 * deep * flare;                 // bottom radius as a share of the top radius
const R = Math.cbrt(3 * volume * 1000 / (2 * Math.PI * deep * (1 + c + c * c)));
const rb = c * R, depthIn = 2 * deep * R;
const H = floor + depthIn;
const Ro = R + wall, rbo = rb + wall;
const outer = revolve(360, polygon([[0, 0], [rbo, 0], [Ro, H], [0, H]]));
const cavity = translate([0, 0, floor], revolve(360, polygon([[0, 0], [rb, 0], [R + 0.01, depthIn + 0.01], [R + 0.01, depthIn + 1], [0, depthIn + 1]])));

// a flat handle on the bed, a rounded tongue running out along +x
const w = Math.min(handleW, 2 * rbo);
const t = Math.min(handleT, H);
const tip = rbo + handleL;
const arm = hull(
  translate([0, -w / 2, 0], cube([1, w, t])),
  translate([tip - w / 2, 0, 0], cylinder({ r: w / 2, h: t, $fn: 32 })),
);
let scoop = difference(union(outer, arm), cavity);
if (hangHole > 0) {
  const hr = Math.min(hangHole, w - 4) / 2;
  if (hr > 0.5) scoop = difference(scoop, translate([tip - w / 2, 0, -1], cylinder({ r: hr, h: t + 2, $fn: 24 })));
}
return translate([-(tip - Ro) / 2, 0, 0], scoop);
