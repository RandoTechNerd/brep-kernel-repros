// Fan grill: a finger guard for 25 to 200 mm fans, with the fan's own hole spacing and slots, rings or round holes.
// Print: flat as shown, no supports.
// Every number below is a slider (Params). From the BREPcode catalog: fan-grill.
const fanSize = 120;      // [25:200] fan size, mm
const plateT = 2;         // [1.2:5] thickness, mm
const barW = 1.8;         // [1:4] bar width between openings, mm
const gapW = 7;           // [3:15] opening width, mm
const holeD = 4.3;        // [2.5:5.5] screw hole diameter, mm
const pattern = "slots";  // [slots, rings, holes] grille pattern

// standard hole spacing for a fan of this size, in between the sizes by interpolation
const spacingFor = (s) => {
  const t = [[25, 20], [30, 24], [40, 32], [50, 40], [60, 50], [70, 60], [80, 71.5], [92, 82.5], [120, 105], [140, 124.5], [200, 154]];
  for (let i = 1; i < t.length; i++) {
    if (s <= t[i][0]) return t[i - 1][1] + (t[i][1] - t[i - 1][1]) * (s - t[i - 1][0]) / (t[i][0] - t[i - 1][0]);
  }
  return t[t.length - 1][1];
};
const sp = spacingFor(fanSize);
const r = Math.max(2, fanSize * 0.08);
const plate = hull(...[[-1, -1], [1, -1], [1, 1], [-1, 1]].map(([sx, sy]) =>
  translate([sx * (fanSize / 2 - r), sy * (fanSize / 2 - r), 0], cylinder({ r, h: plateT, $fn: 24 }))));
const screws = [[-1, -1], [1, -1], [1, 1], [-1, 1]].map(([sx, sy]) => translate([sx * sp / 2, sy * sp / 2, -1], cylinder({ d: holeD, h: plateT + 2, $fn: 20 })));
// the opening stays clear of the screw holes
const R = Math.min(fanSize * 0.46, sp / 2 * Math.SQRT2 - holeD / 2 - 1.6);
const g = Math.min(gapW, R);
const pitch = g + barW;
const through = (shape) => translate([0, 0, -1], shape);
if (pattern === "rings") {
  const rings = [];
  for (let rr = R - pitch; rr > g; rr -= pitch) {
    rings.push(difference(cylinder({ r: rr, h: plateT, $fn: 96 }), through(cylinder({ r: rr - barW, h: plateT + 2, $fn: 96 }))));
  }
  const spokes = [0, 90].map((a) => rotate([0, 0, a], translate([-R - 0.5, -barW / 2, 0], cube([2 * R + 1, barW, plateT]))));
  return union(difference(plate, ...screws, through(cylinder({ r: R, h: plateT + 2, $fn: 96 }))),
    ...rings, ...spokes, cylinder({ r: Math.max(g * 0.6, 3), h: plateT, $fn: 32 }));
}
const cuts = [];
if (pattern === "holes") {
  const dy = pitch * 0.866;
  for (let j = -Math.ceil(R / dy); j <= Math.ceil(R / dy); j++) {
    for (let i = -Math.ceil(R / pitch) - 1; i <= Math.ceil(R / pitch) + 1; i++) {
      const x = i * pitch + (j % 2 ? pitch / 2 : 0), y = j * dy;
      if (Math.hypot(x, y) + g / 2 <= R) cuts.push(through(translate([x, y, 0], cylinder({ d: g, h: plateT + 2, $fn: 20 }))));
    }
  }
} else {
  // rounded slots, each as long as the circle allows at its row
  for (let k = -Math.floor(R / pitch); k <= Math.floor(R / pitch); k++) {
    const y = k * pitch;
    const hl = Math.sqrt(Math.max(0, R * R - (Math.abs(y) + g / 2) ** 2)) - g / 2;
    if (hl <= 0.2) continue;
    cuts.push(through(hull(translate([-hl, y, 0], cylinder({ d: g, h: plateT + 2, $fn: 24 })), translate([hl, y, 0], cylinder({ d: g, h: plateT + 2, $fn: 24 })))));
  }
}
return difference(plate, ...screws, ...cuts);
