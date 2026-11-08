// Wall toothbrush rack: a wall rack with front-opening notches the toothbrushes or razors hang in, screwed or taped to the wall.
// Print: as shown: shelf flat on the bed, back plate standing up (no supports). It mounts the same way up. PETG near water.
// Every number below is a slider (Params). From the BREPcode catalog: toothbrush-rack.
const slots = 4;         // [1:10] notches
const notchW = 10;       // [5:30] notch width, mm
const notchL = 18;       // [8:45] notch length, mm
const gapW = 14;         // [6:40] plastic between notches, mm
const depth = 44;        // [25:90] how far it sticks out from the wall, mm
const backH = 40;        // [20:100] back plate height, mm
const plateT = 4;        // [3:10] shelf thickness, mm
const backT = 4;         // [3:8] back plate thickness, mm
const screwD = 4.5;      // [3:6] screw hole diameter, mm
const mount = "screws";  // [screws, tape] how it mounts

// print = as hung: x along the wall, y out from the wall, z up
const gT = Math.max(3, backT);                        // end cheek thickness
const W = 2 * gT + slots * notchW + (slots + 1) * gapW;
const D = Math.max(depth, backT + notchW + 8);
const nL = Math.max(notchW / 2 + 2, Math.min(notchL, D - backT - 6));          // leave a bridge of plastic behind each notch
const rC = Math.min(6, (D - backT) / 3);              // rounded front corners

// a profile drawn in (x, z) and stood up as a wall from y0 to y0 + t
const inXZ = (pts, y0, t) => translate([0, y0 + t, 0], rotate([90, 0, 0], linearExtrude({ h: t }, polygon(pts))));
// a profile drawn in (y, z) and stood up from x0 to x0 + t
const inYZ = (pts, x0, t) => translate([x0, 0, 0], rotate([90, 90, 0], linearExtrude({ h: t }, polygon(pts))));

const shelfPlate = hull(
  cube([W, 1, plateT]),
  translate([rC, D - rC, 0], cylinder({ r: rC, h: plateT, $fn: 32 })),
  translate([W - rC, D - rC, 0], cylinder({ r: rC, h: plateT, $fn: 32 })),
);
const rT = Math.min(8, W / 4, (backH - plateT) / 2);   // rounded top corners on the back plate
const arcPts = (cx, a0, a1, n = 10) => Array.from({ length: n + 1 }, (_, i) => {
  const t = a0 + (a1 - a0) * i / n;
  return [cx + rT * Math.cos(t), backH - rT + rT * Math.sin(t)];
});
const backPlate = inXZ([[0, 0], [W, 0], ...arcPts(W - rT, 0, Math.PI / 2), ...arcPts(rT, Math.PI / 2, Math.PI)], 0, backT);
const cheek = [[backT - 0.01, plateT - 0.01], [D - rC - 1, plateT - 0.01], [backT - 0.01, backH - rT]];
let part = union(shelfPlate, backPlate, inYZ(cheek, 0, gT), inYZ(cheek, W - gT, gT));

// the notches: a straight U open to the front, with a flared mouth
const cuts = [];
const fl = Math.min(2, gapW / 4);
for (let i = 0; i < slots; i++) {
  const x = gT + gapW + notchW / 2 + i * (notchW + gapW);
  const y1 = D - nL + notchW / 2;
  cuts.push(hull(
    translate([x, y1, -1], cylinder({ r: notchW / 2, h: plateT + 2, $fn: 32 })),
    translate([x - notchW / 2, D - 1, -1], cube([notchW, 2, plateT + 2])),
  ));
  cuts.push(translate([0, 0, -1], linearExtrude({ h: plateT + 2 }, polygon([
    [x - notchW / 2, D - fl - 0.01], [x + notchW / 2, D - fl - 0.01], [x + notchW / 2 + fl, D + 0.01], [x - notchW / 2 - fl, D + 0.01]]))));
}

// screw holes through the back plate: teardrops (pointed up, so they print), countersunk on the room side
if (mount === "screws") {
  const r = screwD / 2;
  const zH = plateT + Math.max(r + 3, (backH - plateT) * 0.55);
  const tear = polygon([...Array.from({ length: 25 }, (_, i) => {
    const t = 3 * Math.PI / 4 + i * (3 * Math.PI / 2) / 24;
    return [r * Math.cos(t), r * Math.sin(t)];
  }), [0, r * Math.SQRT2]]);
  const xs = W < 70 ? [W / 2] : [W * 0.22, W * 0.78];
  for (const x of xs) {
    cuts.push(translate([x, backT + 1, zH], rotate([90, 0, 0], linearExtrude({ h: backT + 2 }, tear))));
    cuts.push(translate([x, backT + 0.01, zH], rotate([90, 0, 0], cylinder({ r1: r + r, r2: r, h: r, $fn: 32 }))));
  }
}
part = difference(part, ...cuts);
// turned so the notches face the front of the view
return rotate([0, 0, 180], translate([-W / 2, -D / 2, 0], part));
