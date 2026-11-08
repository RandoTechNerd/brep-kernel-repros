// Book page holder: a thumb ring with two wings that holds a book open, for reading with one hand.
// Print: flat as shown, no supports.
// Every number below is a slider (Params). From the BREPcode catalog: page-holder.
const span = 75;    // [40:120] wing span, mm
const wingW = 30;   // [18:50] wing depth, mm
const thumbD = 22;  // [14:32] thumb hole, mm
const thick = 3.5;  // [2:8] thickness, mm

// lying flat: the wings run along x
const w = Math.max(wingW, thumbD + 8);           // keeps at least 4 mm round the thumb
const half = Math.max(span / 2, w / 2 + 2);
const bar = hull(...[-1, 1].map((s) => translate([s * (half - w / 2), 0, 0], cylinder({ r: w / 2, h: thick, $fn: 40 }))));
return difference(bar, translate([0, 0, -1], cylinder({ r: thumbD / 2, h: thick + 2, $fn: 40 })));
