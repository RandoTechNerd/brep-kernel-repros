// Tool battery holder: a wall pocket that holds power-tool battery packs by their body, one pocket per pack.
// Print: upright as shown, no supports. A drop-in pocket, not a latching rail: it holds the pack, it does not lock it.
// Every number below is a slider (Params). From the BREPcode catalog: battery-holder.
const packL = 115;   // [40:200] pack length, mm
const packW = 75;    // [30:130] pack width, mm
const packH = 60;    // [20:120] pack height, mm
const count = 2;     // [1:4] how many packs
const cover = 0.6;   // [0.25:1] how much of the pack's height the pocket covers
const fit = 1;       // [0.3:3] clearance per side, mm
const wall = 2.4;    // [1.6:5] wall thickness, mm
const above = 22;    // [14:60] back plate above the pocket (screws), mm
const screwD = 4.5;  // [3:6] screw hole diameter, mm

// x along the wall, y out from it, z up
const iL = packL + 2 * fit, iW = packW + 2 * fit;
const deep = Math.max(15, cover * packH);        // pocket depth
const floor = Math.max(2, wall);
const pitch = iL + wall;
const L = count * pitch + wall;
const D = iW + 2 * wall;                         // back wall, pocket, front wall
const H = floor + deep;
const peak = H + above;
const box = union(
  translate([-L / 2, 0, 0], cube([L, D, H])),
  translate([-L / 2, 0, 0], cube([L, wall, peak])),          // back plate rises above the pockets
);
const cuts = [];
for (let i = 0; i < count; i++) {
  const x0 = -L / 2 + wall + i * pitch;
  cuts.push(translate([x0, wall, floor], cube([iL, iW, H])));
  // a notch down the front wall to get fingers on the pack
  const nw = Math.min(iL * 0.5, 60);
  cuts.push(translate([x0 + (iL - nw) / 2, D - wall - 1, floor + Math.min(12, deep / 2)], cube([nw, wall + 2, H])));
}
const k = screwD / 2;
const sx = L / 2 - 12;
for (const x of L > 200 ? [-sx, 0, sx] : [-sx, sx]) {
  cuts.push(translate([x, -1, H + above / 2], rotate([-90, 0, 0], cylinder({ r: screwD / 2, h: wall + 2, $fn: 24 }))));
  cuts.push(translate([x, wall - k + 0.02, H + above / 2], rotate([-90, 0, 0], cylinder({ r1: screwD / 2, r2: screwD / 2 + k, h: k, $fn: 24 }))));
}
return translate([0, -D / 2, 0], difference(box, ...cuts));
