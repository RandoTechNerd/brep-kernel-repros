// Built-up utensil grip: a fat ridged grip that a spoon, fork, pen or brush handle pushes into, for hands that cannot close tightly.
// Print: standing on end as shown, no supports. A snug push fit; a wrap of tape on the handle makes it tighter.
// Every number below is a slider (Params). From the BREPcode catalog: utensil-grip.
const gripD = 32;     // [18:50] grip diameter, mm
const length = 100;   // [40:160] grip length, mm
const holeW = 13;     // [3:30] hole width (diameter if round), mm
const holeT = 3.5;    // [1:15] hole thickness (flat handles), mm
const form = "flat";  // [flat, round] hole shape
const ridges = 4;     // [0:8] finger ridges

const R = gripD / 2;
const hw = Math.min(holeW, gripD - 6), ht = Math.min(holeT, hw);
const amp = ridges > 0 ? Math.min(1.5, R * 0.08) : 0;
// the outline turned about the axis: gentle finger ridges, eased in at both ends
const radius = (z) => {
  const ease = Math.min(1, z / 4, (length - z) / 4);
  return R - amp + amp * Math.cos(2 * Math.PI * ridges * z / length) - (1 - Math.max(0, ease)) * 1.6;
};
const prof = [[0, 0], ...Array.from({ length: 49 }, (_, i) => [radius(length * i / 48), length * i / 48]), [0, length]];
const body = revolve({ $fn: 64 }, polygon(prof));
// the hole: a round bore, or a rounded slot for a flat handle
const hole = form === "round"
  ? cylinder({ r: hw / 2 + 0.15, h: length + 2, $fn: 32 })
  : hull(...[-1, 1].map((s) => translate([s * (hw - ht) / 2, 0, 0], cylinder({ r: ht / 2 + 0.15, h: length + 2, $fn: 20 }))));
return difference(body, translate([0, 0, -1], hole));
