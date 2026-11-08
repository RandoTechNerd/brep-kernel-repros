// Shelf pin: a shelf support pin with a ledge, for 5 mm (IKEA) or 1/4 inch shelf holes.
// Print: on its side as shown, no supports. PETG; print a few spares.
// Every number below is a slider (Params). From the BREPcode catalog: shelf-pin.
const pinD = 4.8;    // [3:8] peg diameter (the hole size), mm
const pinL = 8;      // [4:20] how far the peg goes in, mm
const ledgeL = 12;   // [5:40] how far the ledge sticks out, mm
const width = 10;    // [6:30] support width, mm
const plateH = 14;   // [8:40] back plate height, mm
const plateT = 2.4;  // [1.6:5] back plate thickness, mm
const ledgeT = 3;    // [2:6] ledge thickness, mm

// side view: x runs from the cabinet wall (x = 0) out under the shelf
// (negative) and into the hole (positive); y up. Stretched across the width.
const r = pinD / 2;
const pinY = -(r + 1);                           // the peg's axis, just under the shelf
const H = Math.max(plateH, r * 2 + 3);
const outline = [[-ledgeL, 0], [0, 0], [0.4, 0], [0.4, -H], [-plateT, -H], [-plateT, -ledgeT], [-ledgeL, -ledgeT]];
const body = linearExtrude({ h: width }, polygon(outline));
// the peg along +x, its flat cut where the round underside would lean past 45
// degrees; it sits on the bed at one face of the support
const zc = r * Math.SQRT1_2;
const peg = translate([0, pinY, zc], rotate([0, 90, 0], union(
  cylinder({ r, h: pinL - 0.6, $fn: 32 }),
  translate([0, 0, pinL - 0.61], cylinder({ r1: r, r2: r - 0.6, h: 0.6, $fn: 32 })),
)));
return difference(union(body, peg), translate([-ledgeL - 1, -H - 1, -10], cube([ledgeL + pinL + 3, H + 2, 10])));
