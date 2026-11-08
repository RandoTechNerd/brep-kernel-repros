// Mail holder: a wall pocket for mail and letters, with one or more stepped pockets.
// Print: upright as shown, no supports.
// Every number below is a slider (Params). From the BREPcode catalog: mail-holder.
const width = 200;   // [60:250] width, mm
const depth = 40;    // [15:120] pocket depth, mm
const pocketH = 90;  // [30:220] pocket height at the back, mm
const frontH = 55;   // [10:220] front height, mm
const backH = 150;   // [40:250] back plate height, mm
const pockets = 1;   // [1:4] pockets, front to back
const wall = 2.4;    // [1.6:5] wall thickness, mm
const screwD = 4.5;  // [3:6] screw diameter, mm

// x across, y out from the wall, z up
const ph = Math.min(pocketH, backH);
const fh = Math.min(frontH, ph);
const bT = Math.max(3, wall);
const d = Math.max(depth, bT + wall + 8);
// rotate([90, 90, 0]) sends a side outline's x to y, its y to z, the width to +x
const inYZ = (pts, x, w) => translate([x, 0, 0], rotate([90, 90, 0], linearExtrude({ h: w }, polygon(pts))));
// the whole side view (back plate and the pocket's sloping sides) stretched
// across, minus the pocket itself between the two side walls
const side = [[0, 0], [d, 0], [d, fh], [bT, ph], ...(ph < backH - 0.5 ? [[bT, backH]] : []), [0, backH]];
const cavity = [[bT, wall], [d - wall, wall], [d - wall, backH + 1], [bT, backH + 1]];
const parts = [difference(inYZ(side, 0, width), inYZ(cavity, wall, width - 2 * wall))];
// stepped dividers between the pockets, each lower than the one behind it
for (let i = 1; i < pockets; i++) {
  const y = bT + (d - bT) * i / pockets;
  const h = fh + (ph - fh) * (1 - i / pockets);
  parts.push(translate([wall - 0.1, y - wall / 2, wall - 0.1], cube([width - 2 * wall + 0.2, wall, h - wall + 0.1])));
}
// countersunk screw holes through the back plate, the heads inside the pocket
const r = screwD / 2;
const zh = backH - ph >= 5 * screwD ? (ph + backH) / 2 : Math.max(wall + 2 * screwD, ph * 0.6);
const k = Math.min(r, bT - 1.2);
const holes = [width * 0.2, width * 0.8].flatMap((x) => [
  translate([x, -1, zh], rotate([-90, 0, 0], cylinder({ r, h: bT + 2, $fn: 24 }))),
  translate([x, bT - k + 0.02, zh], rotate([-90, 0, 0], cylinder({ r1: r, r2: r + k, h: k, $fn: 24 }))),
]);
return translate([-width / 2, 0, 0], difference(union(...parts), ...holes));
