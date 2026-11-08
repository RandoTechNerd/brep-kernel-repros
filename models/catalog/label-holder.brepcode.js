// Label holder: a slide-in label channel that hooks over a bin rim, clamps a shelf edge or sticks on with tape.
// Print: standing on its end as shown, no supports. Slide the label in from the side.
// Every number below is a slider (Params). From the BREPcode catalog: label-holder.
const labelW = 60;    // [20:150] label length, mm
const labelH = 22;    // [8:60] label height, mm
const paperT = 0.8;   // [0.3:3] room for the label's thickness, mm
const wall = 1.6;     // [1.2:3] wall thickness, mm
const mount = "rim";  // [tape, rim, shelf] how it fixes on
const edgeT = 3;      // [1:40] thickness of the rim or shelf it fits, mm
const reach = 10;     // [4:30] how far the hook or clamp reaches, mm

// side profile: x runs back toward the bin or shelf, y runs up; extruded labelW tall
const lipT = wall;
const lipO = Math.min(2.5, labelH * 0.12);           // how far the lips cover the label edges
const H = labelH + 2 * wall;
const bx = lipT + paperT;                            // inside face of the back plate
const bk = bx + wall;                                // outside of the back plate
const rect = (x0, y0, x1, y1) => [[x0, y0], [x1, y0], [x1, y1], [x0, y1]];
const pieces = [[
  [0, 0], [bk, 0], [bk, H], [0, H], [0, H - wall - lipO], [lipT, H - wall - lipO], [lipT, H - wall],
  [bx, H - wall], [bx, wall], [lipT, wall], [lipT, wall + lipO], [0, wall + lipO],
]];
if (mount === "rim") {
  // over the top of a wall edgeT thick, and down its back
  pieces.push(rect(bk - 0.01, H - wall, bk + edgeT + wall, H));
  pieces.push(rect(bk + edgeT, H - wall - reach, bk + edgeT + wall, H));
}
if (mount === "shelf") {
  // arms over and under the front of a board edgeT thick, the lower one with a grip bump
  const yb = H - 2 * wall - edgeT;                   // bottom of the lower arm
  if (yb < 0) pieces.push(rect(bx, yb, bk, 0.01));   // carry the back plate down to it
  pieces.push(rect(bk - 0.01, H - wall, bk + reach, H));
  pieces.push([[bk - 0.01, yb], [bk + reach, yb], [bk + reach, yb + wall], [bk + reach - 1.2, yb + wall + 0.6], [bk + reach - 2.4, yb + wall], [bk - 0.01, yb + wall]]);
}
const solid = pieces.map((p) => linearExtrude({ h: labelW }, polygon(p)));
const lo = mount === "shelf" ? Math.min(0, H - 2 * wall - edgeT) : 0;
return translate([0, -lo, 0], solid.length > 1 ? union(...solid) : solid[0]);
