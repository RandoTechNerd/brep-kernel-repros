// Wall ring holder: a wall-mounted tapered ring for a hair dryer, curling iron, straightener or shower head, with an optional gap for the hose or cord.
// Print: upright as shown, exactly as it hangs; no supports. PETG near a hot tool or in the shower.
// Every number below is a slider (Params). From the BREPcode catalog: wall-ring-holder.
const topD = 74;         // [15:130] ring opening at the top, mm
const botD = 56;         // [10:130] ring opening at the bottom (smaller = more taper), mm
const ringH = 30;        // [10:80] ring height, mm
const gap = 0;           // [0:60] gap in the front for a hose or cord (0 = closed ring), mm
const wallT = 4;         // [2.5:10] ring wall thickness, mm
const offWall = 18;      // [0:80] room between the wall and the ring, mm
const rings = 1;         // [1:4] rings side by side
const plateW = 60;       // [30:220] wall plate width, mm
const plateH = 75;       // [30:200] wall plate height, mm
const plateT = 5;        // [3:10] wall plate thickness, mm
const screwD = 4.5;      // [3:6] screw hole diameter, mm
const mount = "screws";  // [screws, tape] how it mounts

// print = as hung: x along the wall, the wall at y = plateT, the ring out toward -y, z up
const rT = topD / 2, rB = Math.min(botD, topD) / 2;   // never narrower at the top
const Ro = rT + wallT;
const sp = Math.max(6, wallT * 1.5);                  // between neighbouring rings
const W = Math.max(plateW, rings * 2 * Ro + (rings - 1) * sp + 12);
const g = Math.max(0, Math.min(14, offWall + wallT * 0.8, (plateH - ringH) * 0.35));
const minH = ringH + g + (mount === "screws" ? 4 * screwD + 10 : 4);
const H = Math.max(plateH, minH);
const yc = -(offWall + Ro);
const armW = Math.min(Ro * 1.2, 2 * Ro - 2);

// a profile drawn in (x, z) and stood up as a wall from y0 to y0 + t
const inXZ = (pts, y0, t) => translate([0, y0 + t, 0], rotate([90, 0, 0], linearExtrude({ h: t }, polygon(pts))));
// a profile drawn in (y, z) and stood up from x0 to x0 + t
const inYZ = (pts, x0, t) => translate([x0, 0, 0], rotate([90, 90, 0], linearExtrude({ h: t }, polygon(pts))));

const rc = Math.min(10, W / 4, (H - ringH) / 2);
const arcPts = (cx, a0, a1, n = 8) => Array.from({ length: n + 1 }, (_, i) => {
  const t = a0 + (a1 - a0) * i / n;
  return [cx + rc * Math.cos(t), H - rc + rc * Math.sin(t)];
});
const parts = [inXZ([[-W / 2, 0], [W / 2, 0], ...arcPts(W / 2 - rc, 0, Math.PI / 2), ...arcPts(-W / 2 + rc, Math.PI / 2, Math.PI)], 0, plateT)];
const centers = Array.from({ length: rings }, (_, i) => (i - (rings - 1) / 2) * (2 * Ro + sp));
for (const xc of centers) {
  parts.push(translate([xc, yc, 0], cylinder({ r: Ro, h: ringH, $fn: 64 })));
  parts.push(translate([xc - armW / 2, yc, 0], cube([armW, plateT / 2 - yc, ringH])));
  if (g > 0.5) parts.push(inYZ([[plateT / 2, ringH - 0.01], [plateT / 2, ringH + g], [-g, ringH - 0.01]], xc - armW / 2, armW));
}
const cuts = [];
const gw = Math.min(gap, 1.8 * rB);
for (const xc of centers) {
  // the tapered bore: wider at the top, so it never overhangs
  cuts.push(translate([xc, yc, -0.01], cylinder({ r1: rB, r2: rT, h: ringH + 0.02, $fn: 64 })));
  if (gw > 0) cuts.push(translate([xc - gw / 2, yc - Ro - 1, -1], cube([gw, Ro + 1, ringH + 2])));
}

// screw holes above the ring: teardrops pointed up (they print), countersunk on the room side
if (mount === "screws") {
  const r = screwD / 2;
  const zS = ringH + g + (H - ringH - g) / 2;
  const tear = polygon([...Array.from({ length: 25 }, (_, i) => {
    const t = 3 * Math.PI / 4 + i * (3 * Math.PI / 2) / 24;
    return [r * Math.cos(t), r * Math.sin(t)];
  }), [0, r * Math.SQRT2]]);
  const xs = W >= 50 ? [-W / 2 + 2 * screwD + 5, W / 2 - 2 * screwD - 5] : [0];
  for (const x of xs) {
    cuts.push(translate([x, plateT + 1, zS], rotate([90, 0, 0], linearExtrude({ h: plateT + 2 }, tear))));
    cuts.push(translate([x, -0.01, zS], rotate([-90, 0, 0], cylinder({ r1: 2 * r, r2: r, h: r, $fn: 32 }))));
  }
}
return translate([0, -yc / 2, 0], difference(union(...parts), ...cuts));
