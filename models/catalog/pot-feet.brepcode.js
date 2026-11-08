// Pot feet: a set of curved risers that lift a pot for drainage, each with a lip to keep the pot on.
// Print: flat as shown, no supports. PETG or ASA outdoors; three under a pot, four under a square one.
// Every number below is a slider (Params). From the BREPcode catalog: pot-feet.
const potD = 150;  // [60:400] pot base diameter, mm
const lift = 15;   // [5:50] how far it lifts the pot, mm
const footW = 35;  // [15:80] foot width, mm
const footD = 30;  // [15:60] how far it reaches under the pot, mm
const lipH = 4;    // [0:12] outer lip height (0 = none), mm
const count = 3;   // [1:8] how many feet

const r = potD / 2;
const lipT = lipH > 0 ? 3 : 0;
const ro = r + 0.5 + lipT, ri = Math.max(ro - footD, ro * 0.3);   // the foot's outer and inner radius
const half = Math.min(1.2, footW / 2 / ro);              // its half angle round the pot
// a slice of a ring, from radius a to b
const slice = (a, b, n = 16) => polygon([
  ...Array.from({ length: n + 1 }, (_, i) => { const t = -half + 2 * half * i / n; return [b * Math.cos(t), b * Math.sin(t)]; }),
  ...Array.from({ length: n + 1 }, (_, i) => { const t = half - 2 * half * i / n; return [a * Math.cos(t), a * Math.sin(t)]; }),
]);
const pad = linearExtrude({ h: lift }, slice(ri, ro));
const one = lipH > 0 ? union(pad, linearExtrude({ h: lift + lipH }, slice(r + 0.5, ro))) : pad;
const pitch = footW + 8;
return group(...Array.from({ length: count }, (_, i) => translate([-(ri + ro) / 2, (i - (count - 1) / 2) * pitch, 0], one)));
