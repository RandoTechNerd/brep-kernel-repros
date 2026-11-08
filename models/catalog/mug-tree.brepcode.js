// Mug tree: a post on a weighted base with angled pegs on two levels for hanging mugs.
// Print: upright as shown, no supports. Use 3+ walls and 20% infill: the pegs take the load.
// Every number below is a slider (Params). From the BREPcode catalog: mug-tree.
const pegs = 6;       // [2:12] pegs
const pegL = 70;      // [30:120] peg length, mm
const pegR = 5.5;     // [3:10] peg radius, mm
const elev = 50;      // [46:80] peg angle above level (46 = flattest that prints), degrees
const postH = 230;    // [100:245] post height, mm
const postR = 11;     // [6:25] post radius, mm
const baseR = 75;     // [40:125] base radius, mm
const baseT = 8;      // [4:16] base thickness, mm
const levelGap = 90;  // [40:140] drop from the top pegs to the lower ones, mm

const el = elev * Math.PI / 180;
const reach = postR + pegL;
const zTop = postH - reach * Math.sin(el) - 5;                 // upper peg tips stay below the post top
const zLow = Math.max(baseT + pegR + 4, zTop - levelGap);
// pegs are octagonal prisms: flat faces keep the boolean with the post quick
const pr = Math.min(pegR, postR * 0.9) / Math.cos(Math.PI / 8);
const octagon = polygon(Array.from({ length: 8 }, (_, i) => [pr * Math.cos((i + 0.5) * Math.PI / 4), pr * Math.sin((i + 0.5) * Math.PI / 4)]));
// each starts part way out inside the post, a little further each time, so no
// two pegs meet in a mirror-image seam (the mesh would share an edge there)
const peg = (az, z, i) => {
  const s0 = postR * (0.3 + 0.05 * (i % 7));
  return translate([0, 0, z], rotate([0, 0, az], rotate([0, 90 - elev, 0], translate([0, 0, s0], linearExtrude({ h: reach - s0 }, octagon)))));
};
const arms = Array.from({ length: pegs }, (_, i) =>
  peg(4.5 + i * 360 / pegs, i % 2 === 0 ? Math.max(zLow, zTop) : zLow, i));   // 4.5: off the post's facet seams
return union(
  cylinder({ r: baseR, h: baseT, $fn: 72 }),
  cylinder({ r: postR, h: postH, $fn: 40 }),
  translate([0, 0, postH - 0.01], cylinder({ r1: postR, r2: postR * 0.35, h: postR, $fn: 40 })),
  ...arms,
);
