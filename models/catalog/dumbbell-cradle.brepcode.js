// Dumbbell cradle: a pair of saddle blocks that hold dumbbells (or a barbell) off the floor, optionally stepped.
// Print: upright as shown, no supports. One cradle goes under each end of the weights; 40% infill.
// Every number below is a slider (Params). From the BREPcode catalog: dumbbell-cradle.
const headD = 100;  // [40:250] dumbbell head diameter, mm
const count = 2;    // [1:6] saddles per cradle
const depth = 45;   // [20:120] cradle depth, along the dumbbell, mm
const step = 0;     // [0:60] each saddle higher than the last, mm
const baseH = 15;   // [8:60] height under the saddle, mm
const gap = 4;      // [0:15] room around the head, mm

const R = (headD + gap) / 2;
const side = Math.max(8, headD * 0.08);                   // wall between and beside the saddles
const pitch = 2 * R + side;
const W = count * pitch + side;
const dip = headD * 0.4;                                  // how deep a head sits
const top = (i) => baseH + dip + i * step;
// a stepped front profile, one step per saddle (a plain block when there is no step)
const prof = [[0, 0], [W, 0], [W, top(count - 1)]];
for (let i = count - 1; i >= 1 && step > 0; i--) prof.push([i * pitch + side / 2, top(i)], [i * pitch + side / 2, top(i - 1)]);
prof.push([0, top(0)]);
const across = (pts, h, y0) => translate([0, y0 + h, 0], rotate([90, 0, 0], linearExtrude({ h }, polygon(pts))));
const saddles = Array.from({ length: count }, (_, i) =>
  translate([side + R + i * pitch, depth + 1, baseH + R + i * step], rotate([90, 0, 0], cylinder({ r: R, h: depth + 2 }))));
const one = difference(across(prof, depth, 0), ...saddles);
return group(translate([-W / 2, -depth - 6, 0], one), translate([-W / 2, 6, 0], one));
