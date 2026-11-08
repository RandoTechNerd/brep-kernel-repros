// Wall cradle hook: a U-shaped wall hook that cradles anything round: mats, rollers, coiled hoses and cords.
// Print: on its side as shown (no supports); the flat back goes against the wall. Long things want two.
// Every number below is a slider (Params). From the BREPcode catalog: cradle-hook.
const itemD = 80;     // [20:300] diameter of what it holds, mm
const gap = 3;        // [0:20] room around it, mm
const width = 40;     // [15:160] hook width, mm
const wall = 6;       // [3:14] thickness, mm
const lipAngle = 35;  // [0:80] how far the front lip curls up, degrees
const above = 25;     // [14:80] plate height above the cradle, mm
const screwD = 4.5;   // [3:6.5] screw hole diameter, mm

// side profile: x runs out from the wall, y runs up; printed lying on it
const R = itemD / 2 + gap;                       // inside of the cradle
const Ro = R + wall;
const cx = wall + R, cy = Ro;                    // inner circle touches the plate face
const top = cy + above;                          // top of the wall plate
const lip = lipAngle * Math.PI / 180;
const arc = (r, a0, a1, N = 48) => Array.from({ length: N + 1 }, (_, i) => {
  const t = a0 + (a1 - a0) * i / N;
  return [cx + r * Math.cos(t), cy + r * Math.sin(t)];
});
const outline = [
  [0, 0],
  ...arc(Ro, -Math.PI / 2, lip),                 // under and round the front, up to the lip
  ...arc(R, lip, -Math.PI),                      // back along the inside to the plate
  [wall, top], [0, top],
];
const piece = linearExtrude({ h: width }, polygon(outline));

// countersunk screw holes through the plate, above the cradle
const yh = cy + above / 2;
const zs = width < 45 ? [width / 2] : [width * 0.25, width * 0.75];
const k = screwD / 2;                            // 90 degree countersink depth
const holes = zs.flatMap((z) => [
  translate([-1, yh, z], rotate([0, 90, 0], cylinder({ r: screwD / 2, h: wall + 2, $fn: 24 }))),
  translate([wall - k + 0.02, yh, z], rotate([0, 90, 0], cylinder({ r1: screwD / 2, r2: screwD / 2 + k, h: k, $fn: 24 }))),
]);
return difference(piece, ...holes);
