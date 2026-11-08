// Hexagon shelf: a honeycomb (or triangle, square, octagon) wall shelf, open or with a back.
// Print: lying flat as shown, no supports. PETG or PLA, 3 walls.
// Every number below is a slider (Params). From the BREPcode catalog: hex-shelf.
const size = 200;    // [80:250] across the corners, mm
const depth = 100;   // [30:200] how deep, mm
const wall = 4;      // [2:10] wall thickness, mm
const sides = 6;     // [3:8] sides
const backT = 0;     // [0:6] back thickness (0 = open frame), mm
const shelves = 0;   // [0:2] shelves across the inside
const screwD = 4.5;  // [3:6] screw diameter, mm

// lying on its back: x across, y up the wall (as hung), z out from the wall
const R = size / 2;
// a flat side at the bottom (as hung): rotate so one edge is horizontal
const a0 = -Math.PI / 2 - Math.PI / sides;
const ngon = (r) => polygon(Array.from({ length: sides }, (_, i) => [r * Math.cos(a0 + 2 * Math.PI * i / sides), r * Math.sin(a0 + 2 * Math.PI * i / sides)]));
const inR = R - wall / Math.cos(Math.PI / sides);
const frame = difference(linearExtrude({ h: depth }, ngon(R)), translate([0, 0, backT > 0 ? backT : -1], linearExtrude({ h: depth + 2 }, ngon(inR))));
const parts = [frame];
// shelves across the inside, clipped to the opening
const apo = R * Math.cos(Math.PI / sides);           // centre to the bottom flat
for (let i = 1; i <= shelves; i++) {
  const y = -apo + 2 * apo * i / (shelves + 1);
  parts.push(intersection(translate([-R, y - wall / 2, 0], cube([2 * R, wall, depth])), linearExtrude({ h: depth }, ngon(inR + 0.5))));
}
const piece = parts.length > 1 ? union(...parts) : frame;
// two screws: through the back near the top, or through the top wall of an open frame
const k = Math.min(screwD / 2, Math.max(backT, wall) - 1);
const top = Math.max(...Array.from({ length: sides }, (_, i) => R * Math.sin(a0 + 2 * Math.PI * i / sides)));   // a flat, or a corner
const xs = [-R * 0.22, R * 0.22];
const holes = backT > 0
  ? xs.flatMap((x) => [
      translate([x, apo * 0.55, -1], cylinder({ r: screwD / 2, h: backT + 2, $fn: 24 })),
      translate([x, apo * 0.55, backT - k + 0.02], cylinder({ r1: screwD / 2, r2: screwD / 2 + k, h: k, $fn: 24 })),
    ])
  : xs.map((x) => translate([x, top + 1, depth / 2], rotate([90, 0, 0], cylinder({ r: screwD / 2, h: top - apo + 2.5 * wall / Math.cos(Math.PI / sides) + 2, $fn: 24 }))));
return difference(piece, ...holes);
