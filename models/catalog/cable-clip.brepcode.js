// Cable clip: a row of snap-in clips that hold cables along a desk edge or wall.
// Print: upright as shown; small rings print fine without supports.
// Every number below is a slider (Params). From the BREPcode catalog: cable-clip.
const cableD = 4;      // [1.5:16] cable diameter, mm
const count = 3;       // [1:10] how many cables
const clipWall = 1.6;  // [1.2:3] clip wall thickness, mm
const depth = 10;      // [5:30] clip length along the cable, mm
const mount = "tape";  // [tape, screw] how it fixes on

const r = cableD / 2 + 0.2;                     // snug round the cable
const ro = r + clipWall;
const pitch = 2 * ro + 1.5;
const tab = mount === "screw" ? 12 : 0;         // a screw tab at each end
const span = count * pitch + 2 * tab + 2;
const base = Math.max(2, clipWall);             // the strip the clips stand on
const mouth = cableD * 0.75;                    // narrower than the cable: it snaps in
const zc = Math.max(base + r, ro);              // ring centre: never through the bottom
const xs = Array.from({ length: count }, (_, i) => (i - (count - 1) / 2) * pitch);
// each ring, plus a block under it: the ring's underside just above the base
// would otherwise be a ledge too steep to print
const rings = xs.flatMap((x) => [
  translate([x, 0, zc], rotate([90, 0, 0], cylinder({ r: ro, h: depth, center: true, $fn: 48 }))),
  translate([x - 0.72 * ro, -depth / 2, 0], cube([1.44 * ro, depth, zc])),
]);
const cuts = xs.flatMap((x) => [
  translate([x, 0, zc], rotate([90, 0, 0], cylinder({ r, h: depth + 2, center: true, $fn: 48 }))),
  translate([x - mouth / 2, -depth / 2 - 1, zc], cube([mouth, depth + 2, ro + 1])),
]);
if (tab) {
  for (const s of [-1, 1]) {
    const x = s * (span / 2 - tab / 2 - 1);
    cuts.push(translate([x, 0, -1], cylinder({ r: 1.75, h: base + 2, $fn: 20 })));
    cuts.push(translate([x, 0, base - 1.5 + 0.02], cylinder({ r1: 1.75, r2: 3.25, h: 1.5, $fn: 20 })));
  }
}
return difference(union(translate([-span / 2, -depth / 2, 0], cube([span, depth, base])), ...rings), ...cuts);
