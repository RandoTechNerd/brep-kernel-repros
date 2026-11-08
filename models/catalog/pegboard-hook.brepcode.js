// Pegboard hook: a hook that clips into IKEA Skadis slots or 1/4 inch pegboard holes.
// Print: on its side as shown, no supports. PETG or PLA; try one in your board before printing a set.
// Every number below is a slider (Params). From the BREPcode catalog: pegboard-hook.
const board = "skadis";  // [skadis, pegboard, small] board (small = 1/8 in pegboard)
const reach = 40;        // [10:150] how far it sticks out, mm
const width = 10;        // [4.2:40] hook width, mm
const armT = 6;          // [3:14] arm thickness, mm
const tipH = 10;         // [0:40] how far the tip turns up, mm
const angle = 10;        // [0:45] upward tilt of the arm, degrees
const plateH = 30;       // [15:100] back plate height below the clip, mm
const plateT = 5;        // [3:10] back plate thickness, mm

// side profile: x runs out from the board's face, y runs up; printed lying on
// it. The board sits behind, from x = -tB to 0.
const sk = board === "skadis";
const tB = sk ? 5 : board === "small" ? 3.2 : 6.35;            // board thickness
const hole = sk ? 5 : board === "small" ? 4.76 : 6.35;          // slot width or hole diameter
// a square clip section whose diagonal passes a round hole (Skadis: the slot width)
const pegS = sk ? 4.2 : (hole - 0.35) / Math.SQRT2;
const back = -(tB + 0.4);                                     // behind the board
const clips = sk
  // a tab through the slot that drops 7 mm down behind the board (tab plus drop clear the 15 mm slot)
  ? [[[0.5, 0], [0.5, 5], [back - 3.5, 5], [back - 3.5, -7], [back, -7], [back, 0]]]
  // an L through one hole that turns up behind the board, and a stub one hole lower
  : [[[0.5, 0], [0.5, pegS], [back, pegS], [back, pegS + (board === "small" ? 5 : 7)], [back - pegS, pegS + (board === "small" ? 5 : 7)], [back - pegS, 0]],
     [[0.5, -25.4], [0.5, -25.4 + pegS], [-(tB - 0.6), -25.4 + pegS], [-(tB - 0.6), -25.4]]];
const yTop = (sk ? 5 : pegS) + 3;
const yBot = sk ? -Math.max(plateH, 15) : Math.min(-25.4 - 3, -plateH);
// the hook: the arm leaves the plate at its foot, tilts up and turns up at the tip
const t = Math.tan(angle * Math.PI / 180);
const tipT = Math.max(3, armT * 0.8);
const gus = Math.min(armT, reach * 0.3);
const L = Math.max(reach, plateT + gus + tipT + 3);
const yb = (x) => yBot + x * t;
const tipTop = yb(L) + armT + tipH;
const outline = [
  [0, yBot], [L, yb(L)], [L, tipTop], [L - tipT, tipTop],
  [L - tipT, yb(L - tipT) + armT], [plateT + gus, yb(plateT + gus) + armT],
  [plateT, yb(plateT) + armT + gus], [plateT, Math.max(yTop, yb(plateT) + armT + gus + 2)], [0, Math.max(yTop, yb(plateT) + armT + gus + 2)],
];
const W = Math.max(width, pegS);
return union(
  linearExtrude({ h: W }, polygon(outline)),
  ...clips.map((pts) => linearExtrude({ h: pegS }, polygon(pts))),
);
