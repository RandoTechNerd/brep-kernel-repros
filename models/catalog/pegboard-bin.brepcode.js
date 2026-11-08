// Pegboard bin: a bin, cup or shelf that hangs on 1/4 inch pegboard by its own pegs.
// Print: upright as shown, no supports. PETG if it will carry tools.
// Every number below is a slider (Params). From the BREPcode catalog: pegboard-bin.
const width = 80;          // [30:200] width (or cup diameter), mm
const depth = 50;          // [20:150] depth out from the board, mm
const height = 60;         // [15:150] bin height, mm
const backH = 0;           // [0:80] back plate above the rim, mm
const wall = 1.8;          // [1.2:4] wall thickness, mm
const floor = 2;           // [1.2:5] floor thickness, mm
const cornerR = 5;         // [1:20] front corner radius, mm
const shape = "box";       // [box, cup] shape
const board = "pegboard";  // [pegboard, small] board (small = 1/8 in pegboard)

// x across, y out from the board (the board's face is y = 0), z up
const small = board === "small";
const tB = small ? 3.2 : 6.35;                       // board thickness
const hd = (small ? 4.76 : 6.35) - 0.45;             // diamond diagonal: just under the hole
const s = hd / Math.SQRT2;                           // the upturn's square section
const rise = small ? 5 : 7;                          // how far it turns up behind the board
const backT = Math.max(3, wall);
const top = height + backH;
const zU = top - hd / 2 - 2;                         // the hooking pegs
const zL = zU - 25.4;                                // the resting pegs, one hole down
const span = Math.floor((width - 2 * wall - hd) / 25.4);
const xs = span >= 1 ? [-span * 25.4 / 2, span * 25.4 / 2] : [0];
const diamond = polygon([[0, -hd / 2], [hd / 2, 0], [0, hd / 2], [-hd / 2, 0]]);
// a peg straight back from the plate: the diamond stretched along -y
const peg = (x, z, len) => translate([x, 0.5, z], rotate([90, 0, 0], linearExtrude({ h: len + 0.5 }, diamond)));
const reachBack = tB + 0.4 + s;
const pegs = xs.flatMap((x) => [
  peg(x, zU, reachBack),
  translate([x - s / 2, -reachBack, zU], cube([s, s, hd / 2 + rise])),
  ...(zL >= hd / 2 + 0.5 ? [peg(x, zL, tB - 0.6)] : []),
]);

let bin;
if (shape === "cup") {
  const R = width / 2;
  const outer = union(
    translate([0, R, 0], cylinder({ r: R, h: height, $fn: 64 })),
    translate([-R, 0, 0], cube([2 * R, backT, top])),
  );
  bin = difference(outer, translate([0, R, floor], cylinder({ r: R - wall, h: top, $fn: 64 })));
} else {
  const rr = Math.max(0.6, Math.min(cornerR, width / 2 - 1, depth / 2 - 1));
  // a flat back against the board, rounded front corners
  const box = (w, d, y0, z0, h, r) => hull(
    translate([-w / 2, y0, z0], cube([w, 0.1, h])),
    translate([-w / 2 + r, y0 + d - r, z0], cylinder({ r, h, $fn: 32 })),
    translate([w / 2 - r, y0 + d - r, z0], cylinder({ r, h, $fn: 32 })),
  );
  const outer = backH > 0
    ? union(box(width, depth, 0, 0, height, rr), translate([-width / 2, 0, 0], cube([width, backT, top])))
    : box(width, depth, 0, 0, height, rr);
  bin = difference(outer, box(width - 2 * wall, depth - backT - wall, backT, floor, top, Math.max(0.5, rr - wall)));
}
return union(bin, ...pegs);
