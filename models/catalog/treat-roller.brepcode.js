// Treat roller: a hollow treat-dispensing roller with teardrop holes and a push-fit cap; pets roll it to get the kibble out.
// Print: standing on its closed end, cap beside it, no supports. PETG or TPU. Food contact: food-safe filament, hand wash. A toy to play with under supervision, not a chew toy: take it away once it is chewed.
// Every number below is a slider (Params). From the BREPcode catalog: treat-roller.
const outerD = 75;        // [40:140] across the flats, mm
const length = 110;       // [50:220] length, mm
const sides = "octagon";  // [octagon, hex, round] shape: octagonal, hexagonal or round (round rolls farther)
const holeD = 14;         // [6:30] treat hole size, mm
const holes = 6;          // [1:16] number of holes
const wall = 3;           // [2:6] wall thickness, mm
const capFit = 0.25;      // [0.1:0.8] cap clearance per side (more = looser), mm

// round is a 40-sided prism: flat facets keep the holes' booleans quick
const N = sides === "hex" ? 6 : sides === "octagon" ? 8 : 40;
const ra = outerD / 2;                                    // to the middle of a flat
const rb = ra - wall;                                     // the bore, the same shape inside
const floorT = Math.max(2.4, wall);
const lipD = Math.min(10, Math.max(5, length * 0.08));   // how far the cap plugs in
// an N-sided prism, apo from the middle to a flat; flats face 0, 1/N, 2/N... of a turn
const prism = (apo, h, z = 0) => translate([0, 0, z], linearExtrude({ h }, polygon(Array.from({ length: N }, (_, k) => {
  const a = (k + 0.5) * 2 * Math.PI / N, rc = apo / Math.cos(Math.PI / N);
  return [rc * Math.cos(a), rc * Math.sin(a)];
}))));
const shellPart = difference(prism(ra, length), prism(rb, length, floorT));

// teardrop holes, point up, one per flat (round: a golden-angle spiral)
const rh = holeD / 2;
const tear = (M = 10) => [[0, rh * Math.SQRT2], ...Array.from({ length: M + 1 }, (_, i) => {
  const a = Math.PI * 0.75 + Math.PI * 1.5 * i / M;      // from 135 round the bottom to 405 degrees
  return [rh * Math.cos(a), rh * Math.sin(a)];
})];
const zLo = floorT + rh + 3, zHi = length - lipD - rh * Math.SQRT2 - 3;
const stepF = N === 8 ? 3 : 1;
const holeAt = (i) => {
  const ang = N < 20 ? ((i * stepF) % N) * 360 / N : i * 137.5;
  const z = holes === 1 ? (zLo + zHi) / 2 : zLo + (zHi - zLo) * i / (holes - 1);
  // a prism just through the wall: from inside the bore to past the corners
  const r0 = rb - 1, r1 = ra / Math.cos(Math.PI / 6) + 1;
  return translate([0, 0, z], rotate([0, 0, ang + 90], translate([0, -r0, 0], rotate([90, 0, 0], linearExtrude({ h: r1 - r0 }, polygon(tear()))))));
};
const roller = difference(shellPart, union(...Array.from({ length: holes }, (_, i) => holeAt(i))));

// the cap, upside down beside it: a matching disc and a plug ring
const capT = Math.max(2.4, wall);
const ro = rb - capFit, ri = ro - 1.6;
const cap = union(prism(ra, capT), difference(prism(ro, lipD + 0.01, capT - 0.01), prism(ri, lipD + 2, capT - 1)));
return group(roller, translate([2 * ra + 10, 0, 0], cap));
