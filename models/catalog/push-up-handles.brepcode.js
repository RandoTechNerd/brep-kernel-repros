// Push-up handles: a push-up handle in three flat parts: two legs and a keyed grip that presses into them.
// Print: all parts flat as shown, no supports. You put your weight on it: PETG, 6 walls, 40% infill, and glue the pegs. Print two.
// Every number below is a slider (Params). From the BREPcode catalog: push-up-handles.
const gripD = 32;    // [24:45] grip thickness, mm
const gripL = 110;   // [80:180] grip length between the legs, mm
const height = 100;  // [50:200] leg height, mm
const baseL = 110;   // [60:200] foot length, front to back, mm
const legT = 12;     // [8:20] leg thickness, mm
const fit = 0.25;    // [0:0.8] peg clearance per side, mm

// the grip's cross-section: a circle of radius r with a flat underside and 50 degree chamfers up to it
const teardrop = (r, n = 40) => {
  const a = 0.766 * r - 0.839 * 0.357 * r;               // half the flat
  const pts = [[-a, 0], [a, 0]];
  for (let i = 0; i <= n; i++) {
    const t = (-40 + 260 * i / n) * Math.PI / 180;
    pts.push([r * Math.cos(t), r + r * Math.sin(t)]);
  }
  return polygon(pts);
};
const r = gripD / 2, rp = r - 4;                         // the pegs are 4 mm smaller, sharing the flat
// grip: profile x across, profile y up; lying along x on its flat
const along = (prof, len, x0) => translate([x0, 0, 0], rotate([90, 90, 0], linearExtrude({ h: len }, prof)));
const grip = union(along(teardrop(r), gripL, 0), along(teardrop(rp), legT + 0.01, -legT), along(teardrop(rp), legT + 0.01, gripL - 0.01));

// a leg: a side-view trapezoid lying flat, with the peg's socket near the top
const H = height, B = baseL, T = 2 * r + 12;
const ys = Math.max(8, H - 6 - 2 * rp);                  // bottom of the socket
const leg = difference(
  linearExtrude({ h: legT }, polygon([[-B / 2, 0], [B / 2, 0], [T / 2, H], [-T / 2, H]])),
  translate([0, ys - fit, -1], linearExtrude({ h: legT + 2 }, teardrop(rp + fit))),
);
return group(
  translate([-B / 2 - 4, 0, 0], leg), translate([B / 2 + 4, 0, 0], leg),
  translate([-gripL / 2, H + 10 + r, 0], grip),
);
