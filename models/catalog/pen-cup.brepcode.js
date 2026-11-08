// Pen holder: a desk cup for pens, brushes or utensils, round or hexagonal, with optional dividers.
// Print: upright as shown, no supports.
// Every number below is a slider (Params). From the BREPcode catalog: pen-cup.
const diameter = 80;     // [30:200] outside diameter, mm
const height = 100;      // [30:250] height, mm
const wall = 2;          // [1.2:5] wall thickness, mm
const floor = 2.5;       // [1.5:6] floor thickness, mm
const compartments = 1;  // [1:6] compartments
const form = "round";    // [round, hex, octagon] outline

const sides = form === "hex" ? 6 : form === "octagon" ? 8 : 96;
const r = diameter / 2;
const apothem = r * Math.cos(Math.PI / sides);
const ri = r - wall / Math.cos(Math.PI / sides);    // keeps the wall `wall` thick on the flats
const cup = difference(
  cylinder({ r, h: height, $fn: sides }),
  translate([0, 0, floor], cylinder({ r: ri, h: height, $fn: sides })),
);
if (compartments < 2) return cup;
const divT = Math.max(1.2, wall * 0.8), divH = height * 0.85;
const reach = apothem - wall / 2;                 // ends buried in the wall on every side
const walls = compartments === 2
  ? [translate([-reach, -divT / 2, floor - 0.1], cube([2 * reach, divT, divH - floor + 0.1]))]
  : Array.from({ length: compartments }, (_, i) =>
      rotate([0, 0, i * 360 / compartments + 90], translate([-divT / 2, 0, floor - 0.1], cube([divT, reach, divH - floor + 0.1]))));
// radial walls only meet at a point: a post at the centre closes the gap between them
if (compartments > 2) walls.push(translate([0, 0, floor - 0.1], cylinder({ r: divT, h: divH - floor + 0.1, $fn: 16 })));
return union(cup, ...walls);
