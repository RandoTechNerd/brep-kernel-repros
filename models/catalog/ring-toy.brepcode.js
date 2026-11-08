// Ring stacker: a stacking-ring toddler toy, or a ring toss game: a base with a post and flat rings.
// Print: everything flat as shown, no supports. At the defaults every ring is over 32 mm across, so nothing is a small part; keep it that way for under-3s.
// Every number below is a slider (Params). From the BREPcode catalog: ring-toy.
const style = "stacker";  // [stacker, toss] stacker or ring toss
const count = 5;          // [2:8] rings
const ringD = 80;         // [40:130] largest ring diameter, mm
const step = 10;          // [0:15] each ring smaller by (stacker), mm
const ringT = 12;         // [6:25] ring thickness, mm
const postD = 18;         // [10:30] post diameter, mm
const postH = 75;         // [30:200] post height, mm
const baseD = 90;         // [50:150] base diameter, mm

const toss = style === "toss";
const rp = postD / 2, bh = 8;
const Rb = Math.max(baseD / 2, rp + 15);
// base and post in one profile: a disc, a root cone, the post, a domed (coned) cap
const capH = rp * 0.8;
const base = revolve(360, polygon([[0, 0], [Rb, 0], [Rb, bh], [rp + 6, bh + 3], [rp, bh + 9], [rp, postH - capH], [rp * 0.35, postH], [0, postH]]));
// the rings: a stacker's share one hole and step down; a toss game's are alike with a wide hole
const hole = toss ? Math.max(postD + 30, ringD - 28) : postD + 5;
const sizes = Array.from({ length: count }, (_, i) => Math.max(toss ? ringD : ringD - i * step, hole + 20));
const ringOf = (D) => difference(cylinder({ r: D / 2, h: ringT, $fn: 64 }), translate([0, 0, -1], cylinder({ r: hole / 2, h: ringT + 2, $fn: 64 })));
// lay the pieces out in rows, left to right
const items = [{ d: 2 * Rb, part: base }, ...sizes.map((D) => ({ d: D, part: ringOf(D) }))];
const placed = [];
let x = 0, y = 0, row = 0, width = 0;
for (const it of items) {
  if (x > 0 && x + it.d > 250) { y += row + 6; x = 0; row = 0; }
  placed.push(translate([x + it.d / 2, y + it.d / 2, 0], it.part));
  x += it.d + 6; row = Math.max(row, it.d); width = Math.max(width, x - 6);
}
return translate([-width / 2, -(y + row) / 2, 0], group(...placed));
