// Plant clip: a snap-on clip that holds a stem to a stake, cane or trellis; a big one is a support ring.
// Print: flat as shown, no supports. PETG flexes without cracking; print a few spare.
// Every number below is a slider (Params). From the BREPcode catalog: plant-clip.
const stakeD = 10;      // [3:30] stake or cane diameter, mm
const stemD = 15;       // [4:200] stem loop diameter, mm
const ringW = 3;        // [1.6:8] ring band width, mm
const height = 8;       // [4:20] clip height, mm
const stemGap = 0.6;    // [0:0.9] stem loop opening (0 = closed)
const stakeGap = 0.75;  // [0:0.9] stake opening (0 = closed)

// a C: a ring band of inner radius ri, opening a chord g wide, facing angle face
const C = (ri, w, g, face, n = 48) => {
  const ro = ri + w;
  if (g <= 0) return difference(cylinder({ r: ro, h: height, $fn: n }), translate([0, 0, -1], cylinder({ r: ri, h: height + 2, $fn: n })));
  const ai = Math.asin(Math.min(0.95, g / 2 / ri)), ao = Math.asin(Math.min(0.95, g / 2 / ro));
  const pts = [];
  for (let i = 0; i <= n; i++) { const t = face + ao + (2 * Math.PI - 2 * ao) * i / n; pts.push([ro * Math.cos(t), ro * Math.sin(t)]); }
  for (let i = n; i >= 0; i--) { const t = face + ai + (2 * Math.PI - 2 * ai) * i / n; pts.push([ri * Math.cos(t), ri * Math.sin(t)]); }
  return linearExtrude({ h: height }, polygon(pts));
};
const rs = stakeD / 2, rt = stemD / 2;
const d = rs + ringW + rt + ringW * 0.5 + 1.5;            // centre to centre, with a short neck
const neck = translate([rs + ringW * 0.5, -Math.max(ringW, 3) / 2, 0], cube([d - rs - rt - ringW * 1, Math.max(ringW, 3), height]));
const stake = C(rs, ringW, stakeGap * stakeD, Math.PI);
const stem = translate([d, 0, 0], C(rt, ringW, stemGap * stemD, 0, stemD > 60 ? 96 : 48));
return translate([-d / 2, 0, 0], union(stake, neck, stem));
