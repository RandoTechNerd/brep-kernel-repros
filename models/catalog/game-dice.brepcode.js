// Game dice: six-sided dice with pips (or blank faces), chamfered edges, one or a set.
// Print: flat as shown, the one face down; no supports. At 25 mm a die is too big to swallow; standard 16 mm dice are small parts (ages 3+).
// Every number below is a slider (Params). From the BREPcode catalog: game-dice.
const size = 25;      // [10:60] die size, mm
const count = 1;      // [1:12] how many dice
const pips = "dots";  // [dots, blank] pips or blank faces
const edge = 1.5;     // [0.4:5] edge chamfer, mm
const pipR = 0.09;    // [0.05:0.13] pip size, as a share of the die

const s = size, c = Math.min(edge, s / 5);
// a cube with every edge chamfered at 45 degrees: the hull of three crossed boxes
const block = hull(
  translate([-s / 2, -s / 2 + c, -s / 2 + c], cube([s, s - 2 * c, s - 2 * c])),
  translate([-s / 2 + c, -s / 2, -s / 2 + c], cube([s - 2 * c, s, s - 2 * c])),
  translate([-s / 2 + c, -s / 2 + c, -s / 2], cube([s - 2 * c, s - 2 * c, s])),
);
// pips: 90 degree cones sunk into each face; opposite faces add to seven
const pr = s * pipR, q = s * 0.26;
const LAYOUT = {
  1: [[0, 0]], 2: [[-q, -q], [q, q]], 3: [[-q, -q], [0, 0], [q, q]], 4: [[-q, -q], [q, -q], [-q, q], [q, q]],
  5: [[-q, -q], [q, -q], [0, 0], [-q, q], [q, q]], 6: [[-q, -q], [q, -q], [-q, 0], [q, 0], [-q, q], [q, q]],
};
// a pip cutter pointing down into the top face, then turned onto each face
const pip = (u, v) => translate([u, v, s / 2 - pr], cylinder({ r1: 0, r2: pr + 0.4, h: pr + 0.4, $fn: 24 }));
const FACES = [[6, [0, 0, 0]], [1, [180, 0, 0]], [2, [90, 0, 0]], [5, [-90, 0, 0]], [3, [0, 90, 0]], [4, [0, -90, 0]]];
const cuts = pips === "dots" ? FACES.flatMap(([n, r]) => LAYOUT[n].map(([u, v]) => rotate(r, pip(u, v)))) : [];
const die = translate([0, 0, s / 2], cuts.length ? difference(block, ...cuts) : block);
const per = Math.ceil(Math.sqrt(count)), pitch = s + 5;
return group(...Array.from({ length: count }, (_, i) => translate([((i % per) - (per - 1) / 2) * pitch, (Math.floor(i / per) - (Math.ceil(count / per) - 1) / 2) * pitch, 0], die)));
