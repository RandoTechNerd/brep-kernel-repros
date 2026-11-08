// Bottle waterer: a push-on top that turns a plastic bottle into a watering spike or a watering-can rose.
// Print: spike point up, rose face down, as shown; no supports. Push it over the bottle's thread; adjust fit if it is loose.
// Every number below is a slider (Params). From the BREPcode catalog: bottle-waterer.
const neckD = 27.4;     // [15:45] bottle thread diameter, mm
const fit = 0.2;        // [-0.4:1.2] socket allowance (less = tighter), mm
const sockD = 17;       // [10:30] socket depth, mm
const wall = 2.4;       // [1.6:4] wall thickness, mm
const style = "spike";  // [spike, rose] spike or watering rose
const spikeL = 90;      // [30:180] spike length, mm
const holeD = 2;        // [1:4] outlet hole or slot width, mm
const roseD = 60;       // [35:110] rose diameter, mm

// Everything here is FLAT-FACED: rings of points hulled into cones and tubes,
// n-gon prisms for the bores. A true (curved) revolve with a twelve-sided
// socket cut out of it took the kernel 15 to 25 s per build; this builds in
// well under a second and prints the same.
const rb = neckD / 2 + fit;                               // the socket's flats sit here
const Rs = rb / Math.cos(Math.PI / 12) + wall;            // outside of the socket
const k60 = Math.tan(60 * Math.PI / 180), k50 = Math.tan(50 * Math.PI / 180);
const thin = Math.min(0.5, wall / 4);                     // a hulled ring is a thin slice (derived: not a slider)
const ringPts = (r, n, turn) => { const o = []; for (let i = 0; i < n; i++) { const a = (turn || 0) + i * 2 * Math.PI / n; o.push([r * Math.cos(a), r * Math.sin(a)]); } return o; };
const ring = (r, z0, h, n, turn) => translate([0, 0, z0], linearExtrude({ h }, polygon(ringPts(r, n || 48, turn))));
// the twelve-sided socket bore: its flats sit at rb and bite the thread
const sock12 = (z0, h) => ring(rb / Math.cos(Math.PI / 12), z0, h, 12, Math.PI / 12);

if (style === "rose") {
  // face down: perforated plate, a 50 degree cone up to the socket, socket open on top
  const Rr = Math.max(roseD / 2, Rs + 4), pt = 2;
  const zc = pt + (Rr - wall - rb) * k50;                 // inside of the cone reaches the socket here
  const zs = pt + (Rr - Rs) * k50;                        // outside of the cone reaches the socket wall here
  // the face: a flat disc cut into parallel slots holeD wide
  const rIn = Rr - wall - 1, sp = holeD * 3;
  const slots = [];
  for (let y = -Math.floor(rIn / sp) * sp; y <= rIn - holeD; y += sp) {
    const half = Math.sqrt(Math.max(0, rIn * rIn - (Math.abs(y) + holeD / 2) ** 2)) - 1.5;
    if (half > 2) slots.push(translate([-half, y - holeD / 2, -1], cube([2 * half, holeD, pt + 2])));
  }
  const face = difference(ring(Rr, 0, pt), ...slots);
  // the cone: a thin-walled frustum (outer hull minus inner hull), overlapping
  // the face by half a millimetre; then the socket tube on top of it
  const outerC = hull(ring(Rr, pt - thin, thin), ring(Rs, zs - thin, thin));
  const innerC = hull(ring(Rr - wall + 1.5 / k50, pt - 1.5, thin), ring(rb, zc + thin, thin));
  // the socket tube on top. The inner cone is cut from the frustum AND the
  // tube together: cut from the frustum alone, the tube's solid base was left
  // as a flat ceiling over the cone, a 45 degree overhang the print needs no supports for.
  const sockTube = ring(Rs, zs - thin, zc + sockD - zs + thin);
  const upperShell = difference(union(outerC, sockTube), innerC, sock12(zc, sockD + 1));
  return union(face, upperShell);
}

// spike: point up, socket open on the bed, a 60 degree cone ceiling up to a water channel
const rc = Math.max(2, holeD / 2 + 0.6);                  // the channel
const rp = rc + wall;                                     // the spike tube
const zs = sockD + (Rs - rp) * k60;                       // top of the shoulder
const tipR = holeD / 2 + 0.8, tipL = (rp - tipR) * 2.5;
const zt = zs + spikeL;                                   // the point starts here
// the outside is convex (socket, shoulder, tube, point), so one hull of three rings is it
const outer = hull(ring(Rs, 0, sockD), ring(rp, zs, zt - zs), ring(tipR, zt + tipL - thin, thin, 24));
const zch = sockD + (rb - rc) * k60;                      // the inside cone meets the channel
const ceiling = hull(sock12(sockD - 0.01, thin), ring(rc, zch - thin, thin, 24));
const zEnd = zt + tipL * (rp - rc - 1) / (rp - tipR);     // keep a millimetre of wall in the point
const channel = ring(rc, zch - 0.01, zEnd - zch + 0.01, 24);
const outlet = ring(holeD / 2, zEnd - 1, zt + tipL - zEnd + 2, 16);
return difference(outer, sock12(-1, sockD + 1), ceiling, channel, outlet);
