// Charging dock: a dock that holds an earbud case on its charging plug, or a watch charger puck, with the cable routed out the back.
// Print: upright as shown, no supports. Push the plug up through the slot from below.
// Every number below is a slider (Params). From the BREPcode catalog: charging-dock.
const devW = 60.6;    // [10:120] case width (or puck diameter), mm
const devT = 21.7;    // [5:60] case thickness, mm
const pocket = 15;    // [4:50] pocket depth, mm
const plugW = 12;     // [0:20] plug slot width (0 = cable out the top), mm
const cableD = 4;     // [2:8] cable diameter, mm
const baseH = 14;     // [6:40] base under the pocket, mm
const wall = 3;       // [2:8] wall thickness, mm
const form = "rect";  // [rect, round] pocket shape

const fit = Math.min(0.4, wall / 5);
const round = form === "round";
const pw = devW + 2 * fit, pt = (round ? devW : devT) + 2 * fit;
const W = Math.max(pw + 2 * wall, 40), D = Math.max(pt + 2 * wall, 40);
const H = baseH + pocket;
const rounded = (w, d, h, r, z = 0) => hull(...[[-1, -1], [1, -1], [1, 1], [-1, 1]].map(([sx, sy]) =>
  translate([sx * (w / 2 - r), sy * (d / 2 - r), z], cylinder({ r, h, $fn: 32 }))));
const block = rounded(W, D, H, Math.min(8, W / 4, D / 4));
const cuts = [round
  ? translate([0, 0, baseH], cylinder({ d: pw, h: pocket + 1, $fn: 64 }))
  : rounded(pw, pt, pocket + 1, Math.min(pt / 2 - 0.1, 6), baseH)];
const ct = cableD + 1.5;                             // cable channel width
if (plugW > 0 && !round) {
  // the plug comes up through the floor; its cable leaves along the bed under a 45 degree roof
  const pT = Math.min(8, pt - 2);
  cuts.push(translate([-plugW / 2, -pT / 2, -1], cube([plugW, pT, baseH + 1.01])));
  const th = Math.min(cableD + 1, baseH - 4);
  // rotate([90, 0, 0]) keeps the profile's x, sends its y to z, and the extrusion to -y
  cuts.push(translate([0, D / 2 + 1, 0], rotate([90, 0, 0], linearExtrude({ h: D / 2 + 1 },
    polygon([[-ct / 2, -1], [ct / 2, -1], [ct / 2, th], [0, th + ct / 2], [-ct / 2, th]])))));
} else {
  // the cable leaves the pocket through a groove in the top, out the back
  cuts.push(translate([-ct / 2, 0, baseH], cube([ct, D / 2 + 1, pocket + 1])));
}
return difference(block, ...cuts);
