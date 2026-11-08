// Controller stand: a narrow desk stand that holds a gamepad upright between its grips, leaning back on a sloped spine.
// Print: lying on its side as shown, no supports.
// Every number below is a slider (Params). From the BREPcode catalog: controller-stand.
const angle = 62;   // [40:80] lean angle from the desk, degrees
const seatH = 45;   // [15:90] seat height (the grips hang below it), mm
const seatD = 32;   // [8:70] seat depth (the controller's thickness where it sits), mm
const backL = 65;   // [30:150] back support length, mm
const width = 42;   // [16:90] spine width (fits between the grips), mm
const lipH = 10;    // [3:30] front lip height, mm
const wall = 6;     // [4:12] frame thickness, mm
const baseD = 110;  // [60:220] base length front to back, mm

// side profile: x runs front to back, y runs up; printed lying on it, `width` thick
const a = angle * Math.PI / 180;
const lipT = wall;
const S = [lipT + seatD, seatH];                 // where the controller's back meets the support
const u = [Math.cos(a), Math.sin(a)], n = [Math.sin(a), -Math.cos(a)];
const T = [S[0] + backL * u[0], S[1] + backL * u[1]];
const Tb = [T[0] + wall * n[0], T[1] + wall * n[1]];
const D = Math.max(baseD, Tb[0] + 15);
const outline = [[0, 0], [D, 0], [D, wall], [Tb[0], wall], Tb, T, S, [lipT, seatH], [lipT, seatH + lipH], [0, seatH + lipH]];
// a window through the spine, leaving `wall` of frame all round
const m = wall, xR = Tb[0] - m, yB = 2 * m;
const under = (x) => S[1] + (x - S[0]) * Math.tan(a) - m / Math.cos(a);
const xk = S[0] + (m / Math.cos(a) - m) / Math.tan(a);
let win = null;
if (seatH - m - yB > 6 && xR - m > 8) {
  win = xk < xR - 2 && under(xR) > seatH - m
    ? [[m, yB], [xR, yB], [xR, under(xR)], [xk, seatH - m], [m, seatH - m]]
    : [[m, yB], [xR, yB], [xR, seatH - m], [m, seatH - m]];
}
const spine = linearExtrude({ h: width }, polygon(outline));
const piece = win ? difference(spine, translate([0, 0, -1], linearExtrude({ h: width + 2 }, polygon(win)))) : spine;
return translate([-D / 2, -Math.max(T[1], seatH + lipH) / 2, 0], piece);
