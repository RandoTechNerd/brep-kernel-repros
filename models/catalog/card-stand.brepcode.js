// Card stand: a slotted stand for a photo, place card, table number or small sign.
// Print: upright as shown, no supports.
// Every number below is a slider (Params). From the BREPcode catalog: card-stand.
const length = 60;      // [20:250] length, mm
const depth = 25;       // [12:80] depth, mm
const height = 16;      // [6:60] height, mm
const slotW = 1.2;      // [0.4:6] slot width (card thickness plus room), mm
const slotDepth = 10;   // [4:50] how deep the card sits, mm
const lean = 10;        // [0:25] lean back, degrees
const shape = "block";  // [block, wedge, round] shape
const count = 1;        // [1:12] how many

// x along the stand, y front to back, z up; the slot runs along x
const ys = depth * 0.55;                             // where the slot comes out of the top
const sd = Math.min(slotDepth, height - 2);
let block;
if (shape === "round") {
  block = cylinder({ r: Math.max(length, depth) / 2, h: height, $fn: 72 });
} else {
  // side outline in (y, z), stood up and stretched along x
  const side = shape === "wedge"
    ? [[0, 0], [depth, 0], [depth, height], [ys + 2, height], [0, height * 0.45]]
    : [[0, 0], [depth, 0], [depth, height], [0, height]];
  block = translate([-length / 2, -depth / 2, 0], rotate([90, 90, 0], linearExtrude({ h: length }, polygon(side))));
}
const L = shape === "round" ? Math.max(length, depth) + 2 : length + 2;
// the slot: a thin box leaning back by 'lean', its top well above the stand
const groove = translate([0, ys - depth / 2, height], rotate([-lean, 0, 0],
  translate([-L / 2, -slotW / 2, -sd], cube([L, slotW, sd + 20]))));
const one = () => difference(block, groove);
const D = shape === "round" ? Math.max(length, depth) : depth;
const W = shape === "round" ? D : length;
const cols = Math.min(count, Math.max(1, Math.floor(230 / (W + 6))));
const pieces = Array.from({ length: count }, (_, i) => translate([(i % cols) * (W + 6), Math.floor(i / cols) * (D + 6), 0], one()));
return pieces.length > 1 ? group(...pieces) : pieces[0];
