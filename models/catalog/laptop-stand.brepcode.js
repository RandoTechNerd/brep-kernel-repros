// Laptop stand: a pair of wedges that tilt a laptop or keyboard toward you, with a front lip and air underneath.
// Print: lying on their side as shown, no supports. One wedge goes under each side of the laptop.
// Every number below is a slider (Params). From the BREPcode catalog: laptop-stand.
const angle = 15;   // [3:35] tilt, degrees
const depth = 220;  // [100:250] wedge length front to back, mm
const frontH = 20;  // [4:60] height at the front, mm
const lipH = 8;     // [0:20] front lip height, mm
const wedgeW = 25;  // [10:60] wedge width, mm
const wall = 6;     // [4:12] frame thickness, mm
const pieces = 2;   // [1:2] wedges

// side profile: x runs front to back, y runs up
const a = angle * Math.PI / 180;
const lipT = Math.max(4, wall * 0.7);
const D = depth;
const slope = (x) => frontH + (x - lipT) * Math.tan(a);  // the surface the laptop rests on
const backH = slope(D);
const outline = [[0, 0], [D, 0], [D, backH], [lipT, frontH], [lipT, frontH + lipH], [0, frontH + lipH]];
// window: the outline shrunk by `wall` all round
const m = wall;
const under = (x) => slope(x) - m / Math.cos(a);
const xF = lipT + m, xB = D - m;
let win = null;
if (under(xB) > m + 4) {
  if (under(xF) > m + 2) win = [[xF, m], [xB, m], [xB, under(xB)], [xF, under(xF)]];
  else {
    const x1 = lipT + (m + m / Math.cos(a) - frontH) / Math.tan(a);
    if (x1 < xB - 4) win = [[x1, m], [xB, m], [xB, under(xB)]];
  }
}
const wedge = () => {
  const body = linearExtrude({ h: wedgeW }, polygon(outline));
  return win ? difference(body, translate([0, 0, -1], linearExtrude({ h: wedgeW + 2 }, polygon(win)))) : body;
};
const rowH = Math.max(backH, frontH + lipH) + 8;
const wedges = Array.from({ length: pieces }, (_, i) => translate([-D / 2, i * rowH, 0], wedge()));
return translate([0, -(pieces * rowH - 8) / 2, 0], group(...wedges));
