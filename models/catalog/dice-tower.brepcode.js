// Dice tower: a dice tower with two internal ramps and a walled tray the dice roll out into.
// Print: upright as shown, no supports: the ramps and the peaked door are steep enough to print as they are.
// Every number below is a slider (Params). From the BREPcode catalog: dice-tower.
const towerIn = 50;  // [35:90] inside width of the tower, mm
const gap = 26;      // [18:45] room between ramps (bigger than your biggest die), mm
const trayL = 70;    // [0:160] tray length (0 = no tray), mm
const trayH = 18;    // [8:40] tray wall height, mm
const wall = 2.4;    // [1.6:4] wall thickness, mm

// x runs across, y runs front to back (the door faces -y), z runs up
const t = wall, Di = towerIn;
const fl = Math.max(2, t);
const rise = Math.tan(55 * Math.PI / 180);
const reach = Di * 0.65, drop = reach * rise;
const rtV = Math.max(2.5, t * 1.4) / Math.cos(55 * Math.PI / 180);   // ramp thickness, measured up and down
// the last ramp is a solid wedge rising from the door to the back wall
const wedgeTop = fl + Di * 0.47;
const wedgeAt = (y) => fl + (wedgeTop - fl) * y / Di;
// ramp 2 leaves the front wall sloping down toward the back, its end a gap above the wedge
const r2Low = wedgeAt(reach) + gap + rtV, r2Top = r2Low + drop;
// ramp 1 leaves the back wall sloping down toward the front, its end a gap above ramp 2
const r1Low = r2Top - (Di - reach) * rise + gap + rtV, r1Top = r1Low + drop;
const H = r1Top + gap + 8;
// outside: the tower, and the tray in front of it (as wide as the tower)
const hasTray = trayL >= t + 5;
const yF = -t - (hasTray ? trayL : 0);
const outer = hasTray
  ? [[yF, 0], [Di + t, 0], [Di + t, H], [-t, H], [-t, trayH], [yF, trayH]]
  : [[-t, 0], [Di + t, 0], [Di + t, H], [-t, H]];
// a side profile (y, z) pushed across the width, from x0 for w
const across = (pts, x0, w) => translate([x0, 0, 0], rotate([0, 0, 90], rotate([90, 0, 0], linearExtrude({ h: w }, polygon(pts)))));
const W = Di + 2 * t;
const cuts = [translate([-Di / 2, 0, fl], cube([Di, Di, H]))];
if (hasTray) cuts.push(translate([-Di / 2, -trayL, fl], cube([Di, trayL - t, trayH])));
// the door: as wide as the tower allows, peaked at 55 degrees
const ow = Di - 4, gh = ow / 2 * rise;
const eh = Math.max(8, Math.min(gap + 4, r2Top - rtV - 3 - fl - gh));
cuts.push(translate([0, 0.5, 0], rotate([90, 0, 0], linearExtrude({ h: t + 1 },
  polygon([[-ow / 2, fl], [ow / 2, fl], [ow / 2, fl + eh], [0, fl + eh + gh], [-ow / 2, fl + eh]])))));
const casing = difference(across(outer, -W / 2, W), ...cuts);
const wedge = across([[-0.3, fl - 0.5], [Di + 0.5, fl - 0.5], [Di + 0.5, wedgeTop], [-0.3, fl + 0.2]], -Di / 2 - 0.5, Di + 1);
const ramp2 = across([[-0.5, r2Top + 0.5 * rise], [reach, r2Low], [reach, r2Low - rtV], [-0.5, r2Top + 0.5 * rise - rtV]], -Di / 2 - 0.5, Di + 1);
const ramp1 = across([[Di + 0.5, r1Top + 0.5 * rise], [Di - reach, r1Low], [Di - reach, r1Low - rtV], [Di + 0.5, r1Top + 0.5 * rise - rtV]], -Di / 2 - 0.5, Di + 1);
return translate([0, -(yF + Di + t) / 2, 0], union(casing, wedge, ramp2, ramp1));
