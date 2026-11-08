// Spice drawer insert: sloped rows that lay spice jars down in a drawer, lids forward and labels tilted up.
// Print: lying on its side (the sawtooth profile on the bed), no supports. Wide drawers take two or more side by side.
// Every number below is a slider (Params). From the BREPcode catalog: spice-drawer.
const rows = 2;     // [1:6] rows
const rowD = 95;    // [40:140] depth of each row (about a jar long), mm
const tilt = 25;    // [10:40] slope of each row, degrees
const width = 200;  // [60:250] width (across the drawer), mm
const wall = 3;     // [2:6] wall thickness, mm
const lipH = 6;     // [2:20] lip at the front of each row, mm

// side profile: x runs front to back, y runs up; extruded across the width
const t = wall;
const ta = Math.tan(tilt * Math.PI / 180);
const yh = t + rowD * ta;                        // back of each ramp
const lip = Math.min(lipH, (yh - t) * 0.8);
const D = rows * rowD + t;
const outline = [[0, 0], [0, t + lip]];
for (let k = 0; k < rows; k++) {
  const x = k * rowD;
  outline.push([x + t, t + lip], [x + t, t], [x + rowD, yh]);
  if (k < rows - 1) outline.push([x + rowD, t + lip]);
}
outline.push([D, yh], [D, 0]);
let part = linearExtrude({ h: width }, polygon(outline));

// a window through each tooth, `wall` in from the ramp, the floor and the drop
const ca = Math.cos(tilt * Math.PI / 180);
const wins = [];
for (let k = 0; k < rows; k++) {
  const xa = k * rowD + t, xb = (k + 1) * rowD - t;
  const x0 = xa + (t / ca) / ta;
  const ytop = t + (xb - xa) * ta - t / ca;
  if (xb - x0 > 4 && ytop > t + 3) wins.push(translate([0, 0, -1], linearExtrude({ h: width + 2 }, polygon([[x0, t], [xb, t], [xb, ytop]]))));
}
if (wins.length) part = difference(part, ...wins);
return translate([-D / 2, -yh / 2, 0], part);
