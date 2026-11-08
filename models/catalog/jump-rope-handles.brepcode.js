// Jump rope handles: a pair of lathed jump rope handles with a rope bore and a knot pocket, optionally for a 608 bearing.
// Print: standing upright as shown, no supports. Thread the rope down through the top and knot it in the cone at the foot.
// Every number below is a slider (Params). From the BREPcode catalog: jump-rope-handles.
const length = 140;         // [90:200] handle length, mm
const gripD = 26;           // [18:40] grip diameter, mm
const ropeD = 5;            // [2:10] rope diameter, mm
const knotD = 12;           // [6:20] knot pocket diameter, mm
const flare = 3;            // [0:8] end flare, mm
const topBearing = "none";  // [none, 608] 608 bearing pocket on top

const R = gripD / 2, rb = ropeD / 2 + 0.3;               // grip, and the rope bore with a little room
const withBearing = topBearing === "608";
const rTop = withBearing ? Math.max(R * 0.9, 11.05 + 2.4) : R * 0.85;
const rEnd = R + flare;
const foot = flare > 0.2 ? [[rEnd, 0], [rEnd, 2], [R, 2 + flare * 1.2]] : [[R, 0]];
const neck = Math.max(10, (rTop > R ? (rTop - R) * 1.2 : 0) + 8);   // widening up stays under 40 degrees
const one = revolve(360, polygon([[0, 0], ...foot, [R * 1.06, length * 0.45], [R, length - neck], [rTop, length], [0, length]]));
// the knot sits in a steep cone at the foot (no flat ceiling), the rope runs up the bore
const kr = Math.min(knotD / 2, rEnd - 2);
const cuts = [
  translate([0, 0, -1], cylinder({ r: rb, h: length + 2, $fn: 20 })),
  translate([0, 0, -0.01], cylinder({ r1: kr, r2: rb + 0.4, h: (kr - rb - 0.4) * 1.43 + 0.01, $fn: 24 })),
];
if (withBearing) cuts.push(translate([0, 0, length - 7.2], cylinder({ r: 11.05, h: 8, $fn: 48 })));
const grip = difference(one, ...cuts);
const sep = rEnd + 4;
return group(translate([-sep, 0, 0], grip), translate([sep, 0, 0], grip));
