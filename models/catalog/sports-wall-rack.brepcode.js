// Sports wall rack: a wall plate with angled pegs: medals and belts on a row of pegs, rackets and paddles in a two-peg fork.
// Print: lying on its back as shown, no supports. Countersunk screws through the plate; into a stud for anything heavy.
// Every number below is a slider (Params). From the BREPcode catalog: sports-wall-rack.
const pegs = 6;     // [1:15] how many pegs
const gap = 28;     // [10:80] gap between pegs, mm
const pegL = 35;    // [15:80] peg length, mm
const tilt = 60;    // [50:90] peg angle from the wall (90 = straight out), degrees
const pegT = 8;     // [5:16] peg thickness, mm
const pegW = 10;    // [6:24] peg depth at the plate, mm
const plateH = 45;  // [30:120] plate height, mm
const plateT = 5;   // [3:10] plate thickness, mm

const pitch = gap + pegT;
const len = (pegs - 1) * pitch + pegT + 36;               // plate length along the wall, room for a screw at each end
const H = Math.max(plateH, pegW + 30);
const r = Math.min(6, H / 4);
// the plate: a rounded rectangle lying flat (x along the wall, y up the wall)
const arc = (cx, cy, a0, n = 6) => Array.from({ length: n + 1 }, (_, i) => {
  const t = a0 + Math.PI / 2 * i / n;
  return [cx + r * Math.cos(t), cy + r * Math.sin(t)];
});
const outline = [...arc(len / 2 - r, r, -Math.PI / 2), ...arc(len / 2 - r, H - r, 0), ...arc(-len / 2 + r, H - r, Math.PI / 2), ...arc(-len / 2 + r, r, Math.PI)];
// screws near the top, countersunk on the face
const sx = len / 2 - 8, sy = H - 10;                      // 10 mm clear of the end pegs
const screwCut = (x) => [translate([x, sy, -1], cylinder({ r: 2.3, h: plateT + 2, $fn: 16 })), translate([x, sy, plateT - 2.3], cylinder({ r1: 2.3, r2: 4.7, h: 2.31, $fn: 16 }))];
const holes = [...screwCut(-sx), ...screwCut(sx)];
const plate = difference(linearExtrude({ h: plateT }, polygon(outline)), ...holes);
// a peg: a parallelogram fin in the y-z plane, leaning up the wall at its angle, pegT thick along x
const a = tilt * Math.PI / 180;
const y0 = plateT + 3;                                    // the pegs start just above the bottom edge
const fin = polygon([[y0, plateT - 0.5], [y0 + pegW, plateT - 0.5], [y0 + pegW + pegL * Math.cos(a), plateT + pegL * Math.sin(a)], [y0 + pegL * Math.cos(a), plateT + pegL * Math.sin(a)]]);
const peg = rotate([90, 90, 0], linearExtrude({ h: pegT }, fin));
const all = Array.from({ length: pegs }, (_, i) => translate([-((pegs - 1) * pitch + pegT) / 2 + i * pitch, 0, 0], peg));
return union(plate, ...all);
