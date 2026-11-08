// Trinket dish: a small round or faceted dish for rings, keys, sweets or incense.
// Print: upright as shown, no supports.
// Every number below is a slider (Params). From the BREPcode catalog: trinket-dish.
const diameter = 90;  // [30:200] top diameter, mm
const height = 20;    // [6:70] height, mm
const baseD = 60;     // [20:200] base diameter, mm
const wall = 2;       // [1.2:5] wall thickness, mm
const floor = 2;      // [1.2:6] floor thickness, mm
const sides = 0;      // [0:12] facets (0 = round, 3 to 12 = a polygon)
const stickHole = 0;  // [0:6] incense stick hole in a centre boss (0 = none), mm

const rt = diameter / 2;
const rb = Math.max(Math.min(baseD / 2, rt - 2), rt - height * 0.95);   // the sides lean out at 45 degrees at most
if (sides >= 3) {
  // two polygons hulled into a tapered tray, minus the same, inset, from the floor up
  const ngon = (r, z) => translate([0, 0, z], linearExtrude({ h: 0.01 }, polygon(Array.from({ length: sides }, (_, i) =>
    [r * Math.cos(2 * Math.PI * i / sides), r * Math.sin(2 * Math.PI * i / sides)]))));
  const k = 1 / Math.cos(Math.PI / sides);           // corner radius over flat radius
  const slope = (rt - rb) / height;
  const dr = wall * Math.sqrt(1 + slope * slope);
  const outer = hull(ngon(rb * k, 0), ngon(rt * k, height - 0.01));
  const inner = hull(ngon((rb + slope * floor - dr) * k, floor), ngon((rt - dr) * k, height + 1));
  return difference(outer, inner);
}
// turned: outer wall, rim, inner wall, floor, and an optional boss with a
// blind hole for an incense stick
const slope = (rt - rb) / height;
const dr = wall * Math.sqrt(1 + slope * slope);
const ri = (z) => rb + slope * z - dr;
const boss = stickHole > 0
  ? [[Math.max(stickHole / 2 + 3, 6), floor], [Math.max(stickHole / 2 + 3, 6) - 2, floor + Math.min(14, height * 0.8)],
     [stickHole / 2, floor + Math.min(14, height * 0.8)], [stickHole / 2, floor * 0.5], [0, floor * 0.5]]
  : [[0, floor]];
return revolve(360, polygon([[0, 0], [rb, 0], [rt, height], [rt - dr, height], [ri(floor), floor], ...boss]));
