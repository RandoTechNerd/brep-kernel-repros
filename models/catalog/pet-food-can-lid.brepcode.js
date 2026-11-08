// Pet food can lid: a push-in lid for opened pet food cans: a tapered plug seals a range of can sizes, with a lift tab.
// Print: upside down as shown (disc on the bed), no supports. Food contact: PETG or PLA from a food-safe spool, hand wash, replace it once scratched.
// Every number below is a slider (Params). From the BREPcode catalog: pet-food-can-lid.
const canD = 76;    // [50:120] can diameter across the rim, mm
const spread = 16;  // [6:40] taper range: how much bigger or smaller an opening still seals, mm
const plugH = 14;   // [6:30] plug depth, mm
const diskT = 2.4;  // [1.6:5] top thickness, mm
const wall = 1.8;   // [1.2:4] plug wall thickness (thinner flexes to seal), mm
const tab = 12;     // [0:25] lift tab length (0 = none), mm

// the opening of an opened can is about 10 mm less than its rim; the plug
// tapers from a little over that to spread less, at no more than 40 degrees
const open0 = canD - 10;
const rB = Math.min(canD / 2 - 2, (open0 + spread / 2) / 2);
const rT = Math.max(6, rB - spread / 2);
const h = Math.max(plugH, (rB - rT) / Math.tan(40 * Math.PI / 180));
const phi = Math.atan((rB - rT) / h);
const wh = wall / Math.cos(phi);                         // the wall, measured across
const Rd = canD / 2 + 3;                                 // the top reaches past the rim
const hole = Math.max(2, rT - wh);
const lid = revolve(360, polygon([
  [0, 0], [Rd, 0], [Rd, diskT], [rB, diskT], [rT, diskT + h],
  [hole, diskT + h], [hole + rB - rT, diskT], [0, diskT],         // hollow inside, parallel to the outside
]));
if (tab <= 0) return lid;
const tw = Math.min(18, Rd);
const lift = hull(
  translate([Rd - 6, -tw / 2, 0], cube([1, tw, diskT])),
  translate([Rd + tab, 0, 0], cylinder({ r: tw / 2, h: diskT, $fn: 32 })));
return translate([-tab / 2, 0, 0], union(lid, lift));
