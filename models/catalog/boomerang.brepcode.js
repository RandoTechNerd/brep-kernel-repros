// Indoor boomerang: a light, flat indoor boomerang with 2 to 5 bevelled blades, for right or left hands.
// Print: flat as shown, bevels up; no supports. Light and thin for indoors, still never throw it at people.
// Every number below is a slider (Params). From the BREPcode catalog: boomerang.
const blades = 3;      // [2:5] blades
const length = 75;     // [40:120] centre to blade tip, mm
const bladeW = 24;     // [12:40] blade width at the hub, mm
const thick = 2.5;     // [1.5:5] thickness, mm
const bevel = 15;      // [0:30] trailing-edge bevel (0 = flat), degrees
const hand = "right";  // [right, left] thrower's hand

const r0 = bladeW / 2, r1 = Math.max(4, bladeW * 0.35);   // hub and tip radii
const L = Math.max(length, r0 + r1 + 5);
// one blade along +x: tangent lines between the hub circle and the tip circle
const outline = (n = 20) => {
  const w = Math.acos(Math.max(-1, Math.min(1, (r0 - r1) / L)));
  const pts = [];
  for (let i = 0; i <= n; i++) { const t = w + (2 * Math.PI - 2 * w) * i / n; pts.push([r0 * Math.cos(t), r0 * Math.sin(t)]); }
  for (let i = 0; i <= n; i++) { const t = -w + 2 * w * i / n; pts.push([L + r1 * Math.cos(t), r1 * Math.sin(t)]); }
  return pts;
};
const side = hand === "left" ? 1 : -1;                    // which edge trails as it spins
const bw = r0 * 0.8;                                      // bevel width across the blade
const ang = Math.min(bevel, Math.atan((thick - 0.8) / bw) * 180 / Math.PI);
let blade = linearExtrude({ h: thick }, polygon(outline()));
if (ang > 0) {
  // everything above a plane that starts bw in from the trailing edge and tips down across it
  const cut = translate([0, side * (r0 - bw), thick], rotate([-side * ang, 0, 0], translate([r0, side > 0 ? 0 : -50, 0], cube([L + r1 + 5, 50, 20]))));
  blade = difference(blade, cut);
}
const spread = blades === 2 ? [-50, 50] : Array.from({ length: blades }, (_, i) => 360 * i / blades);
return union(...spread.map((a) => rotate([0, 0, a], blade)));
