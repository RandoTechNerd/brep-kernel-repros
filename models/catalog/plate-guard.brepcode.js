// Plate guard: a curved wall that clips onto a plate's rim, so food can be pushed onto a spoon with one hand.
// Print: upright as shown, no supports.
// Every number below is a slider (Params). From the BREPcode catalog: plate-guard.
const plateD = 229;  // [120:300] plate diameter, mm
const rimT = 4;      // [2:10] rim thickness, mm
const guardH = 30;   // [15:60] wall height above the rim, mm
const span = 150;    // [60:200] how far round the plate, degrees
const gT = 3;        // [2:6] wall thickness, mm
const jawL = 8;      // [4:20] how far the clip reaches under the plate, mm

// a turned cross-section, z up: lower jaw under the plate, a channel round the rim, a 50 degree upper jaw, the wall
const Rp = plateD / 2;
const ri = Rp + 0.5, ro = ri + gT;               // half a millimetre round the plate's edge
const jt = Math.max(2, gT * 0.8);                // lower jaw thickness
const z1 = jt, z2 = jt + rimT + 0.4;             // the channel
const uL = Math.max(3, gT + 1), z3 = z2 + uL * Math.tan(50 * Math.PI / 180);
const zt = z2 + guardH;
// everything inside the guard, turned about the plate's centre: one cutter
const inside = revolve({ $fn: 96 }, polygon([[0, -1], [Rp - jawL, -1], [Rp - jawL, z1], [ri, z1], [ri, z2], [ri - uL, z3], [ri - uL, zt + 1], [0, zt + 1]]));
// an arc of the outer cylinder, its ends square
const a = span * Math.PI / 180, n = Math.max(8, Math.round(span / 6)), Rw = ro + 5;
const wedge = polygon([[0, 0], ...Array.from({ length: n + 1 }, (_, i) => {
  const t = -a / 2 + a * i / n;
  return [Rw * Math.cos(t) / Math.cos(a / (2 * n)), Rw * Math.sin(t) / Math.cos(a / (2 * n))];
})]);
const arc = difference(intersection(cylinder({ r: ro, h: zt, $fn: 96 }), translate([0, 0, -1], linearExtrude({ h: zt + 2 }, wedge))), inside);
return translate([-(ro + (Rp - jawL) * Math.cos(Math.min(Math.PI, a) / 2)) / 2, 0, 0], arc);
