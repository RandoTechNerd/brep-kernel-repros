// Citrus juicer: a ribbed reamer cone in a juice-catching dish with a pour notch, sized to the fruit.
// Print: upright as shown, no supports. Food contact: PETG or food-safe PLA, hand wash; acid juice etches PLA over time.
// Every number below is a slider (Params). From the BREPcode catalog: citrus-juicer.
const dishD = 140;  // [80:230] dish diameter at the rim, mm
const dishH = 26;   // [12:60] dish depth, mm
const reamD = 56;   // [25:110] cone diameter at its base, mm
const reamH = 40;   // [15:90] cone height, mm
const ribs = 10;    // [0:18] ribs on the cone
const wall = 2.4;   // [1.6:4] wall thickness, mm
const spoutW = 14;  // [0:30] pour notch width (0 = none), mm

const lean = Math.tan(30 * Math.PI / 180);       // dish walls lean out 30 degrees
const R = dishD / 2;
const rb = Math.max(R - dishH * lean, reamD / 2 + 8);
const floorT = Math.max(2, wall);
const outside = revolve(360, polygon([[0, 0], [rb, 0], [R, dishH], [0, dishH]]));
const hollow = revolve(360, polygon([[0, floorT], [rb - wall, floorT], [R - wall, dishH + 0.01], [R - wall, dishH + 1], [0, dishH + 1]]));
const rc = Math.min(reamD / 2, rb - wall - 2);
const reamer = translate([0, 0, floorT - 0.01], cylinder({ r1: rc, r2: 0.8, h: reamH, $fn: 48 }));
// fins in vertical planes through the axis, a little proud of the cone
const proud = Math.min(3, rc * 0.12);
const finT = Math.max(1.2, wall * 0.6);
const fin = rotate([90, 0, 0], linearExtrude({ h: finT, center: true },
  polygon([[0, floorT - 0.01], [rc + proud, floorT - 0.01], [proud * 0.3, floorT + reamH * 0.96]])));
const blades = Array.from({ length: ribs }, (_, i) => rotate([0, 0, 360 * (i + 0.5) / ribs], fin));
let part = union(difference(outside, hollow), reamer, ...blades);
if (spoutW > 0) {
  const w = Math.min(spoutW, R * 0.5);
  part = difference(part, translate([R - wall - 2, 0, dishH - w * 0.7], rotate([45, 0, 0], cube([wall + 4, w, w], { center: false }))));
}
return part;
