// Under-desk cable tray: a trough that screws up under a desk to carry cables, a power strip or a laptop brick.
// Print: standing on one end as shown, no supports. Screws go up through the flange into the desk.
// Every number below is a slider (Params). From the BREPcode catalog: under-desk-tray.
const innerW = 60;   // [20:200] inside width, mm
const innerH = 50;   // [15:150] inside height, mm
const length = 200;  // [40:250] length, mm
const frontH = 30;   // [5:150] front wall height, mm
const wall = 3;      // [2:6] wall thickness, mm
const flange = 18;   // [10:40] screw flange width, mm
const screwD = 4;    // [3:5.5] screw diameter, mm

// end profile: x runs front to back under the desk, y runs up (desk underside at y = H)
const t = wall;
const H = innerH + 2 * t;
const fh = Math.min(frontH, innerH + t);
const xf = t + innerW;                           // inside face of the front wall
const outline = [[-flange, H], [t, H], [t, t], [xf, t], [xf, fh], [xf + t, fh], [xf + t, 0], [0, 0], [0, H - t], [-flange, H - t]];
const trough = linearExtrude({ h: length }, polygon(outline));
// screw holes up through the flange, countersunk from below
const k = screwD / 2;
const zs = length < 90 ? [length / 2] : [length * 0.2, length * 0.8];
const holes = zs.flatMap((z) => [
  translate([-flange / 2, H + 1, z], rotate([90, 0, 0], cylinder({ r: screwD / 2, h: t + 2, $fn: 24 }))),
  translate([-flange / 2, H - t + k - 0.02, z], rotate([90, 0, 0], cylinder({ r1: screwD / 2, r2: screwD / 2 + k, h: k, $fn: 24 }))),
]);
return translate([(flange - xf - t) / 2, -H / 2, 0], difference(trough, ...holes));
