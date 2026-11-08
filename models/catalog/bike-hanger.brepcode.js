// Bike wall hanger: a braced wall arm that hangs a bike by its top tube, or nose-up by the front wheel.
// Print: on its side as shown, no supports. PETG or nylon, 6+ walls, 40% infill. Not load-rated: hang the bike by hand and watch it before you walk away, and screw into studs.
// Every number below is a slider (Params). From the BREPcode catalog: bike-hanger.
const style = "tube";  // [tube, wheel] hang by the top tube, or nose-up by the wheel
const reach = 180;     // [40:230] reach out from the wall, mm
const tubeD = 50;      // [20:80] saddle size (at least the top tube), mm
const tipH = 35;       // [10:80] wheel hook tip height, mm
const armT = 18;       // [8:30] arm thickness, mm
const width = 40;      // [12:80] hanger width, mm
const drop = 70;       // [20:160] plate below the arm (gusset height), mm
const above = 35;      // [20:80] plate above the arm (screws), mm
const wall = 8;        // [5:16] wall plate thickness, mm
const screwD = 5;      // [3:7] screw hole diameter, mm

// side profile: x runs out from the wall, y runs up; printed lying on it
const armTop = drop + armT;
const g = Math.min(drop, reach * 0.7);            // the gusset under the arm
const x1 = wall + reach;
const pts = [[0, 0], [wall, 0], [wall, drop - g], [wall + g, drop], [x1, drop]];
const lift = style === "wheel" ? 0 : (tubeD / 2 + 1) * 0.9;   // saddle sides rise this far above the arm
if (style === "wheel") {
  // an upturned tip the rim hangs behind
  const tipT = Math.max(8, armT * 0.7);
  pts.push([x1, armTop + tipH], [x1 - tipT, armTop + tipH], [x1 - tipT, armTop]);
} else {
  // a saddle block at the end; the trough is cut below
  const R = tubeD / 2 + 1;
  const s0 = Math.max(wall + 10, x1 - 2 * R - 12);
  pts.push([x1, armTop + lift], [s0, armTop + lift], [s0, armTop]);
}
const above0 = Math.max(armTop, armTop + lift - 0.01);
pts.push([wall, armTop], [wall, above0 + above], [0, above0 + above]);
const piece = linearExtrude({ h: width }, polygon(pts));
const cuts = [];
if (style !== "wheel") {
  const R = tubeD / 2 + 1;
  const s0 = Math.max(wall + 10, x1 - 2 * R - 12);
  cuts.push(translate([(s0 + x1) / 2, drop + armT * 0.5 + R, -1], cylinder({ r: R, h: width + 2, $fn: 72 })));
}
// countersunk screw holes: two above the arm, one below the gusset if there is room
const k = screwD / 2;
const zs = width < 30 ? [width / 2] : [width * 0.28, width * 0.72];
const ys = [above0 + above / 2, ...(drop - g > 2 * screwD + 10 ? [(drop - g) / 2] : [])];
for (const y of ys) for (const z of zs) {
  cuts.push(translate([-1, y, z], rotate([0, 90, 0], cylinder({ r: screwD / 2, h: wall + 2, $fn: 24 }))));
  cuts.push(translate([wall - k + 0.02, y, z], rotate([0, 90, 0], cylinder({ r1: screwD / 2, r2: screwD / 2 + k, h: k, $fn: 24 }))));
}
return difference(piece, ...cuts);
