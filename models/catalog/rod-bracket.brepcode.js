// Curtain rod bracket: a wall bracket with an open cradle that a curtain rod or closet pole drops into.
// Print: on its side as shown, no supports. PETG; print one per end and one per metre between.
// Every number below is a slider (Params). From the BREPcode catalog: rod-bracket.
const rodD = 25.4;      // [8:50] rod diameter, mm
const projection = 80;  // [30:160] rod centre from the wall, mm
const rods = 1;         // [1:2] rods
const plateH = 70;      // [40:140] wall plate height, mm
const width = 20;       // [12:50] bracket width, mm
const plateT = 6;       // [4:10] wall plate thickness, mm
const armT = 9;         // [5:16] arm thickness, mm
const wallT = 4;        // [2.5:8] cradle wall, mm
const sideH = 10;       // [0:40] how far the cradle sides rise above the rod centre, mm
const screwD = 4.5;     // [3:6] screw diameter, mm

// side profile: x runs out from the wall, y runs up; printed lying on it
const R = rodD / 2 + 0.5;                          // the rod drops in with half a millimetre
const Ro = R + wallT;
const P = Math.max(projection, plateT + (rods > 1 ? 3 * Ro + 8 : Ro + 2));
const gusL = Math.min(P * 0.6, 40);
const gusH = Math.min(gusL, 25);
const below = 7 * screwD;                          // two screws stacked under the brace
const qa = below + gusH;                           // underside of the arm
const H = Math.max(plateH, qa + armT + 2);
const pEnd = P + Ro * 0.6;
const outline = [
  [0, 0], [plateT, 0], [plateT, qa - gusH], [plateT + gusL, qa], [pEnd, qa],
  [pEnd, qa + armT], [plateT, qa + armT], [plateT, H], [0, H],
];
const parts = [linearExtrude({ h: width }, polygon(outline))];
// a U on the arm, straight-sided above the rod's centre so the rod drops in
const cradle = (cx) => {
  const cy = qa + armT - wallT / 2 + Ro;
  const at = (r, a) => [cx + r * Math.cos(a), cy + r * Math.sin(a)];
  const n = 32;
  const top = cy + Math.max(0.4, sideH);
  return polygon([
    [cx - Ro, top], ...Array.from({ length: n + 1 }, (_, i) => at(Ro, Math.PI + Math.PI * i / n)), [cx + Ro, top],
    [cx + R, top], ...Array.from({ length: n + 1 }, (_, i) => at(R, 2 * Math.PI - Math.PI * i / n)), [cx - R, top],
  ]);
};
parts.push(linearExtrude({ h: width }, cradle(P)));
if (rods > 1) parts.push(linearExtrude({ h: width }, cradle(P - 2 * Ro - 6)));
// countersunk screws through the plate, under the brace
const k = Math.min(screwD / 2, plateT - 1.5);
const holes = [below * 0.25, below * 0.72].flatMap((y) => [
  translate([-1, y, width / 2], rotate([0, 90, 0], cylinder({ r: screwD / 2, h: plateT + 2, $fn: 24 }))),
  translate([plateT - k + 0.02, y, width / 2], rotate([0, 90, 0], cylinder({ r1: screwD / 2, r2: screwD / 2 + k, h: k, $fn: 24 }))),
]);
return difference(union(...parts), ...holes);
