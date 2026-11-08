// Controller wall mount: a narrow wall bracket a gamepad drops into between its grips, screwed through the plate.
// Print: lying on its side as shown, no supports. Countersunk screws go through the plate into the wall.
// Every number below is a slider (Params). From the BREPcode catalog: controller-wall-mount.
const seatD = 32;   // [10:80] channel depth (the controller's thickness), mm
const lipH = 15;    // [5:50] front lip height, mm
const plateH = 70;  // [35:160] wall plate height, mm
const width = 36;   // [16:90] width (fits between the grips), mm
const wall = 5;     // [3:10] thickness, mm
const screwD = 4;   // [3:5.5] screw diameter, mm

// side profile: x runs out from the wall, y runs up; printed lying on it, `width` thick
const g = Math.min(25, seatD);                   // gusset under the channel
const x1 = wall + seatD, x2 = x1 + wall;
const outline = [[0, -g], [wall, -g], [wall + g, 0], [x2, 0], [x2, wall + lipH], [x1, wall + lipH], [x1, wall],
  [wall, wall], [wall, plateH], [0, plateH]];
const piece = linearExtrude({ h: width }, polygon(outline));
// countersunk screw holes through the plate, above the channel
const k = screwD / 2;
const ys = plateH > 80 ? [plateH - 12, (plateH + wall) / 2] : [plateH - Math.min(14, (plateH - wall) / 2)];
const holes = ys.flatMap((y) => [
  translate([-1, y, width / 2], rotate([0, 90, 0], cylinder({ r: screwD / 2, h: wall + 2, $fn: 24 }))),
  translate([wall - k + 0.02, y, width / 2], rotate([0, 90, 0], cylinder({ r1: screwD / 2, r2: screwD / 2 + k, h: k, $fn: 24 }))),
]);
return translate([-x2 / 2, (g - plateH) / 2, 0], difference(piece, ...holes));
