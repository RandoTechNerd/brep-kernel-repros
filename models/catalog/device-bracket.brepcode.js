// Device wall bracket: a U bracket that holds a router, modem, power strip, switch, hub or drive against a wall or under a shelf.
// Print: on its side as shown, no supports. Use a pair.
// Every number below is a slider (Params). From the BREPcode catalog: device-bracket.
const deviceT = 35;     // [5:120] device thickness, mm
const lipH = 15;        // [5:60] front lip height, mm
const backH = 45;       // [20:150] back plate height, mm
const width = 25;       // [10:100] bracket width, mm
const wall = 4;         // [2.5:8] thickness, mm
const room = 1;         // [0.3:5] room round the device, mm
const screwD = 4;       // [3:6] screw hole diameter, mm
const mount = "screw";  // [tape, screw] how it fixes on

// side profile: x out from the wall, y up; printed lying on it
const w = wall, g = deviceT + room;
const lip = Math.max(lipH, w + 2);
const c = Math.min(3, g / 3);                        // a small gusset in the inside corner
const back = Math.max(backH, w + c + 6);
const outline = [[0, 0], [2 * w + g, 0], [2 * w + g, lip], [w + g, lip], [w + g, w], [w + c, w], [w, w + c], [w, back], [0, back]];
const piece = linearExtrude({ h: width }, polygon(outline));
if (mount !== "screw") return piece;
// countersunk holes through the back plate, above the cradle, heads on the inside
const yh = w + c + (back - w - c) / 2;
const zs = width < 45 ? [width / 2] : [width * 0.25, width * 0.75];
const k = Math.min(screwD / 2, w - 1);
const holes = zs.flatMap((z) => [
  translate([-1, yh, z], rotate([0, 90, 0], cylinder({ r: screwD / 2, h: w + 2, $fn: 24 }))),
  translate([w - k + 0.02, yh, z], rotate([0, 90, 0], cylinder({ r1: screwD / 2, r2: screwD / 2 + k, h: k, $fn: 24 }))),
]);
return difference(piece, ...holes);
