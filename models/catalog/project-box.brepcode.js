// Project box: an electronics enclosure with corner screw posts, a screw-down lid, and optional vents, panel holes and a cable notch.
// Print: box upright, lid beside it outside face up, no supports. M3 screws self-tap into the posts.
// Every number below is a slider (Params). From the BREPcode catalog: project-box.
const width = 80;   // [30:220] outside width, mm
const depth = 60;   // [25:180] outside depth, mm
const height = 35;  // [15:120] box height, mm
const wall = 2;     // [1.6:4] wall thickness, mm
const cornerR = 4;  // [1:6] corner radius, mm
const vents = 0;    // [0:12] vent slots per long side
const holes = 0;    // [0:8] panel holes in the lid
const holeD = 16;   // [6:30] panel hole diameter, mm
const cableD = 0;   // [0:20] cable notch in one end (0 = none), mm
const tabs = "no";  // [no, yes] mounting tabs

const pr = Math.max(3.2, wall + 1.2);                // corner post radius, round an M3 self-tapping screw
const rr = Math.min(cornerR, wall + pr);             // the posts nest into the corners
const rounded = (w, d, h, r, z = 0) => hull(...[[-1, -1], [1, -1], [1, 1], [-1, 1]].map(([sx, sy]) =>
  translate([sx * (w / 2 - r), sy * (d / 2 - r), z], cylinder({ r, h, $fn: 32 }))));
const floor = wall;
const iw = width - 2 * wall, id = depth - 2 * wall;
const px = width / 2 - wall - pr + 0.8, py = depth / 2 - wall - pr + 0.8;
const posts = [[-1, -1], [1, -1], [1, 1], [-1, 1]].map(([sx, sy]) => translate([sx * px, sy * py, floor - 0.01], cylinder({ r: pr, h: height - floor + 0.01, $fn: 24 })));
const parts = [difference(rounded(width, depth, height, rr), rounded(iw, id, height, Math.max(0.5, rr - wall), floor)), ...posts];
if (tabs === "yes") {
  for (const s of [-1, 1]) parts.push(difference(
    translate([s > 0 ? width / 2 - 0.5 : -width / 2 - 11.5, -Math.min(depth, 30) / 2, 0], cube([12, Math.min(depth, 30), wall * 1.5])),
    translate([s * (width / 2 + 6), 0, -1], cylinder({ d: 4.5, h: wall * 1.5 + 2, $fn: 20 }))));
}
const cuts = [...[[-1, -1], [1, -1], [1, 1], [-1, 1]].map(([sx, sy]) => translate([sx * px, sy * py, floor + 2], cylinder({ d: 2.6, h: height, $fn: 16 })))];
// vents: tall narrow slots through both long walls
const ventH = Math.max(4, (height - floor) * 0.5);
const ventP = Math.max(5, wall + 3);
for (let i = 0; i < vents; i++) {
  const x = (i - (vents - 1) / 2) * ventP;
  if (Math.abs(x) > iw / 2 - pr * 2 - 2) continue;
  for (const s of [-1, 1]) cuts.push(translate([x - 1, s * (depth / 2 - wall / 2) - wall, floor + (height - floor - ventH) / 2], cube([2, 2 * wall, ventH])));
}
// a cable notch down from the rim of the +x end; the lid closes its top
if (cableD > 0) {
  const r = Math.min(cableD / 2, id / 2 - pr * 2, height - floor - 2) ;
  if (r > 0.5) cuts.push(translate([width / 2 - wall - 1, 0, height - r - 1], union(
    rotate([0, 90, 0], translate([0, 0, 0], cylinder({ r, h: wall + 2, $fn: 24 }))),
    translate([0, -r, 0], cube([wall + 2, 2 * r, r + 2])))));
}
const box = difference(union(...parts), ...cuts);
// the lid: a plate with countersunk holes over the posts and the panel holes
const lt = Math.max(2, wall);
const lidCuts = [[-1, -1], [1, -1], [1, 1], [-1, 1]].flatMap(([sx, sy]) => [
  translate([sx * px, sy * py, -1], cylinder({ d: 3.4, h: lt + 2, $fn: 16 })),
  translate([sx * px, sy * py, lt - 1.4], cylinder({ r1: 1.7, r2: 3.1, h: 1.41, $fn: 16 })),
]);
const hd = Math.min(holeD, id - 4, iw - 4);
const hp = hd + 6;
const nh = Math.min(holes, Math.max(0, Math.floor((iw - 2 * pr - 4) / hp)));
for (let i = 0; i < nh; i++) lidCuts.push(translate([(i - (nh - 1) / 2) * hp, 0, -1], cylinder({ d: hd, h: lt + 2, $fn: 40 })));
const lid = difference(rounded(width, depth, lt, rr), ...lidCuts);
return group(box, translate([0, depth + 10, 0], lid));
