// Temperature tower: a stack of test blocks, one per temperature setting, each with a bridge and an overhang to judge.
// Print: upright as shown, no supports. Set a temperature change at each block in the slicer.
// Every number below is a slider (Params). From the BREPcode catalog: temp-tower.
const segments = 7;  // [3:12] blocks (one per setting)
const segH = 10;     // [6:20] block height, mm
const width = 30;    // [15:60] tower width, mm
const depth = 10;    // [6:25] tower depth, mm
const winW = 12;     // [0:30] bridge window width (0 = none), mm

const baseT = Math.min(1.2, segH / 5);
const ww = Math.max(0, Math.min(winW, width - 8));
const c = Math.min(segH - 3, 5);                     // the 45 degree overhang on the left
const groove = Math.min(0.6, depth / 10);
const blocks = [translate([-width / 2 - 5, -depth / 2 - 3, 0], cube([width + 10, depth + 6, baseT]))];
const cuts = [];
// rotate([90, 0, 0]) keeps the profile's x, sends its y to z, and the extrusion to -y
const across = (pts) => translate([0, depth / 2 + 1, 0], rotate([90, 0, 0], linearExtrude({ h: depth + 2 }, polygon(pts))));
for (let i = 0; i < segments; i++) {
  const z = baseT + i * segH;
  blocks.push(translate([-width / 2, -depth / 2, z - 0.01], cube([width, depth, segH + 0.02])));
  if (ww > 0) cuts.push(translate([-ww / 2 + 2, -depth / 2 - 1, z + 2], cube([ww, depth + 2, segH - 4])));
  // a wedge out of the bottom-left corner: the block above it overhangs at 45 degrees
  cuts.push(across([[-width / 2 - 1, z - 0.01], [-width / 2 + c, z - 0.01], [-width / 2 - 1, z + c + 1]]));
  // a V groove round the front and back where the next block starts
  if (i > 0) {
    for (const s of [-1, 1]) {
      cuts.push(translate([-width / 2 - 1, s * depth / 2, z], rotate([45, 0, 0], translate([0, -groove / 2, -groove / 2], cube([width + 2, groove, groove])))));
    }
  }
}
return difference(union(...blocks), ...cuts);
