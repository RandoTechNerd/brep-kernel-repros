// S hook: an S-shaped hook for closet rods, rails and racks, sized to the rod.
// Print: flat as shown, no supports. PETG; print a few at once.
// Every number below is a slider (Params). From the BREPcode catalog: s-hook.
const topD = 30;     // [8:80] upper loop (rod) diameter, mm
const bottomD = 25;  // [8:80] lower loop diameter, mm
const mid = 25;      // [0:150] straight middle length, mm
const thick = 6;     // [3:14] loop thickness, mm
const width = 8;     // [4:25] hook width (print height), mm
const curl = 60;     // [20:110] how far each end curls back, degrees

// flat in x/y, printed lying down
const r1 = topD / 2 + thick / 2, r2 = bottomD / 2 + thick / 2;   // centre-line radii
const a = curl * Math.PI / 180;
// a band of the given centre-line radius round (cx, cy) from angle a0 to a1,
// with a rounded end at a1
const band = (cx, cy, r, a0, a1, N = 40) => {
  const at = (rr, t) => [cx + rr * Math.cos(t), cy + rr * Math.sin(t)];
  const outer = Array.from({ length: N + 1 }, (_, i) => at(r + thick / 2, a0 + (a1 - a0) * i / N));
  const end = at(r, a1);
  const cap = Array.from({ length: 11 }, (_, i) => {
    const t = a1 + Math.PI * i / 10;
    return [end[0] + thick / 2 * Math.cos(t), end[1] + thick / 2 * Math.sin(t)];
  });
  const inner = Array.from({ length: N + 1 }, (_, i) => at(r - thick / 2, a1 - (a1 - a0) * i / N));
  return polygon([...outer, ...cap.slice(1, -1), ...inner]);
};
const yTop = mid / 2, yBot = -mid / 2;
const pieces = [
  // the upper loop opens downward on the right: from the top of the middle, over, and back down
  band(-r1, yTop, r1, 0, Math.PI + a),
  // the lower loop opens upward: from the bottom of the middle, under, and back up
  band(r2, yBot, r2, Math.PI, 2 * Math.PI + a),
];
// the straight middle, overlapping a little into both loops
pieces.push(polygon([[-thick / 2, yBot - 0.3], [thick / 2, yBot - 0.3], [thick / 2, yTop + 0.3], [-thick / 2, yTop + 0.3]]));
return union(...pieces.map((p) => linearExtrude({ h: width }, p)));
