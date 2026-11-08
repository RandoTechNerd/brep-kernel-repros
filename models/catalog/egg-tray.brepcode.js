// Egg holder: a tray of egg-shaped cups for the fridge or the counter, sized to the eggs.
// Print: upright as shown, no supports. PETG if it lives in the fridge door.
// Every number below is a slider (Params). From the BREPcode catalog: egg-tray.
const eggs = 12;    // [1:36] number of eggs
const rows = 3;     // [1:6] rows
const eggD = 44;    // [22:62] egg diameter, mm
const depthP = 21;  // [8:36] cup depth, mm
const wall = 2;     // [1.2:4] cup wall at the rim, mm
const floorT = 2;   // [1.2:5] base thickness, mm

const a = eggD / 2 + 1;                          // the hollow, a millimetre round the egg
const Rc = a + wall;
const H = floorT + depthP;
const pitch = 2 * Rc - wall * 0.5;               // neighbours overlap so the tray is one piece
// one cup: a cylinder with the lower half of an egg hollowed out of it
const half = (n = 10) => Array.from({ length: n + 1 }, (_, i) => {
  const t = (Math.PI / 2) * i / n;
  return [a * Math.sin(t), H - depthP * Math.cos(t)];
});
const cupAt = (x, y) => translate([x, y, 0], difference(
  cylinder({ r: Rc, h: H, $fn: 40 }),
  revolve({ angle: 360, $fn: 40 }, polygon([[0, floorT], ...half().slice(1), [a, H + 1], [0, H + 1]])),
));
const nr = Math.min(rows, eggs), nc = Math.ceil(eggs / nr);
const W = (nc - 1) * pitch, Dp = (nr - 1) * pitch;
const cups = [];
for (let k = 0; k < eggs; k++) cups.push(cupAt((k % nc) * pitch - W / 2, Math.floor(k / nc) * pitch - Dp / 2));
const r = Rc * 0.6;
const base = hull(...[[-1, -1], [1, -1], [-1, 1], [1, 1]].map(([sx, sy]) =>
  translate([sx * (W / 2 + Rc - r), sy * (Dp / 2 + Rc - r), 0], cylinder({ r, h: floorT, $fn: 32 }))));
return union(base, ...cups);
