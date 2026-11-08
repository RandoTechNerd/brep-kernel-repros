// Spoon rest: a shallow teardrop dish by the stove for a stirring spoon, ladle or used tea bag, with a notch for the handle.
// Print: upright as shown, no supports. PETG or ABS by the stove: PLA softens near a hot pan.
// Every number below is a slider (Params). From the BREPcode catalog: spoon-rest.
const length = 120;  // [50:240] length, mm
const bowlW = 70;    // [30:140] width of the round end, mm
const neckW = 34;    // [16:90] width of the narrow end, mm
const depth = 14;    // [5:40] dish depth, mm
const wall = 2.4;    // [1.6:5] wall thickness, mm
const floorT = 2.4;  // [1.6:6] floor thickness, mm
const notchW = 16;   // [0:40] handle notch width (0 = none), mm

// a teardrop footprint: a round end at -x, a narrower round end at +x, walls leaning out as they rise
const lean = Math.tan(30 * Math.PI / 180);
const rB = bowlW / 2, rN = Math.min(neckW, bowlW) / 2;
const H = floorT + depth;
const xB = -length / 2 + rB, xN = length / 2 - rN;    // the rim reaches the full length
const span = Math.max(1, xN - xB);
const drop = (grow, z0, h) => hull(
  translate([xB, 0, z0], cylinder({ r1: Math.max(1, rB - H * lean + grow), r2: Math.max(1, rB - H * lean + grow + h * lean), h, $fn: 56 })),
  translate([xB + span, 0, z0], cylinder({ r1: Math.max(1, rN - H * lean + grow), r2: Math.max(1, rN - H * lean + grow + h * lean), h, $fn: 40 })),
);
let dish = difference(drop(0, 0, H), drop(-wall, floorT, H));
// the channel the handle lies in, through the rim at the narrow end
if (notchW > 0) {
  const nw = Math.min(notchW, 2 * rN - 2 * wall);
  const nd = Math.min(depth * 0.6, depth - 1);
  dish = difference(dish, translate([xB + span, -nw / 2, H - nd], cube([rN + H, nw, nd + 1])));
}
return dish;
