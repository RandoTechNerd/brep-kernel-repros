// Bed clip: a spring clip that holds a glass or mirror build plate onto the printer's bed.
// Print: on its side as shown, no supports. PETG or ABS: the bed gets warm.
// Every number below is a slider (Params). From the BREPcode catalog: bed-clip.
const bedT = 3;       // [1:8] bed thickness, mm
const glassT = 4;     // [1:8] glass or plate thickness, mm
const lipL = 8;       // [4:20] how far it reaches over the glass, mm
const backL = 14;     // [6:30] how far it reaches under the bed, mm
const width = 12;     // [6:30] clip width, mm
const wallT = 3;      // [2:5] clip thickness, mm
const squeeze = 0.3;  // [0:1] how much tighter than bed plus glass, mm

// side profile: x runs in over the bed, y runs up; the bed's edge sits against x = 0
const t = wallT;
const open = Math.max(1, bedT + glassT - squeeze);
const nub = Math.min(0.8, open / 3);
const outline = [
  [-t, 0], [backL, 0], [backL, t], [0, t],
  [0, open + t], [lipL - 2.5, open + t], [lipL - 1.2, open + t - nub], [lipL, open + t],
  [lipL, open + 2 * t], [-t, open + 2 * t],
];
return linearExtrude({ h: width }, polygon(outline));
