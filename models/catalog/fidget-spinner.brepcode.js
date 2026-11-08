// Fidget spinner: a flat spinner body for a 608 bearing, with 2 to 6 arms and weight pockets in the lobes.
// Print: flat as shown, no supports. Press a 608 bearing into the middle (and more, or coins, into the lobes). Bearings and coins are small parts: not for children under 3.
// Every number below is a slider (Params). From the BREPcode catalog: fidget-spinner.
const arms = 3;        // [2:6] arms
const armR = 34;       // [20:60] centre to lobe centre, mm
const centerD = 22.1;  // [12:30] centre bearing pocket, mm
const weightD = 22.1;  // [0:30] lobe pocket (0 = solid lobes), mm
const thick = 7;       // [4:12] thickness, mm
const lobeW = 4.5;     // [2.5:10] rim round each pocket, mm

const rc = centerD / 2 + lobeW;                            // hub radius
const rl = (weightD > 0 ? weightD / 2 : 6) + lobeW;        // lobe radius
const R = Math.max(armR, rc + rl - 2);                     // lobes never swallow the hub
// one arm: a stadium from inside the hub out to a lobe (tangent lines between two circles);
// its hub end sits inside the hub disc, so the arms never share an edge
const ra = rc * 0.7;
const stadium = (a, n = 24) => {
  const d = R, s = (ra - rl) / d, w = Math.acos(Math.max(-1, Math.min(1, s)));
  const pts = [];
  for (let i = 0; i <= n; i++) { const t = a + w + (2 * Math.PI - 2 * w) * i / n; pts.push([ra * Math.cos(t), ra * Math.sin(t)]); }
  for (let i = 0; i <= n; i++) { const t = a - w + 2 * w * i / n; pts.push([d * Math.cos(a) + rl * Math.cos(t), d * Math.sin(a) + rl * Math.sin(t)]); }
  return linearExtrude({ h: thick }, polygon(pts));
};
const angles = Array.from({ length: arms }, (_, i) => 2 * Math.PI * i / arms);
const body = union(cylinder({ r: rc, h: thick, $fn: 64 }), ...angles.map((a) => stadium(a)));
// pockets turned a few degrees off the hub's corners, so no two outlines line up
const pocket = (x, y, d) => translate([x, y, -1], rotate([0, 0, 3.7], cylinder({ r: d / 2, h: thick + 2, $fn: 48 })));
const pockets = [pocket(0, 0, centerD)];
if (weightD > 0) for (const a of angles) pockets.push(pocket(R * Math.cos(a), R * Math.sin(a), weightD));
return difference(body, ...pockets);
