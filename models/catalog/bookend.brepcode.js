// Bookend: an L-shaped bookend with a corner brace; the books stand on its foot and hold it down.
// Print: lying on its side as shown, no supports. Comes as a pair.
// Every number below is a slider (Params). From the BREPcode catalog: bookend.
const height = 150;  // [50:250] upright height, mm
const baseL = 110;   // [40:200] foot length, mm
const width = 110;   // [40:200] width, mm
const thick = 5;     // [3:12] plate thickness, mm
const brace = 40;    // [0:120] corner brace size, mm
const pieces = 2;    // [1:2] bookends

// side profile: x runs along the shelf, y runs up
const tip = Math.min(1.6, thick);                // the foot thins to a slip at its end
const b = Math.min(brace, height - thick - 5, baseL - thick - 10);
const outline = [[0, 0], [baseL, 0], [baseL, tip], [Math.max(thick + b, baseL - 30), thick],
  ...(b > 2 ? [[thick + b, thick], [thick, thick + b]] : [[thick, thick]]),
  [thick, height], [thick * 0.4, height], [0, height - thick * 0.6]];
const one = linearExtrude({ h: width }, polygon(outline));
if (pieces < 2) return translate([-baseL / 2, -height / 2, 0], one);
return translate([-baseL - 4, -height / 2, 0], group(one, translate([2 * baseL + 8, 0, 0], mirror([1, 0, 0], one))));
