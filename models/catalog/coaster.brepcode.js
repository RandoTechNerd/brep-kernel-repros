// Coaster: a drink coaster with a drip rim and grooves, as a set with a holder if wanted.
// Print: flat as shown, no supports. A TPU or cork-filled base layer stops it sliding.
// Every number below is a slider (Params). From the BREPcode catalog: coaster.
const size = 100;         // [60:160] across, mm
const thick = 4;          // [2:10] thickness, mm
const rim = 1.5;          // [0:6] rim height (0 = flat), mm
const rimW = 3;           // [1.2:8] rim width, mm
const shape = "round";    // [round, square, hex, octagon] shape
const pattern = "rings";  // [rings, lines, plain] grooves on top
const count = 1;          // [1:8] how many
const holder = "no";      // [no, yes] holder for the stack

const R = size / 2;
const sideN = shape === "hex" ? 6 : shape === "octagon" ? 8 : shape === "square" ? 4 : 0;
// the outline at a given inset (negative grows it): a polygon with a flat at the bottom
const outline = (inset) => {
  if (!sideN) return null;
  const rc = (R - inset) / Math.cos(Math.PI / sideN);   // R is the flat-to-centre distance
  const a0 = Math.PI / sideN - Math.PI / 2;
  return polygon(Array.from({ length: sideN }, (_, i) => [rc * Math.cos(a0 + 2 * Math.PI * i / sideN), rc * Math.sin(a0 + 2 * Math.PI * i / sideN)]));
};
const slab = (inset, z0, h) => sideN
  ? translate([0, 0, z0], linearExtrude({ h }, outline(inset)))
  : translate([0, 0, z0], cylinder({ r: R - inset, h, $fn: 96 }));
const one = () => {
  let c = slab(0, 0, thick + rim);
  const cuts = [];
  if (rim > 0) cuts.push(slab(rimW, thick, rim + 1));
  // grooves: 0.8 mm deep into the top, inside the rim
  const gd = Math.min(0.8, thick * 0.3);
  const inner = R - rimW - 3;
  if (pattern === "rings") {
    for (let r = 8; r < inner; r += 7) {
      cuts.push(translate([0, 0, thick - gd], difference(cylinder({ r: r + 0.8, h: gd + rim + 1, $fn: 72 }), translate([0, 0, -1], cylinder({ r: r - 0.8, h: gd + rim + 3, $fn: 72 })))));
    }
  } else if (pattern === "lines") {
    for (let y = -inner + 4; y < inner - 3; y += 7) {
      const half = Math.sqrt(Math.max(0, inner * inner - y * y));
      if (half > 4) cuts.push(translate([-half, y - 0.8, thick - gd], cube([2 * half, 1.6, gd + rim + 1])));
    }
  }
  return cuts.length ? difference(c, ...cuts) : c;
};
const step = size + 6;
const cols = count > 2 ? 2 : count;
const parts = Array.from({ length: count }, (_, i) => translate([(i % cols) * step, Math.floor(i / cols) * step, 0], one()));
if (holder === "yes") {
  // an open box the stack drops into, with a finger notch at the front
  const fit = 1;
  const wallT = 2.4;
  const hH = Math.min(count * (thick + rim) * 0.7 + 3, 60);
  const box = difference(slab(-(fit + wallT), 0, hH), slab(-fit, 2, hH),
    translate([-R * 0.3, -R - fit - wallT - 1, 4], cube([R * 0.6, wallT + 2 + R * 0.3, hH])));
  parts.push(translate([-(step + 10), 0, 0], box));
}
return parts.length > 1 ? group(...parts) : parts[0];
