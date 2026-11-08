// Tolerance test: a print-in-place plate of pins in holes, each gap a step looser, to find your printer's clearance.
// Print: flat as shown, no supports. The notched corner is the tightest gap.
// Every number below is a slider (Params). From the BREPcode catalog: tolerance-test.
const pinD = 8;     // [3:20] pin diameter, mm
const steps = 5;    // [2:10] how many gaps
const cMin = 0.1;   // [0.05:0.3] tightest gap per side, mm
const cStep = 0.1;  // [0.05:0.3] gap added each step, mm
const plateT = 4;   // [2:10] plate thickness, mm

const gaps = Array.from({ length: steps }, (_, i) => cMin + i * cStep);
const pitch = pinD + 2 * gaps[steps - 1] + 4;
const W = steps * pitch + 4, D = pinD + 2 * gaps[steps - 1] + 8;
const xs = gaps.map((_, i) => -W / 2 + 2 + (i + 0.5) * pitch);
const notch = Math.min(5, D / 3);
const plate = difference(
  translate([-W / 2, -D / 2, 0], cube([W, D, plateT])),
  ...gaps.map((g, i) => translate([xs[i], 0, -1], cylinder({ d: pinD + 2 * g, h: plateT + 2, $fn: 48 }))),
  // the notched corner marks the tight end
  translate([-W / 2, -D / 2, -1], linearExtrude({ h: plateT + 2 }, polygon([[-1, -1], [notch, -1], [-1, notch]]))),
);
const pins = xs.map((x) => translate([x, 0, 0], cylinder({ d: pinD, h: plateT + 3, $fn: 48 })));
return group(plate, ...pins);
