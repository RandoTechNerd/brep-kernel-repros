// Desk cable grommet: a flanged sleeve for the cable hole in a desk, with a notched cap the cables come up through.
// Print: both pieces flange-down as shown, no supports.
// Every number below is a slider (Params). From the BREPcode catalog: cable-grommet.
const holeD = 60;   // [20:120] hole diameter, mm
const deskT = 20;   // [5:60] sleeve depth (desk thickness), mm
const flangeW = 6;  // [2:20] flange overlap round the hole, mm
const flangeT = 3;  // [1.6:6] flange thickness, mm
const wall = 2.4;   // [1.6:5] sleeve wall, mm
const notchW = 22;  // [0:50] cable notch width (0 = none), mm
const cap = "yes";  // [no, yes] cap

// both pieces stand on their flanges; every face is vertical or looks up
const ro = holeD / 2 - 0.3;                      // slips into the hole
const ri = ro - wall;
const rf = holeD / 2 + flangeW;
const e = Math.min(1, flangeT / 3);              // the flange's top edge is bevelled
const ring = difference(
  union(cylinder({ r1: rf, r2: rf - e, h: flangeT }), translate([0, 0, flangeT / 2], cylinder({ r: ro, h: flangeT / 2 + deskT }))),
  translate([0, 0, -1], cylinder({ r: ri, h: flangeT + deskT + 2 })));
if (cap !== "yes") return ring;
// the cap: a disc over the flange, and a short collar that drops into the sleeve
const capT = Math.max(2, flangeT * 0.8);
const co = ri - 0.4, cw = Math.min(1.6, co / 3), ch = Math.min(8, deskT);
let lid = difference(union(cylinder({ r1: rf, r2: rf - e, h: capT }), translate([0, 0, capT / 2], cylinder({ r: co, h: capT / 2 + ch }))),
  translate([0, 0, capT + 0.01], cylinder({ r: co - cw, h: ch + 1 })));
const nw = Math.min(notchW, 1.6 * co);
if (nw > 0) lid = difference(lid, translate([co * 0.2, -nw / 2, -1], cube([rf, nw, capT + ch + 2])));
return group(ring, translate([2 * rf + 8, 0, 0], lid));
