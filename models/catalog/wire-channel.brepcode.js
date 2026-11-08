// Cable channel: a channel that runs cables or an LED strip along a wall, open with a diffuser groove or with a snap-on cover.
// Print: on its back as shown, cover beside it, no supports. Longer runs: print several end to end.
// Every number below is a slider (Params). From the BREPcode catalog: wire-channel.
const length = 200;    // [30:250] length of the run, mm
const innerW = 12;     // [5:60] inside width, mm
const innerH = 8;      // [4:40] inside depth, mm
const wall = 1.6;      // [1.2:3] wall thickness, mm
const lip = 1.2;       // [0.6:3] groove or lip size, mm
const style = "open";  // [open, covered] open with diffuser groove, or covered
const mount = "tape";  // [tape, screw] how it fixes on

// cross-section: x across, z up; extruded along y
const W = innerW + 2 * wall, H = wall + innerH;
const iw = innerW / 2;
const g = Math.min(lip, wall - 0.6, (innerH - 1.5) / 2);   // groove depth: never through the wall or the floor
const l = Math.min(lip, innerW / 4, innerH - 1);     // lip size: never closes the opening
const zg = H - g - 1;
const section = style === "covered"
  ? [[-W / 2, 0], [W / 2, 0], [W / 2, H], [iw - l, H], [iw, H - l], [iw, wall], [-iw, wall], [-iw, H - l], [-iw + l, H], [-W / 2, H]]
  : [[-W / 2, 0], [W / 2, 0], [W / 2, H], [iw, H], [iw, zg + g], [iw + g, zg], [iw, zg - g], [iw, wall],
     [-iw, wall], [-iw, zg - g], [-iw - g, zg], [-iw, zg + g], [-iw, H], [-W / 2, H]];
// rotate([90, 0, 0]) keeps the profile's x, sends its y to z, and the extrusion to -y
const run = (pts) => translate([0, length / 2, 0], rotate([90, 0, 0], linearExtrude({ h: length }, polygon(pts))));
let channel = run(section);
if (mount === "screw") {
  const n = Math.max(1, Math.round(length / 100));
  const holes = Array.from({ length: n }, (_, i) => {
    const y = (i + 0.5) * length / n - length / 2;
    const d = Math.min(3.5, innerW - 1.5);
    return union(translate([0, y, -1], cylinder({ d, h: wall + 2, $fn: 16 })),
      translate([0, y, wall - d / 2 + 0.01], cylinder({ r1: d / 2, r2: d, h: d / 2, $fn: 16 })));
  });
  channel = difference(channel, ...holes);
}
if (style !== "covered") return channel;
// the cover, printed upside down: a plate with two legs whose barbs catch under the lips
const fit = Math.min(0.25, wall / 5), b = Math.min(l * 0.8, 1);
const xo = iw - l - fit;
const legT = Math.max(0.6, Math.min(1.2, xo - 0.5));
const zb = wall + l + 0.3;
const cover = [[-W / 2, 0], [W / 2, 0], [W / 2, wall], [xo, wall], [xo, zb], [xo + b, zb + b], [xo, zb + 2 * b],
  [xo - legT, zb + 2 * b], [xo - legT, wall], [-(xo - legT), wall], [-(xo - legT), zb + 2 * b], [-xo, zb + 2 * b],
  [-xo - b, zb + b], [-xo, zb], [-xo, wall], [-W / 2, wall]];
return group(channel, translate([W + 6, 0, 0], run(cover)));
