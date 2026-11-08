// Barrel hinge: a two-leaf printed hinge with interleaved knuckles, a glue-in pin and countersunk screw holes.
// Print: flat as shown (countersinks up), pin lying on its flat, no supports. Push the pin through and put a drop of CA glue in the orange leaf's outer knuckles; the blue leaf turns on it. A 3 mm steel rod works as the pin too.
// Every number below is a slider (Params). From the BREPcode catalog: barrel-hinge.
const length = 60;     // [20:200] hinge length along the pin, mm
const width = 24;      // [10:60] each leaf, from the pin outwards, mm
const thick = 3;       // [2:6] leaf thickness, mm
const knuckleR = 4;    // [2.5:8] barrel radius, mm
const knuckles = 5;    // [3:11] knuckles (made odd)
const gap = 0.5;       // [0.2:1] gap between knuckles, mm
const pinD = 3;        // [1.5:6] pin diameter, mm
const turnFit = 0.45;  // [0.1:1] clearance where the pin turns, mm
const glueFit = 0.15;  // [0:0.5] clearance where the pin is glued, mm
const sweep = 0.6;     // [0.3:1.5] clearance round each knuckle, mm
const screws = 2;      // [0:6] screw holes per leaf
const screwD = 3.4;    // [2:6] screw hole diameter, mm
const headD = 6.5;     // [4:12] countersink diameter, mm

const nK = knuckles % 2 ? knuckles : knuckles + 1;        // odd: orange gets both ends and the middle
const kr = Math.max(knuckleR, pinD / 2 + turnFit + 1, thick / 2 + 0.5);   // barrel radius it can hold
const seg = (length - (nK - 1) * gap) / nK;               // one knuckle's length
const x0 = (i) => i * (seg + gap);                        // knuckle i starts here
const flatX = (s) => rotate([90, 90, 0], s);              // a YZ profile pushed along +X
const pts = (r, a0, a1, n) => [...Array(n + 1).keys()].map((k) => {
  const a = a0 + (a1 - a0) * k / n; return [r * Math.cos(a), r * Math.sin(a)];
});
// a barrel is round on top and an octagon's 45 degree chamfers underneath, so it
// rests on a flat and never sticks out past its radius
const zc = kr * Math.cos(Math.PI / 8);                    // pin axis height: the barrel's flat is on the bed
const barrelShape = (r) => polygon([...pts(r, -Math.PI / 8, Math.PI * 9 / 8, 10), ...pts(r, Math.PI * 11 / 8, Math.PI * 13 / 8, 1)]);
const barrel = (i) => translate([x0(i), 0, zc], flatX(linearExtrude({ h: seg }, barrelShape(kr))));
const sweepCut = (i) => translate([x0(i) - gap, 0, zc], rotate([0, 90, 0], cylinder({ r: kr + sweep, h: seg + 2 * gap })));
// the pin hole is a teardrop pointing up, so its roof prints at 45 degrees
const tear = (r) => polygon([...pts(r, Math.PI * 0.75, Math.PI * 2.25, 12), [0, r * Math.SQRT2]]);
const pinHole = (r) => translate([-1, 0, zc], flatX(linearExtrude({ h: length + 2 }, tear(r))));

// a countersunk screw hole through a leaf: two cutters, the shaft and the cone
const csk = (x, y) => [
  translate([x, y, -1], cylinder({ r: screwD / 2, h: thick + 2 })),
  translate([x, y, thick - (headD - screwD) / 2], cylinder({ r1: screwD / 2, r2: headD / 2 + 0.01, h: (headD - screwD) / 2 + 0.01 })),
];
const holeXs = [...Array(screws).keys()].map((k) => length * (screws > 1 ? 0.15 + 0.7 * k / (screws - 1) : 0.5));

// a leaf plate with round corners
const rc = Math.min(3, width / 4);
const rounded = (w, d) => linearExtrude({ h: thick }, polygon([[w - rc, rc], [w - rc, d - rc], [rc, d - rc], [rc, rc]]
  .flatMap(([x, y], k) => pts(rc, Math.PI * (k / 2 - 0.5), Math.PI * k / 2, 4).map(([u, v]) => [x + u, y + v]))));

// a leaf on one side of the pin (side -1 or +1), owning knuckles `mine`. The
// cuts go into the plain plate and each knuckle on its own, which is far
// cheaper than cutting the finished leaf.
function leaf(side, mine) {
  const others = [...Array(nK).keys()].filter((i) => !mine.includes(i));
  const hole = pinHole(pinD / 2 + (side < 0 ? glueFit : turnFit) / 2);
  const plate = difference(
    translate([0, side < 0 ? -width : 0, 0], rounded(length, width)),
    ...others.map(sweepCut),                     // room for the other leaf's knuckles
    hole,
    ...holeXs.flatMap((x) => csk(x, side * (width * 0.62))),
  );
  return union(plate, difference(union(...mine.map(barrel)), hole));
}

const evens = [...Array(nK).keys()].filter((i) => i % 2 === 0);
const odds = [...Array(nK).keys()].filter((i) => i % 2 === 1);
const glued = leaf(-1, evens);      // orange: the pin is glued in here
const turning = leaf(1, odds);      // blue: turns on the pin

// the pin: an octagon inside the pin circle, lying on a flat beside the hinge
const oct = polygon(pts(pinD / 2, Math.PI / 8, Math.PI * 15 / 8, 7));
const pin = translate([0, width + 8, pinD / 2 * Math.cos(Math.PI / 8)], flatX(linearExtrude({ h: length - 1 }, oct)));

return group(colorize("#e8902a", glued), colorize("#3b82f6", turning), colorize("#9aa4b2", pin));
