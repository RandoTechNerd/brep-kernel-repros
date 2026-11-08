// Hanging planter: a pot with cord lugs round the rim, to hang from a hook or a macrame hanger.
// Print: upright as shown, no supports. No drain hole by default, so it can hang indoors; PETG if it lives outside.
// Every number below is a slider (Params). From the BREPcode catalog: hanging-planter.
const topD = 140;     // [60:230] top diameter, mm
const bottomD = 100;  // [30:230] bottom diameter, mm
const height = 110;   // [40:220] height, mm
const wall = 2.2;     // [1.2:5] wall thickness, mm
const floor = 3;      // [1.6:8] floor thickness, mm
const lugs = 3;       // [2:6] cord lugs
const holeD = 5;      // [2.5:10] cord hole diameter, mm
const drain = 0;      // [0:30] drain hole (0 = none), mm

const rt = topD / 2, rb = Math.min(bottomD, topD) / 2;   // never wider at the foot
const rOut = (z) => rb + (rt - rb) * z / height;          // the outside of the wall at height z
const pot = revolve(360, polygon([[0, 0], [rb, 0], [rt, height], [rt - wall, height], [rb - wall, floor], [0, floor]]));

// a lug: a fin in the radial plane, its underside sloping back into the wall at 55 degrees
const reach = holeD + 9;                                   // how far it stands out past the rim
const k = Math.tan(55 * Math.PI / 180);
const zA = height - 4 - (reach + wall / 2) * k;
const xIn = (z) => rOut(z) - wall / 2;                     // inside the wall, never in the soil
const zD = height - 4 - (rt + reach - xIn(zA)) * k;
// on a short, steep pot the slope would reach the bed: then the lug is a buttress standing on it
const low = zD < 2;
const fin = low ? polygon([[xIn(height), height], [rt + reach, height], [rt + reach, 0], [xIn(0), 0]])
  : polygon([[xIn(height), height], [rt + reach, height], [rt + reach, height - 4], [xIn(zD), zD]]);
const t = Math.max(6, holeD + 4);                          // fin thickness
const lug = translate([0, t / 2, 0], rotate([90, 0, 0], linearExtrude({ h: t }, fin)));
const xh = rt + reach - holeD / 2 - 3;
const zh = low ? -1 : zD - 1;
const lugHole = translate([xh, 0, zh], cylinder({ r: holeD / 2, h: height - zh + 1, $fn: 20 }));
const one = difference(lug, lugHole);
const all = Array.from({ length: lugs }, (_, i) => rotate([0, 0, 360 * i / lugs], one));
const body = union(pot, ...all);
return drain > 0 ? difference(body, translate([0, 0, -1], cylinder({ r: drain / 2, h: floor + 2, $fn: 32 }))) : body;
