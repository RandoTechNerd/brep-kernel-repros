// Rain gauge: a straight tube with ring marks every few millimetres of rain, on a fence-post plate or a foot.
// Print: upright as shown, no supports. A clear or white filament makes the water easy to read.
// Every number below is a slider (Params). From the BREPcode catalog: rain-gauge.
const tubeD = 40;       // [20:80] inside diameter, mm
const height = 160;     // [60:240] height, mm
const step = 5;         // [2:20] rain between marks, mm
const wall = 2.4;       // [1.6:4] wall thickness, mm
const mount = "plate";  // [plate, foot] fence plate or standing foot

const Ri = tubeD / 2, R = Ri + wall, fl = 3;
const foot = mount === "foot";
const z0 = foot ? 18 : 0;                                 // where the tube proper starts
// the outside edge, bottom to top, with a V groove at every mark (flanks steeper than 45 degrees)
const edge = [];
for (let n = 1; fl + n * step < height - 4; n++) {
  const z = fl + n * step;
  const major = n % 5 === 0;
  const gh = Math.min(major ? 3 : 1.4, step * (major ? 0.9 : 0.6)), gd = Math.min(gh * 0.4, wall - 1);
  if (z - gh / 2 > z0 + 1) edge.push([R, z - gh / 2], [R - gd, z], [R, z + gh / 2]);
}
const base = foot ? [[0, 0], [R + 15, 0], [R + 15, 3], [R, z0]] : [[0, 0], [R, 0]];
const gauge = revolve(360, polygon([...base, ...edge, [R, height], [Ri, height], [Ri, fl], [0, fl]]));
if (foot) return gauge;

// a back plate for a fence post, screws outside the tube's shadow, countersunk on the front
const pw = 2 * R + 26, pt = 5, y0 = R - 1;
const plate = translate([-pw / 2, y0, 0], cube([pw, pt, height]));
const screwAt = (x, z) => [
  translate([x, y0 - 1, z], rotate([-90, 0, 0], cylinder({ r: 2.25, h: pt + 2, $fn: 20 }))),
  translate([x, y0 - 0.01, z], rotate([-90, 0, 0], cylinder({ r1: 4.6, r2: 2.25, h: 2.35, $fn: 20 }))),
];
const xs = R + 7;
// holes into the plate alone first: cutting a flat box is far cheaper than cutting the grooved tube
const drilled = difference(plate, ...screwAt(-xs, height * 0.25), ...screwAt(xs, height * 0.25), ...screwAt(-xs, height * 0.75), ...screwAt(xs, height * 0.75));
return union(gauge, drilled);
