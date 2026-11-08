// Phone stand: leans a phone back at a reading angle, with a charging-cable hole through the seat.
// Print: upright as shown, no supports.
// Every number below is a slider (Params). From the BREPcode catalog: phone-stand.
const deviceT = 12;  // [5:30] device thickness with its case, mm
const angle = 65;    // [45:80] lean angle from the desk, degrees
const width = 70;    // [30:220] stand width, mm
const backH = 80;    // [40:220] back support length, mm
const seatH = 22;    // [4:60] seat height above the desk, mm
const lipH = 10;     // [4:30] front lip height, mm
const cableW = 12;   // [0:20] cable hole width (0 = none), mm
const wall = 4;      // [2.4:8] wall thickness, mm

// side profile: x runs front to back, y runs up; extruded across the width
const gapX = deviceT + 1;                       // a millimetre of room around the device
const lipT = wall;
const x0 = lipT + gapX;                         // the back support starts here
const a = angle * Math.PI / 180;
const u = [Math.cos(a), Math.sin(a)];           // up the support
const n = [Math.sin(a), -Math.cos(a)];          // through the support, away from the phone
const S = [x0, seatH];
const Ti = [S[0] + backH * u[0], S[1] + backH * u[1]];
const To = [Ti[0] + wall * n[0], Ti[1] + wall * n[1]];
const depth = To[0];
const outline = [[0, 0], [depth, 0], To, Ti, S, [lipT, seatH], [lipT, seatH + lipH], [0, seatH + lipH]];

// the window through the wedge under the support, leaving `wall` all round
const m = wall;
const Q = [S[0] + (wall + m) * n[0], S[1] + (wall + m) * n[1]];
const onLine = (x) => Q[1] + ((x - Q[0]) / u[0]) * u[1];
const xBack = depth - m, xFront = x0 + m;
let win = null;
if (onLine(xBack) > m + 3) {
  if (onLine(xFront) > m + 1) win = [[xFront, m], [xBack, m], [xBack, onLine(xBack)], [xFront, onLine(xFront)]];
  else {
    const x1 = Q[0] + ((m - Q[1]) / u[1]) * u[0];
    if (x1 < xBack - 3) win = [[x1, m], [xBack, m], [xBack, onLine(xBack)]];
  }
}

// a side profile turned up and stretched across y from y0 to y0 + h
const across = (pts, h, y0) => translate([0, y0 + h, 0], rotate([90, 0, 0], linearExtrude({ h }, polygon(pts))));

const cuts = [];
if (win) cuts.push(across(win, width + 2, -1));
if (cableW > 0) {
  // down through the seat, then out the front along the desk
  cuts.push(translate([lipT + 0.5, (width - cableW) / 2, -1], cube([gapX - 1, cableW, seatH + 2])));
  cuts.push(translate([-1, (width - cableW) / 2, -1], cube([x0, cableW, Math.min(8, seatH - 2) + 1])));
}
const stand = cuts.length ? difference(across(outline, width, 0), ...cuts) : across(outline, width, 0);
return translate([-depth / 2, -width / 2, 0], stand);
