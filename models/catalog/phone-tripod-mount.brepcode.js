// Phone tripod mount: a jaw that holds a phone on its long edge, with a 1/4-20 nut pocket for any camera tripod.
// Print: upright as shown, no supports (the nut pocket roof is a short bridge). Press a 1/4-20 nut in from below.
// Every number below is a slider (Params). From the BREPcode catalog: phone-tripod-mount.
const phoneT = 12;   // [6:20] phone thickness with its case, mm
const jawH = 18;     // [8:40] jaw height, mm
const jawT = 6;      // [3:12] jaw thickness, mm
const width = 40;    // [20:90] width along the phone, mm
const baseH = 10;    // [8:20] base height, mm
const nutAF = 11.1;  // [6:16] nut across flats (1/4-20 = 11.1), mm

// cross-section: x across the phone's thickness, z up; extruded along y (the phone's length)
const gapW = phoneT + 0.6;
const bw = Math.max(gapW + 2 * jawT, nutAF / Math.cos(Math.PI / 6) + 6);
const H = baseH + jawH;
const plate = (pts) => translate([0, width / 2, 0], rotate([90, 0, 0], linearExtrude({ h: width }, polygon(pts))));
const outline = [[-bw / 2, 0], [bw / 2, 0], [bw / 2, baseH], [gapW / 2 + jawT, baseH], [gapW / 2 + jawT, H], [gapW / 2, H], [gapW / 2, baseH],
  [-gapW / 2, baseH], [-gapW / 2, H], [-gapW / 2 - jawT, H], [-gapW / 2 - jawT, baseH], [-bw / 2, baseH]];
const nutH = nutAF * 0.5;                         // a 1/4-20 nut is 7/32 inch (5.6 mm) thick
const cuts = [
  // the nut pocket opens on the bed, the bolt's clearance hole runs on above it
  translate([0, 0, -1], cylinder({ r: (nutAF + 0.3) / 2 / Math.cos(Math.PI / 6), h: nutH + 1.4, $fn: 6 })),
  translate([0, 0, nutH], cylinder({ r: 3.4, h: Math.max(2, baseH - nutH - 1.5), $fn: 24 })),
];
return difference(plate(outline), ...cuts);
