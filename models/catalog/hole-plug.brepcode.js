// Hole plug: a push-in plug with a flat cap that covers an unused hole.
// Print: cap down as shown, no supports. Print a test one; PETG springs better than PLA.
// Every number below is a slider (Params). From the BREPcode catalog: hole-plug.
const holeD = 8;   // [2:40] hole diameter, mm
const depth = 8;   // [2:30] how far it goes in, mm
const capD = 12;   // [4:60] cap diameter, mm
const capT = 1.6;  // [0.8:5] cap thickness, mm
const fit = 0.15;  // [-0.2:0.5] extra width at the root (+ = tighter), mm
const slit = 0.8;  // [0:3] spring slit (0 = solid), mm

// z = 0 is the cap's face; the pin points up
const d1 = holeD + fit;                            // at the root
const d2 = holeD - 0.3;                            // at the tip, so it starts in the hole
const capR = Math.max(capD, holeD + 2) / 2;
const ch = Math.min(0.6, d2 / 4);
const plug = union(
  cylinder({ r: capR, h: capT, $fn: 64 }),
  translate([0, 0, capT - 0.01], cylinder({ r1: d1 / 2, r2: d2 / 2, h: depth - ch + 0.01, $fn: 48 })),
  translate([0, 0, capT + depth - ch - 0.01], cylinder({ r1: d2 / 2, r2: d2 / 2 - ch, h: ch + 0.01, $fn: 48 })),
);
const cuts = [];
// big pins are hollow, so they flex rather than split the hole
if (holeD > 12) cuts.push(translate([0, 0, capT + 1], cylinder({ r: d2 / 2 - 1.6, h: depth + 1, $fn: 48 })));
if (slit > 0 && holeD >= 4) cuts.push(translate([-slit / 2, -holeD, capT + depth * 0.25], cube([slit, 2 * holeD, depth])));
return cuts.length ? difference(plug, ...cuts) : plug;
