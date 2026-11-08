// LED strip clip: a strap clip that holds an LED strip or a flat cable to a wall, screwed or taped down.
// Print: on its side as shown, no supports.
// Every number below is a slider (Params). From the BREPcode catalog: strip-clip.
const stripW = 10;      // [3:40] strip width, mm
const stripT = 3;       // [1:14] strip thickness, mm
const clipW = 8;        // [4:20] clip width, mm
const wall = 1.6;       // [1.2:3] clip thickness, mm
const tabL = 7;         // [0:20] side tab length (0 = none), mm
const mount = "screw";  // [tape, screw] how it fixes on

// profile: x across the strip, y up off the wall; extruded clipW along the strip
const sw = stripW + 0.6, st = stripT + 0.4, w = wall;
const t = tabL >= 1 ? tabL : 0;
const outline = t
  ? [[-sw / 2 - w - t, 0], [-sw / 2, 0], [-sw / 2, st], [sw / 2, st], [sw / 2, 0], [sw / 2 + w + t, 0],
     [sw / 2 + w + t, w], [sw / 2 + w, w], [sw / 2 + w, st + w], [-sw / 2 - w, st + w], [-sw / 2 - w, w], [-sw / 2 - w - t, w]]
  : [[-sw / 2 - w, 0], [-sw / 2, 0], [-sw / 2, st], [sw / 2, st], [sw / 2, 0], [sw / 2 + w, 0], [sw / 2 + w, st + w], [-sw / 2 - w, st + w]];
const clip = linearExtrude({ h: clipW }, polygon(outline));
const d = Math.min(3.4, clipW - 2, t - 1.5);
if (mount !== "screw" || d < 1.5) return clip;
// screw holes up through the tabs (across the print, so small and round)
const holes = [-1, 1].map((s) => translate([s * (sw / 2 + w + t / 2), -1, clipW / 2], rotate([-90, 0, 0], cylinder({ d, h: w + 2, $fn: 16 }))));
return difference(clip, ...holes);
