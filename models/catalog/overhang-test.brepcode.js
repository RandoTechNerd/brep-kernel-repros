// Overhang test: a row of fins leaning out at rising angles, to see how steep an overhang your printer manages.
// Print: as shown, with no supports: the drooping fins are the result.
// Every number below is a slider (Params). From the BREPcode catalog: overhang-test.
const angleMin = 30;  // [10:60] first fin's lean from upright, degrees
const angleMax = 80;  // [40:85] last fin's lean from upright, degrees
const steps = 6;      // [2:9] how many fins
const slant = 15;     // [8:40] fin length, mm
const finW = 8;       // [4:20] fin width, mm

const hi = Math.max(angleMax, angleMin + 5);          // the last fin always leans furthest
const angles = Array.from({ length: steps }, (_, i) => angleMin + (hi - angleMin) * i / (steps - 1));
const finT = Math.max(2, finW / 4);
const tallest = slant * Math.cos(angleMin * Math.PI / 180) + finT;
const backT = Math.max(3, finW * 0.4), gap = Math.max(2, finW / 4);
const span = steps * (finW + gap) + gap;
// a fin drawn in (x out from the wall, z up), stood up at y
// rotate([90, 0, 0]) keeps the profile's x, sends its y to z, and the extrusion to -y
const fin = (deg, y) => {
  const a = deg * Math.PI / 180;
  const ox = slant * Math.sin(a), oz = slant * Math.cos(a);
  return translate([0, y + finW, 0], rotate([90, 0, 0], linearExtrude({ h: finW },
    polygon([[-0.01, 0], [ox, oz], [ox, oz + finT], [-0.01, oz + finT]]))));
};
return translate([0, -span / 2, 0], union(
  translate([-backT, 0, 0], cube([backT, span, tallest])),
  ...angles.map((d, i) => fin(d, gap + i * (finW + gap))),
));
