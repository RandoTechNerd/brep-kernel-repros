// Door knob lever: a clamp-on lever for a round door knob, tap or stove knob, turned with a push instead of a grip.
// Print: flat as shown, no supports. An M4 bolt and nut across the split pinch it onto the knob; a strip of rubber inside helps it grip.
// Every number below is a slider (Params). From the BREPcode catalog: knob-lever.
const knobD = 56;    // [15:90] knob diameter, mm
const leverL = 100;  // [40:180] lever length, mm
const ringH = 22;    // [8:45] ring height, mm
const wall = 5;      // [3:10] ring wall, mm
const leverW = 22;   // [12:40] lever end width, mm
const boltD = 4.4;   // [3:6.5] clamp bolt hole, mm

// lying flat: x runs out along the lever from the knob's centre
const rb = knobD / 2 + 0.4;                      // the bore
const Ro = rb + wall;
const tipR = leverW / 2;
const armH = Math.min(ringH, Math.max(10, ringH * 0.7));   // the arm tapers down toward its end
const paddle = hull(cylinder({ r: Ro, h: ringH, $fn: 64 }), translate([Ro + leverL - tipR, 0, 0], cylinder({ r: tipR, h: armH, $fn: 32 })));
// the split, and a bolt across it to close the ring on the knob
const xb = Ro + boltD / 2 + 3;
const split = translate([0, -1, -1], cube([xb + boltD / 2 + 6, 2, ringH + 2]));
const boltHole = translate([xb, Ro + 1, ringH / 2], rotate([90, 0, 0], cylinder({ r: boltD / 2, h: 2 * Ro + 2, $fn: 20 })));
return translate([-(Ro + leverL - Ro) / 2, 0, 0], difference(paddle, translate([0, 0, -1], cylinder({ r: rb, h: ringH + 2, $fn: 64 })), split, boltHole));
