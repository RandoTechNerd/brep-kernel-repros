// Pet bowl: a shallow food or water dish with a heavy flat floor, plain or with slow-feeder fins or a ring maze.
// Print: upright as shown, no supports. Food and water contact: PETG from a food-safe spool, hand wash (PLA softens in a dishwasher), and replace it once it is chewed or scratched.
// Every number below is a slider (Params). From the BREPcode catalog: pet-bowl.
const topD = 140;       // [50:260] outside diameter at the rim, mm
const height = 40;      // [12:120] height, mm
const flare = 30;       // [0:45] how far the wall leans out, degrees
const wall = 3;         // [1.6:8] wall thickness, mm
const floor = 4;        // [2:12] floor thickness (a heavier floor tips less), mm
const feeder = "none";  // [none, fins, rings] slow feeder: none, radial fins, or a ring maze
const ridges = 6;       // [2:12] number of fins (rings use about half)
const ridgeH = 0.8;     // [0.3:1] fin height as a share of the inside depth

const rt = topD / 2;
// keep the foot at least 40 % of the rim, whatever the flare
const tanE = Math.min(Math.tan(flare * Math.PI / 180), rt * 0.6 / height);
const rb = rt - height * tanE;
const wh = wall * Math.sqrt(1 + tanE * tanE);           // wall measured across, horizontally
const fl = Math.min(floor, height - 4);
const xw = (z) => rb - wh + z * tanE;                   // inside face of the wall at height z
const zc = height - wh / 2, xo = rb + zc * tanE;        // where the rim's round top starts
const rim = (N = 12) => Array.from({ length: N + 1 }, (_, i) => {
  const a = Math.PI * i / N;                            // over the top, outside to inside
  return [xo - wh / 2 + (wh / 2) * Math.cos(a), zc + (wh / 2) * Math.sin(a)];
});
const cove = Math.max(0.5, Math.min(8, (height - fl) * 0.3, xw(fl) * 0.3));
const bowl = revolve(360, polygon([
  [0, 0], [rb, 0], ...rim(),
  [xw(fl + cove), fl + cove], [xw(fl) - cove, fl], [0, fl],
]));
if (feeder === "none") return bowl;

// slow feeder: walls up from the floor
const rIn = xw(fl);
const top = Math.min(fl + ridgeH * (height - fl), height - wh);
const finT = Math.max(2, Math.min(wall, 4));
const hubR = Math.max(6, rIn * 0.14);
const across = (pts, w) => translate([0, w / 2, 0], rotate([90, 0, 0], linearExtrude({ h: w }, polygon(pts))));
const parts = [bowl, translate([0, 0, fl - 0.2], cylinder({ r: hubR, h: top - fl + 0.2, $fn: 48 }))];
if (feeder === "fins") {
  for (let i = 0; i < ridges; i++) {
    // even fins run into the wall; odd ones stop short so the pockets connect
    const short = i % 2 === 1 && ridges > 2;
    const end = short ? [[Math.max(hubR + 8, rIn - 18), fl - 0.2], [Math.max(hubR + 8, rIn - 18), top]]
      : [[xw(fl) + wh / 2, fl - 0.2], [xw(top) + wh / 2, top]];
    const fin = across([[hubR - 1, fl - 0.2], ...end, [hubR - 1, top]], finT);
    parts.push(rotate([0, 0, i * 360 / ridges], fin));
  }
} else {
  const nR = Math.max(1, Math.min(Math.round(ridges / 2), Math.floor((rIn - hubR) / 18)));
  for (let k = 1; k <= nR; k++) {
    const r = hubR + (rIn - hubR) * k / (nR + 1);
    const gapW = Math.min(28, r);
    const ring = difference(
      translate([0, 0, fl - 0.2], cylinder({ r: r + finT / 2, h: top - fl + 0.2, $fn: 96 })),
      translate([0, 0, fl - 1], cylinder({ r: r - finT / 2, h: top - fl + 2, $fn: 96 })),
      rotate([0, 0, k % 2 ? 0 : 180], translate([0, -gapW / 2, fl - 1], cube([r + finT, gapW, top - fl + 2]))),
    );
    parts.push(ring);
  }
}
return union(...parts);
