// Shower curtain hook: a snap-on shower curtain ring with a J-hook for the curtain, single or double, sized to the rod.
// Print: flat as shown, no supports. PETG springs back best; print a dozen (most curtains have 12 holes).
// Every number below is a slider (Params). From the BREPcode catalog: shower-curtain-ring.
const rodD = 25.4;  // [12:45] rod diameter, mm
const clear = 1.5;  // [0.3:4] room round the rod, mm
const ringT = 4;    // [2.5:8] ring and hook band width, mm
const thick = 5;    // [3:10] thickness (printed height), mm
const snap = 0.85;  // [0:0.95] snap opening as a share of the rod (0 = closed ring)
const hookD = 12;   // [6:40] curtain hook inside diameter, mm
const drop = 10;    // [2:60] stem between the ring and the hook, mm
const hooks = 1;    // [1:2] hooks (2 = curtain and liner)

// flat profile in x, y (the rod runs along z through the ring); extruded `thick`
const ri = rodD / 2 + clear, ro = ri + ringT;
const arc = (cx, cy, r, a0, a1, n) => Array.from({ length: n + 1 }, (_, i) => {
  const t = a0 + (a1 - a0) * i / n;
  return [cx + r * Math.cos(t), cy + r * Math.sin(t)];
});
const prism = (pts) => linearExtrude({ h: thick }, polygon(pts));
const deg = Math.PI / 180;

// the ring: a C open toward the upper right (a parallel-sided gap), or two halves of a closed ring
const parts = [];
const w = snap * rodD;
if (w > 0.5) {
  const g = 20 * deg;                                     // where the opening faces
  const ao = Math.asin(Math.min(0.99, w / 2 / ro)), ai = Math.asin(Math.min(0.99, w / 2 / ri));
  parts.push(prism([...arc(0, 0, ro, g + ao, g + 2 * Math.PI - ao, 40), ...arc(0, 0, ri, g + 2 * Math.PI - ai, g + ai, 40)]));
} else {
  parts.push(prism([...arc(0, 0, ro, -0.02, Math.PI + 0.02, 24), ...arc(0, 0, ri, Math.PI + 0.02, -0.02, 24)]));
  parts.push(prism([...arc(0, 0, ro, Math.PI, 2 * Math.PI, 24), ...arc(0, 0, ri, 2 * Math.PI, Math.PI, 24)]));
}

// the stem and the J-hook(s): the hook's band meets the stem at its side, then curls down and up
const hr = hookD / 2, rm = hr + ringT / 2;
const cy = -(ro + drop + hr * 0.3);
parts.push(prism([[-ringT / 2, cy - ringT / 2], [ringT / 2, cy - ringT / 2], [ringT / 2, -ri - 0.5], [-ringT / 2, -ri - 0.5]]));
const tipA = 30 * deg;
for (const sx of hooks > 1 ? [1, -1] : [1]) {
  const band = [...arc(rm, cy, hr + ringT, Math.PI, 2 * Math.PI + tipA, 28), ...arc(rm, cy, hr, 2 * Math.PI + tipA, Math.PI, 28)];
  const tip = arc(rm + rm * Math.cos(tipA), cy + rm * Math.sin(tipA), ringT / 2, 0, 2 * Math.PI - 0.2, 16);
  parts.push(prism(band.map(([x, y]) => [sx * x, y])));
  parts.push(prism(tip.map(([x, y]) => [sx * x, y])));
}
return translate([0, -cy / 2, 0], union(...parts));
