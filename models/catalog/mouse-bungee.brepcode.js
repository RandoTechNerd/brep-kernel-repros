// Mouse bungee: a weighted base and a springy arm that holds a mouse cable up off the desk.
// Print: both pieces flat as shown, no supports. The arm's plug pushes into the socket in the base.
// Every number below is a slider (Params). From the BREPcode catalog: mouse-bungee.
const height = 110;  // [60:180] arm height, mm
const reach = 50;    // [20:120] forward reach of the bend, mm
const cableD = 4;    // [2:9] cable diameter, mm
const armT = 5;      // [3:9] arm thickness (springiness), mm
const armW = 8;      // [5:15] arm width, mm
const baseD = 80;    // [50:140] base diameter, mm
const baseH = 14;    // [8:30] base height, mm

// the arm's centre line, lying flat: x runs forward, y runs up the arm as it stands
const plug = baseH - 3;                          // the part that goes into the base
const rise = Math.max(plug + 6, height - reach);
const rc = cableD / 2 + 0.4 + armT / 2;          // centre-line radius of the cable hook
const path = [[0, 0, 90], [0, rise, 90]];        // [x, y, heading in degrees]
for (let i = 1; i <= 24; i++) {                  // bend from straight up to 25 degrees below level
  const ph = Math.PI - (115 * Math.PI / 180) * i / 24;
  path.push([reach + reach * Math.cos(ph), rise + reach * Math.sin(ph), ph * 180 / Math.PI - 90]);
}
const [ex, ey, eh] = path[path.length - 1];
const hcx = ex + rc * Math.cos((eh + 90) * Math.PI / 180), hcy = ey + rc * Math.sin((eh + 90) * Math.PI / 180);
for (let i = 1; i <= 20; i++) {                  // the hook curls up and back under the cable
  const ps = (eh - 90 + 170 * i / 20) * Math.PI / 180;
  path.push([hcx + rc * Math.cos(ps), hcy + rc * Math.sin(ps), ps * 180 / Math.PI + 90]);
}
const off = (p, side) => {
  const a = (p[2] + 90) * Math.PI / 180;
  return [p[0] + side * armT / 2 * Math.cos(a), p[1] + side * armT / 2 * Math.sin(a)];
};
const outline = [...path.map((p) => off(p, 1)), ...path.slice().reverse().map((p) => off(p, -1))];
const arm = linearExtrude({ h: armW }, polygon(outline));
// the base: a slightly tapered disc with a socket for the plug
const R = baseD / 2;
const base = difference(cylinder({ r1: R, r2: R - 2, h: baseH }),
  translate([-(armT + 0.4) / 2, -(armW + 0.4) / 2, baseH - plug], cube([armT + 0.4, armW + 0.4, plug + 1])));
return group(base, translate([R + 10 + armT / 2, -(rise + reach) / 2, 0], arm));
