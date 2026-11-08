// Drawer divider strips: flat slotted strips that lock together into an egg-crate grid inside a drawer.
// Print: flat as shown, no supports. Turn every other strip over and slot them together.
// Every number below is a slider (Params). From the BREPcode catalog: drawer-divider.
const length = 200;  // [40:250] strip length, mm
const height = 50;   // [15:120] strip height, mm
const stripT = 2;    // [1.2:4] strip thickness, mm
const slots = 3;     // [0:10] slots per strip
const strips = 2;    // [1:6] strips printed at once
const fit = 0.3;     // [0.1:0.8] slot clearance per side, mm

// each strip drawn in x (length) and y (height), lying flat, stripT thick
const slotW = stripT + 2 * fit;
const c = Math.min(3, height / 6);                   // chamfered top corners
const outline = [[0, 0], [length, 0], [length, height - c], [length - c, height], [c, height], [0, height - c]];
const one = linearExtrude({ h: stripT }, polygon(outline));
const cuts = Array.from({ length: slots }, (_, i) => {
  const x = (i + 1) * length / (slots + 1);
  // a slot from the top edge down to just past halfway, with a lead-in
  return linearExtrude({ h: stripT + 2 }, polygon([
    [x - slotW / 2, height / 2 - 0.2], [x + slotW / 2, height / 2 - 0.2], [x + slotW / 2, height - 1.2],
    [x + slotW / 2 + 1, height + 1], [x - slotW / 2 - 1, height + 1], [x - slotW / 2, height - 1.2]]));
}).map((s) => translate([0, 0, -1], s));
const strip = cuts.length ? difference(one, ...cuts) : one;
const gap = Math.max(6, 3 * stripT);
const all = Array.from({ length: strips }, (_, i) => translate([0, i * (height + gap), 0], strip));
return translate([-length / 2, -(strips * (height + gap) - gap) / 2, 0], strips > 1 ? union(...all) : strip);
