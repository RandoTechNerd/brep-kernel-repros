// Roll stand: a freestanding post on a weighted base for spare toilet rolls or a kitchen paper towel roll.
// Print: upright as shown, no supports. The post is at most 250 mm tall so it fits a printer; a paper towel roll stands a little above it.
// Every number below is a slider (Params). From the BREPcode catalog: roll-stand.
const postD = 34;    // [16:50] post diameter (roll cores are about 42 mm inside), mm
const height = 160;  // [60:250] overall height, mm
const baseD = 150;   // [70:240] base diameter, mm
const baseT = 9;     // [4:20] base thickness, mm
const wall = 3;      // [2:6] post wall thickness, mm

// the base: a disc with a softened top edge
const rB = baseD / 2;
const e = Math.min(baseT * 0.6, 4);
const base = revolve(360, polygon([[0, 0], [rB, 0], [rB, baseT - e], [rB - e, baseT], [0, baseT]]));

// the post: a root cone into the base, a slight taper, a bevelled top
const R = Math.min(postD / 2, rB - 8);
const H = Math.max(height, baseT + 40);
const rTop = R - Math.min(1.5, R * 0.08);
const root = Math.min(8, R * 0.5);
const bev = Math.min(3, rTop / 3);
const post = revolve(360, polygon([
  [0, baseT - 0.5], [R + root, baseT - 0.5], [R + root, baseT], [R, baseT + root],
  [rTop, H - bev], [rTop - bev, H], [0, H],
]));
// hollow inside, open underneath, roofed at 45 degrees so it prints
const ri = Math.max(2, rTop - wall);
const roofZ = H - Math.max(3, wall) - ri;
const inside = revolve(360, polygon([[0, -1], [ri, -1], [ri, roofZ], [0, roofZ + ri]]));
return difference(union(base, post), inside);
