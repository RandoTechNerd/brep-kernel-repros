// Plant pot: a tapered round or polygon pot with drainage holes and a matching saucer.
// Print: upright as shown, no supports. PETG if it will stay wet.
// Every number below is a slider (Params). From the BREPcode catalog: plant-pot.
const topD = 100;      // [30:240] top width (across the flats), mm
const bottomD = 75;    // [20:240] bottom width, mm
const height = 90;     // [20:240] height, mm
const sides = 0;       // [0:12] sides (0 = round, 4-12 = polygon)
const wall = 2.4;      // [1.2:5] wall thickness, mm
const floor = 3;       // [1.6:8] floor thickness, mm
const rim = 3;         // [0:10] rim overhang, mm
const drain = 10;      // [0:30] drain hole size (0 = none), mm
const holes = 1;       // [1:8] drain holes
const saucer = "yes";  // [yes, no] matching saucer

const n = sides > 0 ? Math.min(12, Math.max(4, Math.round(sides))) : 0;   // 1-3 sides means round
const rt = topD / 2, rb = Math.min(bottomD, topD) / 2;   // never wider at the foot: that would overhang
const lip = Math.min(rim, 0.6 * (height - floor - 2));
// sizes are apothems (flat to centre); a corner sits 1 / cos(PI / n) further out
const k = n ? 1 / Math.cos(Math.PI / n) : 1;
const rbi = rb - wall;
// drain holes: through the floor only (z -1..floor+1), inside the cavity's footprint
const ring = holes > 1 ? 0.45 * rbi : 0;
const hd = drain > 0 ? Math.min(drain, holes > 1 ? Math.min(0.7 * 2 * Math.PI * ring / holes, 2 * (rbi - ring - 2)) : rbi) : 0;
const drains = hd > 0 ? Array.from({ length: holes }, (_, i) => translate(
  [ring * Math.cos(2 * Math.PI * i / holes + Math.PI / 2), ring * Math.sin(2 * Math.PI * i / holes + Math.PI / 2), -1],
  cylinder({ r: hd / 2, h: floor + 2, $fn: 24 }))) : [];
// Everything below is a native exact solid, so the Rust B-rep kernel builds
// it in one pass: cones (not a lathe, whose axis seam it refuses to cut a
// centre hole through) and prisms cut by flat blocks (not hull(), which is
// a triangle mesh). Every cut overlaps by a margin: no face ever just grazes
// another, which is where an exact boolean slows down or gives up.
const DEG = 180 / Math.PI;
// a regular n-gon by its apothem, a flat facing the front
const ngon = (a) => polygon(Array.from({ length: n }, (_, i) => {
  const t = Math.PI / n - Math.PI / 2 + 2 * Math.PI * i / n;
  return [a * k * Math.cos(t), a * k * Math.sin(t)];
}));
// a tapered solid, apothem (radius when round) a0 at z0 to a1 at z1
const frustum = (a0, z0, a1, z1) => {
  const h = z1 - z0;
  if (!n) return translate([0, 0, z0], cylinder({ r1: a0, r2: a1, h, $fn: 96 }));
  if (Math.abs(a1 - a0) < 1e-6) return translate([0, 0, z0], linearExtrude({ h }, ngon(a0)));
  // a prism a little wider than the widest end, each side planed off by a
  // block tilted to the taper. One block at a time: handing difference() all
  // n blocks at once makes the kernel union the overlapping blocks first,
  // which took 2.5 s at 12 sides and was refused outright at 4 and 8.
  const big = Math.max(a0, a1) + 1, L = 2 * (big * k + h) + 10;
  const tilt = Math.atan((a1 - a0) / h) * DEG;
  let solid = translate([0, 0, z0], linearExtrude({ h }, ngon(big)));
  for (let i = 0; i < n; i++) solid = difference(solid, rotate([0, 0, -90 + 360 * i / n],
    translate([a0, 0, z0], rotate([0, tilt, 0], translate([0, -L, -L], cube([L, 2 * L, 2 * L]))))));
  return solid;
};
const slope = (rt - rb) / (height - lip);
// the rim flares out (45 degrees unless the pot is too short). Body and rim
// each run a little past the knee, so their side faces cross there instead
// of the rim just touching the body's top edge, which the exact kernel
// refuses (an octagon pot did).
const over = Math.min(1, lip / 2);
let outer = frustum(rb, 0, rt + slope * over, height - lip + over);
if (lip > 0) outer = union(outer, frustum(rt - rim / lip, height - lip - 1, rt + rim, height));
// the cavity starts AT the floor and runs past the top
const cavity = frustum(rbi, floor, rbi + slope * (height + 1 - floor), height + 1);
const pot = difference(difference(outer, cavity), ...drains);
if (saucer !== "yes") return pot;
// the saucer: its own solid with a solid 2 mm floor, never cut by the pot's holes
const rs = rb + 10, sh = 14, tf = 2;
const dish = difference(frustum(rs, 0, rs + 4, sh), frustum(rs - 2, tf, rs + 2.3, sh + 1));
return group(pot, translate([(rt + rim) * k + (rs + 4) * k + 10, 0, 0], dish));
