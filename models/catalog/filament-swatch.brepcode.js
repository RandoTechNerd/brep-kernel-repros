// Filament swatch: a sample card with stepped thicknesses and a ring hole, to keep a swatch of every filament.
// Print: flat as shown, no supports.
// Every number below is a slider (Params). From the BREPcode catalog: filament-swatch.
const width = 60;   // [30:100] card width, mm
const height = 30;  // [15:60] card height, mm
const steps = 4;    // [1:8] thickness steps
const stepT = 0.6;  // [0.2:1.2] thickness of each step, mm
const holeD = 5;    // [0:8] ring hole (0 = none), mm

const T = steps * stepT;
const r = Math.min(4, height / 4);
const card = hull(...[[-1, -1], [1, -1], [1, 1], [-1, 1]].map(([sx, sy]) =>
  translate([sx * (width / 2 - r), sy * (height / 2 - r), 0], cylinder({ r, h: T, $fn: 32 }))));
const tab = Math.max(holeD + 6, width * 0.2);         // the full-thickness tab holding the ring hole
const x0 = -width / 2 + tab, bw = (width - tab) / steps;
const cuts = [];
for (let j = 1; j < steps; j++) {
  cuts.push(translate([x0 + j * bw, -height / 2 - 1, (steps - j) * stepT], cube([width, height + 2, T])));
}
if (holeD > 0) cuts.push(translate([-width / 2 + tab / 2, 0, -1], cylinder({ d: holeD, h: T + 2, $fn: 24 })));
return cuts.length ? difference(card, ...cuts) : card;
