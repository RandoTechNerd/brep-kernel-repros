// Filament clip: a clip that pushes onto a spool's rim and holds the loose filament end so it never tangles.
// Print: flat as shown, no supports. PETG springs back best.
// Every number below is a slider (Params). From the BREPcode catalog: filament-clip.
const filD = 1.75;  // [1.5:3.2] filament diameter, mm
const flangeT = 3;  // [1:8] spool wall thickness it grips, mm
const armL = 12;    // [6:30] arm length, mm
const armT = 2;     // [1.2:4] arm thickness, mm
const clipW = 8;    // [4:20] clip width, mm

const a = armT;
const g = Math.max(0.6, flangeT - 0.3);              // a little tighter than the wall: it grips
const hb = filD + 2 * a + 1;                         // the block that holds the filament
const blk = Math.max(filD + 2 * a + 2, 6);
const L = blk + armL;
const lead = Math.min(1.2, armL / 4);                // a lead-in at the mouth
const outline = [
  [0, -hb], [blk, -hb], [blk, 0], [L, 0], [L, a * 0.5], [L - lead, a], [blk, a],
  [blk, a + g], [L - lead, a + g], [L, a + g + a * 0.5], [L, 2 * a + g], [0, 2 * a + g],
];
const clip = linearExtrude({ h: clipW }, polygon(outline));
// the filament runs up through the block; it goes in sideways through a slit narrower than it
const yc = -hb / 2;
return translate([-L / 2, 0, 0], difference(clip,
  translate([blk / 2, yc, -1], cylinder({ d: filD + 0.15, h: clipW + 2, $fn: 24 })),
  translate([-1, yc - filD * 0.375, -1], cube([blk / 2 + 1, filD * 0.75, clipW + 2])),
));
