// Over-the-door hook: a hook that hangs over the top of a door, no screws; also a wreath hanger.
// Print: on its side as shown, no supports. PETG; keep the top strap thin enough for the door to close.
// Every number below is a slider (Params). From the BREPcode catalog: door-hook.
const doorT = 35;     // [15:60] door thickness, mm
const drop = 60;      // [20:250] how far down the door it hangs, mm
const width = 25;     // [10:60] width, mm
const strapT = 4;     // [2.5:8] strap thickness, mm
const bridgeT = 2.4;  // [1.6:5] top strap thickness (the door closes over it), mm
const backDrop = 25;  // [10:60] leg down the back of the door, mm
const reach = 35;     // [15:100] how far the hook sticks out, mm
const armT = 6;       // [3:14] hook arm thickness, mm
const tipH = 15;      // [0:50] how far the tip turns up, mm
const angle = 10;     // [0:40] upward tilt of the arm, degrees
const hooks = 1;      // [1:2] hooks (2 = one halfway down too)

// side profile, printed lying on it: the door is x = 0 to D, its top at y = 0.
// The hook is drawn with u running out into the room from the strap's door
// face, then flipped (x = -u) so the room is on the left.
const D = doorT + 2;
const S = strapT;
const t = Math.tan(angle * Math.PI / 180);
const tipT = Math.max(3, armT * 0.8);
const gus = Math.min(armT, reach * 0.3);
const L = Math.max(S + reach, S + gus + tipT + 3);
const arm = (u0, y0) => {
  const yb = (u) => y0 + (u - u0) * t;
  const top = yb(L) + armT + tipH;
  return [[u0, y0], [L, yb(L)], [L, top], [L - tipT, top], [L - tipT, yb(L - tipT) + armT],
    [S + gus, yb(S + gus) + armT], [S, yb(S) + armT + gus]];
};
const outline = [
  ...arm(0, -drop),
  [S, bridgeT], [-(D + S), bridgeT], [-(D + S), -backDrop], [-D, -backDrop], [-D, 0], [0, 0],
].map(([u, y]) => [-u, y]);
const parts = [linearExtrude({ h: width }, polygon(outline))];
const yMid = -drop / 2;
if (hooks > 1 && drop >= 2 * (armT + gus + tipH) + 20) {
  const second = arm(S - 0.5, yMid);
  second.push([S - 0.5, second[second.length - 1][1]]);
  parts.push(linearExtrude({ h: width }, polygon(second.map(([u, y]) => [-u, y]))));
}
return parts.length > 1 ? union(...parts) : parts[0];
