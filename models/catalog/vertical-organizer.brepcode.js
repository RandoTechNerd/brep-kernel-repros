// Vertical organizer: a base with upright dividers that holds laptops, tablets, mail or folders on edge.
// Print: upright as shown, no supports.
// Every number below is a slider (Params). From the BREPcode catalog: vertical-organizer.
const slots = 2;    // [1:8] slots
const slotW = 22;   // [3:60] slot width, mm
const finH = 60;    // [15:200] divider height, mm
const depth = 100;  // [30:250] depth front to back, mm
const finT = 8;     // [3:20] divider thickness, mm
const baseT = 4;    // [2:12] base thickness, mm
const step = 0;     // [0:40] each divider taller than the last by, mm

// end profile: x runs across the slots, y runs up; pushed back `depth` along y
const pitch = slotW + finT;
const width = slots * pitch + finT;
const c = Math.min(1.5, finT / 3);               // a small chamfer on each divider top
const pts = [[0, 0], [width, 0]];
for (let k = slots; k >= 0; k--) {
  const x0 = k * pitch, x1 = x0 + finT, h = baseT + finH + k * step;
  pts.push([x1, h - c], [x1 - c, h], [x0 + c, h], [x0, h - c]);
  if (k > 0) pts.push([x0, baseT], [x0 - slotW, baseT]);
}
const comb = rotate([90, 0, 0], linearExtrude({ h: depth }, polygon(pts)));
return translate([-width / 2, depth / 2, 0], comb);
