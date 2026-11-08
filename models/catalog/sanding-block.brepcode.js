// Sanding block: a hand sanding block with a rounded grip and end slots that clamp the sandpaper.
// Print: flat side down as shown, no supports.
// Every number below is a slider (Params). From the BREPcode catalog: sanding-block.
const length = 120;   // [40:230] sole length, mm
const width = 70;     // [12:120] sole width, mm
const baseH = 14;     // [6:40] sole thickness, mm
const grip = 22;      // [0:50] grip height above the sole (0 = flat), mm
const slotDepth = 9;  // [0:30] paper slot depth (0 = none), mm
const slotW = 1.6;    // [0.8:4] paper slot width, mm

// side profile: x along the sole, y up; extruded across the width
const e = Math.min(18, length / 5);              // flat zone at each end for the paper slot
const sd = Math.min(slotDepth, baseH - 3);       // a slot never goes through the sole
const span = length - 2 * e;
const steps = grip > 0 ? Array.from({ length: 33 }, (_, i) => {
  const x = length - e - span * i / 32;          // back across the top, end to end
  return [x, baseH + grip * Math.pow(Math.sin(Math.PI * i / 32), 0.7)];
}) : [];
const outline = [[0, 0], [length, 0], [length, baseH], ...steps, [0, baseH]];
const across = (pts) => translate([0, width / 2, 0], rotate([90, 0, 0], linearExtrude({ h: width }, polygon(pts))));
const across2 = (pts) => translate([0, width / 2 + 1, 0], rotate([90, 0, 0], linearExtrude({ h: width + 2 }, polygon(pts))));
const sole = across(outline);
if (sd <= 0) return translate([-length / 2, 0, 0], sole);
// each slot leans 20 degrees in toward the middle as it goes down
const lean = Math.tan(20 * Math.PI / 180);
const slotAt = (x0, dir) => across2([
  [x0 - slotW / 2, baseH + 1], [x0 + slotW / 2, baseH + 1],
  [x0 + slotW / 2 + dir * lean * (sd + 1), baseH - sd], [x0 - slotW / 2 + dir * lean * (sd + 1), baseH - sd],
]);
return translate([-length / 2, 0, 0], difference(sole, slotAt(e * 0.45, 1), slotAt(length - e * 0.45, -1)));
