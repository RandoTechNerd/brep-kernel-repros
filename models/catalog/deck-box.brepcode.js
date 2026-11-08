// Deck box: a box for a deck of cards with a finger scoop and a lift-off lid, sized to the deck.
// Print: as shown: box upright, lid upside down beside it. No supports.
// Every number below is a slider (Params). From the BREPcode catalog: deck-box.
const cardW = 67;          // [40:130] card width (in its sleeve), mm
const cardH = 92;          // [40:130] card height (in its sleeve), mm
const cards = 60;          // [5:200] cards
const sleeve = "sleeved";  // [sleeved, bare, double] sleeves
const wall = 2;            // [1.2:4] wall thickness, mm
const lidH = 35;           // [10:120] lid depth, mm
const fit = 0.25;          // [0.1:0.6] lid clearance per side, mm
const notchW = 30;         // [0:60] finger scoop width (0 = none), mm

const per = sleeve === "bare" ? 0.32 : sleeve === "double" ? 0.8 : 0.65;   // each card's thickness
const stack = cards * per + 2;
const iw = cardW + 1, il = stack + 1;            // half a millimetre of room round the deck
const W = iw + 2 * wall, D = il + 2 * wall;
const flr = Math.max(1.6, wall);
const H = cardH + flr;                           // the deck sits all the way in
const r = Math.min(3, W / 4, D / 4);
// a rounded rectangle w x d, h tall, centred, from z
const rounded = (w, d, h, rr, z = 0) => hull(...[[-1, -1], [1, -1], [-1, 1], [1, 1]].map(([i, j]) =>
  translate([i * (w / 2 - rr), j * (d / 2 - rr), z], cylinder({ r: rr, h, $fn: 24 }))));
let box = difference(rounded(W, D, H, r), rounded(iw, il, H, Math.max(0.4, r - wall), flr));
const nw = Math.min(notchW, iw - 6);
if (nw > 0) {
  // a finger scoop down both faces of the deck, round at the bottom
  const zc = H - Math.max(nw / 2 + 2, Math.min(cardH * 0.35, nw));
  box = difference(box,
    translate([-nw / 2, -D / 2 - 1, zc], cube([nw, D + 2, H])),
    translate([0, D / 2 + 1, zc], rotate([90, 0, 0], cylinder({ r: nw / 2, h: D + 2, $fn: 32 }))));
}
// the lid slides down over the box
const lh = Math.min(lidH, H - 5);
const LW = W + 2 * (fit + wall), LD = D + 2 * (fit + wall);
const lid = difference(rounded(LW, LD, lh + flr, r + fit + wall), rounded(W + 2 * fit, D + 2 * fit, lh + 1, r + fit, flr));
return group(translate([-(LW + 10) / 2, 0, 0], box), translate([(W + 10) / 2, 0, 0], lid));
