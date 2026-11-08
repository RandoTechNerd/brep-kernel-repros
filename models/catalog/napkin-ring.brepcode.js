// Napkin ring: a round or faceted, optionally twisted, ring for a rolled napkin; a set at once.
// Print: standing up as shown, no supports.
// Every number below is a slider (Params). From the BREPcode catalog: napkin-ring.
const innerD = 42;  // [25:70] inside diameter, mm
const height = 25;  // [8:60] band width, mm
const wall = 3;     // [1.6:8] wall thickness, mm
const sides = 0;    // [0:12] facets (0 = round, 3 to 12 = a polygon)
const twist = 0;    // [0:90] twist across the band (faceted only), degrees
const count = 1;    // [1:8] how many

const ri = innerD / 2;
const faceted = sides >= 3;
// a faceted ring's flats sit a wall's thickness outside the hole
const ro = faceted ? (ri + wall) / Math.cos(Math.PI / sides) : ri + wall;
const one = () => {
  if (!faceted) return difference(cylinder({ r: ro, h: height, $fn: 96 }), translate([0, 0, -1], cylinder({ r: ri, h: height + 2, $fn: 96 })));
  const ring = (z, a) => translate([0, 0, z], linearExtrude({ h: 0.01 }, polygon(Array.from({ length: sides }, (_, i) =>
    [ro * Math.cos(a + 2 * Math.PI * i / sides), ro * Math.sin(a + 2 * Math.PI * i / sides)]))));
  const n = twist > 0 ? 4 : 1;
  const tw = twist * Math.PI / 180;
  const band = union(...Array.from({ length: n }, (_, i) => hull(ring(height * i / n, tw * i / n), ring(height * (i + 1) / n - 0.01, tw * (i + 1) / n))));
  return difference(band, translate([0, 0, -1], cylinder({ r: ri, h: height + 2, $fn: 96 })));
};
const step = 2 * ro + 5;
const cols = Math.min(count, 4);
const rings = Array.from({ length: count }, (_, i) => translate([(i % cols) * step, Math.floor(i / cols) * step, 0], one()));
return rings.length > 1 ? group(...rings) : rings[0];
