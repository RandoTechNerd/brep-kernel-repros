// Wheel chock: a wedge chock with its face curved to the tire, a toothed sole and a rope hole.
// Print: on its side as shown, no supports; 40%+ infill. Not load-rated: a printed chock is a convenience, never your only brake. Set the parking brake.
// Every number below is a slider (Params). From the BREPcode catalog: wheel-chock.
const tireD = 650;    // [300:900] tire outside diameter, mm
const height = 90;    // [40:160] height, mm
const angle = 45;     // [30:60] face angle, degrees
const topW = 20;      // [5:60] flat top length, mm
const length = 200;   // [80:250] overall length, mm
const width = 120;    // [40:200] width across the tire, mm
const teeth = "yes";  // [yes, no] toothed sole
const ropeD = 12;     // [0:25] rope hole (0 = none), mm

// side profile: x runs back from the toe, y up; printed lying on it
const R = tireD / 2;
const H = height;
const a = angle * Math.PI / 180;
const toe = Math.min(4, H / 10);                 // a blunt toe, not a knife edge
const xt = (H - toe) / Math.tan(a);              // the face's run, toe to top
const L = Math.max(length, xt + topW + H / Math.tan(60 * Math.PI / 180) + 4);
// the face: an arc of the tire's radius from the toe to the top, hollowed toward the tire
const P1 = [0, toe], P2 = [xt, H];
const dx = P2[0] - P1[0], dy = P2[1] - P1[1], c = Math.hypot(dx, dy);
const off = Math.sqrt(Math.max(0, R * R - c * c / 4));
const C = [(P1[0] + P2[0]) / 2 - dy / c * off, (P1[1] + P2[1]) / 2 + dx / c * off];
const a1 = Math.atan2(P1[1] - C[1], P1[0] - C[0]), a2 = Math.atan2(P2[1] - C[1], P2[0] - C[0]);
const face = Array.from({ length: 17 }, (_, i) => {
  const t = a1 + (a2 - a1) * i / 16;
  return [C[0] + R * Math.cos(t), C[1] + R * Math.sin(t)];
});
// the sole: teeth that bite, pointing back toward the toe
const sole = [];
if (teeth === "yes") {
  const n = Math.floor((L - 30) / 12);
  for (let i = n - 1; i >= 0; i--) { const x = 15 + i * 12; sole.push([x + 12, 0], [x + 3, -3], [x, 0]); }
}
const outline = [[0, 0], ...[...sole].reverse(), [L, 0], [xt + topW, H], ...face.slice().reverse()];
const body = linearExtrude({ h: width }, polygon(outline.filter((p, i, arr) => i === 0 || p[0] !== arr[i - 1][0] || p[1] !== arr[i - 1][1])));
if (ropeD <= 0) return translate([-L / 2, 0, 0], body);
const hx = xt + topW / 2 + 6, hy = H * 0.42;
return translate([-L / 2, 0, 0], difference(body, translate([hx, hy, -1], cylinder({ r: ropeD / 2, h: width + 2, $fn: 32 }))));
