// Funnel: a pouring funnel with an air rib on the spout, sized to a bottle, a jar mouth or an espresso basket.
// Print: upright, mouth up, no supports. Food contact: PETG or food-safe PLA, hand wash.
// Every number below is a slider (Params). From the BREPcode catalog: funnel.
const topD = 110;    // [30:240] mouth diameter, mm
const spoutD = 16;   // [6:100] spout outside diameter, mm
const spoutL = 35;   // [3:120] spout length, mm
const flare = 38;    // [20:45] cone angle from upright (45 = flattest that prints), degrees
const rim = 6;       // [0:60] straight rim above the cone, mm
const wall = 1.6;    // [1.2:4] wall thickness, mm
const airRib = 1.2;  // [0:3] air rib on the spout (0 = none), mm

const tf = Math.tan(flare * Math.PI / 180);
const Ro = topD / 2;
const rs = Math.min(spoutD / 2, Ro - wall - 1);  // the spout can be no wider than the mouth
const ri = Math.max(1, rs - wall);                // the hole down the spout
const wh = wall / Math.cos(flare * Math.PI / 180); // the cone wall measured across
const zc = spoutL + (Ro - rs) / tf;                // where the cone meets the rim
const lift = (wh - (rs - ri)) / tf;               // the bore's cone starts this much higher
const top = zc + Math.max(rim, lift + 0.6);
const outside = revolve(360, polygon([[0, 0], [rs, 0], [rs, spoutL], [Ro, zc], [Ro, top], [0, top]]));
const bore = revolve(360, polygon([[0, -1], [ri, -1], [ri, spoutL + lift], [Ro - wall, zc + lift], [Ro - wall, top + 1], [0, top + 1]]));
let part = difference(outside, bore);
if (airRib > 0 && spoutL > 4) {
  const ribW = Math.max(1, wall * 0.8);
  part = union(part, translate([rs - 0.3, -ribW / 2, 0], cube([airRib + 0.3, ribW, spoutL])));
}
return part;
