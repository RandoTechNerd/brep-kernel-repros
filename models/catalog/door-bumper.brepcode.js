// Door bumper: a domed wall or baseboard door stop, screwed or stuck on.
// Print: standing on its base as shown, no supports. TPU for a soft, quiet stop.
// Every number below is a slider (Params). From the BREPcode catalog: door-bumper.
const diameter = 25;    // [8:80] diameter, mm
const length = 60;      // [3:150] how far it sticks out, mm
const flange = 5;       // [0:20] base flange width, mm
const mount = "screw";  // [screw, adhesive] mounting
const screwD = 4.5;     // [3:6] screw diameter, mm
const headD = 9;        // [6:14] screw head counterbore, mm

// z = 0 is the face against the wall; the dome the door hits is on top
const r = diameter / 2;
const dh = Math.min(r, length * 0.6);               // dome height
const fT0 = Math.min(2.5, length * 0.4);
// a flange that tapers in to the post at 45 degrees, if the post is long enough for one
const fl = Math.max(0, Math.min(flange, length - dh - fT0 - 0.3));
const fT = fl > 0 ? fT0 : 0;
const base = fl > 0 ? [[r + fl, 0], [r + fl, fT], [r, fT + fl]] : [[r, 0]];
// the screw goes in through the dome: its head sits at the bottom of a
// counterbore, which is part of the turned outline (a bore cut down a
// revolve's axis is very slow); only the screw hole itself is cut
const screwed = mount === "screw";
const floor = Math.max(3, Math.min(6, length * 0.4));
const rc = screwed && floor < length - 0.5 ? Math.min(headD / 2, r - 1.2) : 0;
const aMax = rc > 0 ? Math.acos(Math.min(1, rc / r)) : Math.PI / 2;
const dome = Array.from({ length: 13 }, (_, i) => {
  const a = aMax * i / 12;
  return [r * Math.cos(a), length - dh + dh * Math.sin(a)];
}).filter(([x]) => x > 0.01);
const inner = rc > 0 ? [[rc, floor], [0, floor]] : [[0, length]];
const prof = [[0, 0], ...base, ...dome, ...inner];
const post = revolve(360, polygon(prof.filter((p, i) => i === 0 || Math.hypot(p[0] - prof[i - 1][0], p[1] - prof[i - 1][1]) > 1e-4)));
if (!screwed) return post;
const hole = polygon(Array.from({ length: 24 }, (_, i) => [screwD / 2 * Math.cos(Math.PI * i / 12), screwD / 2 * Math.sin(Math.PI * i / 12)]));
return difference(post, translate([0, 0, -1], linearExtrude({ h: floor + 2 }, hole)));
