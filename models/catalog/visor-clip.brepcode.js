// Visor clip: a clip that slides over a car sun visor and holds sunglasses, a pen, a parking card or a garage remote.
// Print: on its side as shown, no supports. PETG: PLA softens in a hot car.
// Every number below is a slider (Params). From the BREPcode catalog: visor-clip.
const holds = "glasses";  // [glasses, pen, card, remote] what it holds
const visorT = 24;        // [10:40] visor thickness, mm
const grip = 1;           // [0:3] how much the arms close in (grip), mm
const armL = 30;          // [15:60] how far it reaches onto the visor, mm
const width = 25;         // [10:80] clip width along the visor edge, mm
const wall = 2.5;         // [1.8:4] wall thickness, mm
const itemT = 3;          // [1:30] what it holds: glasses-arm gap, pen diameter, card gap or remote thickness, mm

// side profile: x runs across the visor's thickness, y runs in from its edge; printed lying on it
const g = visorT;
const xi = -g / 2, xo = g / 2;                   // the visor's two faces
const box = (x0, y0, x1, y1) => linearExtrude({ h: width }, polygon([[x0, y0], [x1, y0], [x1, y1], [x0, y1]]));
// an arm that leans in by grip at its tip, so the clip springs onto the visor
const arm = (x, dir) => linearExtrude({ h: width }, polygon([
  [x + dir * grip, 0], [x + dir * grip + (dir > 0 ? -wall : wall), 0],
  [x + (dir > 0 ? -wall : wall), armL], [x, armL],
]));
const parts = [
  arm(xi, 1),                                     // inner arm, its face at xi, leaning +x
  arm(xo, -1),                                    // outer arm
  box(xi - wall, armL - 0.01, xo + wall, armL + wall),   // the spine over the visor's edge
];
const x0 = xo + wall;                             // the outer face, where the holder goes
if (holds === "glasses" || holds === "card") {
  // a tongue beside the outer arm, joined at the spine: the glasses arm or the card slides in from the open end
  const gap = holds === "card" ? itemT : Math.max(2, itemT);
  parts.push(box(x0 - 0.01, armL - 0.01, x0 + gap + 0.01, armL + wall));
  parts.push(box(x0 + gap, armL * 0.25, x0 + gap + 2, armL + wall));
} else if (holds === "pen") {
  // a snap ring on the outer face, its mouth facing out
  const r = itemT / 2, rr = r + 1.8, cy = armL / 2;
  parts.push(translate([x0 + r + 0.6, cy, 0], difference(
    cylinder({ r: rr, h: width, $fn: 48 }),
    translate([0, 0, -1], cylinder({ r, h: width + 2, $fn: 48 })),
    translate([r * 0.55, -r * 0.8, -1], cube([rr, r * 1.6, width + 2])),
  )));
} else {
  // a channel the remote slides into from the side, lips over its face
  const d = itemT, H = armL + wall;
  // (the outer arm leans in by grip at its tip, so the walls reach back into it)
  parts.push(box(x0 - grip - 0.6, 0, x0 + d + 2, 2));
  parts.push(box(x0 - 0.6, H - 2, x0 + d + 2, H));
  parts.push(box(x0 + d, 0, x0 + d + 2, 5));
  parts.push(box(x0 + d, H - 5, x0 + d + 2, H));
}
return translate([0, -armL / 2, 0], union(...parts));
