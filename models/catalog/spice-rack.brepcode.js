// Tiered spice rack: a step riser that lifts each row of spice jars above the one in front, with a lip on every step.
// Print: lying on its side (the stair profile on the bed), no supports. Stand it up to use.
// Every number below is a slider (Params). From the BREPcode catalog: spice-rack.
const tiers = 3;    // [2:6] tiers (rows)
const width = 200;  // [60:250] width (side to side), mm
const stepD = 55;   // [25:140] depth of each step, mm
const stepH = 30;   // [12:80] rise of each step, mm
const wall = 4;     // [2.4:8] wall thickness, mm
const lipH = 6;     // [0:20] lip on the front of each step (0 = none), mm

// side profile: x runs front to back, y runs up; extruded across the width
const t = wall;
const lip = Math.min(lipH, stepH * 2);
const D = tiers * stepD;
const yk = (k) => t + k * stepH;                 // top of tread k (0 = front row, on the floor plate)
const outline = [[0, 0], [D, 0], [D, yk(tiers - 1)]];
for (let k = tiers - 1; k >= 0; k--) {
  const x = k * stepD;
  if (lip > 0) outline.push([x + t, yk(k)], [x + t, yk(k) + lip], [x, yk(k) + lip]);
  else outline.push([x, yk(k)]);
  if (k > 0) outline.push([x, yk(k - 1)]);
}
let part = linearExtrude({ h: width }, polygon(outline));

// the space under the stairs, leaving `wall` all round
if (stepH > t + 3 && stepD > 2 * t + 4) {
  const win = [[stepD + t, t], [D - t, t], [D - t, yk(tiers - 1) - t]];
  for (let k = tiers - 1; k >= 1; k--) {
    win.push([k * stepD + t, yk(k) - t]);
    if (k > 1) win.push([k * stepD + t, yk(k - 1) - t]);
  }
  part = difference(part, translate([0, 0, -1], linearExtrude({ h: width + 2 }, polygon(win))));
}
return translate([-D / 2, -(yk(tiers - 1) + lip) / 2, 0], part);
