// Chair leg cap: a glide cap that slips over a chair or table leg to protect the floor.
// Print: floor down as shown, no supports. TPU for grip and quiet, PETG for gliding.
// Every number below is a slider (Params). From the BREPcode catalog: leg-cap.
const legSize = 25;     // [8:80] leg diameter (or side, if square), mm
const shape = "round";  // [round, square] leg shape
const depth = 15;       // [5:40] how far the leg goes in, mm
const wall = 2.4;       // [1.6:5] wall thickness, mm
const floorT = 3;       // [1.6:8] floor thickness, mm
const fit = 0.3;        // [0:1] room around the leg, each side, mm
const tilt = 0;         // [0:15] leg splay angle, degrees

const inner = legSize + 2 * fit;
const Ro = inner / 2 + wall;
const H = floorT + depth;
const sq = shape === "square";
const c = tilt > 0 ? 0 : Math.min(1.2, wall * 0.5);   // 45 degree chamfer round the floor edge
// a rounded square (or a circle) w across, from z0 to z0 + h
const ring = (w, r, z0, h) => sq
  ? hull(...[[-1, -1], [1, -1], [-1, 1], [1, 1]].map(([sx, sy]) => translate([sx * (w / 2 - r), sy * (w / 2 - r), z0], cylinder({ r, h, $fn: 24 }))))
  : translate([0, 0, z0], cylinder({ r: w / 2, h, $fn: 64 }));
const rc = Math.min(wall + 1, Ro - 0.5);
const lean = tilt * Math.PI / 180;
// the socket floor rises with the lean so its low side keeps the full floor
const floorZ = floorT / Math.cos(lean) + (inner / 2) * Math.tan(lean);
const body = c > 0
  ? hull(ring(2 * Ro - 2 * c, Math.max(0.5, rc - c), 0, 0.01), ring(2 * Ro, rc, c, H - c))
  : ring(2 * Ro, rc, -Ro, H + Ro);
const socket = ring(inner, Math.max(0.5, rc - wall), floorZ, H + Ro);
const cup = difference(body, socket);
if (tilt <= 0) return cup;
// lean the cup and cut the floor flat again
return intersection(rotate([tilt, 0, 0], cup), translate([-2 * Ro - 10, -2 * Ro - 10, 0], cube([4 * Ro + 20, 4 * Ro + 20, H + Ro])));
