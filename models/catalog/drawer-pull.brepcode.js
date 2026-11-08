// Drawer pull: a bar, arch or D pull for two screws at the usual cabinet hole spacings.
// Print: on its side as shown, no supports. PETG or PLA, 100% infill round the posts.
// Every number below is a slider (Params). From the BREPcode catalog: drawer-pull.
const spacing = 96;   // [32:256] hole spacing, centre to centre, mm
const overhang = 20;  // [0:60] bar past each hole, mm
const gap = 25;       // [12:50] finger gap behind the bar, mm
const barT = 10;      // [6:20] bar thickness, mm
const barH = 12;      // [8:30] bar height, mm
const postW = 10;     // [6:20] post width, mm
const style = "bar";  // [bar, arch, square] style
const holeD = 3.4;    // [2.5:5] pilot holes, mm

// the view from above: x along the pull, y out from the door; extruded up
// by the bar height and printed lying that way
const c = spacing / 2;
const pw = postW;
const H = Math.max(barH, holeD * 1.42 + 4);
const top = gap + barT;
const arcAt = (cx, cy, r, a0, a1, n = 16) => Array.from({ length: n + 1 }, (_, i) => {
  const a = a0 + (a1 - a0) * i / n;
  return [cx + r * Math.cos(a), cy + r * Math.sin(a)];
});
const parts = [];
let deep = Math.min(top - 2.5, 15);
if (style === "arch") {
  const yS = gap * 0.35;
  // a circle through (-w, yS), (0, apex) and (w, yS): its centre height and radius
  const circle = (w, apex) => { const k = (apex * apex - yS * yS - w * w) / (2 * (apex - yS)); return [k, apex - k]; };
  const over = (w, apex) => {
    const [k, r] = circle(w, apex);
    return arcAt(0, k, r, Math.atan2(yS - k, -w), Math.atan2(yS - k, w), 32);
  };
  const a = c + pw / 2, b = c - pw / 2;
  parts.push(polygon([[-a, 0], ...over(a, top), [a, 0], [b, 0], ...over(b, gap).reverse(), [-b, 0]]));
  // the post is only as tall as the arch above it
  const [k, r] = circle(a, top);
  deep = Math.min(deep, k + Math.sqrt(r * r - c * c) - 2.5);
} else if (style === "square") {
  const a = c + pw / 2, b = c - pw / 2;
  const rr = Math.min(barT, gap / 2, pw);
  parts.push(polygon([[-a, 0], ...arcAt(-a + rr, top - rr, rr, Math.PI, Math.PI / 2), ...arcAt(a - rr, top - rr, rr, Math.PI / 2, 0),
    [a, 0], [b, 0], [b, gap], [-b, gap], [-b, 0]]));
} else {
  // a straight bar with round ends on two posts, braced where they meet
  const f = Math.min(4, gap * 0.3);
  const rt = barT / 2;
  const half = Math.max(c + pw / 2 + f + rt, c + overhang);
  parts.push(polygon([...arcAt(half - rt, gap + rt, rt, -Math.PI / 2, Math.PI / 2), ...arcAt(-half + rt, gap + rt, rt, Math.PI / 2, 3 * Math.PI / 2)]));
  for (const sx of [-1, 1]) {
    const x0 = sx * c;
    parts.push(polygon([[x0 - pw / 2, 0], [x0 + pw / 2, 0], [x0 + pw / 2, gap - f], [x0 + pw / 2 + f, gap + 0.2], [x0 - pw / 2 - f, gap + 0.2], [x0 - pw / 2, gap - f]]));
  }
}
const pull = parts.length > 1 ? union(...parts.map((p) => linearExtrude({ h: H }, p))) : linearExtrude({ h: H }, parts[0]);
// teardrop pilot holes up each post from the door face
const r = holeD / 2;
const tear = polygon([[0, r * Math.SQRT2], ...Array.from({ length: 19 }, (_, i) => {
  const a = Math.PI / 4 - i * (3 * Math.PI / 2) / 18;
  return [r * Math.cos(a), r * Math.sin(a)];
})]);
const holes = [-c, c].map((x) => translate([x, deep, H / 2], rotate([90, 0, 0], linearExtrude({ h: deep + 1 }, tear))));
return difference(pull, ...holes);
