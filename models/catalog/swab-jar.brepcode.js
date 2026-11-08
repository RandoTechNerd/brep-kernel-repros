// Bathroom canister: a lidded canister for cotton swabs, cotton balls and floss picks, or sugar, coffee and tea, with an optional divider.
// Print: as shown: jar upright, lid upside down beside it; no supports. Food: PETG or PLA from a food-safe spool, hand wash, and keep it out of the dishwasher.
// Every number below is a slider (Params). From the BREPcode catalog: swab-jar.
const diameter = 75;     // [30:200] outside diameter, mm
const height = 90;       // [25:240] jar height (without the lid), mm
const wall = 2;          // [1.2:4] wall thickness, mm
const floor = 2.4;       // [1.6:6] floor thickness, mm
const compartments = 1;  // [1:4] compartments
const lipD = 7;          // [3:15] how far the lid's insert goes in, mm
const fit = 0.3;         // [0.1:0.8] lid clearance per side, mm
const lid = "yes";       // [yes, no] lid
const form = "round";    // [round, hex, octagon] outline

const sides = form === "hex" ? 6 : form === "octagon" ? 8 : 96;
const r = diameter / 2;
const flatR = r * Math.cos(Math.PI / sides);           // the outline's flats are this far out
const ri = Math.max(4, flatR - wall);                  // a round inside, so the lid fits any outline
const lipH = Math.min(lipD, height / 3);
const jarBody = difference(
  cylinder({ r, h: height, $fn: sides }),
  translate([0, 0, Math.min(floor, height - 5)], cylinder({ r: ri, h: height, $fn: 96 })),
);
const parts = [jarBody];
if (compartments > 1) {
  const divT = Math.max(1.2, wall * 0.8);
  const divH = height - (lid === "yes" ? lipH + 1 : 0);
  const fz = Math.min(floor, height - 5);
  for (let i = 0; i < compartments; i++) {
    parts.push(rotate([0, 0, i * 360 / compartments + 90], translate([-divT / 2, 0, fz - 0.1], cube([divT, ri + wall / 2, divH - fz + 0.1]))));
  }
  if (compartments > 2) parts.push(translate([0, 0, fz - 0.1], cylinder({ r: divT, h: divH - fz + 0.1, $fn: 16 })));
}
let jar = union(...parts);
if (lid !== "yes") return jar;

// a thumb notch in the front of the rim, under the lid's edge
const nW = Math.min(14, r * 0.5), nD = Math.min(2.5, lipH / 2);
jar = difference(jar, translate([-nW / 2, -r - 1, height - nD], cube([nW, r - ri + 1.5, nD + 1])));

// the lid, upside down: a cap the size of the jar, an insert ring standing up from it
const capT = Math.max(2, wall);
const ro = ri - fit;
const ring = Math.max(1.4, Math.min(2.4, ro / 6));
const cap = union(
  cylinder({ r, h: capT, $fn: sides }),
  difference(translate([0, 0, capT - 0.1], cylinder({ r: ro, h: lipH + 0.1, $fn: 96 })),
    translate([0, 0, capT - 0.2], cylinder({ r: ro - ring, h: lipH + 1, $fn: 96 }))),
);
return group(jar, translate([2 * r + 10, 0, 0], cap));
