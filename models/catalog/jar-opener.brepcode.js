// Jar opener: a long-handled opener with stepped, toothed pockets that grip a range of jar lids and bottle caps.
// Print: flat as shown, pockets up, no supports.
// Every number below is a slider (Params). From the BREPcode catalog: jar-opener.
const lidMax = 90;   // [30:130] biggest lid, mm
const lidMin = 30;   // [15:110] smallest lid, mm
const steps = 4;     // [1:6] lid sizes (steps)
const stepH = 6;     // [3:14] depth of each step, mm
const handleL = 90;  // [0:160] handle length, mm
const wall = 4;      // [3:8] rim thickness, mm

const lo = Math.min(lidMin, lidMax - 2);
const R = lidMax / 2 + wall;                     // the round end
const flr = Math.max(2.4, wall * 0.75);
const T = steps * stepH + flr;
const tipR = Math.max(10, Math.min(16, R * 0.5));
const paddle = handleL > 0
  ? hull(cylinder({ r: R, h: T, $fn: 64 }), translate([R + handleL, 0, 0], cylinder({ r: tipR, h: T * 0.75, $fn: 32 })))
  : hull(cylinder({ r: R, h: T, $fn: 64 }));
// each step is a toothed round pocket; the teeth (about 4 mm apart) bite the lid's edge
const toothed = (d) => {
  const n = Math.max(12, Math.round(Math.PI * d / 4));
  return polygon(Array.from({ length: 2 * n }, (_, i) => {
    const a = Math.PI * i / n, r = d / 2 + (i % 2 ? 1.2 : 0);
    return [r * Math.cos(a), r * Math.sin(a)];
  }));
};
const cuts = Array.from({ length: steps }, (_, i) => {
  const d = steps < 2 ? lidMax : lidMax - (lidMax - lo) * i / (steps - 1);
  return translate([0, 0, T - (i + 1) * stepH], linearExtrude({ h: (i + 1) * stepH + 1 }, toothed(d)));
});
if (handleL > 0) cuts.push(translate([R + handleL, 0, -1], cylinder({ r: Math.min(5, tipR / 2), h: T + 2, $fn: 24 })));
return translate([-(R + handleL) / 2 + R / 2 - (handleL > 0 ? tipR / 2 : 0), 0, 0], difference(paddle, ...cuts));
