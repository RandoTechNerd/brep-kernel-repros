// Cat wall step: a wall-mounted step or shelf for cats with end gussets, a front lip and a carpet-pad recess; small, a reptile ledge.
// Print: upright as shown (step plate on the bed), no supports. PETG with 4+ walls and 40%+ infill; screw into studs or proper anchors with every hole, and press on it hard before a cat jumps on.
// Every number below is a slider (Params). From the BREPcode catalog: cat-wall-step.
const length = 240;      // [60:400] step length along the wall, mm
const depth = 200;       // [40:300] how far it sticks out, mm
const stepT = 8;         // [3:15] step plate thickness, mm
const backH = 70;        // [25:150] back plate height above the step, mm
const backT = 6;         // [3:12] back plate thickness, mm
const gusset = 0.7;      // [0.3:1] how far the end gussets reach forward (share of the depth)
const lipH = 15;         // [0:40] front lip height (0 = none), mm
const recess = 3;        // [0:6] carpet pad recess depth (0 = none), mm
const mount = "screws";  // [screws, tape, ties] screws, a flat back for tape or silicone, or zip-tie slots for cage bars
const screwD = 4.5;      // [3:6] screw diameter, mm

// x along the wall, y out from it (back plate at y = 0), z up
const lip = Math.min(lipH, 60);
const lipT = lip > 0 ? Math.max(4, stepT * 0.6) : 0;
const gT = Math.max(5, backT);                              // gusset thickness
const gD = Math.max(backT + 5, gusset * depth);             // how far a gusset reaches out
const gH = Math.max(stepT + 5, backH * 0.9);                // and how high up the back
const across = (pts, w, x0) => translate([x0, 0, 0], rotate([0, 0, 90], rotate([90, 0, 0], linearExtrude({ h: w }, polygon(pts)))));
const parts = [
  cube([length, depth, stepT]),                             // the step
  cube([length, backT, stepT + backH]),                     // the back plate
  // end gussets: triangles in (y, z), standing up at each end
  across([[backT - 0.01, stepT - 0.01], [gD, stepT - 0.01], [backT - 0.01, stepT + gH]], gT, 0),
  across([[backT - 0.01, stepT - 0.01], [gD, stepT - 0.01], [backT - 0.01, stepT + gH]], gT, length - gT),
];
if (lip > 0) parts.push(translate([0, depth - lipT, stepT - 0.01], cube([length, lipT, lip + 0.01])));
const cuts = [];
// the carpet pad recess, inside the gussets and the lip
const rd = Math.min(recess, stepT - 2.4);
if (rd > 0.2) {
  const m = 4;
  const x0 = gT + m, x1 = length - gT - m, y0 = backT + m, y1 = depth - lipT - m;
  if (x1 - x0 > 10 && y1 - y0 > 10) cuts.push(translate([x0, y0, stepT - rd], cube([x1 - x0, y1 - y0, rd + 1])));
}
// fixings through the back plate, high enough to clear the gussets' feet
const nH = length > 200 ? 3 : 2;
const xs = Array.from({ length: nH }, (_, i) => gT + 12 + (length - 2 * gT - 24) * i / (nH - 1));
const zH = stepT + Math.max(backH * 0.6, Math.min(backH - 8, 15));
if (mount === "screws") {
  const k = Math.min(screwD / 2 + 0.5, backT - 1.5);
  for (const x of xs) {
    cuts.push(translate([x, -1, zH], rotate([-90, 0, 0], cylinder({ r: screwD / 2, h: backT + 2, $fn: 24 }))));
    cuts.push(translate([x, backT - k, zH], rotate([-90, 0, 0], cylinder({ r1: screwD / 2, r2: screwD / 2 + k + 0.02, h: k + 0.02, $fn: 24 }))));
  }
} else if (mount === "ties") {
  // pairs of narrow slots: the tie goes out one, round a bar, and back in the other
  for (const x of xs) for (const dx of [-5, 3]) {
    cuts.push(translate([x + dx, -1, zH - 3], cube([2.5, backT + 2, 6])));
  }
}
const step = cuts.length ? difference(union(...parts), ...cuts) : union(...parts);
return translate([-length / 2, -depth / 2, 0], step);
