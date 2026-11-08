// Key rack: a wall rail with a row of pegs for keys, coats, caps or necklaces.
// Print: lying on its back as shown, pegs up, no supports. PETG for coats.
// Every number below is a slider (Params). From the BREPcode catalog: key-rack.
const length = 180;     // [60:250] rail length, mm
const boardH = 60;      // [30:150] rail height, mm
const boardT = 6;       // [4:12] rail thickness, mm
const pegs = 4;         // [1:12] pegs
const pegD = 10;        // [5:20] peg diameter, mm
const pegL = 35;        // [15:80] how far each peg sticks out, mm
const tilt = 15;        // [0:35] upward lean of the pegs, degrees
const cornerR = 6;      // [0.5:20] corner radius, mm
const mount = "screw";  // [screw, keyhole, adhesive] mounting
const screwD = 4.5;     // [3:6] screw diameter, mm

// print orientation: x along the rail, y up the wall, z out from it
const r = pegD / 2;
const flare = Math.min(4, r);
const lean = tilt * Math.PI / 180;
const holed = mount !== "adhesive";
// leave room at each end for a screw head clear of the first peg
const m = holed ? Math.max(length / (2 * pegs), 2 * (screwD + r + flare + 1)) : length / (2 * pegs);
const xs = pegs === 1 ? [length / 2] : Array.from({ length: pegs }, (_, i) => m + (length - 2 * m) * i / (pegs - 1));
const pegY = Math.max(r + flare + 2, boardH * 0.38);
// sink each peg deep enough that its leaning root never lifts off the rail
const embed = 0.5 + (r + flare) * Math.sin(lean);
const len = pegL + embed;
const peg = union(
  cylinder({ r1: r + flare, r2: r, h: flare, $fn: 32 }),
  cylinder({ r, h: len - r, $fn: 32 }),
  translate([0, 0, len - r], sphere({ r, $fn: 32 })),
);
const cr = Math.max(0.5, Math.min(cornerR, boardH / 2 - 0.5, length / 2 - 0.5));
const board = hull(...[[cr, cr], [length - cr, cr], [cr, boardH - cr], [length - cr, boardH - cr]].map(([x, y]) =>
  translate([x, y, 0], cylinder({ r: cr, h: boardT, $fn: 32 }))));
// a leaning root can poke through the back of a thin rail: trim it flush
const railed = difference(
  union(board, ...xs.map((x) => translate([x, pegY, boardT - embed], rotate([-tilt, 0, 0], peg)))),
  translate([-1, -50, -40], cube([length + 2, boardH + 150, 40])),
);
if (!holed) return translate([-length / 2, -boardH / 2, 0], railed);

const hx = [m / 2, length - m / 2];
let cuts;
if (mount === "keyhole") {
  // the head goes in the round end, then the rail drops onto the shank
  const head = screwD * 2;
  const ky = boardH / 2 - head / 2;
  cuts = hx.flatMap((x) => [
    translate([x, ky, -1], cylinder({ d: head, h: boardT + 2, $fn: 32 })),
    translate([x - screwD / 2, ky, -1], cube([screwD, head, boardT + 2])),
    translate([x - head / 2, ky, -1], cube([head, head, boardT - 1.6 + 1])),
  ]);
} else {
  const k = Math.min(screwD / 2, boardT - 1.5);
  cuts = hx.flatMap((x) => [
    translate([x, boardH / 2, -1], cylinder({ r: screwD / 2, h: boardT + 2, $fn: 24 })),
    translate([x, boardH / 2, boardT - k + 0.02], cylinder({ r1: screwD / 2, r2: screwD / 2 + k, h: k, $fn: 24 })),
  ]);
}
return translate([-length / 2, -boardH / 2, 0], difference(railed, ...cuts));
