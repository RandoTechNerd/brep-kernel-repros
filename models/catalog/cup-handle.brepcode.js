// Can handle: a split ring that springs round a can, glass or bottle, with a big D handle for the whole hand.
// Print: upright as shown, no supports. PETG springs better than PLA.
// Every number below is a slider (Params). From the BREPcode catalog: cup-handle.
const itemD = 66.3;  // [25:110] diameter of the can or cup, mm
const ringH = 60;    // [25:120] height, mm
const wall = 3;      // [2:6] ring wall, mm
const gap = 28;      // [15:45] finger room inside the handle, mm
const handleT = 14;  // [8:25] handle thickness, mm
const split = 8;     // [0:30] split in the ring (0 = closed ring that slides on), mm

// the ring stands on the bed; x runs out through the handle
const tight = split > 0 ? -0.5 : 0.3;            // a split ring grips; a closed one slides on
const ri = itemD / 2 + tight;
const R = ri + wall;
const H = ringH;
const rise = Math.tan(50 * Math.PI / 180);
const armT = Math.max(4, handleT * 0.35), armV = armT / Math.cos(50 * Math.PI / 180);
const xi = R - wall / 2;                         // the handle starts inside the ring wall
const room = Math.max(10, Math.min(gap, (H - armV - armT - 8) / rise - (R - xi)));
const xb = R + room, barT = Math.max(6, handleT * 0.6);
const zr = H - armV - (xb - xi) * rise;          // where the top arm meets the ring
const side = [[xi, 0], [xb + barT, 0], [xb + barT, H], [xi, zr + armV], [xi, zr], [xb, H - armV], [xb, armT], [xi, armT]];
const grip = translate([0, handleT / 2, 0], rotate([90, 0, 0], linearExtrude({ h: handleT }, polygon(side))));
const ring = difference(hull(cylinder({ r: R, h: H, $fn: 72 })), translate([0, 0, -1], cylinder({ r: ri, h: H + 2, $fn: 72 })));
const all = union(ring, grip);
const cut = split > 0 ? difference(all, translate([-R - 1, -split / 2, -1], cube([wall + 2, split, H + 2]))) : all;
return translate([-(xb + barT - R) / 2, 0, 0], cut);
