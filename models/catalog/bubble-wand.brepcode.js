// Bubble wand: a flat bubble wand: one notched ring or a cluster of them on a handle.
// Print: flat as shown, no supports. One piece with no small parts.
// Every number below is a slider (Params). From the BREPcode catalog: bubble-wand.
const ringD = 70;     // [25:180] ring inside diameter, mm
const band = 6;       // [3:12] ring band width, mm
const rings = 1;      // [1:7] rings (1, or a cluster up to 7)
const handleL = 110;  // [40:200] handle length, mm
const handleW = 14;   // [8:25] handle width, mm
const thick = 4;      // [2:8] thickness, mm
const notches = 24;   // [0:48] notches round each ring

const ri = ringD / 2, ro = ri + band;
// the cluster: one ring, or a ring with up to six round it, bands overlapping so they join
const centres = [[0, 0]];
for (let i = 0; i < rings - 1; i++) centres.push([(ringD + band) * Math.cos(Math.PI / 2 + i * Math.PI / 3), (ringD + band) * Math.sin(Math.PI / 2 + i * Math.PI / 3)]);
const ext = rings > 1 ? ringD + band + ro : ro;          // how far the cluster reaches down
// a ring's hole, its edge zig-zagged into notches that hold the bubble film
const hole = (n = Math.max(notches, 0)) => {
  if (n < 6) return cylinder({ r: ri, h: thick + 2, $fn: 64 });
  const pts = [];
  for (let i = 0; i < 2 * n; i++) { const t = Math.PI * i / n, r = i % 2 ? ri + Math.min(1.2, band / 3) : ri; pts.push([r * Math.cos(t), r * Math.sin(t)]); }
  return linearExtrude({ h: thick + 2 }, polygon(pts));
};
const discs = centres.map(([x, y]) => translate([x, y, 0], cylinder({ r: ro, h: thick, $fn: 64 })));
const handleBar = translate([-handleW / 2, -ext - handleL + band, 0], cube([handleW, handleL, thick]));
const end = translate([0, -ext - handleL + band, 0], cylinder({ r: handleW * 0.75, h: thick, $fn: 32 }));
const holes = centres.map(([x, y]) => translate([x, y, -1], hole()));
const wand = difference(union(...discs, handleBar, end), ...holes);
return translate([0, (handleL + ext) / 2 - ro / 2, 0], wand);
