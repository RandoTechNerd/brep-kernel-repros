// Puck and disc stand: a slotted stand that holds a puck, disc, medal or coin upright, leaning back a little.
// Print: upright as shown, no supports.
// Every number below is a slider (Params). From the BREPcode catalog: puck-stand.
const itemD = 76.2;  // [20:300] diameter of what it holds, mm
const itemT = 25.4;  // [1:40] thickness of what it holds, mm
const lean = 12;     // [0:30] lean back, degrees
const height = 18;   // [8:60] stand height, mm
const fit = 0.6;     // [0.2:2] slot clearance, mm

const st = itemT + fit;                                   // slot width
const W = Math.max(40, itemD * 0.45);                     // across, under the item
const D = Math.max(36, st + 24, itemD * 0.3);             // front to back: room behind for the lean
const c = Math.min(3, height / 4);
const rr = Math.min(8, D / 3);
const corners = (w, d, r, z, h) => [[r, r], [w - r, r], [r, d - r], [w - r, d - r]].map(([x, y]) =>
  translate([x - w / 2, y - d / 2, z], cylinder({ r, h, $fn: 24 })));
const block = hull(...corners(W, D, rr, 0, height - c), ...corners(W - 2 * c, D - 2 * c, rr - c * 0.6, height - 0.5, 0.5));
const sd = Math.min(height - 3, Math.max(6, itemD * 0.12));   // slot depth
const yc = -D * 0.15;                                     // a little in front of centre, so more base is behind
const notch = translate([0, yc, height - sd], rotate([-lean, 0, 0], translate([-W / 2 - 1, -st / 2, 0], cube([W + 2, st, sd + height]))));
return difference(block, notch);
