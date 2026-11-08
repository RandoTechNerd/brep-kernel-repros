// Plant marker: blank plant labels on pointed stakes, with a shallow panel to write on.
// Print: flat as shown, no supports. Write on them with a paint pen, or print the panel in a second colour.
// Every number below is a slider (Params). From the BREPcode catalog: plant-marker.
const labelW = 60;   // [25:120] label width, mm
const labelH = 25;   // [12:80] label height, mm
const stakeL = 100;  // [30:200] stake length, mm
const stakeW = 10;   // [5:20] stake width, mm
const thick = 2.4;   // [1.6:5] thickness, mm
const recess = 0.6;  // [0:1.2] writing panel depth (0 = flat), mm
const count = 3;     // [1:10] how many

const r = Math.min(4, labelH / 3, labelW / 4);           // label corner radius
const sw = Math.min(stakeW, labelW - 2 * r - 1);          // the stake is never wider than the label
const tip = Math.min(sw * 1.5, stakeL * 0.4);             // length of the point
const y0 = stakeL;                                        // the label starts where the stake ends
const arc = (cx, cy, rr, a0, a1, n = 8) => Array.from({ length: n + 1 }, (_, i) => {
  const t = a0 + (a1 - a0) * i / n;
  return [cx + rr * Math.cos(t), cy + rr * Math.sin(t)];
});
const hw = labelW / 2, P = Math.PI;
const outline = [
  [0, 0], [sw / 2, tip], [sw / 2, y0],
  ...arc(hw - r, y0 + r, r, -P / 2, 0), ...arc(hw - r, y0 + labelH - r, r, 0, P / 2),
  ...arc(-hw + r, y0 + labelH - r, r, P / 2, P), ...arc(-hw + r, y0 + r, r, P, 1.5 * P),
  [-sw / 2, y0], [-sw / 2, tip],
];
let one = linearExtrude({ h: thick }, polygon(outline));
const m = 3, rp = Math.max(1, r - 1.5);                   // the writing panel, 3 mm in from the edge
if (recess > 0 && thick - recess >= 0.8 && labelH - 2 * m > 4) {
  const panel = [
    ...arc(hw - m - rp, y0 + m + rp, rp, -P / 2, 0), ...arc(hw - m - rp, y0 + labelH - m - rp, rp, 0, P / 2),
    ...arc(-hw + m + rp, y0 + labelH - m - rp, rp, P / 2, P), ...arc(-hw + m + rp, y0 + m + rp, rp, P, 1.5 * P),
  ];
  one = difference(one, translate([0, 0, thick - recess], linearExtrude({ h: recess + 1 }, polygon(panel))));
}
const pitch = labelW + 6;
return group(...Array.from({ length: count }, (_, i) => translate([(i - (count - 1) / 2) * pitch, -(stakeL + labelH) / 2, 0], one)));
