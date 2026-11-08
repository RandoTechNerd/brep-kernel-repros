// Calibration cube: a test cube to measure with calipers, with grooves marking X, Y and Z, or a single-wall cube for flow.
// Print: upright as shown, no supports. Hollow: vase mode, then measure the wall.
// Every number below is a slider (Params). From the BREPcode catalog: calibration-cube.
const size = 20;       // [5:50] cube size, mm
const form = "solid";  // [solid, hollow] solid or single-wall hollow
const wallT = 0.8;     // [0.4:5] wall thickness when hollow, mm
const marks = "yes";   // [no, yes] axis grooves

const s = size;
const block = translate([-s / 2, -s / 2, 0], cube([s, s, s]));
if (form === "hollow") {
  const t = Math.min(wallT, s / 4);
  return difference(block, translate([-s / 2 + t, -s / 2 + t, Math.max(0.6, t)], cube([s - 2 * t, s - 2 * t, s])));
}
if (marks !== "yes") return block;
// vertical grooves print as plain walls; the top ones are open to the sky
const gd = Math.min(0.8, s * 0.04), gw = Math.min(1.6, s * 0.08);
const up = (x, y, w, d) => translate([x, y, -1], cube([w, d, s + 2]));
return difference(block,
  up(s / 2 - gd, -gw / 2, gd + 1, gw),                               // X: one
  up(-s * 0.15 - gw / 2, s / 2 - gd, gw, gd + 1),                     // Y: two
  up(s * 0.15 - gw / 2, s / 2 - gd, gw, gd + 1),
  ...[-0.2, 0, 0.2].map((f) => translate([s * f - gw / 2, -s / 2 - 1, s - gd], cube([gw, s + 2, gd + 1]))),  // Z: three
);
