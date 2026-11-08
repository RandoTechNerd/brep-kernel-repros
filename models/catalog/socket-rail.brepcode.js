// Socket rail: a rail of square posts that hold sockets by their drive hole, in a row by size.
// Print: flat as shown, no supports.
// Every number below is a slider (Params). From the BREPcode catalog: socket-rail.
const driveW = 9.53;  // [5:20] drive square size (3/8 inch = 9.53), mm
const fit = 0.15;     // [0:0.6] clearance per side, mm
const count = 8;      // [1:30] posts
const pitch = 26;     // [10:60] post spacing, mm
const postH = 9;      // [4:20] post height, mm
const baseH = 5;      // [3:12] rail thickness, mm
const width = 18;     // [10:50] rail width, mm
const screwD = 4;     // [0:6] end screw holes (0 = none), mm

const side = driveW - 2 * fit;                  // the post: the drive square, a touch under
const ch = Math.min(1.2, side / 5);             // lead-in chamfer at the top
const end = screwD > 0 ? 12 : 4;
const L = count * pitch + 2 * end;
const w = Math.max(width, driveW + 6);
const rail = translate([-L / 2, -w / 2, 0], cube([L, w, baseH]));
const posts = Array.from({ length: count }, (_, i) => {
  const x = -L / 2 + end + (i + 0.5) * pitch;
  return hull(
    translate([x - side / 2, -side / 2, baseH - 0.1], cube([side, side, postH - ch + 0.1])),
    translate([x - side / 2 + ch, -side / 2 + ch, baseH + postH - 0.01], cube([side - 2 * ch, side - 2 * ch, 0.01])),
  );
});
const body = union(rail, ...posts);
if (screwD <= 0) return body;
const k = screwD / 2;
const holes = [-1, 1].flatMap((s) => {
  const x = s * (L / 2 - end / 2);
  return [
    translate([x, 0, -1], cylinder({ r: screwD / 2, h: baseH + 2, $fn: 24 })),
    translate([x, 0, baseH - k + 0.02], cylinder({ r1: screwD / 2, r2: screwD / 2 + k, h: k, $fn: 24 })),
  ];
});
return difference(body, ...holes);
