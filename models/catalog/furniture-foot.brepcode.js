// Furniture foot: a replacement foot or short leg for furniture, on a screw or a hanger bolt.
// Print: upside down as shown (the furniture face on the bed), no supports. PETG or PLA; 4 walls, 30% infill.
// Every number below is a slider (Params). From the BREPcode catalog: furniture-foot.
const height = 40;       // [8:150] height, mm
const topD = 50;         // [15:120] size where it meets the furniture, mm
const bottomD = 40;      // [10:120] size at the floor, mm
const shape = "taper";   // [taper, round, bun, square] shape
const fixing = "screw";  // [screw, bolt, none] fixing (screw from below, bolt with a captive nut)
const holeD = 5;         // [2:10] screw or bolt hole, mm
const headD = 10;        // [0:22] screw head counterbore (0 = none), mm
const nutAF = 13;        // [5:19] captive nut across flats (M8 = 13), mm
const padD = 0;          // [0:80] felt pad recess at the floor (0 = none), mm

// z = 0 is the face against the furniture; the floor end is at the top
const rt = topD / 2;
const rb = Math.min(bottomD / 2, rt + height * 0.95);   // never widen faster than 45 degrees
// built from primitives and hulls, not a revolve: a revolve with a bore cut
// down its axis is very slow to boolean
const disc = (r, z) => translate([0, 0, z], cylinder({ r, h: 0.01, $fn: 64 }));
let foot;
if (shape === "square") {
  const slab = (w, z, h) => {
    const r = Math.max(0.5, Math.min(4, w / 4));
    return hull(...[[-1, -1], [1, -1], [-1, 1], [1, 1]].map(([sx, sy]) =>
      translate([sx * (w / 2 - r), sy * (w / 2 - r), z], cylinder({ r, h, $fn: 24 }))));
  };
  foot = hull(slab(2 * rt, 0, 0.01), slab(2 * rb, height - 0.01, 0.01));
} else if (shape === "bun") {
  // bulges out a little above the furniture face, then rounds in to the floor
  const zm = height * 0.4;
  const rm = Math.min(Math.max(rt, rb) * 1.15, rt + 0.6 * zm);
  const rAt = (z) => z <= zm ? rt + (rm - rt) * Math.sin(z / zm * Math.PI / 2) : rb + (rm - rb) * Math.cos((z - zm) / (height - zm) * Math.PI / 2);
  foot = hull(...Array.from({ length: 11 }, (_, i) => disc(rAt(height * i / 10), Math.min(height * i / 10, height - 0.01))));
} else if (shape === "round") {
  foot = cylinder({ r: rt, h: height, $fn: 64 });
} else {
  foot = cylinder({ r1: rt, r2: rb, h: height, $fn: 64 });
}
const cuts = [];
const rFloor = shape === "round" ? rt : rb;
if (padD > 0) cuts.push(translate([0, 0, height - 1.5], cylinder({ r: Math.min(padD / 2, rFloor - 1.5), h: 2, $fn: 48 })));
if (fixing !== "none") {
  cuts.push(translate([0, 0, -1], cylinder({ r: holeD / 2, h: height + 2, $fn: 24 })));
  if (fixing === "screw" && headD > holeD) {
    // the screw goes in from the floor end: its head sits down a counterbore
    const grip = Math.max(4, Math.min(12, height * 0.4));
    cuts.push(translate([0, 0, grip], cylinder({ r: Math.min(headD / 2, rFloor - 1.5), h: height, $fn: 32 })));
  }
  if (fixing === "bolt") {
    // a hex nut pressed into the furniture face takes the hanger bolt
    const af = Math.min(nutAF, 2 * Math.min(rt, rb) - 4) + 0.3;
    const rc = af / Math.sqrt(3);
    const hex = polygon(Array.from({ length: 6 }, (_, i) => [rc * Math.cos(Math.PI * i / 3), rc * Math.sin(Math.PI * i / 3)]));
    cuts.push(translate([0, 0, -1], linearExtrude({ h: Math.min(height * 0.5, af * 0.5) + 1 }, hex)));
  }
}
return cuts.length ? difference(foot, ...cuts) : foot;
