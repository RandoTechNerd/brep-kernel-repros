// Treadmill tablet holder: hooks over a treadmill or exercise bike console and holds a tablet or phone in a ledge.
// Print: lying on its side as shown, no supports. Two narrow ones hold a tablet steadier than one wide one.
// Every number below is a slider (Params). From the BREPcode catalog: treadmill-holder.
const deviceT = 12;   // [5:30] device thickness with its case, mm
const consoleT = 30;  // [5:80] console edge thickness, mm
const hookD = 25;     // [10:60] how far the hook reaches down behind, mm
const backH = 80;     // [40:200] back height, mm
const lipH = 12;      // [5:30] front lip height, mm
const width = 40;     // [15:200] width, mm
const wall = 5;       // [3:10] thickness, mm
const lean = 10;      // [0:30] lean back from upright, degrees

// side profile: x towards you, y up; printed lying on it, stretched across the width
const t = wall, g = deviceT + 1, H = backH;
const s = Math.tan(lean * Math.PI / 180);
const xb = -H * s;                                        // the back plate's front face at the top
const hk = Math.min(hookD, H - t);
const outline = [
  [g + t, 0], [g + t, t + lipH], [g, t + lipH], [g, t],   // the lip and the ledge the device stands in
  [-t * s, t], [xb, H],                                   // up the back plate
  [xb, H + t], [xb - 2 * t - consoleT, H + t],            // over the top of the console edge
  [xb - 2 * t - consoleT, H + t - hk], [xb - t - consoleT, H + t - hk],   // and down behind it
  [xb - t - consoleT, H], [xb - t, H],                    // the underside the console edge sits against
  [-t, 0],
];
const left = xb - 2 * t - consoleT;
return translate([-(left + g + t) / 2, -(H + t) / 2, 0], linearExtrude({ h: width }, polygon(outline)));
