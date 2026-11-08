// French cleat hook: a hook, shelf or cradle that drops onto a French cleat rail, no screws.
// Print: on its side as shown, no supports. Match the cleat thickness to your rail.
// Every number below is a slider (Params). From the BREPcode catalog: cleat-hook.
const piece = "hook";  // [hook, shelf, cradle, plate] what is on the front
const width = 40;      // [15:150] width, mm
const cleatT = 12;     // [6:20] rail thickness it hangs on, mm
const plateH = 80;     // [40:200] back plate height, mm
const plateT = 6;      // [4:12] back plate thickness, mm
const reach = 60;      // [15:150] how far it sticks out, mm
const armT = 8;        // [4:16] arm / shelf / cradle thickness, mm
const tipH = 12;       // [0:40] tip or lip height, mm
const itemD = 60;      // [20:200] diameter the cradle holds, mm
const fit = 0.6;       // [0.3:1.5] clearance on the cleat, mm
const screwD = 4;      // [3:6] plate screw holes, mm

// side profile: p runs out from the wall, q runs up; printed lying on it.
// q = 0 is the top front edge of the rail, whose bevel runs q = p + fit down
// to the wall; the tongue follows it a clearance higher.
const c = fit;
const T = cleatT;
const capH = Math.max(4, T * 0.6);
const top = 2 * c + capH;                          // top of the hanging cleat
const qBot = top - Math.max(plateH, T + capH + 2 * c + 20);
const cleat = [[-T, top], [-T, -T + 2 * c], [0, 2 * c], [0, qBot], [plateT, qBot], [plateT, top]];
const parts = [linearExtrude({ h: width }, polygon(cleat))];
const t = Math.tan(Math.PI / 18);                 // the hook arm tilts up 10 degrees
if (piece === "hook") {
  const tipT = Math.max(3, armT * 0.8);
  const gus = Math.min(armT, reach * 0.3);
  const L = Math.max(plateT + reach, plateT + gus + tipT + 3);
  const yb = (x) => qBot + (x - plateT) * t;
  const yTop = yb(L) + armT + tipH;
  parts.push(linearExtrude({ h: width }, polygon([
    [plateT - 0.5, qBot], [L, yb(L)], [L, yTop], [L - tipT, yTop],
    [L - tipT, yb(L - tipT) + armT], [plateT + gus, yb(plateT + gus) + armT],
    [plateT, yb(plateT) + armT + gus], [plateT - 0.5, yb(plateT) + armT + gus],
  ])));
} else if (piece === "shelf") {
  const boardT = Math.max(4, armT * 0.6);
  const L = plateT + reach;
  const lipT = Math.max(2.4, boardT * 0.6);
  const front = tipH > 0 ? [[L, top + tipH], [L - lipT, top + tipH], [L - lipT, top]] : [[L, top]];
  parts.push(linearExtrude({ h: width }, polygon([
    [plateT - 0.5, qBot + 2], [plateT + Math.min(reach * 0.85, reach - lipT - 1), top - boardT],
    [L, top - boardT], ...front, [plateT - 0.5, top],
  ])));
} else if (piece === "cradle") {
  // the cradle-hook outline, its inner circle touching the plate front
  const R = itemD / 2 + 2, Ro = R + armT;
  const cx = plateT + R, cy = qBot + Ro;
  const lip = Math.PI * 2 / 9;                    // the front lip curls up 40 degrees
  const arc = (r, a0, a1, N = 40) => Array.from({ length: N + 1 }, (_, i) => {
    const a = a0 + (a1 - a0) * i / N;
    return [cx + r * Math.cos(a), cy + r * Math.sin(a)];
  });
  parts.push(linearExtrude({ h: width }, polygon([
    [plateT - 0.5, qBot], ...arc(Ro, -Math.PI / 2, lip), ...arc(R, lip, -Math.PI), [plateT - 0.5, cy],
  ])));
}
const piece3d = parts.length > 1 ? union(...parts) : parts[0];
if (piece !== "plate") return piece3d;
// a plain plate: countersunk holes to screw it to whatever should hang
const k = Math.min(screwD / 2, plateT - 1.5);
const span = -T - qBot;
const holes = [qBot + span * 0.3, qBot + span * 0.75].flatMap((q) => [width * 0.3, width * 0.7].flatMap((z) => [
  translate([-1, q, z], rotate([0, 90, 0], cylinder({ r: screwD / 2, h: plateT + 2, $fn: 24 }))),
  translate([plateT - k + 0.02, q, z], rotate([0, 90, 0], cylinder({ r1: screwD / 2, r2: screwD / 2 + k, h: k, $fn: 24 }))),
]));
return difference(piece3d, ...holes);
