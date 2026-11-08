// Console wall mount: brackets that hold a games console on edge, on the wall or as a vertical stand.
// Print: lying on their side as shown, no supports. Use one near each end of the console.
// Every number below is a slider (Params). From the BREPcode catalog: console-mount.
const consoleT = 64;   // [15:170] console thickness, mm
const mount = "wall";  // [wall, stand] wall bracket or floor stand
const lipH = 15;       // [5:60] lip height, mm
const width = 40;      // [15:100] bracket width, mm
const wall = 5;        // [3:12] thickness, mm
const plateH = 60;     // [30:150] wall plate height, mm
const foot = 35;       // [10:120] foot reach each side (stand), mm
const pieces = 2;      // [1:4] brackets
const screwD = 4;      // [3:5.5] screw diameter, mm

// one flat profile, printed lying on it, `width` thick
const gap = consoleT + 0.8;
let outline, holes = [], rowH;
if (mount === "wall") {
  // x runs out from the wall, y runs up; the console's bottom edge sits in the channel
  const g = Math.min(25, gap * 0.5, plateH * 0.5);
  const x1 = wall + gap, x2 = x1 + wall;
  outline = [[0, -g], [wall, -g], [wall + g, 0], [x2, 0], [x2, wall + lipH], [x1, wall + lipH], [x1, wall],
    [wall, wall], [wall, plateH], [0, plateH]];
  const k = screwD / 2, y = plateH - Math.min(14, (plateH - wall) / 2);
  holes = [
    translate([-1, y, width / 2], rotate([0, 90, 0], cylinder({ r: screwD / 2, h: wall + 2, $fn: 24 }))),
    translate([wall - k + 0.02, y, width / 2], rotate([0, 90, 0], cylinder({ r1: screwD / 2, r2: screwD / 2 + k, h: k, $fn: 24 }))),
  ];
  rowH = plateH + g;
} else {
  // x runs across the channel, y runs up; walls buttressed out to the feet
  const xL = foot, xR = foot + 2 * wall + gap, W = xR + foot;
  const b = Math.min(foot * 0.8, lipH * 0.8);
  outline = [[0, 0], [W, 0], [W, wall], [xR + b, wall], [xR, wall + b], [xR, wall + lipH], [xR - wall, wall + lipH], [xR - wall, wall],
    [xL + wall, wall], [xL + wall, wall + lipH], [xL, wall + lipH], [xL, wall + b], [xL - b, wall], [0, wall]];
  rowH = wall + lipH;
}
const one = holes.length ? difference(linearExtrude({ h: width }, polygon(outline)), ...holes) : linearExtrude({ h: width }, polygon(outline));
const all = Array.from({ length: pieces }, (_, i) => translate([0, i * (rowH + 8), 0], one));
return translate([-40, -(pieces * (rowH + 8)) / 2, 0], group(...all));
