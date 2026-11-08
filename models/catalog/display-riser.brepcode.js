// Display riser: hollow display steps for figures, amiibo, Funko Pops or model cars.
// Print: lying on its side as shown, no supports; the width becomes the print height.
// Every number below is a slider (Params). From the BREPcode catalog: display-riser.
const steps = 3;    // [1:6] steps
const stepD = 40;   // [15:100] step depth, mm
const stepH = 30;   // [10:80] step height, mm
const width = 180;  // [40:250] width, mm
const wall = 3;     // [2:6] wall thickness, mm

// side profile: x runs front to back, y runs up; printed lying on it, `width` thick
const D = steps * stepD, H = steps * stepH;
const outer = [[0, 0], [D, 0], [D, H]];
for (let k = steps; k >= 1; k--) {
  outer.push([(k - 1) * stepD, k * stepH]);
  if (k > 1) outer.push([(k - 1) * stepD, (k - 1) * stepH]);
}
const solid = linearExtrude({ h: width }, polygon(outer));
if (stepH < 2 * wall + 3 || stepD < 2 * wall + 3) return translate([-D / 2, -H / 2, 0], solid);
// the same staircase, `wall` inside it all round
const inner = [[wall, wall], [D - wall, wall], [D - wall, H - wall]];
for (let k = steps; k >= 1; k--) {
  inner.push([(k - 1) * stepD + wall, k * stepH - wall]);
  if (k > 1) inner.push([(k - 1) * stepD + wall, (k - 1) * stepH - wall]);
}
return translate([-D / 2, -H / 2, 0], difference(solid, translate([0, 0, -1], linearExtrude({ h: width + 2 }, polygon(inner)))));
