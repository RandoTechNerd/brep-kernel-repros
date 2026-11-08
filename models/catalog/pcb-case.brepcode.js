// Board case: a case for a Raspberry Pi, Arduino, Pico or any board: posts at its mounting holes, port openings and a vented lid.
// Print: tray upright, lid beside it with its lip up, no supports.
// Every number below is a slider (Params). From the BREPcode catalog: pcb-case.
const boardW = 85;       // [20:160] board length, mm
const boardD = 56;       // [15:120] board width, mm
const holeDX = 58;       // [0:150] hole spacing along the board (0 = no holes), mm
const holeDY = 49;       // [0:110] hole spacing across the board, mm
const holeX0 = 3.5;      // [1:40] first hole in from the board's end, mm
const holeD = 2.7;       // [1.8:3.5] mounting hole diameter, mm
const postH = 5;         // [3:15] post height under the board, mm
const headroom = 22;     // [6:60] room above the board, mm
const endCut = 50;       // [0:110] port opening in the far end (0 = none), mm
const sideCut = 50;      // [0:150] port opening along the front (0 = none), mm
const vents = 6;         // [0:16] vent slots in the lid
const wall = 2;          // [1.6:3.5] wall thickness, mm
const pattern = "rect";  // [rect, uno] hole pattern

const gap = Math.max(1, wall / 2);                   // room round the board
const floor = Math.max(1.6, wall);
const iw = boardW + 2 * gap, id = boardD + 2 * gap;
const W = iw + 2 * wall, D = id + 2 * wall;
const boardZ = floor + postH;                        // underside of the board
const H = boardZ + 1.6 + headroom;
const rounded = (w, d, h, r, z = 0) => hull(...[[-1, -1], [1, -1], [1, 1], [-1, 1]].map(([sx, sy]) =>
  translate([sx * (w / 2 - r), sy * (d / 2 - r), z], cylinder({ r, h, $fn: 24 }))));
const x0 = -boardW / 2, y0 = -boardD / 2;            // the board's corner
const holes = pattern === "uno"
  ? [[14.0, 2.5], [15.3, 50.6], [66.0, 17.8], [66.0, 45.7]].map(([x, y]) => [x0 + x, y0 + y])
  : holeDX > 0 && holeDY > 0
    ? [[0, 0], [holeDX, 0], [0, holeDY], [holeDX, holeDY]].map(([x, y]) => [x0 + holeX0 + x, -holeDY / 2 + y])
    : [];
const od = Math.max(holeD * 2.2, holeD + 3);
const supports = holes.length
  ? holes.map(([x, y]) => difference(
      translate([x, y, floor - 0.01], cylinder({ d: od, h: postH + 0.01, $fn: 24 })),
      translate([x, y, floor + 0.6], cylinder({ d: holeD - 0.5, h: postH, $fn: 16 }))))
  // no holes: the board rests on a ledge round the inside
  : [difference(rounded(iw + 0.02, id + 0.02, postH + 0.01, 1, floor - 0.01), translate([0, 0, -1], rounded(iw - 3, id - 3, postH + floor + 2, 0.5)))];
const tray = union(difference(rounded(W, D, H, 3), rounded(iw, id, H, 1, floor)), ...supports);
// port openings, cut down from the rim to just below the board's top face
const portZ = boardZ + 1.1;
const cuts = [];
const ec = Math.min(endCut, id - 2);
if (ec > 0) cuts.push(translate([W / 2 - wall - 1, -ec / 2, portZ], cube([wall + 2, ec, H])));
const sc = Math.min(sideCut, iw - 4);
if (sc > 0) cuts.push(translate([-iw / 2 + 2, -D / 2 - 1, portZ], cube([sc, wall + 2, H])));
const caseBody = cuts.length ? difference(tray, ...cuts) : tray;
// the lid: a plate with a lip that drops inside the walls, and vent slots
const fit = Math.min(0.3, wall / 5), lipT = Math.max(1.2, wall * 0.6), lipH = Math.min(3, headroom - 1);
const lid = union(
  rounded(W, D, 2, 3),
  difference(rounded(iw - 2 * fit, id - 2 * fit, lipH + 0.01, 1, 1.99), rounded(iw - 2 * fit - 2 * lipT, id - 2 * fit - 2 * lipT, lipH + 1, 0.5, 1.5)),
);
const vlen = Math.max(4, id * 0.55);
const vp = Math.max(5, wall + 3);
const nv = Math.min(vents, Math.floor((iw - 10) / vp));
const slots = Array.from({ length: Math.max(0, nv) }, (_, i) =>
  translate([(i - (nv - 1) / 2) * vp, 0, -1], hull(translate([0, -vlen / 2, 0], cylinder({ d: 2.4, h: 5, $fn: 12 })), translate([0, vlen / 2, 0], cylinder({ d: 2.4, h: 5, $fn: 12 })))));
const lidDone = slots.length ? difference(lid, ...slots) : lid;
return group(caseBody, translate([0, D + 10, 0], lidDone));
