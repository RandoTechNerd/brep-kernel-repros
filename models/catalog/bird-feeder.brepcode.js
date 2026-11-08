// Bird feeder: a hanging seed tray with a socket for an upside-down bottle of seed; also a platform feeder or a bird bath.
// Print: upright as shown, no supports. Hang it by the three rim holes; push a filled bottle into the socket.
// Every number below is a slider (Params). From the BREPcode catalog: bird-feeder.
const trayD = 160;       // [90:240] tray diameter, mm
const rimH = 18;         // [8:50] rim height, mm
const neckD = 27.4;      // [15:45] bottle thread diameter, mm
const sockH = 30;        // [15:60] socket height, mm
const ports = 4;         // [2:8] seed ports
const style = "bottle";  // [bottle, tray, bath] bottle feeder, platform tray or bird bath

const R = trayD / 2, rimT = 6;                            // a thick rim takes the cord holes
const fl = Math.min(3, rimH / 3);
const bath = style === "bath";
// the dish, from plain cylinders (cheaper to cut than a lathed profile):
// a bath's floor is a cone sloping down to the middle, a tray's is flat
const scoop = bath
  ? translate([0, 0, fl], cylinder({ r1: R * 0.25, r2: R - rimT, h: rimH - fl + 0.01 }))
  : translate([0, 0, fl], cylinder({ r: R - rimT, h: rimH }));
const above = translate([0, 0, rimH - 0.01], cylinder({ r: R - rimT, h: 2 }));
// square cord holes and drain slots: boxes cut far faster than round holes in a round dish
const cord = [0, 1, 2].map((i) => rotate([0, 0, 120 * i + 30], translate([R - rimT / 2 - 1.75, -1.75, -1], cube([3.5, 3.5, rimH + 2]))));
const drains = style === "tray" ? [0, 1, 2, 3].map((i) => rotate([0, 0, 90 * i + 45], translate([R * 0.3, -0.8, -1], cube([R * 0.3, 1.6, fl + 2])))) : [];
const dish = cylinder({ r: R, h: rimH });
if (style !== "bottle") return difference(dish, scoop, ...(bath ? [above] : []), ...cord, ...drains);

// the bottle socket: twelve flat sides that bite the thread, on the tray floor
const rb = neckD / 2 + 0.2, rc = rb / Math.cos(Math.PI / 12);
const outerR = rc + 2.4;
const sock = translate([0, 0, fl - 0.01], rotate([0, 0, 15], cylinder({ r: outerR / Math.cos(Math.PI / 12), h: sockH, $fn: 12 })));
const bore = translate([0, 0, fl], rotate([0, 0, 15], cylinder({ r: rc, h: sockH + 1, $fn: 12 })));
// pointed seed ports through the flats at the socket's foot (no flat top to bridge)
const pw = Math.min(14, 2 * rb * Math.tan(Math.PI / 12) * 1.8), ph = pw * 1.1;
// the triangle stands in the y-z plane and runs out along x through the wall
const port = (i) => rotate([0, 0, 360 * i / ports], translate([rb - 1, -pw / 2, fl - 0.5], rotate([90, 90, 0], linearExtrude({ h: outerR - rb + 4 }, polygon([[0, 0], [pw, 0], [pw / 2, ph]])))));
return difference(union(difference(dish, scoop), sock), bore, ...cord, ...Array.from({ length: ports }, (_, i) => port(i)));
