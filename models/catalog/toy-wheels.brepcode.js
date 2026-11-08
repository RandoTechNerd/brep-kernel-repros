// Toy car wheels: a set of toy car wheels with tread grooves and an axle bore, and optional printed axles.
// Print: flat as shown, no supports. No small parts at the default 40 mm; wheels under 32 mm and printed axles are small parts (ages 3+).
// Every number below is a slider (Params). From the BREPcode catalog: toy-wheels.
const wheelD = 40;   // [15:100] wheel diameter, mm
const width = 12;    // [5:40] tyre width, mm
const axleD = 3;     // [2:10] axle diameter, mm
const fit = 0.3;     // [-0.1:1] bore allowance (more = spins freely), mm
const hubD = 10;     // [5:30] hub diameter, mm
const count = 4;     // [1:8] how many wheels
const treads = 3;    // [0:8] tread grooves
const axles = "no";  // [no, yes] printed axles

const R = wheelD / 2, rh = Math.min(Math.max(hubD / 2, axleD / 2 + 2), R - 4);
const web = Math.max(1.6, width * 0.2), rim = Math.max(2, Math.min(R * 0.18, R - rh - 2));
// the tread, bottom to top, with V grooves (steep flanks, nothing hangs)
const edge = [];
for (let i = 1; i <= treads; i++) {
  const z = width * i / (treads + 1), gh = Math.min(1.6, width / (treads + 1) * 0.6), gd = Math.min(gh * 0.45, rim - 1);
  edge.push([R, z - gh / 2], [R - gd, z], [R, z + gh / 2]);
}
const hubH = Math.min(width, Math.max(web + 3, width * 0.8));
const tyre = revolve(360, polygon([[0, 0], [R, 0], ...edge, [R, width], [R - rim, width], [R - rim, web], [rh, web], [rh, hubH], [0, hubH]]));
// eight flats grip a round axle, and an 8-sided cutter is far cheaper than a round one here
const wheel = difference(tyre, translate([0, 0, -1], rotate([0, 0, 22.5], cylinder({ r: (axleD / 2 + fit / 2) / Math.cos(Math.PI / 8), h: width + 2, $fn: 8 }))));
// lay the wheels out in a grid, axles beside them
const per = Math.min(count, 4), pitch = wheelD + 6;
const parts = Array.from({ length: count }, (_, i) => translate([(i % per) * pitch, Math.floor(i / per) * pitch, 0], wheel));
if (axles === "yes") {
  // a pin with a head: long enough for two wheels and a car between them
  const len = Math.max(40, wheelD * 1.6) + 2 * width, ra = axleD / 2;
  const pin = revolve(360, polygon([[0, 0], [ra + 2.5, 0], [ra + 2.5, 2], [ra, 2], [ra, len], [0, len]]));
  for (let i = 0; i < Math.ceil(count / 2); i++) parts.push(translate([per * pitch + i * (2 * ra + 9), 0, 0], pin));
}
return translate([-(per - 1) * pitch / 2, -(Math.ceil(count / per) - 1) * pitch / 2, 0], group(...parts));
