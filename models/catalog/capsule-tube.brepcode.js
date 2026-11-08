// Tube with cap: a round storage tube with a slip-on cap, sized for coins, needles, leads or beads.
// Print: tube upright, cap upside down beside it, no supports.
// Every number below is a slider (Params). From the BREPcode catalog: capsule-tube.
const innerD = 25;  // [5:80] inside diameter, mm
const innerL = 60;  // [10:200] inside length, mm
const wall = 1.6;   // [1.2:4] wall thickness, mm
const capL = 15;    // [5:40] cap length, mm
const fit = 0.25;   // [0.1:0.6] cap clearance per side, mm

const R = innerD / 2 + wall;                        // tube outside
const floor = Math.max(1.2, wall);
// a cup: closed at the bottom, open at the top
const cup = (ro, ri, h) => difference(
  cylinder({ r: ro, h: h + floor, $fn: 64 }),
  translate([0, 0, floor], cylinder({ r: ri, h: h + 1, $fn: 64 })),
);
const vessel = cup(R, innerD / 2, innerL);
// the cap slides over the outside of the tube; printed closed end down
const capIn = R + fit, capOut = capIn + wall;
const cap = cup(capOut, capIn, capL);
return group(translate([-capOut - 3, 0, 0], vessel), translate([R + 3, 0, 0], cap));
