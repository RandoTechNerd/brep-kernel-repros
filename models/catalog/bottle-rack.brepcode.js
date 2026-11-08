// Wine rack: a row of cradles that wine bottles, water bottles or cans lie in, stackable in the valleys.
// Print: lying on its side (the scalloped profile on the bed), no supports. Stand it up to use; short ones go in pairs.
// Every number below is a slider (Params). From the BREPcode catalog: bottle-rack.
const count = 3;    // [1:8] bottles side by side
const itemD = 76;   // [20:120] bottle diameter, mm
const gap = 2;      // [0.5:6] room around each bottle, mm
const cradle = 24;  // [5:50] cradle depth, mm
const spacing = 6;  // [0:40] space between bottles, mm
const baseH = 8;    // [3:30] base under the cradles, mm
const depth = 50;   // [10:250] depth along the bottles, mm

// side profile: x across the row, y up; extruded along the bottles
const R = itemD / 2 + gap;
const dp = Math.min(cradle, R * 0.9);
const hw = Math.sqrt(R * R - (R - dp) * (R - dp));   // half width of each scallop at its rim
const pitch = Math.max(itemD + spacing, 2 * hw + 2);
const W = count * pitch;
const top = baseH + dp;
const arc = (cx, N = 24) => Array.from({ length: N + 1 }, (_, i) => {
  const t = Math.asin(hw / R) * (1 - 2 * i / N);    // from the left rim, through the bottom, to the right rim
  return [cx - R * Math.sin(t), baseH + R - R * Math.cos(t)];
});
const outline = [[W, 0], [W, top]];
for (let i = count - 1; i >= 0; i--) {
  const cx = (i + 0.5) * pitch;
  outline.push(...arc(cx).reverse());
}
outline.push([0, top], [0, 0]);
return translate([-W / 2, -top / 2, 0], linearExtrude({ h: depth }, polygon(outline)));
