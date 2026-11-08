// Business card holder: an open holder for business cards, sticky notes or index cards, low at the front with a finger notch.
// Print: upright as shown, no supports.
// Every number below is a slider (Params). From the BREPcode catalog: note-tray.
const itemW = 92;   // [30:220] inside width, mm
const itemD = 30;   // [10:200] inside depth front to back, mm
const frontH = 18;  // [5:80] front wall height, mm
const backH = 35;   // [5:120] back wall height, mm
const wall = 2.4;   // [1.6:6] wall thickness, mm
const floor = 2.5;  // [1.6:6] floor thickness, mm
const notchW = 28;  // [0:80] finger notch width (0 = none), mm
const cornerR = 4;  // [0.5:15] corner radius, mm

const W = itemW + 2 * wall, D = itemD + 2 * wall, H = Math.max(frontH, backH);
const r = Math.max(0.5, Math.min(cornerR, W / 2 - 0.5, D / 2 - 0.5));
// a rounded rectangle w x d, h tall, from (x, y, z)
const rounded = (x, y, z, w, d, h, rr) => hull(...[[rr, rr], [w - rr, rr], [rr, d - rr], [w - rr, d - rr]].map(([cx, cy]) =>
  translate([x + cx, y + cy, z], cylinder({ r: rr, h, $fn: 32 }))));
// side profile (x front to back, y up) pushed across the width
const side = translate([-1, 0, 0], rotate([0, 0, 90], rotate([90, 0, 0],
  linearExtrude({ h: W + 2 }, polygon([[0, 0], [D, 0], [D, backH], [0, frontH]])))));
const outer = intersection(rounded(0, 0, 0, W, D, H + 1, r), side);
const cuts = [rounded(wall, wall, floor, itemW, itemD, H + 2, Math.max(0.4, r - wall))];
const nw = Math.min(notchW, itemW - 4);
if (nw > 0) {
  const zb = Math.max(floor + 1.5, frontH * 0.3) + nw / 2;
  cuts.push(translate([W / 2 - nw / 2, -1, zb], cube([nw, wall + 2, H + 2])));
  cuts.push(translate([W / 2, wall + 1, zb], rotate([90, 0, 0], cylinder({ r: nw / 2, h: wall + 2, $fn: 40 }))));
}
return translate([-W / 2, -D / 2, 0], difference(outer, ...cuts));
