// Pill splitter: a block with a V groove that cradles a tablet and a slot that guides a blade through its middle.
// Print: upright as shown, no supports. Use a single-edge razor or a thin knife through the slot.
// Every number below is a slider (Params). From the BREPcode catalog: pill-splitter.
const pillD = 9;    // [3:20] tablet width, mm
const slotW = 1;    // [0.5:2.5] blade slot width, mm
const length = 60;  // [30:120] length, mm
const width = 40;   // [20:80] width, mm
const height = 15;  // [8:30] height, mm

// end profile across the groove: x runs across, y runs up; pushed along the length
const hw = pillD / 2 + 0.8;                      // the groove's half width at the top (45 degree sides)
const H = Math.max(height, hw + 4);
const W = Math.max(width, 2 * hw + 10);
const prof = [[0, 0], [W, 0], [W, H], [W / 2 + hw, H], [W / 2, H - hw], [W / 2 - hw, H], [0, H]];
const block = rotate([0, 0, 90], rotate([90, 0, 0], linearExtrude({ h: length }, polygon(prof))));
// the blade slot, straight across the middle and down past the groove's bottom
const bladeSlot = translate([length / 2 - slotW / 2, -1, H - hw - 2], cube([slotW, W + 2, hw + 3]));
return translate([-length / 2, -W / 2, 0], difference(block, bladeSlot));
