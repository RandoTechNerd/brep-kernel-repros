// Guitar hanger: a wall yoke the neck drops into, so the guitar hangs by its headstock.
// Print: standing on its wall plate as shown, no supports. PETG; screw it into a stud or a plywood board.
// Every number below is a slider (Params). From the BREPcode catalog: guitar-hanger.
const neckGap = 50;  // [20:80] gap between the prongs, mm
const width = 90;    // [50:140] overall fork width, mm
const reach = 85;    // [50:160] how far it holds it off the wall, mm
const armT = 18;     // [10:30] arm thickness, mm
const tipH = 12;     // [0:25] front tip height, mm
const plateH = 100;  // [60:160] wall plate height, mm
const plateT = 8;    // [5:14] wall plate thickness, mm
const screwD = 4.5;  // [3:6] screw diameter, mm

// side profile: p runs out from the wall (up, as printed), q runs up the wall
const prong = Math.max(8, (width - neckGap) / 2);
const W = neckGap + 2 * prong;
const g = Math.min(armT, 22);                         // the gussets above and below the arm
const L = Math.max(reach, plateT + g + 30);
const tipL = Math.max(6, armT * 0.5);
const Hp = Math.max(plateH, armT + 2 * g + 6 * screwD);
const qB = armT / 2 - Hp / 2, qT = armT / 2 + Hp / 2;
const tip = tipH > 0
  ? [[L, armT + tipH], [L - tipL, armT + tipH], [L - tipL - 1.2 * tipH, armT]]   // the slope under the tip leans 40 degrees
  : [[L, armT]];
const outline = [
  [0, qB], [plateT, qB], [plateT, -g], [plateT + g, 0],
  [L, 0], ...tip,
  [plateT + g, armT], [plateT, armT + g], [plateT, qT], [0, qT],
];
// stretched across the fork, then stood up: p becomes z, q stays y
const body = translate([W / 2, 0, 0], rotate([0, -90, 0], linearExtrude({ h: W }, polygon(outline))));
// the neck slot, cut down from the top of the arm to just past the gussets
const pSlot = plateT + g + 2;
const neckSlot = translate([-neckGap / 2, qB - 1, pSlot], cube([neckGap, Hp + 2, L]));
// countersunk screws through the plate, above and below the arm
const k = Math.min(screwD / 2, plateT - 1.5);
const holes = [(qB - g) / 2, (qT + armT + g) / 2].flatMap((q) => [
  translate([0, q, -1], cylinder({ r: screwD / 2, h: plateT + 2, $fn: 24 })),
  translate([0, q, plateT - k + 0.02], cylinder({ r1: screwD / 2, r2: screwD / 2 + k, h: k, $fn: 24 })),
]);
return difference(body, neckSlot, ...holes);
