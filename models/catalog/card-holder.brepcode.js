// Memory card holder: a stepped stand of slots for SD and microSD cards or USB sticks, every card in view.
// Print: upright as shown, no supports.
// Every number below is a slider (Params). From the BREPcode catalog: card-holder.
const cardW = 24;   // [5:60] card width, mm
const cardH = 32;   // [8:80] card height, mm
const cardT = 2.1;  // [0.6:12] card thickness, mm
const count = 8;    // [1:20] slots per row
const rows = 2;     // [1:4] rows
const hold = 0.45;  // [0.25:0.95] share of each card held in its slot
const fit = 0.35;   // [0.15:0.8] slot clearance, mm

const rib = Math.max(2, cardT * 0.8);
const sw = cardW + fit, st = cardT + fit;            // one slot
const pitch = st + rib;
const W = count * pitch + rib;                       // slots run across
const D = sw + 2 * rib + 2;                          // one row, front to back
const depth = Math.max(2, Math.min(cardH * hold, cardH - 1));
const base = depth + 2;                              // front row height
const rise = Math.max(4, cardH * 0.35);              // each row higher than the one in front
const rowsOf = Array.from({ length: rows }, (_, j) => translate([-W / 2, -rows * D / 2 + j * D, 0], cube([W, D + (j < rows - 1 ? 0.01 : 0), base + j * rise])));
const cuts = [];
for (let j = 0; j < rows; j++) {
  const top = base + j * rise, y0 = -rows * D / 2 + j * D + (D - sw) / 2;
  for (let i = 0; i < count; i++) {
    cuts.push(translate([-W / 2 + rib + i * pitch, y0, top - depth], cube([st, sw, depth + 1])));
  }
}
return difference(rows > 1 ? union(...rowsOf) : rowsOf[0], ...cuts);
