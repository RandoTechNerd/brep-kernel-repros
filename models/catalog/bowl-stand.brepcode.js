// Elevated bowl stand: a raised feeder that holds one to four stainless bowls by their rims, with arched legs.
// Print: upside down as shown (top plate on the bed), no supports. Turn it over to use; the bowls drop in from the top and hang by their rims.
// Every number below is a slider (Params). From the BREPcode catalog: bowl-stand.
const bowlD = 120;      // [60:300] bowl diameter across its rim, mm
const rimW = 8;         // [3:20] how much rim rests on the plate (hole = rim minus twice this), mm
const count = 2;        // [1:4] number of bowls
const height = 100;     // [40:300] stand height, mm
const gap = 6;          // [2:60] space between the bowl rims, mm
const wall = 4;         // [2.4:8] wall thickness, mm
const plateT = 4;       // [3:10] top plate thickness, mm
const legs = "arches";  // [arches, solid] arched legs, or solid sides
const archH = 0.55;     // [0.2:0.85] arch height as a share of the stand height
const legW = 24;        // [10:60] leg width, mm

// print orientation: the top plate on the bed, walls rising to the floor end
const n = count;
const edge = Math.max(2, wall / 2);                      // plate beyond the rims
const pitch = bowlD + gap;
const Lp = n * bowlD + (n - 1) * gap + 2 * edge;
const Wp = bowlD + 2 * edge;
const H = Math.max(height, plateT + 12);
const rc = Math.min(Wp / 2 - 0.5, Math.max(6, bowlD * 0.15));
// a rounded rectangle w x d, h tall, centred, standing at z
const rounded = (w, d, h, r, z = 0) => hull(...[[-1, -1], [1, -1], [-1, 1], [1, 1]].map(([sx, sy]) =>
  translate([sx * (w / 2 - r), sy * (d / 2 - r), z], cylinder({ r, h, $fn: 48 }))));
const xs = Array.from({ length: n }, (_, i) => (i - (n - 1) / 2) * pitch);
const holeR = Math.max(10, Math.min(bowlD / 2 - rimW, bowlD / 2 + edge - wall - 1.5));

const parts = [
  rounded(Lp, Wp, plateT, rc),
  difference(rounded(Lp, Wp, H, rc), rounded(Lp - 2 * wall, Wp - 2 * wall, H + 2, Math.max(1, rc - wall), -1)),
];
// a wall between each pair of bowls, where the rims leave room for it
const dT = Math.min(wall, pitch - 2 * holeR - 2);
if (dT >= 1.6) for (let i = 1; i < n; i++) {
  parts.push(translate([(xs[i - 1] + xs[i]) / 2 - dT / 2, -Wp / 2 + wall - 0.5, 0], cube([dT, Wp - 2 * wall + 1, H])));
}
const cuts = xs.map((x) => translate([x, 0, -1], cylinder({ r: holeR, h: plateT + 2, $fn: 96 })));

if (legs === "arches") {
  // U notches down from the free edge, their bottoms rounded: arches in use
  const depthN = Math.min(archH * (H - plateT), H - plateT - 3);
  const zN = H - depthN;
  const uNotch = (wN) => {
    const r = Math.max(1, Math.min(depthN * 0.9, wN / 2 - 0.5, Math.max(8, wN * 0.3)));
    const arc = (cx, a0, a1, N = 16) => Array.from({ length: N + 1 }, (_, i) => {
      const a = a0 + (a1 - a0) * i / N;
      return [cx + r * Math.cos(a), zN + r + r * Math.sin(a)];
    });
    return [[-wN / 2, H + 1], ...arc(-wN / 2 + r, Math.PI, 1.5 * Math.PI), ...arc(wN / 2 - r, 1.5 * Math.PI, 2 * Math.PI), [wN / 2, H + 1]];
  };
  // a profile in (x, z) cut straight through both long walls
  const thruY = (pts, x0) => translate([x0, Wp / 2 + 1, 0], rotate([90, 0, 0], linearExtrude({ h: Wp + 2 }, polygon(pts))));
  // a profile in (y, z) cut along the whole length (ends and dividers)
  const thruX = (pts) => translate([-Lp / 2 - 1, 0, 0], rotate([0, 0, 90], rotate([90, 0, 0], linearExtrude({ h: Lp + 2 }, polygon(pts)))));
  const lw = Math.min(legW, pitch / 3, Wp / 3);
  for (let i = 0; i < n; i++) {
    const x0 = i === 0 ? -Lp / 2 + rc + lw / 2 : (xs[i - 1] + xs[i]) / 2 + lw / 2;
    const x1 = i === n - 1 ? Lp / 2 - rc - lw / 2 : (xs[i] + xs[i + 1]) / 2 - lw / 2;
    if (x1 - x0 > 10) cuts.push(thruY(uNotch(x1 - x0), (x0 + x1) / 2));
  }
  if (Wp - 2 * rc - lw > 10) cuts.push(thruX(uNotch(Wp - 2 * rc - lw)));
}
return difference(union(...parts), ...cuts);
