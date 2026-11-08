// Picture hook: a nail-in picture hook: a 45-degree nail channel and a cup for the hanging wire.
// Print: on its side as shown, no supports. PETG; a panel pin or small nail goes through the channel.
// Every number below is a slider (Params). From the BREPcode catalog: picture-hook.
const cupD = 6;     // [3:20] size of the cup the wire sits in, mm
const plateH = 30;  // [18:60] plate height, mm
const width = 12;   // [8:40] width, mm
const plateT = 3;   // [2:6] plate thickness, mm
const lipH = 5;     // [2:15] front lip height, mm
const bossT = 3;    // [2:8] nail boss thickness, mm
const nailD = 1.6;  // [1:3] nail diameter, mm
const nails = 1;    // [1:3] nails

// side profile: x runs out from the wall, y runs up; printed lying on it
const rc = cupD / 2;
const T = plateT;
const Ro = rc + T;
const cx = T + rc, cy = Ro;                        // the cup's inner circle touches the plate face
const bossH = Math.max(10, bossT * 3);
const H = Math.max(plateH, cy + bossH + 4);
const qb = H - bossH;                              // the boss starts here, with a 45 degree shoulder
const arc = (r, a0, a1, N = 24) => Array.from({ length: N + 1 }, (_, i) => {
  const a = a0 + (a1 - a0) * i / N;
  return [cx + r * Math.cos(a), cy + r * Math.sin(a)];
});
const outline = [
  ...arc(Ro, Math.PI, 2 * Math.PI),                // under the cup, from the wall to the front
  [cx + Ro, cy + lipH], [cx + rc, cy + lipH],      // the lip
  ...arc(rc, 0, -Math.PI),                         // back round the inside of the cup
  [T, qb], [T + bossT, qb + bossT], [T + bossT, H], [0, H],
];
const piece = linearExtrude({ h: width }, polygon(outline));
// the nail channel: from the boss face down at 45 degrees to the back
const yExit = H - T - bossT - 2;
const len = (T + bossT + 4) * Math.SQRT2;
const zs = nails === 1 ? [width / 2] : Array.from({ length: nails }, (_, i) => width * (0.2 + 0.6 * i / (nails - 1)));
const channels = zs.map((z) => translate([-2, yExit - 2, z],
  rotate([0, 0, 45], rotate([0, 90, 0], cylinder({ r: nailD / 2 + 0.15, h: len, $fn: 16 })))));
return difference(piece, ...channels);
