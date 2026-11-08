// Bag clip: a one-piece spring clip that keeps chip, bread and coffee bags shut.
// Print: flat as shown, no supports. PETG or PLA; PETG springs back better.
// Every number below is a slider (Params). From the BREPcode catalog: bag-clip.
const length = 90;    // [40:200] length, mm
const clipW = 12;     // [6:30] width, mm
const armT = 3;       // [2:6] arm thickness at the tip, mm
const springT = 2.4;  // [1.6:4] spring loop thickness, mm
const loop = 8;       // [4:20] spring loop size, mm
const gap = 0.6;      // [0.4:3] gap at the tip, mm

const rI = loop / 2, rO = rI + springT;
const tip = gap / 2;
const arc = (r, a0, a1, N = 24) => Array.from({ length: N + 1 }, (_, i) => {
  const t = a0 + (a1 - a0) * i / N;
  return [r * Math.cos(t), r * Math.sin(t)];
});
const outline = [
  [length, tip + armT],                          // top arm tip, outside
  ...arc(rO, Math.PI / 2, 3 * Math.PI / 2),      // round the back of the loop
  [length, -tip - armT],                         // bottom arm tip, outside
  [length, -tip],
  ...arc(rI, 3 * Math.PI / 2, Math.PI / 2),      // back round the inside
  [length, tip],
];
return translate([-length / 2, 0, 0], linearExtrude({ h: clipW }, polygon(outline)));
