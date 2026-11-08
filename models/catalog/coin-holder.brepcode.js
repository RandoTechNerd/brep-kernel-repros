// Coin holder: a tube per coin, in a row or round to fit a cup holder, with a push-up hole under each stack.
// Print: upright as shown, no supports.
// Every number below is a slider (Params). From the BREPcode catalog: coin-holder.
const coins = "us";     // [us, euro, uk, canada] which coins
const which = "all";    // [all, first] every coin, or just the biggest
const arrange = "row";  // [row, round] in a row, or round for a cup holder
const height = 60;      // [20:140] tube height, mm
const wall = 2;         // [1.2:4] wall thickness, mm
const fit = 0.8;        // [0.2:2] room around each coin (total), mm
const holderD = 76;     // [55:100] cup holder size (round arrangement), mm
const slotW = 8;        // [0:14] front slot width (0 = none), mm

// published diameters, mm: US Mint, ECB, Royal Mint, Royal Canadian Mint (largest first)
const sets = {
  us: [24.26, 21.21, 19.05, 17.91],                        // quarter, nickel, penny, dime
  euro: [25.75, 24.25, 23.25, 22.25, 21.25, 19.75],        // 2 euro, 50c, 1 euro, 20c, 5c, 10c
  uk: [28.4, 27.3, 24.5, 23.43, 21.4, 18],                 // 2 pound, 50p, 10p, 1 pound, 20p, 5p
  canada: [28, 26.5, 23.88, 21.2, 18.03],                  // toonie, loonie, quarter, nickel, dime
};
const ds = (which === "first" ? sets[coins].slice(0, 1) : sets[coins]).map((d) => d + fit);
const dmax = Math.max(...ds);
const floor = Math.max(2, wall);
let at;                                                     // [x, y] of each tube
if (arrange === "round" && ds.length > 1) {
  const n = ds.length;
  // far enough out that neighbours clear each other, and as far as the holder allows
  const need = (dmax + wall) / (2 * Math.sin(Math.PI / n));
  const Rc = Math.max(holderD / 2 - wall - dmax / 2, need);
  at = ds.map((_, i) => [Rc * Math.cos(2 * Math.PI * i / n), Rc * Math.sin(2 * Math.PI * i / n)]);
} else {
  let x = 0;
  at = ds.map((d, i) => { if (i) x += (ds[i - 1] + d) / 2 + wall; return [x, 0]; });
  at = at.map(([x0, y]) => [x0 - x / 2, y]);
}
const outer = arrange === "round" && ds.length > 1
  ? cylinder({ r: Math.hypot(...at[0]) + dmax / 2 + wall, h: height, $fn: 96 })
  : hull(...ds.map((d, i) => translate([at[i][0], at[i][1], 0], cylinder({ r: d / 2 + wall, h: height, $fn: 64 }))));
const cuts = ds.flatMap((d, i) => {
  const [x, y] = at[i];
  const out = Math.atan2(y, x) * 180 / Math.PI;           // the slot faces outward (front, in a row)
  const face = arrange === "round" && ds.length > 1 ? out : -90;
  const c = [
    translate([x, y, floor], cylinder({ r: d / 2, h: height, $fn: 64 })),
    translate([x, y, -1], cylinder({ r: d * 0.3, h: floor + 2, $fn: 32 })),     // push the stack up from below
  ];
  if (slotW > 0) c.push(translate([x, y, floor + 4], rotate([0, 0, face], translate([0, -slotW / 2, 0], cube([d / 2 + wall + 2, slotW, height])))));
  return c;
});
return difference(outer, ...cuts);
