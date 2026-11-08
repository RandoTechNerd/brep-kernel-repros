// Cane holder clip: two snap-on clips back to back that park a cane or crutch on a walker, wheelchair, bed rail or table leg.
// Print: flat as shown, no supports. PETG snaps on and off better than PLA.
// Every number below is a slider (Params). From the BREPcode catalog: cane-holder.
const caneD = 22.2;  // [12:40] cane diameter, mm
const tubeD = 25.4;  // [12:45] frame tube diameter, mm
const height = 20;   // [8:40] clip height, mm
const wall = 3.5;    // [2.4:6] clip wall, mm
const web = 6;       // [2:30] space between the clips, mm
const mouth = 0.75;  // [0.5:0.9] clip mouth as a share of the tube

// lying flat: the cane's clip on the left, the frame's on the right, mouths facing out
const ra = caneD / 2 + wall, rb = tubeD / 2 + wall;
const xa = -(ra + web / 2), xb = rb + web / 2;
const bw = Math.min(ra, rb) * 1.2;               // the web joining the two clips
const solid = union(translate([xa, 0, 0], cylinder({ r: ra, h: height, $fn: 48 })), translate([xb, 0, 0], cylinder({ r: rb, h: height, $fn: 48 })),
  translate([xa, -bw / 2, 0], cube([xb - xa, bw, height])));
// each bore, and a mouth narrower than its tube so the clip snaps on
const ma = caneD * mouth, mb = tubeD * mouth;
return difference(solid,
  translate([xa, 0, -1], cylinder({ r: caneD / 2, h: height + 2, $fn: 48 })),
  translate([xb, 0, -1], cylinder({ r: tubeD / 2, h: height + 2, $fn: 48 })),
  translate([xa - ra - 1, -ma / 2, -1], cube([ra + 1 - caneD * 0.15, ma, height + 2])),
  translate([xb + tubeD * 0.15, -mb / 2, -1], cube([rb + 1 - tubeD * 0.15, mb, height + 2])));
