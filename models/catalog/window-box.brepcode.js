// Window box planter: a long rounded trough planter with drain holes, for a windowsill, balcony or herb garden.
// Print: upright as shown, no supports. PETG or ASA outdoors.
// Every number below is a slider (Params). From the BREPcode catalog: window-box.
const length = 220;  // [80:250] length, mm
const depth = 90;    // [50:200] front to back, mm
const height = 80;   // [30:200] height, mm
const taper = 6;     // [0:20] how much wider the top is, each side, mm
const wall = 2.4;    // [1.2:5] wall thickness, mm
const cornerR = 10;  // [2:40] corner radius, mm
const drains = 3;    // [0:8] drain holes
const drainD = 8;    // [3:15] drain hole diameter, mm

const t = Math.min(taper, depth / 2 - 6, length / 2 - 6);
const rr = Math.max(1, Math.min(cornerR, depth / 2 - t - 2, length / 2 - t - 2));
// four corner discs of a w x d rounded rectangle, standing at z
const corners = (w, d, r, z) => [[r, r], [w - r, r], [r, d - r], [w - r, d - r]].map(([x, y]) =>
  translate([x - w / 2, y - d / 2, z], cylinder({ r, h: 0.5, $fn: 32 })));
// a rounded box, inset by t at its foot, from z0 up to z1
const flared = (w, d, r, z0, z1) => hull(...corners(w - 2 * t, d - 2 * t, r, z0), ...corners(w, d, r, z1 - 0.5));
const outer = flared(length, depth, rr, 0, height);
const fl = Math.max(2, wall);
const inner = flared(length - 2 * wall, depth - 2 * wall, Math.max(0.6, rr - wall), fl, height + 1);
const holes = Array.from({ length: drains }, (_, i) =>
  translate([(i - (drains - 1) / 2) * (length - 2 * t - 4 * wall - drainD) / Math.max(1, drains), 0, -1], cylinder({ r: drainD / 2, h: fl + 2, $fn: 24 })));
return difference(outer, inner, ...holes);
