// Leash rack: a wall plate with upward-angled pegs for leashes, collars and harnesses, and an optional tray for bags and treats.
// Print: lying on its back as shown, no supports. Screw it to the wall (countersunk holes) or use mounting tape for light leashes.
// Every number below is a slider (Params). From the BREPcode catalog: leash-rack.
const pegs = 3;          // [1:8] number of pegs
const pegL = 55;         // [25:120] peg length, mm
const pegD = 12;         // [6:25] peg diameter, mm
const tilt = 30;         // [0:40] how far the pegs angle up, degrees
const spacing = 60;      // [25:120] space between pegs, mm
const plateH = 70;       // [30:200] plate height (below any tray), mm
const plateT = 5;        // [3:10] plate thickness, mm
const tray = "none";     // [none, tray] a tray above the pegs
const trayD = 40;        // [20:80] tray depth out from the wall, mm
const mount = "screws";  // [screws, tape] screw holes, or a flat back for mounting tape
const screwD = 4.5;      // [3:6] screw diameter, mm

// print orientation: the plate lies on the bed (its back goes on the wall);
// x along the wall, y up the wall, pegs rise in z leaning toward +y
const margin = Math.max(28, pegD + 16);
const Wp = Math.max(80, (pegs - 1) * spacing + 2 * margin);
const r = pegD / 2;
const rC = Math.min(1.6 * r, r + 6);                       // the flared collar at each peg's foot
const pH = Math.max(plateH, 2 * rC + 16);
const withTray = tray === "tray";
const trayH = withTray ? Math.max(45, trayD) : 0;          // tray height up the wall
const Hp = pH + trayH;
const rc = Math.min(8, Hp / 2 - 0.5, Wp / 2 - 0.5);
const plate = hull(...[[-1, 0], [1, 0], [-1, 1], [1, 1]].map(([sx, sy]) =>
  translate([sx * (Wp / 2 - rc), sy ? Hp - rc : rc, 0], cylinder({ r: rc, h: plateT, $fn: 32 }))));
const yPeg = pH / 2;
// a peg: started below the bed, tipped up the wall, flared at its foot and
// domed at its end; the part below 0.5 mm is trimmed off, so its foot is
// buried in the plate
const sink = (rC + plateT) * 2 + 2;
const pegAt = (x) => translate([x, yPeg, plateT], rotate([-tilt, 0, 0],
  translate([0, 0, -sink], cylinder({ r, h: pegL + sink, $fn: 40 })),
  translate([0, 0, -sink], cylinder({ r: rC, h: sink, $fn: 40 })),
  cylinder({ r1: rC, r2: r, h: 2 * (rC - r) + 0.01, $fn: 40 }),
  translate([0, 0, pegL], sphere({ r, $fn: 40 }))));
const pegList = Array.from({ length: pegs }, (_, i) => pegAt((i - (pegs - 1) / 2) * spacing));
const reach = pegL + r + 2;
const parts = [plate, intersection(union(...pegList), translate([-Wp, -reach, 0.5], cube([2 * Wp, Hp + 2 * reach, 2 * reach])))];
const holes = [];
if (withTray) {
  // an open box above the pegs, walls straight up off the plate
  const tw = 2.4;
  const Wi = Wp - 12, y1 = pH, y2 = Hp - 4, zt = plateT + trayD;
  parts.push(difference(
    translate([-Wi / 2, y1, plateT - 0.01], cube([Wi, y2 - y1, trayD + 0.01])),
    translate([-Wi / 2 + tw, y1 + tw, plateT], cube([Wi - 2 * tw, y2 - y1 - 2 * tw, trayD + 1])),
  ));
  // a lip on the bottom wall's edge, leaning up into the tray at 50 degrees
  const lipH = Math.min(8, trayH * 0.2), yw = y1 + tw - 0.01;
  parts.push(translate([-Wi / 2 + tw - 0.01, 0, 0], rotate([0, 0, 90], rotate([90, 0, 0],
    linearExtrude({ h: Wi - 2 * tw + 0.02 }, polygon([[yw, zt - lipH * 1.2], [yw + lipH, zt], [yw, zt]]))))));
  if (mount === "screws") holes.push([-Wi / 4, (y1 + y2) / 2], [Wi / 4, (y1 + y2) / 2]);
}
if (mount === "screws") {
  const xh = Wp / 2 - Math.max(12, screwD * 2.5);
  holes.push([-xh, yPeg], [xh, yPeg]);
}
const k = Math.min(screwD / 2 + 0.5, plateT - 1.2);           // countersink depth
const cuts = holes.flatMap(([x, y]) => [
  translate([x, y, -1], cylinder({ r: screwD / 2, h: plateT + 2, $fn: 24 })),
  translate([x, y, plateT - k], cylinder({ r1: screwD / 2, r2: screwD / 2 + k + 0.02, h: k + 0.02, $fn: 24 })),
]);
const board = cuts.length ? difference(union(...parts), ...cuts) : union(...parts);
return translate([0, -Hp / 2, 0], board);
