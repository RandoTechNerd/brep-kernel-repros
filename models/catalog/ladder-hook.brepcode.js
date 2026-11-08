// Ladder hook: a long-reach garage wall hook with a gusset, for ladders, folding chairs, a wheelbarrow or lumber.
// Print: on its side as shown, no supports. PETG or nylon with 6+ walls. Not load-rated: load it by hand first, and never over a walkway.
// Every number below is a slider (Params). From the BREPcode catalog: ladder-hook.
const reach = 100;  // [30:200] reach out from the wall, mm
const tipH = 25;    // [0:80] tip height above the arm, mm
const armT = 14;    // [6:40] arm thickness, mm
const width = 40;   // [15:120] hook width, mm
const drop = 50;    // [10:200] plate below the arm (gusset height), mm
const above = 30;   // [16:80] plate above the arm (screws), mm
const wall = 8;     // [4:16] wall plate thickness, mm
const screwD = 5;   // [3:7] screw hole diameter, mm

// side profile: x runs out from the wall, y runs up; printed lying on it
const armTop = drop + armT;
const peak = armTop + above;
const g = Math.min(drop, reach * 0.75);          // the gusset under the arm
const tipT = Math.max(6, armT * 0.6);
const outline = [
  [0, 0], [wall, 0], [wall, drop - g], [wall + g, drop],
  [wall + reach, drop], [wall + reach, armTop + tipH], [wall + reach - tipT, armTop + tipH], [wall + reach - tipT, armTop],
  [wall, armTop], [wall, peak], [0, peak],
];
const piece = linearExtrude({ h: width }, polygon(outline));
// countersunk screw holes through the plate above the arm, and one below the gusset if there is room
const k = screwD / 2;
const zs = width < 50 ? [width / 2] : [width * 0.25, width * 0.75];
const ys = [armTop + above / 2, ...(drop - g > 2 * screwD + 8 ? [(drop - g) / 2] : [])];
const holes = ys.flatMap((y) => zs.flatMap((z) => [
  translate([-1, y, z], rotate([0, 90, 0], cylinder({ r: screwD / 2, h: wall + 2, $fn: 24 }))),
  translate([wall - k + 0.02, y, z], rotate([0, 90, 0], cylinder({ r1: screwD / 2, r2: screwD / 2 + k, h: k, $fn: 24 }))),
]));
return difference(piece, ...holes);
