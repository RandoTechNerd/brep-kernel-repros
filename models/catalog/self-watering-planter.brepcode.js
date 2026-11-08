// Self-watering planter: an outer water reservoir and an inner pot with a wick hole and a notch to pour water through.
// Print: both parts upright as shown, no supports. PETG for anything that holds water; thread a cotton cord through the wick hole.
// Every number below is a slider (Params). From the BREPcode catalog: self-watering-planter.
const potD = 120;    // [70:220] outside diameter, mm
const height = 110;  // [60:220] reservoir height, mm
const waterH = 35;   // [15:90] water depth under the inner pot, mm
const wall = 2;      // [1.2:4] wall thickness, mm
const gap = 1.5;     // [0.5:4] room between the pots, mm
const wickD = 8;     // [0:20] wick hole (0 = none), mm
const holes = 6;     // [0:16] small root holes in the inner floor
const fillW = 18;    // [0:40] fill notch width (0 = none), mm

const R = potD / 2;
const fl = Math.max(1.6, wall);                         // floors
const water = Math.min(waterH, height * 0.6);           // keep some pot above the water
// the reservoir: a plain cup
const outer = revolve(360, polygon([[0, 0], [R, 0], [R, height], [R - wall, height], [R - wall, fl], [0, fl]]));

// the inner pot, in its own coordinates (z = 0 is its floor, fl + water up in the reservoir)
const ri = R - wall - gap;                               // its outside at the collar
const z0 = height - water - fl - gap;                    // where the 45 degree collar starts
const rb = ri - 0.1 * z0;                                // a gentle taper to the floor
const z1 = z0 + R - ri;                                  // collar reaches the outside, resting on the rim edge
const top = z1 + 1.5;
const pot = revolve(360, polygon([
  [0, 0], [rb, 0], [ri, z0], [R, z1], [R, top],
  [ri - wall, top], [rb - wall, fl], [0, fl],
]));
const cuts = [];
if (wickD > 0) cuts.push(translate([0, 0, -1], cylinder({ r: wickD / 2, h: fl + 2, $fn: 24 })));
for (let i = 0; i < holes; i++) {
  const a = 2 * Math.PI * i / holes, rr = (rb - wall) * 0.62;
  cuts.push(translate([rr * Math.cos(a), rr * Math.sin(a), -1], cylinder({ r: 2, h: fl + 2, $fn: 16 })));
}
// the fill notch: a gap in the collar, outside the pot wall, to pour water through
if (fillW > 0) cuts.push(translate([ri + 0.3, -fillW / 2, z0 - 1], cube([R - ri + 2, fillW, top - z0 + 2])));
const inner = cuts.length ? difference(pot, ...cuts) : pot;

// side by side on the diagonal, so the pair fits a smaller bed
const d = (2 * R + 6) / (2 * Math.SQRT2);
return group(translate([-d, -d, 0], outer), translate([d, d, 0], inner));
