// Resistance band anchor: a wall loop or a behind-the-door puck to anchor resistance bands.
// Print: flat as shown, no supports. For resistance bands only, never body weight. Screw the wall loop into a stud.
// Every number below is a slider (Params). From the BREPcode catalog: band-anchor.
const style = "wall";  // [wall, door] wall loop or door puck
const loopW = 30;      // [15:60] loop opening width, mm
const loopH = 30;      // [15:60] loop opening height, mm
const loopT = 14;      // [8:30] loop thickness along the band, mm
const wallT = 7;       // [4:14] loop wall thickness, mm
const puckD = 45;      // [30:80] door puck diameter, mm
const strapW = 26;     // [15:52] webbing strap width, mm

if (style === "door") {
  // a puck that sits behind the shut door, the strap through a slot in it
  const h = Math.max(18, strapW * 0.6);
  const sw = Math.min(strapW + 1, puckD - 8);
  return difference(cylinder({ r: puckD / 2, h, $fn: 64 }), translate([-sw / 2, -2.5, -1], cube([sw, 5, h + 2])));
}
const k = Math.tan(55 * Math.PI / 180);
const hi = Math.max(2, loopH - loopW / 2 * k);           // where the inside roof starts
const apexIn = hi + loopW / 2 * k;
const W = loopW + 2 * wallT;
const v = wallT / Math.cos(55 * Math.PI / 180);           // the roof offset straight up for a wall thickness
const apexOut = apexIn + v, ho = apexOut - W / 2 * k;
// the loop's profile: x across, y up off the plate; lying on the plate, running along x
const outerArch = polygon([[-W / 2, 0], [W / 2, 0], [W / 2, ho], [0, apexOut], [-W / 2, ho]]);
const innerArch = polygon([[-loopW / 2, -1], [loopW / 2, -1], [loopW / 2, hi], [0, apexIn], [-loopW / 2, hi]]);
const run = (prof, L) => translate([-L / 2, 0, 0], rotate([90, 90, 0], linearExtrude({ h: L }, prof)));
const pt = Math.max(5, wallT - 1);                        // plate thickness
const loop = translate([0, 0, pt - 0.5], difference(run(outerArch, loopT), run(innerArch, loopT + 2)));
// the plate, screws either side of the loop, countersunk
const PL = loopT + 44, PW = W + 12;
const screwCut = (x) => [translate([x, 0, -1], cylinder({ r: 2.6, h: pt + 2, $fn: 16 })), translate([x, 0, pt - 2.6], cylinder({ r1: 2.6, r2: 5.3, h: 2.61, $fn: 16 }))];
const plate = difference(translate([-PL / 2, -PW / 2, 0], cube([PL, PW, pt])), ...screwCut(-(loopT / 2 + 11)), ...screwCut(loopT / 2 + 11));
return union(plate, loop);
