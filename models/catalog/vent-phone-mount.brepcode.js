// Car vent phone mount: a phone holder that clips onto a car air vent slat and grips the phone by two edges.
// Print: on its side as shown, no supports. PETG: PLA softens in a hot car.
// Every number below is a slider (Params). From the BREPcode catalog: vent-phone-mount.
const phoneW = 80;           // [55:100] phone width with its case, mm
const phoneLen = 160;        // [110:190] phone length with its case, mm
const phoneT = 12;           // [6:20] phone thickness with its case, mm
const orient = "landscape";  // [landscape, portrait] phone held sideways or upright
const width = 40;            // [25:70] mount width, mm
const lipH = 6;              // [3:15] how far the lips wrap the phone's face, mm
const wall = 3.5;            // [2.5:6] wall thickness, mm
const slatT = 2;             // [1:5] vent slat thickness, mm
const clipL = 18;            // [10:30] how far the clip reaches into the vent, mm

// side profile: x runs out of the vent toward the driver, y runs up; printed lying on it
const span = (orient === "portrait" ? phoneLen : phoneW) + 1;   // between the two jaws
const H = span + 2 * wall;
const D = wall + phoneT + 1 + wall;              // back, phone, front lip
const box = (x0, y0, x1, y1) => [[x0, y0], [x1, y0], [x1, y1], [x0, y1]];
const slab = (pts) => linearExtrude({ h: width }, polygon(pts));
const parts = [
  slab(box(0, 0, wall, H)),                                  // back plate
  slab(box(0, 0, D, wall)),                                  // bottom jaw
  slab(box(D - wall, 0, D, wall + lipH)),                    // its lip over the phone's face
  slab(box(0, H - wall, D, H)),                              // top jaw
  slab(box(D - wall, H - wall - lipH, D, H)),                // and its lip
];
// the fork: two tines that pinch a slat, a touch closer than the slat is thick
const g = Math.max(0.6, slatT - 0.4);
const tine = Math.max(2.6, wall * 0.75);
const yc = H / 2;
parts.push(slab(box(-clipL, yc + g / 2, 0.5, yc + g / 2 + tine)));
parts.push(slab(box(-clipL, yc - g / 2 - tine, 0.5, yc - g / 2)));
parts.push(slab(box(0.4 - 2 * clipL / 5, yc - g / 2 - tine - 2, 0.5, yc + g / 2 + tine + 2)));   // root block between the tines and the plate
// an end stop on the bed side so the phone cannot slide out that way
parts.push(linearExtrude({ h: 2 }, polygon(box(0, 0, D, H))));
// the slot between the tines, flared at the mouth so a slat finds its way in
const xEnd = 0.4 - 2 * clipL / 5;
const tineGap = translate([0, 0, -1], linearExtrude({ h: width + 2 }, polygon([
  [-clipL - 1, yc - g / 2 - 1.2], [-clipL + 3, yc - g / 2], [xEnd, yc - g / 2],
  [xEnd, yc + g / 2], [-clipL + 3, yc + g / 2], [-clipL - 1, yc + g / 2 + 1.2],
])));
return translate([-D / 2, -H / 2, 0], difference(union(...parts), tineGap));
