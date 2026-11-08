// Pet food scoop: an open-front shovel scoop that holds a set volume of kibble or feed, with a stiff spined handle; slotted, it sifts litter.
// Print: upright as shown, no supports. Food contact: PETG or PLA from a food-safe spool, hand wash, replace it once scratched. Litter scoops want PETG.
// Every number below is a slider (Params). From the BREPcode catalog: pet-food-scoop.
const volume = 237;         // [30:1000] capacity in millilitres, level to the walls (1 cup = 237)
const deep = 0.55;          // [0.3:0.9] back wall height as a share of the floor width
const long = 1;             // [0.4:1.6] straight floor length as a share of its width
const front = 0.3;          // [0.15:1] side wall height at the front, as a share of the back (lower = more open)
const flare = 15;           // [0:40] how far the walls lean out, degrees
const wall = 2.4;           // [1.6:4] wall thickness, mm
const floor = 2.4;          // [1.6:5] floor thickness, mm
const handleL = 90;         // [40:180] handle length past the scoop, mm
const handleW = 26;         // [14:40] handle width, mm
const handleT = 5;          // [3:10] handle thickness, mm
const grip = "spine";       // [spine, flat] handle: a raised spine, or flat
const floorType = "solid";  // [solid, slotted] floor: solid, or slotted to sift litter
const slotW = 6;            // [3:12] sifting slot width (slotted floor), mm
const hangHole = 6;         // [0:12] hanging hole in the handle (0 = none), mm

// a scoop with a floor 1 wide: walls lean out by the flare, the back is
// deep tall, the straight floor long, the sides fall to front x the back
const tanF = Math.tan(flare * Math.PI / 180);
const hb1 = deep, hf1 = deep * front;
const area = (z) => {
  const r = 0.5 + z * tanF;
  const xc = z <= hf1 ? long : long * (hb1 - z) / Math.max(1e-6, hb1 - hf1);
  return Math.PI * r * r / 2 + 2 * r * xc;            // round back + straight part, at this height
};
const integrate = (f, a, b, n = 96) => {
  let t = 0;
  for (let i = 0; i < n; i++) t += f(a + (b - a) * (i + 0.5) / n);
  return t * (b - a) / n;
};
const s = Math.cbrt(volume * 1000 / integrate(area, 0, hb1));   // mm per unit
const r0 = s / 2, L = long * s, Hb = hb1 * s, Hf = hf1 * s;
const H = floor + Hb;
const Rb = r0 + wall - floor * tanF;                  // outside radius at the bed
const Rt = r0 + wall + Hb * tanF;                     // and at the top

// a racetrack: round end centred on x = 0, straight sides running len along +x
const track = (pts, len) => translate([len / 2, 0, 0], revolve({ stretch: len }, polygon(pts)));
// a side profile (x, z) stood up and stretched across y, centred
const across = (pts, w) => translate([0, w / 2, 0], rotate([90, 0, 0], linearExtrude({ h: w }, polygon(pts))));

const outer = track([[0, 0], [Rb, 0], [Rt, H], [0, H]], L);
const cavity = track([[0, floor], [r0, floor], [r0 + (Hb + 2) * tanF, H + 2], [0, H + 2]], L + Rt + 10);
// cut the front open at x = L and slope the walls down toward it
const B = Rt + 5;
const zTop = (x) => H + 0.01 - (Hb - Hf) * x / L;
const keep = across([[-B, -1], [L, -1], [L, zTop(L)], [-B, zTop(-B)]], 2 * Rt + 4);

// the handle: a flat tongue on the bed running out the back (-x)
const w = Math.min(handleW, 2 * Rb - 2);
const t = Math.min(handleT, H);
const xt = -(Rb + handleL);                            // centre of the rounded tip
const parts = [
  intersection(outer, keep),
  hull(translate([-Rb + 1, -w / 2, 0], cube([1, w, t])), translate([xt, 0, 0], cylinder({ r: w / 2, h: t, $fn: 40 }))),
];
if (grip === "spine") {
  // a fin standing on the tongue, from high on the back wall down to the tip
  const ribT = Math.min(w * 0.35, Math.max(3, t));
  const ribTop = Math.max(t + 1, H * 0.7);
  const xOut = -(Rb + ribTop * tanF);
  const xEnd = xt + w / 2 + 1;
  parts.push(across([[-r0 + 1, 0], [-r0 + 1, ribTop], [xOut, ribTop], [xEnd, t], [xEnd, 0]], ribT));
}
const cuts = [cavity];
if (floorType === "slotted") {
  // straight slots through the floor, front to back, leaving a solid border
  const m = Math.max(4, wall + 2);
  const pitch = slotW + Math.max(2.4, slotW * 0.6);
  const ny = Math.max(1, Math.floor((2 * (r0 - m) - slotW) / pitch) + 1);
  for (let i = 0; i < ny; i++) {
    const y = (i - (ny - 1) / 2) * pitch;
    if (Math.abs(y) + slotW / 2 > r0 - m) continue;
    const x0 = -Math.sqrt(Math.max(0, (r0 - m) ** 2 - y * y)) + slotW / 2, x1 = L - m;
    if (x1 - x0 > slotW) cuts.push(translate([x0, y - slotW / 2, -1], cube([x1 - x0, slotW, floor + 2])));
  }
}
const hr = Math.min(hangHole, w - 6) / 2;
if (hr > 1) cuts.push(translate([xt, 0, -1], cylinder({ r: hr, h: t + 2, $fn: 24 })));
const scoop = difference(union(...parts), ...cuts);
return translate([-(L + xt - w / 2) / 2, 0, 0], scoop);
