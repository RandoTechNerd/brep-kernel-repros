// Spinning top: a twirling top with a stem, a rim and a point; round, or faceted (four sides is a dreidel).
// Print: upside down, standing on its stem as shown; no supports. One piece, no small parts at the default size.
// Every number below is a slider (Params). From the BREPcode catalog: spinning-top.
const rimD = 45;    // [20:90] rim diameter, mm
const stemD = 8;    // [4:14] stem diameter, mm
const stemL = 16;   // [8:40] stem length, mm
const rimH = 4;     // [1:25] rim band height, mm
const point = 0.8;  // [0.4:1.5] point height, as a share of the rim radius
const sides = 0;    // [0:8] flat sides (0 = round)

const rs = stemD / 2, rr = Math.max(rimD / 2, rs + 4);
const k = Math.tan(50 * Math.PI / 180);
const z1 = stemL, z2 = z1 + (rr - rs) * k, z3 = z2 + rimH;   // stem top, rim bottom, rim top (upside down)
const tipR = Math.min(1, rs / 3), zTip = z3 + rr * point;
// the stem ends in a little knob, which is what it stands on while printing
const rk = Math.max(rs + 1.5, 4.5), foot = [[0, 0], [rk, 0], [rk, 1.2], [rs, 1.2 + rk - rs]];
const round = sides < 3;
if (round) return revolve(360, polygon([...foot, [rs, z1], [rr, z2], [rr, z3], [tipR, zTip], [0, zTip]]));
// faceted: the same stack from flat-sided pieces, each overlapping the next a little
const n = sides, f = 1 / Math.cos(Math.PI / n);           // corner radius from flat radius
const seg = (r1, r2, z, h) => translate([0, 0, z], cylinder({ r1: r1 * f, r2: r2 * f, h, $fn: n }));
return union(
  revolve(360, polygon([...foot, [rs, z1 + 0.5], [0, z1 + 0.5]])),
  seg(rs, rr, z1, z2 - z1 + 0.01),
  seg(rr, rr, z2, rimH + 0.01),
  seg(rr, tipR, z3, zTip - z3),
);
