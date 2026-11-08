// Tangram: the seven-piece tangram puzzle cut from a square, with a tray to keep it in.
// Print: flat as shown, no supports. At the default size the smallest piece is 55 mm long: no small parts.
// Every number below is a slider (Params). From the BREPcode catalog: tangram.
const size = 110;    // [60:200] square size, mm
const thick = 6;     // [3:15] piece thickness, mm
const gap = 0.8;     // [0.2:3] gap between pieces, mm
const tray = "yes";  // [yes, no] storage tray

// the classic seven, on a unit square
const unit = [
  [[0, 0], [1, 0], [0.5, 0.5]], [[0, 0], [0.5, 0.5], [0, 1]], [[1, 1], [0.5, 1], [1, 0.5]],
  [[1, 0], [1, 0.5], [0.75, 0.75], [0.75, 0.25]], [[0.75, 0.25], [0.75, 0.75], [0.5, 0.5]],
  [[0.5, 0.5], [0.75, 0.75], [0.5, 1], [0.25, 0.75]], [[0.25, 0.75], [0.5, 1], [0, 1]],
];
// shrink a convex piece by d all round: move each edge in, find the corners again
const inset = (pts, d) => {
  let area = 0;
  for (let i = 0; i < pts.length; i++) { const [x1, y1] = pts[i], [x2, y2] = pts[(i + 1) % pts.length]; area += x1 * y2 - x2 * y1; }
  const P = area < 0 ? [...pts].reverse() : pts, n = P.length;
  const line = (i) => {
    const a = P[i], b = P[(i + 1) % n], L = Math.hypot(b[0] - a[0], b[1] - a[1]);
    const u = [(b[0] - a[0]) / L, (b[1] - a[1]) / L];
    return { p: [a[0] - u[1] * d, a[1] + u[0] * d], u };
  };
  return P.map((_, i) => {
    const A = line((i + n - 1) % n), B = line(i);
    const det = A.u[0] * B.u[1] - A.u[1] * B.u[0];
    const t = ((B.p[0] - A.p[0]) * B.u[1] - (B.p[1] - A.p[1]) * B.u[0]) / det;
    return [A.p[0] + A.u[0] * t, A.p[1] + A.u[1] * t];
  });
};
const S = size;
const pieces = unit.map((p) => linearExtrude({ h: thick }, polygon(inset(p.map(([x, y]) => [x * S - S / 2, y * S - S / 2]), gap / 2))));
if (tray !== "yes") return group(...pieces);
// the tray: a square pocket a little bigger than the puzzle
const rim = 4, fl = 2, clr = 0.6, T = S + 2 * clr + 2 * rim, depth = Math.max(3, thick * 0.6);
const box = difference(translate([-T / 2, -T / 2, 0], cube([T, T, fl + depth])), translate([-S / 2 - clr, -S / 2 - clr, fl], cube([S + 2 * clr, S + 2 * clr, depth + 1])));
return group(translate([-(T + 6) / 2, 0, 0], group(...pieces)), translate([S / 2 + 6 + T / 2 - (T + 6) / 2, 0, 0], box));
