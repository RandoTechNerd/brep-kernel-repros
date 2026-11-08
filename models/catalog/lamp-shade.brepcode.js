// Lamp shade: a drum, tapered or bell lamp shade with a fitter ring for E27, E14 or a harp.
// Print: upside down as shown, no supports. Use LED bulbs only: PLA softens at 60 C. Vase-thin walls glow nicely in white or natural PLA.
// Every number below is a slider (Params). From the BREPcode catalog: lamp-shade.
const bottomD = 200;     // [60:250] bottom (wide end) diameter, mm
const topD = 110;        // [40:240] top diameter, mm
const height = 150;      // [40:250] height, mm
const shape = "empire";  // [empire, drum, bell] shape
const fitter = "e27";    // [e27, e14, spider] lamp holder (spider = harp)
const wall = 1.6;        // [0.8:3] wall thickness, mm
const topT = 3;          // [2:6] top ring and spoke thickness, mm
const spokes = 3;        // [3:8] spokes

// upside down: z = 0 is the top (on the bed), the wide end is up
const rb = bottomD / 2;
const hole = fitter === "e14" ? 29 : fitter === "spider" ? 7 : 40.5;   // fitter hole: E14, harp stud, E27/E26
const rh = hole / 2;
const rr = rh + 5;                                       // fitter ring outer radius
// a drum keeps a millimetre of taper: a dead-straight wall cut this way is a slow
// case for the kernel, and nobody can see 0.4 degrees
const rt0 = shape === "drum" ? rb - 1 : topD / 2;
const rt = Math.max(rt0, rr + 12, rb - height * 0.9);    // never widen faster than 45 degrees
const N = shape === "bell" ? 20 : 2;                     // a straight wall needs only its ends
const rAt = (u) => shape === "bell" ? rt + (rb - rt) * u * u : rt + (rb - rt) * u;
let out = Array.from({ length: N + 1 }, (_, i) => [rAt(i / N), height * i / N]);
// a bell's flare can outrun 45 degrees near the rim: hold it back
for (let i = 1; i <= N; i++) out[i][0] = Math.min(out[i][0], out[i - 1][0] + 0.9 * height / N);
const inner = out.map(([r, z]) => [r - wall, z]).filter(([, z]) => z >= topT).reverse();
const skin = revolve(360, polygon([[0, 0], ...out, ...inner, [out[0][0] - wall, topT], [0, topT]]));
// cut the top open between the spokes, leaving the fitter ring
const sector = (a0, a1, r0, r1, n = 12) => polygon([
  ...Array.from({ length: n + 1 }, (_, i) => [r0 * Math.cos(a0 + (a1 - a0) * i / n), r0 * Math.sin(a0 + (a1 - a0) * i / n)]),
  ...Array.from({ length: n + 1 }, (_, i) => [r1 * Math.cos(a1 - (a1 - a0) * i / n), r1 * Math.sin(a1 - (a1 - a0) * i / n)]),
]);
const spokeW = Math.max(5, topT * 2);
const rOut = out[0][0] - wall - 1.5;                     // keep the cut clear of the wall
const gap = (spokeW / 2) / rr;                           // half a spoke, as an angle at the ring
const windows = Array.from({ length: spokes }, (_, i) => {
  const a = 2 * Math.PI * i / spokes;
  return translate([0, 0, -1], linearExtrude({ h: topT + 2 }, sector(a + gap, a + 2 * Math.PI / spokes - gap, rr, rOut)));
});
const bore = translate([0, 0, -1], linearExtrude({ h: topT + 2 }, polygon(Array.from({ length: 48 }, (_, i) => [rh * Math.cos(Math.PI * i / 24), rh * Math.sin(Math.PI * i / 24)]))));
return difference(skin, bore, ...windows);
