// Tent stake: a T-section tent stake with a striking head and guy-line notches, for soft ground and sand.
// Print: flange down as shown, no supports. PETG or nylon. For soft ground, sand and snow: a printed stake bends or snaps in rock and hard clay.
// Every number below is a slider (Params). From the BREPcode catalog: tent-stake.
const length = 180;  // [80:250] length, mm
const width = 18;    // [10:45] flange width, mm
const flangeT = 3;   // [2:6] flange thickness, mm
const ribH = 12;     // [6:25] rib height at the head, mm
const ribT = 3;      // [2:6] rib thickness, mm
const tipL = 40;     // [15:80] point length, mm
const notch = 5;     // [0:12] guy-line notch depth (0 = none), mm

// x runs from the head to the point
const L = length, w = width;
const head = Math.max(8, w * 0.5);                // the striking head's length
const xn = head + 4;                              // where the guy-line notches sit
const xt = L - tipL;                              // where the taper to the point starts
// the flange, seen from above
const plan = [[0, -w / 2], [xt, -w / 2], [L, -0.75], [L, 0.75], [xt, w / 2], [0, w / 2]];
let flange = linearExtrude({ h: flangeT }, polygon(plan));
if (notch > 0) {
  // a notch each side that leans back toward the head, so a tight line stays in it
  const n = Math.min(notch, w / 2 - ribT / 2 - 1);
  const cut = (s) => linearExtrude({ h: flangeT + 2 }, polygon([
    [xn, s * (w / 2 + 1)], [xn + 6, s * (w / 2 + 1)], [xn + 2, s * (w / 2 - n)], [xn - 2, s * (w / 2 - n)],
  ]));
  flange = difference(flange, translate([0, 0, -1], cut(1)), translate([0, 0, -1], cut(-1)));
}
// the rib, seen from the side: full height at the head, tapering to the point
const side = [[0, 0], [L, 0], [L, 0.8], [xt, ribH * 0.55], [head, ribH], [0, ribH]];
const rib = translate([0, ribT / 2, 0], rotate([90, 0, 0], linearExtrude({ h: ribT }, polygon(side))));
// the head: a block across the flange to strike
const strike = translate([0, -w / 2, 0], cube([head, w, Math.max(flangeT + 2, ribH * 0.6)]));
return translate([-L / 2, 0, 0], union(flange, rib, strike));
