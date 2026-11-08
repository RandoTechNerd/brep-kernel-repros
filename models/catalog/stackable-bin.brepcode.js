// Stackable parts bin: an open-front parts bin whose foot nests into the bin below, so a column of them stays put.
// Print: upright as shown, no supports: the stacking step is a 45 degree chamfer.
// Every number below is a slider (Params). From the BREPcode catalog: stackable-bin.
const width = 80;     // [30:200] outside width, mm
const depth = 120;    // [40:220] outside depth, front to back, mm
const height = 60;    // [25:150] height at the back, mm
const frontH = 25;    // [6:100] front wall height, mm
const wall = 1.6;     // [1.2:4] wall thickness, mm
const cornerR = 5;    // [1:15] corner radius, mm
const divX = 0;       // [0:5] dividers, front to back
const stack = "yes";  // [no, yes] stacking foot

const s = wall + 0.4;                               // how far the foot steps in
const floor = Math.max(1.2, Math.min(wall, 2));
const footH = floor + 0.8;                          // the part that drops into the bin below
const stacks = stack === "yes";
// the corners must stay round through the step, inside and out
const rr = Math.min(Math.max(cornerR, stacks ? s + wall + 0.6 : 0.8), width / 2 - 1, depth / 2 - 1);
const cx = width / 2 - rr, cy = depth / 2 - rr;     // corner centres, the same at every height
const corners = (r1, r2, z, h) => hull(...[[-1, -1], [1, -1], [1, 1], [-1, 1]].map(([sx, sy]) =>
  translate([sx * cx, sy * cy, z], cylinder({ r1, r2, h, $fn: 32 }))));
// the bin's outline offset inward by `inset`, from z0 up to z1: foot, 45 degree step, full size
const stepped = (inset, z0, z1) => {
  const r = rr - inset;
  if (!stacks) return corners(r, r, z0, z1 - z0);
  return union(
    corners(r - s, r - s, z0, footH - z0 + 0.01),
    corners(r - s, r, footH, s),
    corners(r, r, footH + s - 0.01, z1 - footH - s + 0.01),
  );
};
const fh = Math.max(floor + 2, Math.min(frontH, height - 8));
const iw = width - 2 * wall, id = depth - 2 * wall;
const cuts = [
  stepped(wall, floor, height + 1),
  // the front wall, cut down to fh; the side walls stay full height
  translate([-iw / 2, -depth / 2 - 1, fh], cube([iw, wall + 1.01, height])),
];
const divH = height - (stacks ? footH + 1 : 0) - floor;
const dividers = Array.from({ length: divX }, (_, i) =>
  translate([-iw / 2 + (i + 1) * iw / (divX + 1) - 0.6, -id / 2 - 0.1, floor - 0.1], cube([1.2, id + 0.2, divH + 0.1])));
const bin = difference(stepped(0, 0, height), ...cuts);
return dividers.length ? union(bin, ...dividers) : bin;
