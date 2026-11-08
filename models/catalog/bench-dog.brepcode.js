// Bench dog: a workbench dog: a sprung peg for a 3/4 inch or 20 mm dog hole with a stop head.
// Print: head down as shown, no supports. PETG or nylon so it springs without snapping.
// Every number below is a slider (Params). From the BREPcode catalog: bench-dog.
const holeD = 19.05;   // [10:40] dog hole diameter, mm
const fit = 0.1;       // [-0.3:0.6] clearance per side (negative = snug, the split lets it spring), mm
const pegL = 35;       // [10:90] peg length into the hole, mm
const headD = 30;      // [10:80] head diameter (at least the hole), mm
const headH = 10;      // [3:40] head height above the bench, mm
const slit = 1.6;      // [0:4] spring split width (0 = solid), mm
const face = "round";  // [round, flat] head shape

const pr = holeD / 2 - fit;                      // the peg
const hr = Math.max(headD / 2, pr);              // the head is never narrower than the peg
const ch = Math.min(1.5, pegL / 6);              // lead-in chamfer at the peg's tip
const top = headH + pegL;
const dog = union(
  cylinder({ r: hr, h: headH, $fn: 72 }),
  translate([0, 0, headH - 0.01], cylinder({ r: pr, h: pegL - ch + 0.01, $fn: 72 })),
  translate([0, 0, top - ch - 0.01], cylinder({ r1: pr, r2: pr - ch, h: ch + 0.01, $fn: 72 })),
);
const cuts = [];
// the spring split, up the peg from a little above the head
if (slit > 0) cuts.push(translate([-slit / 2, -hr - 1, headH + Math.min(4, pegL / 4)], cube([slit, 2 * hr + 2, top])));
// a flat stop face, just proud of the side of the peg (a tangent cut leaves slivers)
if (face === "flat" && hr > pr + 0.8) cuts.push(translate([pr + 0.3, -hr - 1, -1], cube([hr + 1, 2 * hr + 2, top + 2])));
return cuts.length ? difference(dog, ...cuts) : dog;
