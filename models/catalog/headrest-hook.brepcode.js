// Headrest hook: a hook that snaps onto a car headrest post to hang a bag, purse or coat behind the seat.
// Print: upright as shown, no supports. PETG. Not load-rated: groceries, a bag, a coat; nothing heavy in a hard stop.
// Every number below is a slider (Params). From the BREPcode catalog: headrest-hook.
const postD = 12;   // [8:16] headrest post diameter, mm
const grip = 0.3;   // [0:1] how much smaller than the post (grip), mm
const clipH = 18;   // [10:40] clip height along the post, mm
const ringT = 3.5;  // [2.4:6] ring thickness, mm
const armL = 40;    // [20:90] arm length, mm
const armW = 10;    // [6:20] arm width, mm
const armH = 10;    // [6:25] arm height (its strength), mm
const tipH = 14;    // [0:40] tip post height above the arm, mm
const arms = 1;     // [1:2] arms (1 out the back, 2 to the sides)

const r = postD / 2 - grip;                      // a touch smaller: it grips
const ro = r + ringT;
const mouth = postD * 0.8;                        // narrower than the post: it snaps on
const ring = difference(
  cylinder({ r: ro, h: clipH, $fn: 64 }),
  translate([0, 0, -1], cylinder({ r, h: clipH + 2, $fn: 64 })),
  // the mouth faces forward (+x), away from the arms
  translate([0, -mouth / 2, -1], cube([ro + 1, mouth, clipH + 2])),
);
// one arm out the back, or one to each side
const dirs = arms === 2 ? [90, -90] : [180];
const tipT = Math.max(4, armW * 0.6);
const parts = dirs.flatMap((a) => [
  rotate([0, 0, a], translate([ro - 1, -armW / 2, 0], cube([armL + 1, armW, armH]))),
  rotate([0, 0, a], translate([ro + armL - tipT, -armW / 2, 0], cube([tipT, armW, armH + tipH]))),
]);
return union(ring, ...parts);
