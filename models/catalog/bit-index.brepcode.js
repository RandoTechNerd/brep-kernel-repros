// Bit holder block: a bench block of holes that stands bits up by their shanks, hex or round, even or graduated in size.
// Print: upright as shown, no supports. The holes are sized with the clearance below; print one row first if the fit matters.
// Every number below is a slider (Params). From the BREPcode catalog: bit-index.
const form = "hex";  // [hex, round] hole shape
const holeD = 6.35;  // [1:30] first hole size (across the flats for hex), mm
const stepD = 0;     // [0:3] each hole bigger than the last by (0 = all the same), mm
const count = 10;    // [1:30] holes per row
const rows = 2;      // [1:6] rows
const fit = 0.2;     // [0:1] clearance per side, mm
const gap = 4;       // [1.5:40] plastic between holes, mm
const depth = 12;    // [3:60] hole depth, mm
const floor = 2;     // [1:10] floor under the holes, mm
const rise = 0;      // [0:30] each row higher than the one in front (stadium), mm

// hole i (counting along each row, then on to the next row) is holeD + i * stepD
const total = count * rows;
const sizeOf = (i) => holeD + i * stepD + 2 * fit;           // the bore across its flats
const hex = form === "hex";
const across = (s) => hex ? s / Math.cos(Math.PI / 6) : s;   // across the corners
const edge = Math.max(3, gap);                               // plastic past the outer holes
const rowsList = Array.from({ length: rows }, (_, r) => Array.from({ length: count }, (_, c) => r * count + c).filter((i) => i < total));
// x of each hole along its row: each pair of neighbours is gap apart, edge to edge
const placed = rowsList.map((ids) => {
  let x = edge;
  return ids.map((i, k) => {
    const w = across(sizeOf(i));
    if (k) x += across(sizeOf(ids[k - 1])) / 2 + gap + w / 2; else x += w / 2;
    return { i, x, w };
  });
});
const width = Math.max(...placed.map((row) => row[row.length - 1].x + row[row.length - 1].w / 2 + edge));
const rowDepth = placed.map((row) => Math.max(...row.map((h) => h.w)) + gap);
const ys = [];
let y = edge - gap / 2;
for (const d of rowDepth) { ys.push(y + d / 2); y += d; }
const deep = y + edge - gap / 2;
// one block per row, each a little taller than the one in front
const blocks = rowDepth.map((d, r) => translate([0, ys[r] - d / 2 - (r === 0 ? edge - gap / 2 : 0), 0],
  cube([width, d + (r === 0 ? edge - gap / 2 : 0) + (r === rows - 1 ? edge - gap / 2 : 0.01), floor + depth + r * rise])));
// a row of smaller holes is centred rather than bunched at one end
const shift = placed.map((row) => (width - (row[row.length - 1].x + row[row.length - 1].w / 2 + edge)) / 2);
const holes = placed.flatMap((row, r) => row.map((h) => translate([h.x + shift[r], ys[r], floor + r * rise],
  rotate([0, 0, 30], cylinder({ r: across(sizeOf(h.i)) / 2, h: depth + 1, $fn: hex ? 6 : 32 })))));
return translate([-width / 2, -deep / 2, 0], difference(union(...blocks), ...holes));
