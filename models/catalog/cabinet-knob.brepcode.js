// Cabinet knob: a turned knob for cabinets and drawers that takes a standard knob screw.
// Print: standing on its base as shown, no supports. 100% infill or 6 walls round the screw.
// Every number below is a slider (Params). From the BREPcode catalog: cabinet-knob.
const headD = 30;          // [12:70] knob diameter, mm
const height = 25;         // [12:60] how far it stands off the door, mm
const baseD = 16;          // [8:50] base diameter, mm
const shape = "mushroom";  // [mushroom, barrel, cone, disc] shape
const fixing = "screw";    // [screw, nut, insert] how the screw holds (pilot, captive nut, heat-set insert)
const holeD = 3.4;         // [2.5:6] pilot hole, mm
const nutAF = 7;           // [5.5:10] nut across flats (M4 = 7, 8-32 = 8.7), mm

// a half profile spun round the z axis; z = 0 is the face against the door
const R = headD / 2;
const rb = Math.min(baseD / 2, R);
const arcPts = (cx, cy, rx, ry, a0, a1, n = 12) => Array.from({ length: n + 1 }, (_, i) => {
  const a = a0 + (a1 - a0) * i / n;
  return [cx + rx * Math.cos(a), cy + ry * Math.sin(a)];
});
let side;
if (shape === "barrel" || shape === "cone") {
  // straight sides (a cone widens no faster than 45 degrees), a rounded top edge
  const e = Math.min(3, R * 0.25, height * 0.2);
  const r0 = shape === "barrel" ? R : Math.max(rb, R - (height - e) * 0.95);
  side = [[r0, 0], [R, height - e], ...arcPts(R - e, height - e, e, e, 0, Math.PI / 2).slice(1)];
} else {
  // a collar, a neck, a 45-degree flare out to the head, and a dome
  const dh = shape === "disc" ? Math.min(2, height * 0.12) : Math.min(R * 0.5, height * 0.3);
  const zc = height * 0.12;
  const A = height - dh - 1 - zc;                  // the height the neck and flare share
  let rn = Math.max(R * 0.45, holeD / 2 + 2.5);
  let rbE = Math.max(rb, rn);
  if (rbE - rn + R - rn > A) {
    rn = Math.min(R, Math.max((rbE + R - A) / 2, R - A));
    rbE = Math.max(rb, rn);
  }
  const zTop = height - dh - 1;
  side = [[rbE, 0], [rbE, zc], [rn, zc + rbE - rn], [rn, zTop - (R - rn)], [R, zTop], [R, height - dh],
    ...arcPts(0, height - dh, R, dh, 0, Math.PI / 2).slice(1)];
}
// the screw comes in from the door side: its hole is part of the turned
// outline (a bore cut down a revolve's axis is very slow); a nut pocket is cut
const deep = Math.min(height - 3, fixing === "insert" ? 8 : 15);
const hr = (fixing === "insert" ? holeD + 2.2 : fixing === "nut" ? holeD + 0.9 : holeD) / 2;
const pts = [[hr, 0], ...side.filter(([r]) => r > 0.01), [0, height], [0, deep], [hr, deep]];
// drop points the outline reached twice (a neck as wide as the base, say)
const knobby = revolve(360, polygon(pts.filter((p, i) => i === 0 || Math.hypot(p[0] - pts[i - 1][0], p[1] - pts[i - 1][1]) > 1e-4)));
if (fixing !== "nut") return knobby;
const rcn = (nutAF + 0.3) / Math.sqrt(3);
return difference(knobby, translate([0, 0, -1], linearExtrude({ h: nutAF * 0.46 + 1.3 },
  polygon(Array.from({ length: 6 }, (_, i) => [rcn * Math.cos(Math.PI * i / 3), rcn * Math.sin(Math.PI * i / 3)])))));
