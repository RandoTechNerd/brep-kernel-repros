// Bike bottle cage: a bottle cage that bolts to a bike's cage bosses (or straps on), sized to the bottle.
// Print: standing as shown, no supports. PETG or nylon so it springs without cracking.
// Every number below is a slider (Params). From the BREPcode catalog: bottle-cage.
const bottleD = 74;     // [50:100] bottle diameter, mm
const grip = 0.6;       // [0:2] how much smaller than the bottle (grip), mm
const wall = 3;         // [2:5] wall thickness, mm
const height = 120;     // [60:180] cage height, mm
const mouth = 0.7;      // [0.5:0.9] front opening, as a fraction of the bottle
const spacing = 64;     // [40:90] bolt spacing (64 on nearly every frame), mm
const plateT = 4;       // [3:8] spine thickness, mm
const mount = "bolts";  // [bolts, strap] bolts to the bosses, or straps on
const windows = "yes";  // [yes, no] side windows

// z is the bottle's axis; the frame is behind (-y), the mouth in front (+y)
const R = bottleD / 2 - grip;                    // a touch smaller: it springs round the bottle
const ro = R + wall;
const floor = Math.max(2.4, wall);
const m = bottleD * mouth;
const strap = mount === "strap";
const pt = strap ? Math.max(plateT, 6) : plateT;
const sw = Math.max(24, bottleD / 3);            // spine width
const sleeve = difference(
  cylinder({ r: ro, h: height, $fn: 96 }),
  translate([0, 0, floor], cylinder({ r: R, h: height, $fn: 96 })),
  translate([-m / 2, 0, -1], cube([m, ro + 1, height + 2])),     // the mouth, floor and all
);
const spine = translate([-sw / 2, -ro - pt, 0], cube([sw, pt + wall - 0.3, height]));
const cuts = [];
const zc = height / 2;
if (strap) {
  // two tunnels across the spine for hook-and-loop straps
  for (const z of [height * 0.22, height * 0.78]) cuts.push(translate([-sw / 2 - 1, -ro - pt + 1.2, z - 10.5], cube([sw + 2, 3.2, 21])));
} else {
  for (const z of [zc - spacing / 2, zc + spacing / 2]) {
    // a short upright slot for each bolt, countersunk inside so the bottle rides over the head
    cuts.push(hull(...[-2, 2].map((dz) => translate([0, -R + 1, z + dz], rotate([90, 0, 0], cylinder({ r: 2.75, h: pt + wall + 2, $fn: 24 }))))));
    cuts.push(translate([0, -R + 0.01, z], rotate([90, 0, 0], cylinder({ r1: 5.2, r2: 2.75, h: 2.45, $fn: 24 }))));
  }
}
if (windows === "yes" && height > 70) {
  // a tall diamond through each side wall
  const ww = R * 0.9, hw = Math.min(height - 2 * floor - 30, 1.6 * ww);
  // (drawn in y-z, then turned so it runs along x through both side walls)
  if (hw > 20) cuts.push(translate([-ro - 1, 0, 0], rotate([0, 0, 90], rotate([90, 0, 0], linearExtrude({ h: 2 * ro + 2 },
    polygon([[0, zc - hw / 2], [ww / 2, zc], [0, zc + hw / 2], [-ww / 2, zc]]))))));
}
return difference(union(sleeve, spine), ...cuts);
