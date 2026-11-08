// Treat ball: a hollow treat-dispensing ball in two identical halves and a joining ring; kibble falls out of the holes as it rolls.
// Print: the two halves rim down and the ring standing, as shown, no supports; 15% infill is plenty. PETG or TPU, food-safe filament, hand wash. Press the ring into one half (a drop of glue), then the other half over it. A toy for supervised play, not a chew toy: take it away once it is chewed.
// Every number below is a slider (Params). From the BREPcode catalog: treat-ball.
const ballD = 75;     // [40:140] ball diameter, mm
const holeD = 16;     // [6:30] treat hole size, mm
const holes = 6;      // [1:16] number of holes (shared between the halves)
const wall = 3;       // [2:6] wall thickness, mm
const ringFit = 0.3;  // [0.1:0.8] ring clearance per side (more = looser), mm

const r = ballD / 2, t = wall, ri = r - t;
const band = Math.max(5, Math.min(9, r * 0.14));               // the straight rim the ring sits in
const S = 32, M = 12;                                           // facets round, latitude rings up the dome
// a turned S-gon as a thin ring, for hull(): the whole dome is convex, so one
// hull of every latitude ring IS the dome. 0.2 mm thick, a layer: paper-thin
// rings left non-manifold slivers at some sizes
const ring = (rad, z) => translate([0, 0, z], linearExtrude({ h: 0.2 }, polygon(Array.from({ length: S }, (_, i) =>
  [rad * Math.cos(2 * Math.PI * i / S), rad * Math.sin(2 * Math.PI * i / S)]))));
const dome = hull(ring(r, 0), ...Array.from({ length: M }, (_, i) => {
  const a = Math.PI / 2 * i / M;
  return ring(r * Math.cos(a), band + r * Math.sin(a));
}), ring(0.6, band + r - 0.2));
// the cavity: the band's bore, then a 45 degree cone to just under the pole
const cavity = hull(ring(ri, -0.5), ring(ri, band), ring(1, band + ri - 1));

// teardrop holes, pointed toward the pole, in a ring at 55 degrees from the
// pole (two rings when there are many); each half gets half of them. The
// cone cavity is closest to the centre at 45 degrees (0.71 of the bore), so
// a cutter starts at 0.45 of it to be sure of breaking through into the void
const rh = Math.min(holeD, ri * 0.9) / 2;
const tear = (K = 10) => [[-rh * Math.SQRT2, 0], ...Array.from({ length: K + 1 }, (_, i) => {
  const a = Math.PI * 1.25 + Math.PI * 1.5 * i / K;             // from 225 round the far side to 495 degrees
  return [rh * Math.cos(a), rh * Math.sin(a)];
})];
const cutter = (theta, phi) => translate([0, 0, band], rotate([0, 0, phi], rotate([0, theta, 0],
  translate([0, 0, ri * 0.45], linearExtrude({ h: r + 4 - ri * 0.45 }, polygon(tear()))))));
const holesOn = (n, turn) => {
  const out = [];
  const twoRings = n > 5;
  for (let i = 0; i < n; i++) {
    const theta = twoRings ? (i % 2 ? 68 : 44) : 55;
    out.push(cutter(theta, turn + 360 * i / n));
  }
  return out;
};
const nA = Math.ceil(holes / 2), nB = holes - nA;
const halfA = difference(dome, cavity, ...holesOn(nA, 0));
const halfB = nB > 0 ? difference(dome, cavity, ...holesOn(nB, 180 / Math.max(1, nB))) : difference(dome, cavity);

// the joining ring: a short tube that presses into both bands
const ro = ri - ringFit, ringT = Math.max(1.6, Math.min(2.4, t * 0.7));
const joiner = difference(
  linearExtrude({ h: 2 * band - 2 }, polygon(Array.from({ length: S }, (_, i) => [ro * Math.cos(2 * Math.PI * i / S), ro * Math.sin(2 * Math.PI * i / S)]))),
  translate([0, 0, -1], linearExtrude({ h: 2 * band }, polygon(Array.from({ length: S }, (_, i) => [(ro - ringT) * Math.cos(2 * Math.PI * i / S), (ro - ringT) * Math.sin(2 * Math.PI * i / S)])))),
);
return group(halfA, translate([2 * r + 10, 0, 0], halfB), translate([r + 5, 2 * r + 10, 0], joiner));
