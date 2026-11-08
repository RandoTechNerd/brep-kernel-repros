// Bottle clip: a clip that snaps round a bottle's neck under the cap ring and hangs it from a strap or carabiner.
// Print: flat as shown, no supports. PETG or nylon so the ring springs. Not load-rated beyond a full bottle.
// Every number below is a slider (Params). From the BREPcode catalog: bottle-clip.
const neckD = 26;       // [15:70] bottle neck diameter (under the cap ring), mm
const band = 3.5;       // [2.4:6] ring band width, mm
const thick = 5;        // [3:10] thickness, mm
const mouth = 0.82;     // [0.6:0.95] ring mouth, as a fraction of the neck
const mount = "strap";  // [strap, hole] threads onto a strap, or a carabiner hole
const strapW = 25.4;    // [10:52] strap width, mm
const holeD = 8;        // [4:20] carabiner hole, mm

const r = neckD / 2 + 0.3;
const ro = r + band;
const m = neckD * mouth;
// the ring, its mouth facing -x
const ring = difference(
  cylinder({ r: ro, h: thick, $fn: 72 }),
  translate([0, 0, -1], cylinder({ r, h: thick + 2, $fn: 72 })),
  translate([-ro - 1, -m / 2, -1], cube([ro + 1 - r * 0.3, m, thick + 2])),
);
// the tab beyond the ring, +x: a slot for the strap or a hole for a carabiner
const slotW = strapW + 1, slotH = 3.5;
const tabL = mount === "strap" ? slotH + 2 * band + 2 : holeD + 2 * band + 2;
const tabW = mount === "strap" ? slotW + 2 * band : Math.max(holeD + 2 * band, ro);
const x0 = ro - 1.5;
const tab = translate([x0, -tabW / 2, 0], cube([tabL + 1.5, tabW, thick]));
const hole = mount === "strap"
  ? translate([x0 + 1.5 + band, -slotW / 2, -1], cube([slotH, slotW, thick + 2]))
  : translate([x0 + 1.5 + band + holeD / 2, 0, -1], cylinder({ r: holeD / 2, h: thick + 2, $fn: 32 }));
return difference(union(ring, tab), hole);
