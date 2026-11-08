// Nozzle holder: a block that spare 3D printer nozzles screw into, in rows that can step up so every one is in view.
// Print: upright as shown, no supports.
// Every number below is a slider (Params). From the BREPcode catalog: nozzle-holder.
const threadD = 5.6;     // [3:10] hole for the thread (M6 nozzles: 5.6), mm
const holeDepth = 7;     // [3:15] hole depth, mm
const pitch = 12;        // [8:30] spacing between nozzles, mm
const cols = 6;          // [1:12] nozzles per row
const rows = 2;          // [1:8] rows
const blockH = 10;       // [5:25] front row height, mm
const arrange = "flat";  // [flat, stepped] rows level or stepped

const H = Math.max(blockH, holeDepth + 2);           // the hole never breaks through the floor
const rise = arrange === "stepped" ? Math.max(3, pitch * 0.5) : 0;
const W = cols * pitch, D = pitch;
const rowBlocks = Array.from({ length: rows }, (_, j) =>
  translate([-W / 2, -rows * D / 2 + j * D, 0], cube([W, D + (j < rows - 1 ? 0.01 : 0), H + j * rise])));
const holes = [];
for (let j = 0; j < rows; j++) {
  for (let i = 0; i < cols; i++) {
    holes.push(translate([-W / 2 + (i + 0.5) * pitch, -rows * D / 2 + (j + 0.5) * D, H + j * rise - holeDepth],
      cylinder({ d: threadD, h: holeDepth + 1, $fn: 24 })));
  }
}
return difference(rows > 1 ? union(...rowBlocks) : rowBlocks[0], ...holes);
