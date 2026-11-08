// Cable tag: a snap-on flag for a cable, to write on or colour-code so you can tell cables apart.
// Print: flat as shown, no supports. Print a few in different colours.
// Every number below is a slider (Params). From the BREPcode catalog: cable-tag.
const cableD = 5;    // [2:14] cable diameter, mm
const tagL = 25;     // [10:60] tag length, mm
const tagH = 12;     // [6:30] tag height, mm
const plateT = 1.6;  // [1.2:4] tag thickness, mm
const ringH = 6;     // [2:15] ring height along the cable, mm

const ri = cableD / 2 + 0.2, ro = ri + 1.4;
const ring = difference(
  cylinder({ r: ro, h: ringH, $fn: 40 }),
  translate([0, 0, -1], cylinder({ r: ri, h: ringH + 2, $fn: 40 })),
  // the mouth, narrower than the cable, on the side away from the tag
  translate([-ro - 1, -cableD * 0.35, -1], cube([ro + 1, cableD * 0.7, ringH + 2])),
);
const tag = translate([ro - 0.5, -tagH / 2, 0], cube([tagL + 0.5, tagH, plateT]));
return translate([-tagL / 2, 0, 0], union(ring, difference(tag, translate([0, 0, -1], cylinder({ r: ri, h: plateT + 2, $fn: 40 })))));
