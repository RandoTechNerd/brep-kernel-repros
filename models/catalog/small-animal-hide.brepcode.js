// Small animal hide: a tunnel hideout with a pointed roof and doorways, for hamsters, mice, reptiles, shrimp and fish.
// Print: upright as shown, no supports. PETG for anything that sits in water or a humid tank; sand the door edges smooth.
// Every number below is a slider (Params). From the BREPcode catalog: small-animal-hide.
const width = 110;     // [30:250] outside width, mm
const height = 90;     // [25:200] height (raised if the roof would be too flat), mm
const length = 150;    // [40:250] length, mm
const wall = 3;        // [1.6:6] wall thickness, mm
const roof = "arch";   // [arch, a-frame] pointed arch, or a straight A-frame
const ends = "doors";  // [doors, open, cave] a doorway at each end, open ends, or one door (a cave)
const door = 0.6;      // [0.3:0.85] doorway size as a share of the inside
const windows = 2;     // [0:6] diamond windows along each side

// cross-section in (x, z), extruded along y; the roof is never flatter than 52 degrees
const tanR = Math.tan(52 * Math.PI / 180);
const turn = (90 - 52) * Math.PI / 180;                    // the arc turns the wall this far from upright
const kArc = Math.sin(turn) - (1 - Math.cos(turn)) * tanR; // height an arc of radius 1 adds
// the right half of an outline, from (B, 0) up to the ridge (0, Hh)
const half = (B, Hh, N = 10) => {
  const flat = B * tanR;                                    // the plain 52 degree A-frame
  if (roof === "a-frame" || Hh <= flat + 0.5) return [[B, 0], [0, Math.max(Hh, flat)]];
  const rho = Math.min(B / (1 - Math.cos(turn)) * 0.98, (Hh - flat) / kArc);
  const zv = Hh - flat - rho * kArc;                       // any height left over: straight walls
  const pts = [[B, 0]];
  if (zv > 0.5) pts.push([B, zv]);
  for (let i = 1; i <= N; i++) {
    const t = turn * i / N;
    pts.push([B - rho + rho * Math.cos(t), Math.max(zv, 0) + rho * Math.sin(t)]);
  }
  pts.push([0, Hh]);
  return pts;
};
const both = (h) => [...h, ...h.slice(0, -1).reverse().map(([x, z]) => [-x, z])];  // mirror to a full outline
const B = width / 2;
const Ho = Math.max(height, B * tanR + 1);
const outerHalf = half(B, Ho);
const ridge = outerHalf[outerHalf.length - 1][1];
const pe = outerHalf[outerHalf.length - 2];
const ang = Math.atan2(ridge - pe[1], pe[0]);              // roof angle at the ridge
const Bi = B - wall;
const Hi = Math.min(ridge - 1.2, Math.max(ridge - wall / Math.cos(ang), Bi * Math.tan(48 * Math.PI / 180)));
const innerHalf = half(Bi, Hi);
// the band: outside up and over, inside back
const band = [...both(outerHalf), ...both(innerHalf).reverse()];
// a profile in (x, z) stood up and stretched along y from y0
const along = (pts, h, y0) => translate([0, y0 + h, 0], rotate([90, 0, 0], linearExtrude({ h }, polygon(pts))));
const parts = [along(band, length, 0)];
const cuts = [];
const solidEnd = both(outerHalf);
const doorway = () => both(half(Bi * door, Math.max(Hi * door, Bi * door * tanR + 1))).map(([x, z]) => [x, z - 1]);
if (ends !== "open") {
  parts.push(along(solidEnd, wall + 0.01, 0), along(solidEnd, wall + 0.01, length - wall - 0.01));
  cuts.push(along(doorway(), wall + 2, -1));
  if (ends === "doors") cuts.push(along(doorway(), wall + 2, length - wall - 1));
}
if (windows > 0) {
  // tall diamonds through both sides, low on the walls
  const y0 = wall + 4, span = length - 2 * y0;
  const a = Math.min(span / windows * 0.22, Hi * 0.1, 10);
  const b = a * 1.4, zw = Math.min(Hi * 0.35, Hi * 0.65 - b);
  if (a > 1.5 && zw > b + 2) for (let k = 0; k < windows; k++) {
    const y = y0 + span * (k + 0.5) / windows;
    cuts.push(translate([-B - 1, 0, 0], rotate([0, 0, 90], rotate([90, 0, 0],
      linearExtrude({ h: width + 2 }, polygon([[y - a, zw], [y, zw - b], [y + a, zw], [y, zw + b]]))))));
  }
}
const hide = cuts.length ? difference(union(...parts), ...cuts) : union(...parts);
return translate([0, -length / 2, 0], hide);
