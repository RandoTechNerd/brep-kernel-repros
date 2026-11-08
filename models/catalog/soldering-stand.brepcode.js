// Soldering iron stand: a stand that rests a soldering iron at an angle in two cradles, with a tray for the tip-cleaning sponge.
// Print: upright as shown, no supports. PETG or ABS near the tip.
// Every number below is a slider (Params). From the BREPcode catalog: soldering-stand.
const ironD = 16;      // [8:30] grip diameter, mm
const angle = 25;      // [10:45] angle of the iron, degrees
const length = 150;    // [90:220] base length, mm
const width = 70;      // [40:140] base width, mm
const wall = 3;        // [2:6] wall thickness, mm
const sponge = "yes";  // [no, yes] sponge tray

const baseT = Math.max(3, wall);
const r = Math.min(8, width / 4);
const base = hull(...[[-1, -1], [1, -1], [1, 1], [-1, 1]].map(([sx, sy]) =>
  translate([sx * (length / 2 - r), sy * (width / 2 - r), 0], cylinder({ r, h: baseT, $fn: 24 }))));
// cradles: the tip points to -x, down the slope
const ct = Math.max(5, wall * 1.6);                  // cradle thickness along the iron
const x2 = length / 2 - ct - 6, span = length * 0.5;
const x1 = x2 - span;
const r1 = ironD * 0.35 + 1, r2 = ironD / 2 + 1;     // front cups the shaft, rear the grip
const z1 = baseT + r1 + 8, z2 = z1 + span * Math.tan(angle * Math.PI / 180);
// a cradle: a trapezoid across the base (y, z) with a U notch on top, standing at x
// rotate([90, 90, 0]) sends the profile's x to y, its y to z, and the extrusion to +x
const cradle = (x, zc, rn) => {
  // narrower at the top than the bottom, so the sides never lean out
  const bh = Math.min(width / 2 - 2, rn + wall + 13), hw = Math.min(rn + wall + 3, bh);
  const top = zc + rn * 0.6;
  const plate = translate([x, 0, 0], rotate([90, 90, 0], linearExtrude({ h: ct },
    polygon([[-bh, 0], [bh, 0], [hw, top], [-hw, top]]))));
  return difference(plate,
    translate([x - 1, 0, zc], rotate([0, 90, 0], cylinder({ r: rn, h: ct + 2, $fn: 32 }))),
    translate([x - 1, -rn, zc], cube([ct + 2, 2 * rn, top])));
};
const parts = [base, cradle(x1, z1, r1), cradle(x2, z2, r2)];
// the sponge tray, in front of the front cradle
const trayL = x1 - (-length / 2) - 10;
if (sponge === "yes" && trayL > 25) {
  const tw = width - 8, tx = -length / 2 + 4 + trayL / 2;
  parts.push(difference(
    translate([tx - trayL / 2, -tw / 2, baseT - 0.01], cube([trayL, tw, 10.01])),
    translate([tx - trayL / 2 + wall, -tw / 2 + wall, baseT], cube([trayL - 2 * wall, tw - 2 * wall, 11]))));
}
return union(...parts);
