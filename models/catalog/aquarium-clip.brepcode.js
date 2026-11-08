// Aquarium rim clip: a clip that hangs on the aquarium glass and holds airline, hose, a heater or thermometer, or a glass lid.
// Print: ring and lid versions lie flat on their side, the sleeve version stands upside down; no supports. PETG (or ASA) for anything that sits in tank water; PLA slowly softens.
// Every number below is a slider (Params). From the BREPcode catalog: aquarium-clip.
const glassT = 6;     // [3:25] glass (or frame) thickness, mm
const hold = "ring";  // [ring, sleeve, ledge] what it holds: a snap ring, an upright sleeve, or a lid ledge
const tubeD = 6;      // [3:40] outside diameter of the tube, hose or heater, mm
const width = 12;     // [6:40] clip width along the glass, mm
const drop = 25;      // [10:120] how far it reaches down inside the tank, mm
const lidDrop = 6;    // [0:30] lid ledge: how far below the rim the lid sits, mm
const ledgeW = 12;    // [5:30] lid ledge depth, mm
const wall = 2.4;     // [1.6:5] wall thickness, mm

// drawn as used: x across the glass (glass from 0 to g), y up, glass top at y = 0
const g = glassT + 0.4;
const ri = tubeD / 2 + 0.1, ro = ri + wall;
const inL = hold === "ledge" ? Math.max(drop, lidDrop + wall + 1 + ledgeW * 0.8 + 2)
  : hold === "ring" ? Math.max(drop, 2 * ro + wall) : drop;
const outL = Math.min(inL, Math.max(10, glassT + 8));
// the hanger: an upside-down U, with a grip bump at the outside leg's tip
const hanger = [[-wall, -outL], [0, -outL], [0.6, -outL + 1.2], [0, -outL + 2.4], [0, 0], [g, 0],
  [g, -inL], [g + wall, -inL], [g + wall, wall], [-wall, wall]];
// a C ring round (cx, cy), open toward +x so the tube snaps in from the side
const cRing = (cx, cy, ri, ro, N = 40) => {
  const a = Math.asin(Math.min(0.95, 0.4 * tubeD / ri));        // the opening is 0.8 of the tube
  const arc = (r, a0, a1) => Array.from({ length: N + 1 }, (_, i) => {
    const t = a0 + (a1 - a0) * i / N;
    return [cx + r * Math.cos(t), cy + r * Math.sin(t)];
  });
  return [...arc(ro, a, 2 * Math.PI - a), ...arc(ri, 2 * Math.PI - a, a)];
};
const cx = g + wall + ro - wall * 0.6;                          // overlaps the inner leg

if (hold === "sleeve") {
  // printed upside down: depth below the rim is z, the U's top on the bed
  const W = Math.max(width, ro * 1.2);
  const flip = (pts) => pts.map(([x, y]) => [x, wall - y]);
  const u = translate([0, W / 2, 0], rotate([90, 0, 0], linearExtrude({ h: W }, polygon(flip(hanger)))));
  const sleeve = linearExtrude({ h: wall + inL }, polygon(cRing(cx, 0, ri + 0.2, ro + 0.2)));
  return translate([-cx / 2, 0, 0], union(u, sleeve));
}
const parts = [linearExtrude({ h: width }, polygon(hanger))];
if (hold === "ring") {
  parts.push(linearExtrude({ h: width }, polygon(cRing(cx, -inL + ro, ri, ro))));
} else {
  // the lid ledge: its top lidDrop below the rim, a 45 degree gusset under it
  const x0 = g + wall - 0.01, lt = wall + 1;
  parts.push(linearExtrude({ h: width }, polygon([[x0, -lidDrop], [x0 + ledgeW, -lidDrop], [x0 + ledgeW, -lidDrop - lt], [x0, -lidDrop - lt - ledgeW * 0.8]])));
}
return translate([-g / 2, inL / 2, 0], union(...parts));
