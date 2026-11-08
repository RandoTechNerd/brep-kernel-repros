// Birdhouse: a nest box with the entrance hole, floor and height for a chosen bird, and a push-in floor for cleaning.
// Print: house upright and floor flat beside it, no supports. PETG or ASA in a pale colour so it stays cool; screw it to a post or hang it by the tab.
// Every number below is a slider (Params). From the BREPcode catalog: birdhouse.
const floorW = 102;  // [70:180] inside floor size (square), mm
const wallH = 160;   // [80:220] wall height to the eaves, mm
const holeD = 28.6;  // [20:60] entrance hole diameter, mm
const holeH = 120;   // [30:200] hole centre above the floor, mm
const wall = 3;      // [2:6] wall thickness, mm
const fit = 0.4;     // [0.1:1] floor plug clearance per side, mm

const W = floorW + 2 * wall;                              // outside of the walls
const ridge = wallH + W / 2;                              // 45 degree roof
// a front profile turned up and stretched front to back, y from y0 to y0 + h
const across = (pts, h, y0) => translate([0, y0 + h, 0], rotate([90, 0, 0], linearExtrude({ h }, polygon(pts))));
const outside = across([[-W / 2, 0], [W / 2, 0], [W / 2, wallH], [0, ridge], [-W / 2, wallH]], W, -W / 2);
const a = W / 2 - wall, s2 = wall * Math.SQRT2;           // inside: walls and roof a wall thickness in
const inside = across([[-a, -1], [a, -1], [a, wallH + wall - s2], [0, ridge - s2], [-a, wallH + wall - s2]], W - 2 * wall, -W / 2 + wall);
const hd = Math.min(holeD, floorW - 16);
const hz = Math.max(hd / 2 + 10, Math.min(holeH, wallH - hd / 2 - 6));
const alongY = (x, z, r, y0, h) => translate([x, y0, z], rotate([-90, 0, 0], cylinder({ r, h, $fn: 40 })));
const alongX = (y, z, r, x0, h) => translate([x0, y, z], rotate([0, 90, 0], cylinder({ r, h, $fn: 16 })));
const house = difference(outside, inside,
  alongY(0, hz, hd / 2, -W / 2 - 1, wall + 2),                                 // the entrance
  alongX(0, wallH - 10, 3, -W / 2 - 1, W + 2),                                 // vents through both sides
  alongY(-W / 4, wallH * 0.3, 2.3, W / 2 - wall - 1, wall + 2),                 // screw holes for a post
  alongY(W / 4, wallH * 0.3, 2.3, W / 2 - wall - 1, wall + 2),
);
// a hanging tab on the ridge
const tabZ = ridge - 1.2 * wall;
const tab = difference(translate([-2, -14, tabZ], cube([4, 28, ridge + 16 - tabZ])), alongX(0, ridge + 8, 3.5, -3, 6));
// the floor: a plate with a lip that pushes up inside the walls, and drain holes
const lw = floorW - 2 * fit, lt = 2;
const lip = difference(translate([-lw / 2, -lw / 2, 2.99], cube([lw, lw, 8])), translate([-lw / 2 + lt, -lw / 2 + lt, 2], cube([lw - 2 * lt, lw - 2 * lt, 10])));
const plug = difference(union(translate([-W / 2, -W / 2, 0], cube([W, W, 3])), lip),
  ...[[-1, -1], [1, -1], [-1, 1], [1, 1]].map(([i, j]) => translate([i * lw / 4, j * lw / 4, -1], cylinder({ r: 3, h: 5, $fn: 16 }))));
return group(union(house, tab), translate([W + 8, 0, 0], plug));
