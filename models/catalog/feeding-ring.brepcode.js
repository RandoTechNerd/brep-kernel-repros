// Fish feeding ring: a feeding ring that clips on the aquarium glass; also a shrimp feeding tube or a slotted worm-feeder cone.
// Print: upside down as shown (the clip's top on the bed), no supports. PETG; it lives in tank water.
// Every number below is a slider (Params). From the BREPcode catalog: feeding-ring.
const ringD = 60;       // [12:150] inside size of the ring (or the cone's mouth), mm
const ringH = 40;       // [15:300] how far the ring reaches down, mm
const shape = "round";  // [round, square, cone] round ring, square ring, or a slotted worm-feeder cone
const glassT = 6;       // [3:25] glass (or frame) thickness, mm
const armL = 15;        // [3:80] gap between the glass and the ring, mm
const legH = 25;        // [12:60] how far the clip hangs down the glass, mm
const wall = 2.4;       // [1.6:4] wall thickness, mm
const slitW = 2;        // [1:6] worm slit width (cone), mm

// print coordinates: z is depth below the rim, x across the glass (glass from 0 to g)
const g = glassT + 0.4;
const outL = Math.min(legH, Math.max(10, glassT + 8));
// the clip: a U drawn as used (y up), flipped so its top lies on the bed
const hanger = [[-wall, -outL], [0, -outL], [0.6, -outL + 1.2], [0, -outL + 2.4], [0, 0], [g, 0],
  [g, -legH], [g + wall, -legH], [g + wall, wall], [-wall, wall]].map(([x, y]) => [x, wall - y]);
const Ri = ringD / 2, Ro = Ri + wall;
const cx = g + wall + armL + Ro;
const armW = Math.max(10, Math.min(Ro, 16)), armT = Math.max(3, wall + 1);
// a side profile (x, z) stretched across y, centred
const across = (pts, w) => translate([0, w / 2, 0], rotate([90, 0, 0], linearExtrude({ h: w }, polygon(pts))));
const x0 = g + wall - 0.5;
const parts = [
  across(hanger, armW),
  translate([x0, -armW / 2, 0], cube([cx - x0, armW, armT])),
];
let holder, hollow;
const cuts = [];
if (shape === "cone") {
  // the cone narrows as it rises (down, in use); inside no steeper than 40 degrees
  const Hc = Math.max(ringH, Ri / Math.tan(40 * Math.PI / 180));
  const phi = Math.atan(Ri / Hc);
  const wh = wall / Math.cos(phi), wv = wall / Math.sin(phi);
  holder = translate([cx, 0, 0], revolve(360, polygon([[0, 0], [Ri + wh, 0], [0, Hc + wv]])));
  hollow = translate([cx, 0, 0], revolve(360, polygon([[0, -1], [Ri + Ri / Hc, -1], [0, Hc]])));
  // radial slits part way down, for the worms to wriggle out; spaced at
  // three slit widths where the cone is narrowest, so the tip stays strong
  const r1 = Ri * 0.35;
  const nS = Math.max(3, Math.floor(2 * Math.PI * r1 / (slitW * 3)));
  for (let k = 0; k < nS; k++) {
    cuts.push(translate([cx, 0, 0], rotate([0, 0, (k + 0.5) * 360 / nS],
      translate([0, -slitW / 2, Hc * 0.3], cube([Ri + wh + 2, slitW, Hc * 0.35])))));
  }
  parts.push(across([[x0, 0], [cx - Ri, 0], [cx - Ri, armT], [x0, Math.min(legH, 18)]], wall));
} else if (shape === "square") {
  holder = translate([cx - Ro, -Ro, 0], cube([2 * Ro, 2 * Ro, ringH]));
  hollow = translate([cx - Ri, -Ri, -1], cube([2 * Ri, 2 * Ri, ringH + 2]));
  parts.push(across([[x0, 0], [cx - Ro + 0.5, 0], [cx - Ro + 0.5, Math.min(ringH, legH)], [x0, legH]], wall));
} else {
  holder = translate([cx, 0, 0], cylinder({ r: Ro, h: ringH, $fn: 96 }));
  hollow = translate([cx, 0, -1], cylinder({ r: Ri, h: ringH + 2, $fn: 96 }));
  parts.push(across([[x0, 0], [cx - Ro + 0.5, 0], [cx - Ro + 0.5, Math.min(ringH, legH)], [x0, legH]], wall));
}
return translate([-cx / 2, 0, 0], difference(union(...parts, holder), hollow, ...cuts));
